import { useState } from 'react';
import { Clock, ExternalLink, Bot, Sparkles } from 'lucide-react';
import { newsArticles } from '../../data/mockData';
import { askGemini } from '../../services/geminiService';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function NewsScreen() {
  const [analyzingId, setAnalyzingId] = useState<number | null>(null);
  const [analyses, setAnalyses] = useState<Record<number, string>>({});

  const handleAnalyze = async (id: number, title: string, summary: string) => {
    if (analyses[id]) return; // Already analyzed
    setAnalyzingId(id);
    const context = `عنوان الخبر: ${title}\nالملخص: ${summary}`;
    const response = await askGemini("هل يمكنك شرح تأثير هذا الخبر على البورصة المصرية بشكل مبسط للمبتدئين في فقرة صغيرة جداً؟", context);
    setAnalyses(prev => ({ ...prev, [id]: response }));
    setAnalyzingId(null);
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'اقتصاد': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'شركات': return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'تحليلات': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-col gap-2 mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-l from-white to-slate-400 bg-clip-text text-transparent">أهم الأخبار المالية</h2>
        <p className="text-sm text-slate-400">تحديثات السوق المصري والاقتصاد</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {newsArticles.map((article) => {
          const hasAnalysis = !!analyses[article.id];
          const isAnalyzing = analyzingId === article.id;

          return (
            <div 
              key={article.id}
              className="group relative glass rounded-2xl overflow-hidden hover:bg-slate-800/40 transition-colors flex flex-col"
            >
              <div className="absolute top-0 right-0 w-1 bg-emerald-500 h-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md border", getCategoryTheme(article.category))}>
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    {article.date} <Clock className="w-3 h-3" />
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2 leading-tight">
                  {article.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-4">
                  {article.summary}
                </p>
                
                <AnimatePresence>
                  {hasAnalysis && (
                    <motion.div 
                      key={`analysis-${article.id}`}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mb-4 p-3 bg-teal-950/30 border border-teal-500/20 rounded-xl relative overflow-hidden"
                    >
                      <div className="flex items-center gap-2 mb-2">
                         <div className="w-6 h-6 rounded-full bg-teal-500/20 flex flex-shrink-0 items-center justify-center">
                            <Bot className="w-3 h-3 text-teal-400" />
                         </div>
                         <span className="text-xs font-bold text-teal-300">تحليل المساعد: تأثير الخبر</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed mr-8">
                        {analyses[article.id]}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
              
              <div className="border-t border-slate-800 mt-auto bg-slate-900/50 p-2 flex">
                 <button 
                  onClick={() => handleAnalyze(article.id, article.title, article.summary)}
                  disabled={hasAnalysis || isAnalyzing}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 text-xs font-semibold py-2 px-3 rounded-lg transition-all",
                    hasAnalysis ? "text-slate-500 cursor-default" :
                    isAnalyzing ? "text-emerald-400 bg-emerald-500/10 cursor-wait animate-pulse" :
                    "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                  )}
                 >
                   {isAnalyzing ? (
                     <>جاري التحليل... <Sparkles className="w-3.5 h-3.5" /></>
                   ) : hasAnalysis ? (
                     "تم التحليل بواسطة الذكاء الاصطناعي"
                   ) : (
                     <>حلل تأثير الخبر <Sparkles className="w-3.5 h-3.5" /></>
                   )}
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
