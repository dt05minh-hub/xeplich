import React from 'react';
import {
  Task,
  CalendarEvent,
  AdaptiveUserProfile,
  TimeTrackSession,
  TaskStatus,
  WorkConstraint
} from '../types';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Play,
  Sparkles,
  TrendingUp,
  Briefcase,
  Target,
  ArrowRight
} from 'lucide-react';

interface DashboardViewProps {
  tasks: Task[];
  events: CalendarEvent[];
  profile: AdaptiveUserProfile;
  trackingSessions: TimeTrackSession[];
  constraints?: WorkConstraint[];
  onSelectTaskForTimer: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onNavigateToTab: (tab: any) => void;
  onTriggerAISchedule: () => void;
  isAIScheduling: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  events,
  profile,
  trackingSessions,
  constraints = [],
  onSelectTaskForTimer,
  onUpdateTaskStatus,
  onNavigateToTab,
  onTriggerAISchedule,
  isAIScheduling,
}) => {
  const todayIso = new Date().toISOString().split('T')[0];

  // 1. Today's Tasks
  const todayTasks = tasks.filter(
    (t) => t.scheduledSlot?.date === todayIso || t.deadline === todayIso
  );

  // 2. Today's Events
  const todayEvents = events.filter((e) => {
    if (e.startTime.startsWith(todayIso)) return true;
    const currentDayOfWeek = new Date().getDay();
    return e.type === 'weekly' && e.dayOfWeek === currentDayOfWeek;
  });

  // 3. Next Upcoming Task
  const pendingOrScheduled = tasks.filter(
    (t) => t.status === 'scheduled' || t.status === 'in_progress' || t.status === 'pending'
  );
  const nextTask = pendingOrScheduled[0] || null;

  // 4. Tasks Close to Deadline
  const upcomingDeadlineTasks = tasks
    .filter((t) => t.deadline && t.status !== 'completed')
    .sort((a, b) => (a.deadline! > b.deadline! ? 1 : -1))
    .slice(0, 3);

  // 5. Total Remaining Hours Calculation vs Target (Dynamic from Constraints & Profile)
  const allConstraints = constraints.length > 0 ? constraints : (profile.workConstraints || []);
  
  // Build dynamic target list
  const dynamicTargetList = allConstraints.map((c) => {
    const targetMin = (c.minWeeklyHours || 0) * 60;
    // Calculate actual minutes spent from tasks matching this category or constraint title
    const actualMin = tasks.reduce((sum, t) => {
      if (t.category === c.category || (c.title && t.title.toLowerCase().includes(c.title.toLowerCase()))) {
        return sum + (t.actualMinutesSpent || 0);
      }
      return sum;
    }, 0);

    return {
      id: c.id,
      label: c.title,
      targetMinutes: targetMin,
      actualMinutes: actualMin,
      category: c.category
    };
  });

  // Timeline hours range (08:00 - 22:00)
  const timelineHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Greeting */}
      <div className="bg-gradient-to-r from-sky-200/90 via-teal-100/80 to-cyan-200/80 rounded-3xl p-6 border border-sky-300/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute right-4 bottom-2 text-6xl opacity-15 pointer-events-none animate-float">
          🌻
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/80 text-teal-900 text-xs font-bold mb-2 border border-teal-200/80">
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Tổng Quan Nhịp Làm Việc</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-teal-950">
            Xin chào! Bạn có <span className="text-sky-700 font-black">{todayTasks.length} công việc</span> và <span className="text-teal-700 font-black">{todayEvents.length} lịch cố định</span> hôm nay.
          </h1>
          <p className="text-teal-900/80 text-xs sm:text-sm mt-1 font-medium">
            Hệ thống AI tự động điều chỉnh theo quy định công việc và các khung giờ hiệu quả nhất của bạn.
          </p>
        </div>

        <div className="flex items-center space-x-2 relative z-10">
          <button
            onClick={onTriggerAISchedule}
            disabled={isAIScheduling}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-teal-200/60 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{isAIScheduling ? 'Đang Lập Lịch...' : 'Tự Động Tối Ưu Lịch Tuần'}</span>
          </button>
        </div>
      </div>

      {/* Grid 1: Next Task Widget & Remaining Weekly Hours Target */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Next Task Spotlight */}
        <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center space-x-1">
                <Target className="w-4 h-4 text-indigo-600" />
                <span>Công Việc Tiếp Theo</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                Ưu tiên cao
              </span>
            </div>

            {nextTask ? (
              <div className="mt-3 space-y-2">
                <h3 className="text-base font-bold text-slate-800 line-clamp-2">
                  {nextTask.title}
                </h3>
                <div className="flex items-center space-x-3 text-xs text-slate-600 font-medium">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Dự kiến: {nextTask.estimatedMinutes} phút</span>
                  </span>
                  {nextTask.deadline && (
                    <span className="flex items-center space-x-1 text-rose-600 font-semibold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Hạn: {nextTask.deadline}</span>
                    </span>
                  )}
                </div>

                {nextTask.rules && (
                  <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-200 italic">
                    <strong>Ràng buộc:</strong> {nextTask.rules}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-4">Tất cả công việc đã hoàn thành!</p>
            )}
          </div>

          {nextTask && (
            <button
              onClick={() => onSelectTaskForTimer(nextTask)}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center justify-center space-x-2 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Bắt Đầu Làm Ngay (Theo Dõi Thời Gian)</span>
            </button>
          )}
        </div>

        {/* Widget 2: Weekly Hours Target Remaining (Tổng số giờ còn thiếu của tuần) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-purple-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              <span>Tổng Số Giờ Còn Thiếu Trong Tuần (Theo Quy Định)</span>
            </h3>
            <span className="text-xs text-purple-700 font-semibold">Chỉ tiêu theo tuần</span>
          </div>

          {dynamicTargetList.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {dynamicTargetList.map((item) => {
                const remainingMin = Math.max(0, item.targetMinutes - item.actualMinutes);
                const remainingHours = (remainingMin / 60).toFixed(1);
                const targetHours = (item.targetMinutes / 60).toFixed(0);
                const progressPct = item.targetMinutes > 0 
                  ? Math.min(100, Math.round((item.actualMinutes / item.targetMinutes) * 100))
                  : 0;

                return (
                  <div key={item.id} className="bg-purple-50/50 p-3.5 rounded-2xl border border-purple-100 space-y-2">
                    <div className="flex justify-between items-center font-semibold text-slate-700">
                      <span>{item.label}</span>
                      <span className="text-purple-800 font-bold font-mono">
                        Còn thiếu {remainingHours}h / {targetHours}h
                      </span>
                    </div>

                    <div className="w-full bg-purple-200/60 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Đã làm: {(item.actualMinutes / 60).toFixed(1)} tiếng</span>
                      <span>{progressPct}% hoàn thành</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <p className="font-semibold text-slate-700">Chưa có quy định ca làm việc / chỉ tiêu giờ tuần nào.</p>
              <p className="text-[11px] text-slate-500">Bấm "Tự Động Tối Ưu Lịch Tuần" hoặc chuyển sang tab "Lập Lịch" để khai báo các quy định ca làm của riêng bạn!</p>
            </div>
          )}
        </div>

      </div>

      {/* Grid 2: Today's Tasks & Today's Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Today's Tasks List */}
        <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Công Việc Hôm Nay ({todayTasks.length})</span>
            </h3>
            <button
              onClick={() => onNavigateToTab('tasks')}
              className="text-xs text-indigo-600 hover:underline font-semibold flex items-center space-x-0.5"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3 rounded-2xl border transition-all flex items-start justify-between gap-2 ${
                    task.status === 'completed'
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-500 line-through'
                      : 'bg-slate-50 border-slate-200/80 text-slate-800 hover:border-indigo-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={(e) =>
                          onUpdateTaskStatus(task.id, e.target.checked ? 'completed' : 'pending')
                        }
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span className="font-semibold text-xs">{task.title}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center space-x-2 pl-6">
                      <span>Dự kiến: {task.estimatedMinutes} phút</span>
                      {task.scheduledSlot && (
                        <span className="font-mono text-indigo-600">
                          ({task.scheduledSlot.startTime} - {task.scheduledSlot.endTime})
                        </span>
                      )}
                    </div>
                  </div>

                  {task.status !== 'completed' && (
                    <button
                      onClick={() => onSelectTaskForTimer(task)}
                      className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-xl shrink-0"
                      title="Bắt đầu bấm giờ làm việc"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center italic">
                Hôm nay chưa có công việc nào được xếp lịch. Bấm "Lập Lịch AI" để tự động xếp!
              </p>
            )}
          </div>
        </div>

        {/* Today's Timeline View */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Dòng Thời Gian Hôm Nay (Timeline 08:00 - 22:00)</span>
            </h3>
            <span className="text-xs text-slate-500">Khung khóa & Công việc</span>
          </div>

          <div className="space-y-2 pt-1 max-h-[320px] overflow-y-auto pr-1">
            {timelineHours.map((hour) => {
              const timeStr = `${hour < 10 ? '0' : ''}${hour}:00`;
              
              // Find events at this hour
              const eventAtHour = todayEvents.find((e) => {
                const h = parseInt(e.startTime.split('T')[1]?.split(':')[0] || '0', 10);
                return h === hour;
              });

              // Find scheduled tasks at this hour
              const taskAtHour = todayTasks.find((t) => {
                if (!t.scheduledSlot) return false;
                const h = parseInt(t.scheduledSlot.startTime.split(':')[0], 10);
                return h === hour;
              });

              return (
                <div key={hour} className="flex items-center space-x-3 text-xs">
                  <span className="w-12 font-mono text-slate-400 text-right shrink-0">{timeStr}</span>
                  <div className="flex-1 h-10 rounded-2xl bg-slate-50 border border-slate-200/60 p-2 flex items-center">
                    {eventAtHour ? (
                      <div className="w-full h-full rounded-xl bg-blue-100 border border-blue-300 px-3 flex items-center justify-between text-blue-900 font-semibold">
                        <span>🔒 [Lịch Cố Định] {eventAtHour.title}</span>
                        <span className="text-[10px] bg-blue-200 px-2 py-0.5 rounded-full">Đã Khóa Khung</span>
                      </div>
                    ) : taskAtHour ? (
                      <div className="w-full h-full rounded-xl bg-purple-100 border border-purple-300 px-3 flex items-center justify-between text-purple-900 font-semibold">
                        <span>📌 {taskAtHour.title}</span>
                        <span className="text-[10px] bg-purple-200 px-2 py-0.5 rounded-full">
                          {taskAtHour.scheduledSlot?.startTime} - {taskAtHour.scheduledSlot?.endTime}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-[11px] italic">Thời gian trống</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Grid 3: Upcoming Deadlines & AI Recommendation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-3xl p-5 border border-rose-100 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span>Công Việc Sắp Đến Hạn Chót (Deadlines)</span>
          </h3>

          <div className="space-y-2.5">
            {upcomingDeadlineTasks.map((t) => (
              <div
                key={t.id}
                className="p-3 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-800">{t.title}</h4>
                  <p className="text-[11px] text-slate-500">Mức ưu tiên: {t.priority.toUpperCase()}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-200 text-rose-900 font-mono">
                    Hạn: {t.deadline}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendation Box */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-5 border border-purple-200 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-200 flex items-center justify-center text-purple-800">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Đề Xuất Tự Động Từ AI Co-Pilot</h3>
              <p className="text-[11px] text-slate-500">Dựa trên lịch học và thói quen gần đây</p>
            </div>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed bg-white/80 p-3 rounded-2xl border border-purple-100">
            "Hôm nay bạn có lịch thi giữa kỳ vào Thứ 6. AI khuyên bạn nên làm 1 ca ôn tập TOEIC 60 phút vào tối nay (20:30–21:30) vì đây là khung giờ năng lượng đạt 96% của bạn."
          </p>

          <div className="flex items-center justify-end">
            <button
              onClick={() => onNavigateToTab('insights')}
              className="text-xs font-bold text-indigo-700 hover:underline flex items-center space-x-1"
            >
              <span>Xem Báo cáo Thích ứng đầy đủ</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
