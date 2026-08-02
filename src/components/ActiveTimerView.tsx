import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, TimeTrackSession } from '../types';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Briefcase,
  Sparkles
} from 'lucide-react';

interface ActiveTimerViewProps {
  tasks: Task[];
  activeTask: Task | null;
  trackingSessions: TimeTrackSession[];
  onSelectTask: (task: Task) => void;
  onLogCompletedSession: (session: Omit<TimeTrackSession, 'id'>) => void;
}

export const ActiveTimerView: React.FC<ActiveTimerViewProps> = ({
  tasks,
  activeTask,
  trackingSessions,
  onSelectTask,
  onLogCompletedSession,
}) => {
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [timerState, setTimerState] = useState<'stopped' | 'running' | 'paused'>('stopped');
  const [sessionStartTime, setSessionStartTime] = useState<string | null>(null);
  const [interruptionCount, setInterruptionCount] = useState<number>(0);
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Ticking effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerState === 'running') {
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState]);

  // Format HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs < 10 ? '0' : ''}${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Controls
  const handleStart = () => {
    if (!activeTask) return;
    setTimerState('running');
    if (!sessionStartTime) {
      setSessionStartTime(new Date().toISOString());
    }
  };

  const handlePause = () => {
    setTimerState('paused');
    setInterruptionCount((prev) => prev + 1);
  };

  const handleResume = () => {
    setTimerState('running');
  };

  const handleEnd = () => {
    if (!activeTask) return;
    const durationMinutes = Math.max(1, Math.round(secondsElapsed / 60));

    onLogCompletedSession({
      taskId: activeTask.id,
      taskTitle: activeTask.title,
      category: activeTask.category,
      startTime: sessionStartTime || new Date().toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes,
      estimatedMinutes: activeTask.estimatedMinutes,
      interruptionCount,
      status: 'completed',
      notes: sessionNotes.trim() || 'Hoàn thành phiên làm việc.'
    });

    // Reset stopwatch state
    setTimerState('stopped');
    setSecondsElapsed(0);
    setSessionStartTime(null);
    setInterruptionCount(0);
    setSessionNotes('');
  };

  const handleReset = () => {
    setTimerState('stopped');
    setSecondsElapsed(0);
    setSessionStartTime(null);
    setInterruptionCount(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 max-w-5xl mx-auto"
    >
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-teal-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-100/80 text-teal-900 text-xs font-bold mb-1 border border-teal-200">
            <Timer className="w-3.5 h-3.5 text-teal-700" />
            <span>Đồng Hồ Tập Trung</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-teal-950">
            Theo Dõi Thời Gian Thực Tế
          </h1>
          <p className="text-xs sm:text-sm text-teal-900/80 font-medium mt-0.5">
            Tập trung hoàn thành từng ca công việc. Hệ thống tự động lưu vào báo cáo và học hỏi AI!
          </p>
        </div>
      </div>

      {/* Main Stopwatch Card */}
      <motion.div
        animate={timerState === 'running' ? { y: [0, -2, 0] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className="bg-gradient-to-br from-teal-100/90 via-emerald-50 to-lime-100/80 rounded-3xl p-8 border border-teal-200/90 shadow-md text-center space-y-6 relative overflow-hidden"
      >
        
        {/* Cute Floating Mascot Icon */}
        <div className="absolute top-4 right-4 text-3xl opacity-40 select-none animate-bounce-gentle">
          {timerState === 'running' ? '🚀' : timerState === 'paused' ? '☕' : '💤'}
        </div>

        {/* Task Selection Dropdown */}
        <div className="max-w-md mx-auto space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Chọn công việc cần thực hiện:
          </label>
          <select
            value={activeTask?.id || ''}
            onChange={(e) => {
              const selected = tasks.find((t) => t.id === e.target.value);
              if (selected) {
                onSelectTask(selected);
                handleReset();
              }
            }}
            className="w-full bg-white border border-indigo-200 rounded-2xl p-3 text-xs sm:text-sm font-bold text-indigo-900 shadow-2xs focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.category.toUpperCase()}] {t.title} ({t.estimatedMinutes} phút)
              </option>
            ))}
          </select>
        </div>

        {/* Stopwatch Digital Display */}
        <div className="py-6 space-y-2">
          <motion.div
            key={secondsElapsed}
            animate={{ scale: [1, 1.01, 1] }}
            className="text-5xl sm:text-7xl font-black text-indigo-900 font-mono tracking-wider drop-shadow-2xs"
          >
            {formatTime(secondsElapsed)}
          </motion.div>
          
          <div className="mt-2 text-xs font-semibold text-slate-600 flex items-center justify-center space-x-3">
            <span>
              Trạng thái:{' '}
              <strong className={`uppercase ${timerState === 'running' ? 'text-emerald-600' : timerState === 'paused' ? 'text-amber-600' : 'text-slate-500'}`}>
                {timerState === 'running' ? '⚡ Đang chạy' : timerState === 'paused' ? '☕ Đã tạm dừng' : '💤 Chưa bắt đầu'}
              </strong>
            </span>
            <span>•</span>
            <span>Số lần tạm dừng: <strong className="text-purple-700">{interruptionCount}</strong></span>
          </div>
        </div>

        {/* Control Buttons: Start, Pause, Resume, End */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {timerState === 'stopped' && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleStart}
              disabled={!activeTask}
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-extrabold shadow-md flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Bắt đầu</span>
            </motion.button>
          )}

          {timerState === 'running' && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handlePause}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-sm font-extrabold shadow-md flex items-center space-x-2 transition-all"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Tạm dừng</span>
            </motion.button>
          )}

          {timerState === 'paused' && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleResume}
              className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-extrabold shadow-md flex items-center space-x-2 transition-all"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Tiếp tục</span>
            </motion.button>
          )}

          {(timerState === 'running' || timerState === 'paused') && (
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleEnd}
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-sm font-extrabold shadow-md flex items-center space-x-2 transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>Hoàn thành & Lưu phiên</span>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05, rotate: -30 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-3 bg-white/80 hover:bg-white text-slate-600 border border-slate-200 rounded-2xl text-sm font-bold shadow-2xs"
            title="Đặt lại đồng hồ"
          >
            <RotateCcw className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Optional Notes Input */}
        <div className="max-w-md mx-auto pt-2">
          <input
            type="text"
            placeholder="Ghi chú thêm cho phiên làm việc này (tùy chọn)..."
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            className="w-full bg-white/90 border border-purple-200 rounded-2xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

      </motion.div>

      {/* History of Completed Sessions (Nhật Ký Thời Gian Thực Tế) */}
      <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>Lịch Sử Các Phiên Bấm Giờ Thực Tế Đã Ghi Nhận ({trackingSessions.length})</span>
        </h3>

        <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
          {trackingSessions.length > 0 ? (
            trackingSessions.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="font-bold text-slate-800">{s.taskTitle}</div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Bắt đầu: {s.startTime.split('T')[1]?.substring(0, 5)} | Tạm dừng: {s.interruptionCount} lần
                  </div>
                  {s.notes && <p className="text-[11px] text-indigo-800 italic">"{s.notes}"</p>}
                </div>

                <div className="text-right shrink-0">
                  <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-900 font-mono">
                    {s.durationMinutes} phút
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6 italic">
              Chưa có phiên bấm giờ nào được lưu.
            </p>
          )}
        </div>
      </div>

    </motion.div>
  );
};
