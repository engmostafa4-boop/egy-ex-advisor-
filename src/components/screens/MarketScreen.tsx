import { useState, useEffect } from 'react';
import { egxStocks, Stock } from '../../data/mockData';
import { ChevronLeft, TrendingUp, TrendingDown, Eye, Activity, Scale, Bot, RefreshCw, BellPlus, Copy, Check, Star, Search, ShieldAlert, ShieldCheck, Shield, ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { cn } from '../../lib/utils';
import { askGemini } from '../../services/geminiService';
import { getRealTimeStocks } from '../../services/stockService';
import TradingViewChart from '../TradingViewChart';
import { useAlerts } from '../../context/AlertContext';

export default function MarketScreen() {
  const [stocks, setStocks] = useState<Stock[]>(egxStocks);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Favorites State
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    // Fetch favorites from SQLite isolated user database
    fetch('/api/data/favorites')
      .then(res => res.json())
      .then(data => {
        if (data && data.value) {
          setFavorites(data.value);
        }
      })
      .catch(console.error);
  }, []);

  const toggleFavorite = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const newFavorites = favorites.includes(symbol) 
      ? favorites.filter(s => s !== symbol)
      : [...favorites, symbol];
    
    setFavorites(newFavorites);
    
    // Save to SQLite
    try {
      await fetch('/api/data/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: newFavorites })
      });
    } catch (err) {
      console.error('Failed to sync favorites with DB', err);
    }
  };
  
  // Alert State
  const { checkAlerts, addAlert } = useAlerts();
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertType, setAlertType] = useState<'price_above' | 'price_below'>('price_above');

  const fetchLiveStocks = async () => {
    setIsRefreshing(true);
    const liveData = await getRealTimeStocks();
    setStocks(liveData);
    setIsInitialLoading(false);
    
    // Check Alerts whenever fresh data arrives
    checkAlerts(liveData);
    
    // Update the selected stock if it's currently open
    if (selectedStock) {
      const updatedSelected = liveData.find(s => s.symbol === selectedStock.symbol);
      if (updatedSelected) {
        setSelectedStock(updatedSelected);
      }
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchLiveStocks();
    // Refresh every 60 seconds (simulated real-time)
    const intervalId = setInterval(() => {
      fetchLiveStocks();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []); // Notice we removed dependencies since we want this to mount exactly once

  const bestPerformer = [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  const mostActive = [...stocks].sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))[0];

  const topGainers = [...stocks].filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...stocks].filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);
  const favoriteStocks = stocks.filter(s => favorites.includes(s.symbol));

  const filteredStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStockClick = async (stock: Stock) => {
    setSelectedStock(stock);
    setAiSummary(null);
    setIsAiLoading(true);
    
    const context = `السهم: ${stock.name} (${stock.symbol})\nالسعر الحالي: ${stock.price}\nالتغير: ${stock.changePercent}%\nمستوى المخاطرة: ${stock.riskLevel}\nالنظرة الفنية: ${stock.sentiment}\nالأخبار الأخيرة للسوق: البنك المركزي يثبت أسعار الفائدة، نمو أرباح قطاع البنوك.`;
    const prompt = `أنت مستشار مالي خبير. قم بتحليل هذا السهم استناداً إلى أدائه الأخير والأخبار المالية. 
قدم استجابة ذكية (Smart Response) باللغة العربية تتضمن:
1. ملخص سريع لأداء السهم.
2. "رؤية تعليمية" أو "خطوة قابلة للتنفيذ" (Actionable Insight) مفيدة لمستثمر مبتدئ بناءً على وضع هذا السهم حالياً.
اجعل الإجابة مختصرة وواضحة جداً، مفصولة بأسطر، وضع بنهايتها إخلاء مسؤولية بسيط بأنها ليست نصيحة استثمارية حقيقية.`;
    const summary = await askGemini(prompt, context);
    
    setAiSummary(summary);
    setIsAiLoading(false);
  };

  const handleSetAlert = () => {
    if (!selectedStock || !alertTargetPrice) return;
    addAlert(selectedStock.symbol, alertType, parseFloat(alertTargetPrice));
    setIsAlertDialogOpen(false);
    setAlertTargetPrice('');
  };

  const handleCopySummary = async () => {
    if (aiSummary) {
      try {
        await navigator.clipboard.writeText(aiSummary);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy', err);
      }
    }
  };

  if (selectedStock) {
    const isUp = selectedStock.changePercent >= 0;
    
    return (
      <div className="flex flex-col min-h-full bg-slate-950 animate-in slide-in-from-right-8 duration-300">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setSelectedStock(null)}
            className="flex items-center gap-2 p-4 text-emerald-400 hover:text-emerald-300 group"
          >
            <ChevronLeft className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium">العودة للسوق</span>
          </button>
          
          <button 
            onClick={() => setIsAlertDialogOpen(!isAlertDialogOpen)}
            className="flex items-center gap-2 p-4 text-slate-400 hover:text-emerald-400 transition-colors"
            title="إضافة تنبيه"
          >
            <BellPlus className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 pb-6">
          {/* Create Alert Dialog Inline */}
          {isAlertDialogOpen && (
             <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 mb-6 relative overflow-hidden animate-in fade-in slide-in-from-top-4">
                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-50"></div>
                <h3 className="font-bold text-slate-200 mb-4 text-sm flex items-center gap-2">
                  <BellPlus className="w-4 h-4 text-emerald-400" />
                  إعداد تنبيه لـ {selectedStock.symbol}
                </h3>
                
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
                    <button 
                      onClick={() => setAlertType('price_above')}
                      className={cn("flex-1 text-xs py-2 rounded-md font-bold transition-colors", alertType === 'price_above' ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400 hover:text-slate-300")}
                    >الارتفاع فوق</button>
                    <button 
                      onClick={() => setAlertType('price_below')}
                      className={cn("flex-1 text-xs py-2 rounded-md font-bold transition-colors", alertType === 'price_below' ? "bg-rose-500/20 text-rose-400" : "text-slate-400 hover:text-slate-300")}
                    >الهبوط دون</button>
                  </div>
                  
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-slate-500 font-medium">السعر المستهدف (ج.م)</label>
                    <input 
                      type="number" 
                      value={alertTargetPrice}
                      onChange={(e) => setAlertTargetPrice(e.target.value)}
                      placeholder={`السعر الحالي: ${selectedStock.price}`}
                      className="bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                  
                  <button 
                    onClick={handleSetAlert}
                    disabled={!alertTargetPrice}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm py-2.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 mt-2"
                  >
                    حفظ التنبيه
                  </button>
                </div>
             </div>
          )}

          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-bold font-sans tracking-tight">{selectedStock.symbol}</h2>
              <p className="text-slate-400 mt-1">{selectedStock.name}</p>
            </div>
            <div className="text-left">
              <p className="text-3xl font-bold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
                {selectedStock.price.toFixed(2)}
              </p>
              <div className={cn(
                "flex items-center gap-1 justify-end font-medium mt-1",
                isUp ? "text-emerald-400" : "text-rose-400"
              )}>
                {isUp ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(selectedStock.changePercent)}%
              </div>
            </div>
          </div>

          <div className="h-96 w-full glass rounded-3xl p-1 mb-6 relative overflow-hidden shadow-2xl">
             <div className="w-full h-full rounded-[1.4rem] overflow-hidden">
                <TradingViewChart symbol={selectedStock.symbol} />
             </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border border-slate-700/50">
               <div className="text-slate-400 text-[10px] uppercase tracking-wider font-bold">حجم التداول</div>
               <div className="text-sm font-bold text-slate-200">{selectedStock.volume}</div>
            </div>
            
            <div className={cn(
              "rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border shadow-lg",
              selectedStock.riskLevel === 'عالية' ? "bg-rose-500/10 border-rose-500/30 shadow-rose-500/5" :
              selectedStock.riskLevel === 'منخفضة' ? "bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/5" :
              "bg-amber-500/10 border-amber-500/30 shadow-amber-500/5"
            )}>
               <div className="flex items-center gap-1.5 opacity-80 text-[10px] uppercase tracking-wider font-bold text-slate-300">
                 <Scale className="w-3.5 h-3.5" /> المخاطرة
               </div>
               <div className={cn(
                 "text-sm font-black flex items-center gap-1.5",
                 selectedStock.riskLevel === 'عالية' ? "text-rose-400" :
                 selectedStock.riskLevel === 'منخفضة' ? "text-emerald-400" : "text-amber-400"
               )}>
                 {selectedStock.riskLevel === 'عالية' && <ShieldAlert className="w-4 h-4" />}
                 {selectedStock.riskLevel === 'منخفضة' && <ShieldCheck className="w-4 h-4" />}
                 {selectedStock.riskLevel === 'متوسطة' && <Shield className="w-4 h-4" />}
                 {selectedStock.riskLevel}
               </div>
            </div>

            <div className={cn(
              "rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 border shadow-lg",
              selectedStock.sentiment === 'إيجابي' ? "bg-emerald-500/10 border-emerald-500/30 shadow-emerald-500/5" :
              selectedStock.sentiment === 'سلبي' ? "bg-rose-500/10 border-rose-500/30 shadow-rose-500/5" :
              "bg-slate-800/50 border-slate-700/50"
            )}>
               <div className="opacity-80 text-[10px] uppercase tracking-wider font-bold text-slate-300">
                 النظرة الفنية
               </div>
               <div className={cn(
                 "text-sm font-black flex items-center gap-1.5",
                 selectedStock.sentiment === 'إيجابي' ? "text-emerald-400" :
                 selectedStock.sentiment === 'سلبي' ? "text-rose-400" : "text-slate-300"
               )}>
                 {selectedStock.sentiment === 'إيجابي' && <ThumbsUp className="w-4 h-4" />}
                 {selectedStock.sentiment === 'سلبي' && <ThumbsDown className="w-4 h-4" />}
                 {selectedStock.sentiment === 'محايد' && <Minus className="w-4 h-4" />}
                 {selectedStock.sentiment}
               </div>
            </div>
          </div>

          {/* AI Analysis Card */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-teal-900/20 border border-emerald-500/20 rounded-2xl p-5 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full"></div>
             <div className="flex items-center justify-between mb-3 relative z-10">
               <div className="flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                   <Bot className="w-4 h-4 text-emerald-400" />
                 </div>
                 <h3 className="font-bold text-emerald-300">تحليل المساعد الذكي</h3>
               </div>
               
               {!isAiLoading && aiSummary && (
                 <button
                   onClick={handleCopySummary}
                   className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 text-emerald-400 rounded-lg transition-all flex items-center gap-1.5 text-xs font-semibold"
                   title="نسخ التحليل"
                 >
                   {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                   {isCopied ? "تم النسخ" : "نسخ"}
                 </button>
               )}
             </div>
             
             {isAiLoading ? (
               <div className="space-y-3 mt-4 px-1">
                 <div className="flex gap-2">
                   <div className="h-3 bg-emerald-500/20 rounded-md animate-pulse w-full"></div>
                   <div className="h-3 bg-emerald-500/20 rounded-md animate-pulse w-2/3"></div>
                 </div>
                 <div className="flex gap-2">
                   <div className="h-3 bg-emerald-500/20 rounded-md animate-pulse w-4/5"></div>
                   <div className="h-3 bg-emerald-500/20 rounded-md animate-pulse w-1/3"></div>
                 </div>
                 <div className="h-3 bg-emerald-500/20 rounded-md animate-pulse w-full"></div>
                 <div className="h-3 bg-emerald-500/20 rounded-md animate-pulse w-5/6"></div>
               </div>
             ) : (
               <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                 {aiSummary}
               </p>
             )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن سهم بالرمز أو الاسم..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-2xl py-3 pr-11 pl-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 shadow-inner"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            ×
          </button>
        )}
      </div>

      {searchQuery ? (
        <div className="space-y-3">
          <div className="text-sm font-bold text-slate-400 px-1 mb-2">نتائج البحث</div>
          {filteredStocks.length > 0 ? filteredStocks.map((stock) => {
            const isUp = stock.changePercent >= 0;
            const isFav = favorites.includes(stock.symbol);
            return (
              <div 
                key={stock.symbol}
                onClick={() => handleStockClick(stock)}
                className="glass rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-all duration-300 relative group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-200 border border-slate-700/50 shadow-sm">
                    {stock.symbol.substring(0,2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200">{stock.symbol}</h4>
                      {isFav && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 w-32 truncate">{stock.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="font-semibold text-slate-200">{stock.price.toFixed(2)}</div>
                    <div className={cn(
                      "text-xs font-medium mt-1 flex items-center justify-end gap-0.5",
                      isUp ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {isUp ? "+" : ""}{stock.changePercent}%
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800 border-dashed">
              <Search className="w-8 h-8 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">لا توجد نتائج مطابقة لبحثك</p>
            </div>
          )}
        </div>
      ) : isInitialLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 pt-2">
             <div className="h-28 rounded-2xl bg-slate-800/80 animate-pulse border border-slate-700/50"></div>
             <div className="h-28 rounded-2xl bg-slate-800/80 animate-pulse border border-slate-700/50"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="h-[280px] rounded-3xl bg-slate-800/80 animate-pulse border border-slate-700/50"></div>
             <div className="h-[280px] rounded-3xl bg-slate-800/80 animate-pulse border border-slate-700/50"></div>
          </div>
          <div className="flex items-center justify-between px-1 mt-6 mb-2">
            <div className="h-4 w-32 bg-slate-800/80 animate-pulse rounded-md"></div>
          </div>
          <div className="space-y-3">
             {Array.from({ length: 5 }).map((_, i) => (
                <div key={`skel-${i}`} className="glass rounded-2xl p-4 flex items-center justify-between bg-slate-800/40">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800/60 animate-pulse border border-slate-700/50"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-16 bg-slate-800/60 animate-pulse rounded-md"></div>
                      <div className="h-3 w-24 bg-slate-800/60 animate-pulse rounded-md"></div>
                    </div>
                  </div>
                  <div className="text-left space-y-2">
                    <div className="h-4 w-16 bg-slate-800/60 animate-pulse rounded-md ml-auto"></div>
                    <div className="h-3 w-12 bg-slate-800/60 animate-pulse rounded-md ml-auto"></div>
                  </div>
                </div>
             ))}
          </div>
        </div>
      ) : (
        <>
          {/* Watchlist Section */}
          {favoriteStocks.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 px-1 mb-3">
                 <h3 className="text-sm font-bold text-yellow-400 flex items-center gap-1.5">
                   <Star className="w-4 h-4 fill-yellow-400" /> قائمة المراقبة المُفضلة
                 </h3>
              </div>
              <div className="flex overflow-x-auto pb-4 gap-3 snap-x custom-scrollbar">
                {favoriteStocks.map(stock => {
                  const isUp = stock.changePercent >= 0;
                  return (
                    <div 
                      key={`fav-${stock.symbol}`}
                      onClick={() => handleStockClick(stock)}
                      className="min-w-[140px] snap-center glass rounded-2xl p-3 cursor-pointer hover:bg-slate-800/40 transition-colors border border-yellow-500/20 bg-gradient-to-b from-slate-900 to-slate-900 border-t-yellow-500/50 flex-shrink-0"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-200">{stock.symbol}</span>
                        <button 
                          onClick={(e) => toggleFavorite(e, stock.symbol)}
                          className="text-yellow-400 hover:scale-110 transition-transform"
                        >
                          <Star className="w-3.5 h-3.5 fill-yellow-400" />
                        </button>
                      </div>
                      <div className="font-semibold text-sm">{stock.price.toFixed(2)} EGP</div>
                      <div className={cn("text-xs font-medium mt-1", isUp ? "text-emerald-400" : "text-rose-400")}>
                        {isUp ? "+" : ""}{stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Highlights */}
          <h3 className="text-sm font-bold text-slate-400 px-1">نظرة سريعة</h3>
      <div className="grid grid-cols-2 gap-3">
        <div 
          onClick={() => handleStockClick(bestPerformer)}
          className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 cursor-pointer hover:border-emerald-500/60 transition-colors"
        >
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> الأكثر ارتفاعاً
          </div>
          <div className="text-xl font-bold">{bestPerformer.symbol}</div>
          <div className="text-slate-400 text-xs mt-1">{bestPerformer.price.toFixed(2)} EGP</div>
        </div>
        
        <div 
          onClick={() => handleStockClick(mostActive)}
          className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-4 cursor-pointer hover:border-blue-500/60 transition-colors"
        >
          <div className="flex items-center gap-1 text-xs font-semibold text-blue-400 mb-2">
            <Activity className="w-3.5 h-3.5" /> الأنشط تداولاً
          </div>
          <div className="text-xl font-bold">{mostActive.symbol}</div>
          <div className="text-slate-400 text-xs mt-1">{mostActive.volume} تداول</div>
        </div>
      </div>

      {/* Top 5 Gainers / Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
         {/* Top 5 Gainers */}
         <div className="glass rounded-3xl p-4 border border-emerald-500/20">
            <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> الخمسة الأكثر ارتفاعاً
            </h3>
            <div className="flex flex-col gap-2">
              {topGainers.map((stock, i) => {
                const prevPrice = stock.price / (1 + stock.changePercent / 100);
                const absChange = stock.price - prevPrice;
                return (
                  <div key={`gainer-${stock.symbol}`} onClick={() => handleStockClick(stock)} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors bg-slate-900/40">
                     <div className="flex items-center gap-3">
                        <span className="w-5 text-center text-xs text-slate-500 font-bold">{i + 1}</span>
                        <div className="font-bold text-slate-200 text-sm">{stock.symbol}</div>
                     </div>
                     <div className="text-left flex flex-col items-end">
                        <div className="flex items-center gap-2">
                           <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                             +{absChange.toFixed(2)} EGP
                           </span>
                           <span className="text-sm font-bold text-emerald-400">
                             +{stock.changePercent.toFixed(2)}%
                           </span>
                        </div>
                     </div>
                  </div>
                )
              })}
            </div>
         </div>

         {/* Top 5 Losers */}
         <div className="glass rounded-3xl p-4 border border-rose-500/20">
            <h3 className="text-sm font-bold text-rose-400 mb-3 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" /> الخمسة الأكثر انخفاضاً
            </h3>
            <div className="flex flex-col gap-2">
              {topLosers.length > 0 ? topLosers.map((stock, i) => {
                const prevPrice = stock.price / (1 + stock.changePercent / 100);
                const absChange = stock.price - prevPrice;
                return (
                  <div key={`loser-${stock.symbol}`} onClick={() => handleStockClick(stock)} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/50 cursor-pointer transition-colors bg-slate-900/40">
                     <div className="flex items-center gap-3">
                        <span className="w-5 text-center text-xs text-slate-500 font-bold">{i + 1}</span>
                        <div className="font-bold text-slate-200 text-sm">{stock.symbol}</div>
                     </div>
                     <div className="text-left flex flex-col items-end">
                        <div className="flex items-center gap-2">
                           <span className="text-[11px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded font-mono">
                             {absChange.toFixed(2)} EGP
                           </span>
                           <span className="text-sm font-bold text-rose-400">
                             {stock.changePercent.toFixed(2)}%
                           </span>
                        </div>
                     </div>
                  </div>
                )
              }) : (
                <div className="text-center text-slate-500 text-xs py-10">لا يوجد أسهم منخفضة</div>
              )}
            </div>
         </div>
      </div>

      <div className="flex items-center justify-between px-1 mt-2">
        <div className="flex items-center gap-2">
           <h3 className="text-sm font-bold text-slate-400">قائمة الأسهم (EGX30)</h3>
           {isRefreshing && <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin" />}
        </div>
        <button className="text-xs text-emerald-400 font-medium hover:text-emerald-300 transition-colors flex items-center gap-1">
          عرض الكل <Eye className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {stocks.map((stock) => {
          const isUp = stock.changePercent >= 0;
            const isFav = favorites.includes(stock.symbol);
            return (
              <div 
                key={stock.symbol}
                onClick={() => handleStockClick(stock)}
                className="glass rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-all duration-300 relative group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-200 border border-slate-700/50 shadow-sm">
                    {stock.symbol.substring(0,2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200">{stock.symbol}</h4>
                      {isFav && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 w-32 truncate">{stock.name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-left">
                    <div className="font-semibold text-slate-200">{stock.price.toFixed(2)}</div>
                    <div className={cn(
                      "text-xs font-medium mt-1 flex items-center justify-end gap-0.5",
                      isUp ? "text-emerald-400" : "text-rose-400"
                    )}>
                      {isUp ? "+" : ""}{stock.changePercent}%
                    </div>
                  </div>
                  
                  <button 
                    onClick={(e) => toggleFavorite(e, stock.symbol)}
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 rounded-full"
                  >
                    <Star className={cn("w-4 h-4", isFav ? "text-yellow-400 fill-yellow-400" : "text-slate-400")} />
                  </button>
                </div>
              </div>
            );
          })}
      </div>
        </>
      )}
    </div>
  );
}
