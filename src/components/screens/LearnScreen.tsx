import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, CheckCircle2 } from 'lucide-react';
import { lessons } from '../../data/mockData';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function LearnScreen() {
  const [openLessonId, setOpenLessonId] = useState<number | null>(lessons[0].id);
  const [completed, setCompleted] = useState<number[]>([]);

  useEffect(() => {
    fetch('/api/data/learn_progress')
      .then(res => res.json())
      .then(data => {
        if (data && data.value) setCompleted(data.value);
      })
      .catch(console.error);
  }, []);

  const toggleLesson = (id: number) => {
    setOpenLessonId(prev => prev === id ? null : id);
  };

  const markComplete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!completed.includes(id)) {
      const newCompleted = [...completed, id];
      setCompleted(newCompleted);

      // Save to SQLite
      try {
        await fetch('/api/data/learn_progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: newCompleted })
        });
      } catch(err) {
        console.error('Failed to save learning progress', err);
      }
      
      // Auto-advance to the next lesson
      const currentIndex = lessons.findIndex(l => l.id === id);
      if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
        setTimeout(() => {
          setOpenLessonId(lessons[currentIndex + 1].id);
        }, 300); // slight delay to show the checkmark first
      }
    }
  };

  const progress = Math.round((completed.length / lessons.length) * 100) || 0;

  return (
    <div className="p-5 space-y-6">
      <div className="flex flex-col gap-2 mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-l from-white to-slate-400 bg-clip-text text-transparent">أكاديمية الاستثمار</h2>
        <p className="text-sm text-slate-400">تعلم أساسيات البورصة والاستثمار من الصفر</p>
      </div>

      {/* Progress Card */}
      <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/20 rounded-2xl p-5 shadow-lg shadow-emerald-500/5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <BookOpen className="w-4 h-4" /> مستوى المبتدئين
          </div>
          <span className="text-sm font-bold text-slate-300">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400 mt-3 text-center">أكملت {completed.length} من {lessons.length} دروس</p>
      </div>

      {/* Modules */}
      <div className="space-y-3">
        {lessons.map((lesson, index) => {
          const isOpen = openLessonId === lesson.id;
          const isDone = completed.includes(lesson.id);

          return (
            <div 
              key={lesson.id}
              className={cn(
                "glass rounded-2xl overflow-hidden transition-all duration-300 border",
                isOpen ? "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : 
                isDone ? "border-emerald-500/20 bg-emerald-950/10" : "border-slate-800 hover:border-slate-700"
              )}
            >
              <button 
                onClick={() => toggleLesson(lesson.id)}
                className="w-full p-4 flex items-center justify-between bg-transparent text-right"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                    isDone ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"
                  )}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className={cn(
                    "font-bold transition-colors",
                    isDone ? "text-slate-300" : "text-slate-200"
                  )}>
                    {lesson.title}
                  </span>
                </div>
                <ChevronDown className={cn(
                  "w-5 h-5 text-slate-500 transition-transform duration-300",
                  isOpen && "rotate-180 text-emerald-400"
                )} />
              </button>
              
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    key={`lesson-content-${lesson.id}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 pt-0 border-t border-slate-800/50">
                      <p className="text-sm text-slate-300 leading-relaxed mb-4 mt-4 whitespace-pre-line">
                        {lesson.content}
                      </p>
                      <button 
                        onClick={(e) => markComplete(lesson.id, e)}
                        disabled={isDone}
                        className={cn(
                          "w-full py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 mb-4",
                          isDone 
                            ? "bg-emerald-500/10 text-emerald-400 cursor-default" 
                            : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                        )}
                      >
                        {isDone ? (
                          <>مكتمل <CheckCircle2 className="w-4 h-4" /></>
                        ) : (
                          "تحديد كمكتمل"
                        )}
                      </button>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 text-xs">
                        {index < lessons.length - 1 ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenLessonId(lessons[index+1].id); }}
                            className="text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1"
                          >
                            الدرس التالي
                          </button>
                        ) : <div />}
                        
                        {index > 0 ? (
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenLessonId(lessons[index-1].id); }}
                            className="text-slate-400 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1"
                          >
                            السابق
                          </button>
                        ) : <div />}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
