import { useState, useEffect } from 'react';
import ChatScreen from './components/screens/ChatScreen';
import MarketScreen from './components/screens/MarketScreen';
import NewsScreen from './components/screens/NewsScreen';
import LearnScreen from './components/screens/LearnScreen';
import { cn } from './lib/utils';
import { Bot, Bell, ShieldAlert, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertProvider, useAlerts } from './context/AlertContext';

type Tab = 'chat' | 'market' | 'news' | 'learn';

function MarketStatusBadge() {
  const [status, setStatus] = useState({ isOpen: false, timeString: '' });

  useEffect(() => {
    const updateStatus = () => {
      const now = new Date();
      // Get the time in Cairo timezone
      const cairoTimeStr = now.toLocaleString("en-US", { timeZone: "Africa/Cairo" });
      const cairoDate = new Date(cairoTimeStr);
      
      const day = cairoDate.getDay(); // 0 = Sunday, 1 = Monday,... 4 = Thursday, 5 = Friday, 6 = Saturday
      const hours = cairoDate.getHours();
      const minutes = cairoDate.getMinutes();

      // EGX operates Sunday (0) to Thursday (4)
      const isWorkingDay = day >= 0 && day <= 4; 
      
      const timeInMinutes = hours * 60 + minutes;
      // EGX Trading Session: 10:00 AM to 2:30 PM (14:30)
      const openTime = 10 * 60; 
      const closeTime = 14 * 60 + 30; 

      const isOpen = isWorkingDay && timeInMinutes >= openTime && timeInMinutes <= closeTime;

      // Format time safely for AR locale
      const timeString = cairoDate.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });
      
      setStatus({ isOpen, timeString });
    };

    updateStatus();
    const interval = setInterval(updateStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={cn(
      "text-[10px] sm:text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors",
      status.isOpen 
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
        : "bg-slate-800/80 border-slate-700/50 text-slate-400"
    )}>
      <span className={cn(
        "w-2 h-2 rounded-full", 
        status.isOpen ? "bg-emerald-500 animate-pulse" : "bg-slate-500"
      )}></span>
      {status.isOpen ? "السوق مفتوح" : "السوق مغلق"} • {status.timeString}
    </div>
  );
}

import { AuthProvider, useAuth } from './context/AuthContext';
import AuthScreen from './components/screens/AuthScreen';
import { LogOut } from 'lucide-react';

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const { activeNotifications, dismissAlert, alerts, removeAlert } = useAlerts();
  const { user, loading, logout } = useAuth();

  const tabs = [
    { id: 'chat', label: 'الرئيسية' },
    { id: 'market', label: 'السوق' },
    { id: 'news', label: 'الأخبار' },
    { id: 'learn', label: 'التعلم' },
  ] as const;

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-emerald-400">جاري التحميل...</div>;
  }

  if (!user) {
    return <AuthScreen />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-50 font-sans relative">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-from)_0%,_transparent_70%)] from-emerald-500"></div>

      <header className="h-16 shrink-0 border-b border-slate-800 px-6 flex items-center justify-between glass sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20">EGX</div>
          <div>
            <h1 className="text-lg font-bold leading-tight">المستشار الذكي EGX</h1>
            <p className="text-[10px] text-slate-400">مرحباً <span className="text-emerald-400 font-bold">{user.username}</span></p>
          </div>
        </div>
        <nav className="flex gap-6 h-full">
          {tabs.map((tab) => (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={cn(
                "flex items-center h-full text-sm cursor-pointer transition-colors border-b-2",
                activeTab === tab.id 
                  ? "text-emerald-400 border-emerald-400 font-medium" 
                  : "text-slate-400 border-transparent hover:text-white"
              )}
            >
              {tab.label}
            </div>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <MarketStatusBadge />
          
          <div className="relative">
            <button 
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center transition-colors relative"
            >
              <Bell className="w-4 h-4 text-slate-300" />
              {activeNotifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
              )}
              {activeNotifications.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-slate-700"></span>
              )}
            </button>

            {/* Alerts Dropdown Menus */}
            <AnimatePresence>
              {isAlertsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-12 left-0 w-80 glass border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                    <h3 className="font-bold text-sm text-slate-200">التنبيهات</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">{alerts.length} نشطة</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {alerts.length === 0 ? (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        لا توجد تنبيهات حالياً.
                        <br />أضف تنبيهات من شاشة تفاصيل الأسهم.
                      </div>
                    ) : (
                      <div className="flex flex-col">
                        {alerts.map(alert => (
                          <div key={alert.id} className={cn("p-4 border-b border-slate-800/50 flex flex-col gap-2 relative group transition-colors", alert.isTriggered ? "bg-emerald-500/5" : "hover:bg-slate-800/30")}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-2 font-bold text-slate-200 text-sm">
                                {alert.symbol}
                                {alert.isTriggered && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-1.5 rounded uppercase font-bold">تم تحقيق الهدف</span>}
                              </div>
                              <button onClick={() => removeAlert(alert.id)} className="text-slate-500 hover:text-rose-400 transition-colors">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-400 font-medium">
                              {alert.type === 'price_above' ? 'في حال ارتفع عن' : 'في حال هبط دون'} السعر: <span className="text-emerald-400 font-bold">{alert.targetPrice} ج.م</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-rose-400 transition-colors px-3 py-1.5 rounded-full border border-slate-700/50 hover:bg-rose-500/10"
            title="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* TOAST NOTIFICATIONS */}
      <div className="absolute top-20 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {activeNotifications.map(notification => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className="pointer-events-auto bg-slate-900/95 border border-emerald-500/30 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.3)] rounded-2xl p-4 flex gap-4 items-start w-80 backdrop-blur-md"
            >
               <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1 relative">
                 <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
                 <ShieldAlert className="w-5 h-5 text-emerald-400 relative z-10" />
               </div>
               <div className="flex-1">
                 <h4 className="font-bold text-slate-200 text-sm">تنبيه مستهدف السعر: {notification.symbol}</h4>
                 <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                   لقد تم وصول السهم إلى الهدف المحدد ({notification.targetPrice} ج.م)!
                 </p>
               </div>
               <button onClick={() => dismissAlert(notification.id)} className="text-slate-500 hover:text-slate-300 transition-colors p-1 bg-slate-800 rounded-full">
                 <X className="w-4 h-4" />
               </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <main className="flex-1 p-4 sm:p-6 flex flex-col overflow-hidden items-center">
        <div className="w-full max-w-4xl flex-1 glass rounded-3xl overflow-x-hidden overflow-y-auto custom-scrollbar relative shadow-2xl flex flex-col">
          {activeTab === 'chat' && <ChatScreen />}
          {activeTab === 'market' && <MarketScreen />}
          {activeTab === 'news' && <NewsScreen />}
          {activeTab === 'learn' && <LearnScreen />}
        </div>
      </main>

      <footer className="h-12 shrink-0 border-t border-slate-800 glass flex items-center justify-between px-8 text-[10px] text-slate-500 relative z-10">
        <div>© 2024 المستشار الذكي - البورصة المصرية</div>
        <div className="flex gap-4">
          <span className="cursor-pointer hover:text-slate-300 transition-colors">سياسة الخصوصية</span>
          <span className="cursor-pointer hover:text-slate-300 transition-colors">الشروط والأحكام</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <AppContent />
      </AlertProvider>
    </AuthProvider>
  );
}
