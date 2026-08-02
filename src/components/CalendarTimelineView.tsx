import React, { useState, useEffect, useRef } from 'react';
import {
  CalendarEvent,
  Task,
  TaskStatus,
  ScheduledSlot
} from '../types';
import {
  Calendar as CalendarIcon,
  Clock,
  Lock,
  Unlock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Edit3,
  CalendarDays,
  Play,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

interface CalendarTimelineViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onMoveTaskSlot: (taskId: string, newDate: string, newStartTime: string, newEndTime: string) => void;
  onToggleTaskLock: (taskId: string) => void;
  onSelectTaskForTimer: (task: Task) => void;
  onDeleteEvent: (eventId: string) => void;
  onTriggerAISchedule: () => void;
  isAIScheduling: boolean;
}

export const CalendarTimelineView: React.FC<CalendarTimelineViewProps> = ({
  events,
  tasks,
  onMoveTaskSlot,
  onToggleTaskLock,
  onSelectTaskForTimer,
  onDeleteEvent,
  onTriggerAISchedule,
  isAIScheduling,
}) => {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedTaskForAction, setSelectedTaskForAction] = useState<Task | null>(null);
  const [selectedEventForAction, setSelectedEventForAction] = useState<CalendarEvent | null>(null);

  // Dynamic Hour Height state for Zoom In / Zoom Out
  const [hourHeight, setHourHeight] = useState<number>(56);

  // Time / Day change modal states
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [showDayModal, setShowDayModal] = useState<boolean>(false);
  const [newStartTimeInput, setNewStartTimeInput] = useState<string>('09:00');
  const [newEndTimeInput, setNewEndTimeInput] = useState<string>('11:00');
  const [newDateInput, setNewDateInput] = useState<string>('');

  // Week navigation offset (0 = current week, -1 = prev week, 1 = next week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Current time marker state
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const gridScrollRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setHourHeight((prev) => Math.min(prev + 12, 112));
  const handleZoomOut = () => setHourHeight((prev) => Math.max(prev - 12, 32));
  const handleResetZoom = () => setHourHeight(56);
  const zoomPercentage = Math.round((hourHeight / 56) * 100);

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Calculate 7 days of the week starting from Sunday (CN) like Google Calendar
  const getDaysOfWeek = (offset: number) => {
    const now = new Date();
    const d = new Date(now);
    d.setDate(now.getDate() + offset * 7);
    const dayOfWeek = d.getDay(); // 0 = CN (Sunday)
    d.setDate(d.getDate() - dayOfWeek); // Jump back to Sunday of this week

    const days = [];
    const dayNames = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7'];

    for (let i = 0; i < 7; i++) {
      const dateObj = new Date(d);
      dateObj.setDate(d.getDate() + i);
      const isoStr = dateObj.toISOString().split('T')[0];
      days.push({
        dateIso: isoStr,
        dateObj,
        dayName: dayNames[i],
        dayNum: dateObj.getDate(),
        dayOfWeekIndex: i,
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear()
      });
    }
    return days;
  };

  const weekDays = getDaysOfWeek(weekOffset);

  // Scroll to current time / morning hours on view load
  useEffect(() => {
    if (gridScrollRef.current && viewMode === 'week') {
      const now = new Date();
      const currentHour = now.getHours();
      const targetHour = Math.max(0, currentHour - 1);
      gridScrollRef.current.scrollTop = targetHour * hourHeight;
    }
  }, [viewMode, weekOffset]);

  // Compute month range title for header e.g. "Tháng 7 – Tháng 8, 2026"
  const getMonthYearTitle = () => {
    const firstDay = weekDays[0];
    const lastDay = weekDays[6];
    if (firstDay.month === lastDay.month) {
      return `Tháng ${firstDay.month}, ${firstDay.year}`;
    }
    return `Tháng ${firstDay.month} – Tháng ${lastDay.month}, ${firstDay.year}`;
  };

  // 24 Hour labels format
  const hoursList = Array.from({ length: 24 }, (_, i) => {
    if (i === 0) return '12 AM';
    if (i < 12) return `${i} AM`;
    if (i === 12) return '12 PM';
    return `${i - 12} PM`;
  });

  // Helper to parse time string to total minutes from 00:00
  const parseTimeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    if (timeStr.includes('T')) {
      const timePart = timeStr.split('T')[1]?.substring(0, 5) || '00:00';
      const [h, m] = timePart.split(':').map(Number);
      return (h || 0) * 60 + (m || 0);
    }
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Today ISO string
  const todayIso = currentTime.toISOString().split('T')[0];
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTimeTopPx = (currentMinutes / 60) * hourHeight;

  // Handle Accept / Confirm Slot
  const handleAcceptSlot = (task: Task) => {
    if (task.scheduledSlot) {
      onToggleTaskLock(task.id);
    }
    setSelectedTaskForAction(null);
  };

  // Handle Change Time
  const handleApplyChangeTime = () => {
    if (!selectedTaskForAction || !selectedTaskForAction.scheduledSlot) return;
    onMoveTaskSlot(
      selectedTaskForAction.id,
      selectedTaskForAction.scheduledSlot.date,
      newStartTimeInput,
      newEndTimeInput
    );
    setShowTimeModal(false);
    setSelectedTaskForAction(null);
  };

  // Handle Change Day
  const handleApplyChangeDay = () => {
    if (!selectedTaskForAction || !selectedTaskForAction.scheduledSlot) return;
    onMoveTaskSlot(
      selectedTaskForAction.id,
      newDateInput || selectedTaskForAction.scheduledSlot.date,
      selectedTaskForAction.scheduledSlot.startTime,
      selectedTaskForAction.scheduledSlot.endTime
    );
    setShowDayModal(false);
    setSelectedTaskForAction(null);
  };

  return (
    <div className="space-y-4">
      
      {/* Google Calendar Style Toolbar Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-emerald-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Navigation Controls & Month Display */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={() => setWeekOffset(0)}
            className="px-4 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-full border border-emerald-300/80 transition-all shadow-2xs"
          >
            Hôm nay
          </button>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-full transition-all"
              title="Tuần trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1.5 hover:bg-emerald-50 text-emerald-800 rounded-full transition-all"
              title="Tuần sau"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-emerald-950 font-sans tracking-tight">
            {getMonthYearTitle()}
          </h2>
        </div>

        {/* Right: Zoom Controls, View Selector & AI Action */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom In / Zoom Out Controls */}
          <div className="bg-emerald-50/80 p-1 rounded-xl flex items-center space-x-1 border border-emerald-200/80" title="Phóng to / Thu nhỏ trục 24h">
            <button
              onClick={handleZoomOut}
              disabled={hourHeight <= 32}
              className="p-1 hover:bg-white text-emerald-800 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
              title="Thu nhỏ trục thời gian (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-emerald-900 px-1 select-none min-w-[36px] text-center">
              {zoomPercentage}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={hourHeight >= 112}
              className="p-1 hover:bg-white text-emerald-800 rounded-lg transition-all disabled:opacity-40 cursor-pointer"
              title="Phóng lớn trục thời gian (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            {hourHeight !== 56 && (
              <button
                onClick={handleResetZoom}
                className="p-1 hover:bg-white text-emerald-800 rounded-lg transition-all cursor-pointer"
                title="Khôi phục kích thước chuẩn (100%)"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Day / Week / Month View Selector */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'day' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'week' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'month' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tháng
            </button>
          </div>

          <button
            onClick={onTriggerAISchedule}
            disabled={isAIScheduling}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">{isAIScheduling ? 'Đang Lập Lịch...' : 'AI Lập Lịch Tự Động'}</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE: WEEK VIEW (Google Calendar 7-Day x 24-Hour Interactive Grid) */}
      {viewMode === 'week' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          
          {/* Top Header Row: 7 Day Columns */}
          <div className="grid grid-cols-[64px_repeat(7,_1fr)] border-b border-slate-200 bg-white sticky top-0 z-20">
            {/* GMT / Timezone Label */}
            <div className="p-3 text-[10px] font-bold text-slate-400 border-r border-slate-200 flex items-center justify-center">
              GMT+07
            </div>

            {/* 7 Days Headers */}
            {weekDays.map((day) => {
              const isToday = day.dateIso === todayIso;
              return (
                <div
                  key={day.dateIso}
                  className={`p-2.5 text-center border-r border-slate-200/80 last:border-r-0 ${
                    isToday ? 'bg-indigo-50/30' : ''
                  }`}
                >
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                    isToday ? 'text-blue-600' : 'text-slate-500'
                  }`}>
                    {day.dayName}
                  </span>

                  <div className="mt-1 flex items-center justify-center">
                    <span
                      className={`text-sm sm:text-base font-extrabold w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                        isToday
                          ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                          : 'text-slate-800'
                      }`}
                    >
                      {day.dayNum}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid Scrollable Body (24 Hours) */}
          <div
            ref={gridScrollRef}
            className="h-[680px] overflow-y-auto overflow-x-hidden relative scrollbar-thin"
          >
            <div
              className="grid grid-cols-[64px_repeat(7,_1fr)] relative"
              style={{ minHeight: `${24 * hourHeight}px` }}
            >
              
              {/* Left Column: 24 Time Labels */}
              <div className="border-r border-slate-200 bg-slate-50/50 select-none">
                {hoursList.map((label, hourIdx) => (
                  <div
                    key={hourIdx}
                    style={{ height: `${hourHeight}px` }}
                    className="border-b border-slate-100 text-[10px] font-mono text-slate-400 pr-2 pt-0.5 text-right relative"
                  >
                    {hourIdx > 0 && <span className="-top-2.5 relative">{label}</span>}
                  </div>
                ))}
              </div>

              {/* 7 Day Columns Grid */}
              {weekDays.map((day, colIdx) => {
                const isToday = day.dateIso === todayIso;

                // Fixed Events for this day
                const dayEvents = events.filter((e) => {
                  if (e.startTime.startsWith(day.dateIso)) return true;
                  return e.type === 'weekly' && e.dayOfWeek === day.dayOfWeekIndex;
                });

                // AI Scheduled Tasks for this day
                const dayTasks = tasks.filter(
                  (t) => t.scheduledSlot && t.scheduledSlot.date === day.dateIso
                );

                return (
                  <div
                    key={day.dateIso}
                    className={`border-r border-slate-200/80 last:border-r-0 relative group ${
                      isToday ? 'bg-indigo-50/15' : ''
                    }`}
                  >
                    {/* 24 Horizontal Hour Grid Lines */}
                    {hoursList.map((_, hourIdx) => (
                      <div
                        key={hourIdx}
                        style={{ height: `${hourHeight}px` }}
                        className="border-b border-slate-100 hover:bg-slate-100/40 transition-colors"
                      />
                    ))}

                    {/* Red Line Current Time Indicator for Today */}
                    {isToday && (
                      <div
                        style={{ top: `${currentTimeTopPx}px` }}
                        className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-red-600 -ml-1.25 shadow-xs" />
                        <div className="h-[2px] bg-red-600 flex-1" />
                      </div>
                    )}

                    {/* Render Fixed Events */}
                    {dayEvents.map((evt) => {
                      const startMins = parseTimeToMinutes(evt.startTime);
                      const endMins = parseTimeToMinutes(evt.endTime);
                      const durationMins = Math.max(endMins - startMins, 30);

                      const topPx = (startMins / 60) * hourHeight;
                      const heightPx = Math.max((durationMins / 60) * hourHeight, 26);
                      const isShort = heightPx < 44;

                      return (
                        <div
                          key={evt.id}
                          title={`${evt.title} (${evt.startTime.split('T')[1]?.substring(0, 5)} - ${evt.endTime.split('T')[1]?.substring(0, 5)})`}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                          }}
                          onClick={() => setSelectedEventForAction(evt)}
                          className="absolute left-1 right-1 z-10 p-1.5 rounded-md bg-blue-100/95 hover:bg-blue-50 border-l-4 border-l-blue-600 border border-blue-300 text-blue-950 shadow-2xs hover:shadow-xl hover:z-40 hover:h-auto hover:min-h-[50px] cursor-pointer transition-all overflow-hidden hover:overflow-visible flex flex-col justify-between group/evt"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className={`font-bold text-[11px] leading-tight text-blue-950 group-hover/evt:line-clamp-none ${
                              isShort ? 'line-clamp-1' : 'line-clamp-2'
                            }`}>
                              {evt.title}
                            </span>
                            <Lock className="w-3 h-3 text-blue-600 shrink-0 mt-0.5" title="Sự kiện cố định (Đã khóa)" />
                          </div>

                          <div className="text-[10px] font-mono text-blue-800 flex items-center space-x-1 mt-auto pt-0.5">
                            <Clock className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="font-semibold">
                              {evt.startTime.split('T')[1]?.substring(0, 5)} - {evt.endTime.split('T')[1]?.substring(0, 5)}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Render Tasks Scheduled by AI */}
                    {dayTasks.map((task) => {
                      if (!task.scheduledSlot) return null;
                      const startMins = parseTimeToMinutes(task.scheduledSlot.startTime);
                      const endMins = parseTimeToMinutes(task.scheduledSlot.endTime);
                      const durationMins = Math.max(endMins - startMins, 30);

                      const topPx = (startMins / 60) * hourHeight;
                      const heightPx = Math.max((durationMins / 60) * hourHeight, 26);
                      const isDone = task.status === 'completed';
                      const isShort = heightPx < 44;

                      return (
                        <div
                          key={task.id}
                          title={`${task.title} (${task.scheduledSlot.startTime} - ${task.scheduledSlot.endTime})`}
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                          }}
                          onClick={() => setSelectedTaskForAction(task)}
                          className={`absolute left-1 right-1 z-10 p-1.5 rounded-md border-l-4 border text-xs shadow-2xs hover:shadow-xl hover:z-40 hover:h-auto hover:min-h-[50px] cursor-pointer transition-all overflow-hidden hover:overflow-visible flex flex-col justify-between group/task ${
                            isDone
                              ? 'bg-emerald-100/95 border-l-emerald-600 border-emerald-300 text-slate-700 line-through'
                              : 'bg-purple-100/95 hover:bg-white border-l-purple-600 border-purple-300 text-purple-950 hover:border-purple-500'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className={`font-bold text-[11px] leading-tight text-purple-950 group-hover/task:line-clamp-none ${
                              isShort ? 'line-clamp-1' : 'line-clamp-2'
                            }`}>
                              {task.title}
                            </span>
                            {task.scheduledSlot.isLocked ? (
                              <Lock className="w-3 h-3 text-indigo-600 shrink-0 mt-0.5" title="Khung giờ đã chốt" />
                            ) : (
                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" title="AI tự động đề xuất" />
                            )}
                          </div>

                          <div className="text-[10px] font-mono text-purple-900 flex items-center justify-between mt-auto pt-0.5">
                            <span className="font-semibold">
                              {task.scheduledSlot.startTime} - {task.scheduledSlot.endTime}
                            </span>
                            <span className="px-1 py-0.2 rounded text-[8px] bg-purple-200/80 font-sans uppercase shrink-0 font-bold ml-1">
                              {task.category}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                  </div>
                );
              })}

            </div>
          </div>

          {/* Footer Legend Bar */}
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs gap-3">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-blue-100 border-l-2 border-l-blue-600 border border-blue-300" />
                <span className="text-slate-600 font-medium text-[11px]">Sự kiện cố định (Học, Thi, Họp)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-purple-100 border-l-2 border-l-purple-600 border border-purple-300" />
                <span className="text-slate-600 font-medium text-[11px]">Công việc AI tự động sắp xếp</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-100 border-l-2 border-l-emerald-600 border border-emerald-300" />
                <span className="text-slate-600 font-medium text-[11px]">Công việc hoàn thành</span>
              </div>
            </div>

            <span className="text-[11px] text-slate-500 italic">
              💡 Nhấp trực tiếp vào bất kỳ khung giờ hoặc công việc để tùy chỉnh
            </span>
          </div>

        </div>
      )}

      {/* VIEW MODE: DAY VIEW */}
      {viewMode === 'day' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Lịch Chi Tiết Ngày Hôm Nay</h3>
              <p className="text-xs text-slate-500">Hiển thị đầy đủ tên công việc, ca làm CSKH, khung giờ và ghi chú</p>
            </div>
            <span className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold text-xs rounded-xl">
              {todayIso}
            </span>
          </div>

          <div className="space-y-3">
            {events.length === 0 && tasks.filter(t => t.scheduledSlot?.date === todayIso).length === 0 && (
              <div className="text-center py-8 text-slate-400 text-xs italic">
                Chưa có lịch cố định hay nhiệm vụ AI xếp vào ngày này.
              </div>
            )}

            {events.map((evt) => (
              <div
                key={evt.id}
                onClick={() => setSelectedEventForAction(evt)}
                className="p-4 bg-blue-50/80 hover:bg-blue-100/80 rounded-2xl border-l-4 border-l-blue-600 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 cursor-pointer transition-all shadow-2xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="font-bold text-sm text-blue-950">{evt.title}</span>
                  </div>
                  {evt.location && (
                    <p className="text-xs text-slate-600 flex items-center space-x-1">
                      <span>📍 {evt.location}</span>
                    </p>
                  )}
                </div>

                <div className="px-3 py-1.5 bg-white rounded-xl border border-blue-200 text-blue-800 font-mono font-bold text-xs shrink-0 self-start sm:self-center">
                  ⏰ {evt.startTime.split('T')[1]?.substring(0, 5)} - {evt.endTime.split('T')[1]?.substring(0, 5)}
                </div>
              </div>
            ))}

            {tasks.filter(t => t.scheduledSlot).map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTaskForAction(t)}
                className={`p-4 rounded-2xl border-l-4 border flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 cursor-pointer transition-all shadow-2xs ${
                  t.status === 'completed'
                    ? 'bg-emerald-50/80 border-l-emerald-600 border-emerald-200 text-slate-700 line-through'
                    : 'bg-purple-50/80 hover:bg-purple-100/80 border-l-purple-600 border-purple-200 text-slate-900'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="font-bold text-sm text-slate-900">{t.title}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 font-medium">Danh mục: {t.category}</span>
                    <span className="px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 font-medium">Ưu tiên: {t.priority}</span>
                    <span>Hạn chót: {t.deadline}</span>
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-white rounded-xl border border-purple-200 text-purple-900 font-mono font-bold text-xs shrink-0 self-start sm:self-center">
                  📅 {t.scheduledSlot?.date} ({t.scheduledSlot?.startTime} - {t.scheduledSlot?.endTime})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW MODE: MONTH VIEW GRID */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Lịch Tổng Quan Tháng 07 / 2026</h3>
              <p className="text-xs text-slate-500">Xem tất cả các ca làm CSKH, lịch học cố định và bài tập trong tháng</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-slate-600">Sự kiện cố định</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-slate-600">Task AI xếp</span>
              </span>
            </div>
          </div>

          {/* Month Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5 text-center">
            {['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'].map((dayLabel, idx) => (
              <div key={idx} className="p-2 bg-slate-100/80 rounded-xl font-bold text-slate-700 text-xs">
                {dayLabel}
              </div>
            ))}

            {Array.from({ length: 31 }, (_, i) => {
              const dayNum = i + 1;
              const dateIsoStr = `2026-07-${dayNum < 10 ? '0' + dayNum : dayNum}`;
              const isToday = dateIsoStr === todayIso;

              const dayEvts = events.filter((e) => e.startTime.startsWith(dateIsoStr));
              const dayTsks = tasks.filter((t) => t.scheduledSlot?.date === dateIsoStr);

              return (
                <div
                  key={dayNum}
                  className={`min-h-[90px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isToday
                      ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-400/40'
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isToday ? 'text-indigo-800' : 'text-slate-700'}`}>
                      {dayNum}
                    </span>
                    {(dayEvts.length > 0 || dayTsks.length > 0) && (
                      <span className="px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[9px]">
                        {dayEvts.length + dayTsks.length} việc
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 my-1 flex-1 overflow-y-auto max-h-[70px] pr-0.5">
                    {dayEvts.map((e) => (
                      <div
                        key={e.id}
                        title={`${e.title} (${e.startTime.split('T')[1]?.substring(0, 5)})`}
                        onClick={() => setSelectedEventForAction(e)}
                        className="px-1.5 py-1 bg-blue-100 hover:bg-blue-200 border-l-2 border-l-blue-600 text-blue-950 rounded text-[10px] font-bold cursor-pointer leading-tight break-words"
                      >
                        🔒 {e.title}
                      </div>
                    ))}
                    {dayTsks.map((t) => (
                      <div
                        key={t.id}
                        title={`${t.title} (${t.scheduledSlot?.startTime} - ${t.scheduledSlot?.endTime})`}
                        onClick={() => setSelectedTaskForAction(t)}
                        className={`px-1.5 py-1 border-l-2 text-[10px] font-bold rounded cursor-pointer leading-tight break-words ${
                          t.status === 'completed'
                            ? 'bg-emerald-100 border-l-emerald-600 text-emerald-950 line-through'
                            : 'bg-purple-100 hover:bg-purple-200 border-l-purple-600 text-purple-950'
                        }`}
                      >
                        📌 {t.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TASK MODAL (Khi người dùng nhấp vào Task trên lịch) */}
      {selectedTaskForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-indigo-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Điều Chỉnh Lịch Công Việc</h3>
                  <p className="text-[11px] text-slate-500">Tùy chọn tương tác AI</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTaskForAction(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 text-sm">{selectedTaskForAction.title}</div>
              <div className="text-slate-600 flex items-center space-x-2 font-mono">
                <span>Ngày: {selectedTaskForAction.scheduledSlot?.date}</span>
                <span>•</span>
                <span>
                  {selectedTaskForAction.scheduledSlot?.startTime} - {selectedTaskForAction.scheduledSlot?.endTime}
                </span>
              </div>
            </div>

            {/* AI Action Buttons */}
            <div className="space-y-2.5 pt-1 text-xs">
              <button
                onClick={() => handleAcceptSlot(selectedTaskForAction)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold flex items-center justify-center space-x-2 shadow-xs transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Chấp Nhận Lịch (Khóa Vị Trí)</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowTimeModal(true)}
                  className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-2xl font-semibold border border-indigo-200 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <span>Đổi Giờ</span>
                </button>

                <button
                  onClick={() => {
                    setNewDateInput(selectedTaskForAction.scheduledSlot?.date || '');
                    setShowDayModal(true);
                  }}
                  className="py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-2xl font-semibold border border-purple-200 flex items-center justify-center space-x-1.5 transition-all"
                >
                  <CalendarIcon className="w-4 h-4 text-purple-600" />
                  <span>Đổi Ngày</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onTriggerAISchedule();
                  setSelectedTaskForAction(null);
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-semibold flex items-center justify-center space-x-2 transition-all"
              >
                <RefreshCw className="w-4 h-4 text-slate-600" />
                <span>Yêu Cầu AI Xếp Lại (Replan)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EVENT MODAL (Khi người dùng nhấp vào Sự kiện cố định) */}
      {selectedEventForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-blue-200 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">Sự Kiện Cố Định (Đã Khóa)</h3>
                  <p className="text-[11px] text-slate-500">Lịch học, thi cử, ca làm cố định</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedEventForAction(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-blue-50 rounded-2xl border border-blue-100 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900 text-sm">{selectedEventForAction.title}</div>
              <div className="text-slate-600 font-mono">
                {selectedEventForAction.startTime.split('T')[1]?.substring(0, 5)} - {selectedEventForAction.endTime.split('T')[1]?.substring(0, 5)}
              </div>
              <div className="text-slate-500 text-[11px]">
                {selectedEventForAction.location || 'Chưa cập nhật địa điểm'}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => {
                  onDeleteEvent(selectedEventForAction.id);
                  setSelectedEventForAction(null);
                }}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Sự Kiện Này</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Change Time Input */}
      {showTimeModal && selectedTaskForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-indigo-100 text-slate-800">
            <h3 className="font-bold text-base text-slate-800">Chọn Khung Giờ Mới</h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Giờ bắt đầu:</label>
                <input
                  type="time"
                  value={newStartTimeInput}
                  onChange={(e) => setNewStartTimeInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Giờ kết thúc:</label>
                <input
                  type="time"
                  value={newEndTimeInput}
                  onChange={(e) => setNewEndTimeInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyChangeTime}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Xác Nhận Đổi Giờ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Modal: Change Day Input */}
      {showDayModal && selectedTaskForAction && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-purple-100 text-slate-800">
            <h3 className="font-bold text-base text-slate-800">Chọn Ngày Mới</h3>
            
            <div className="text-xs">
              <label className="block text-slate-600 font-medium mb-1">Chọn ngày cần dời sang:</label>
              <input
                type="date"
                value={newDateInput}
                onChange={(e) => setNewDateInput(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                onClick={() => setShowDayModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleApplyChangeDay}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Xác Nhận Đổi Ngày
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

