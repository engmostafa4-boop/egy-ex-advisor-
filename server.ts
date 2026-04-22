import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-12345';
const db = new Database('app.db');

// Setup DB
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS user_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    key_name TEXT NOT NULL,
    value_data TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(user_id, key_name)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // User Auth Routes
  app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'اسم المستخدم وكلمة المرور مطلوبان' });
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
      const info = stmt.run(username, hashedPassword);
      
      const token = jwt.sign({ userId: info.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ message: 'تم إنشاء الحساب بنجاح', user: { userId: info.lastInsertRowid, username } });
    } catch (error: any) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ error: 'اسم المستخدم موجود مسبقاً' });
      } else {
        res.status(500).json({ error: 'خطأ في قاعدة البيانات' });
      }
    }
  });

  app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    try {
      const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
      if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
      }
      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
      res.json({ message: 'تم تسجيل الدخول', user: { userId: user.id, username: user.username } });
    } catch (error) {
      res.status(500).json({ error: 'خطأ في قاعدة البيانات' });
    }
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
  });

  // Middleware to protect routes
  const authGuard = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'غير مصرح' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ error: 'جلسة التصفح منتهية' });
    }
  };

  app.get('/api/me', authGuard, (req: any, res: any) => {
    res.json({ user: req.user });
  });

  // User Data Routes
  app.get('/api/data/:key', authGuard, (req: any, res: any) => {
    const { key } = req.params;
    try {
      const row = db.prepare('SELECT value_data FROM user_data WHERE user_id = ? AND key_name = ?').get(req.user.userId, key) as any;
      res.json({ value: row ? JSON.parse(row.value_data) : null });
    } catch(e) {
      res.status(500).json({ error: 'Failed to fetch data' });
    }
  });

  app.post('/api/data/:key', authGuard, (req: any, res: any) => {
    const { key } = req.params;
    const { value } = req.body;
    try {
      const stmt = db.prepare(`
        INSERT INTO user_data (user_id, key_name, value_data) 
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, key_name) DO UPDATE SET value_data = excluded.value_data
      `);
      stmt.run(req.user.userId, key, JSON.stringify(value));
      res.json({ success: true });
    } catch(e) {
      res.status(500).json({ error: 'Failed to save data' });
    }
  });

  // API Route to fetch from TradingView (Bypassing CORS)
  app.post('/api/market-data', async (req, res) => {
    try {
      const response = await fetch('https://scanner.tradingview.com/egypt/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify(req.body)
      });
      
      if (!response.ok) {
        throw new Error(`TradingView responded with ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
