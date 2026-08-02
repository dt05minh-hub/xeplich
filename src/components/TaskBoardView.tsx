import React, { useState } from 'react';
import { Task, TaskCategory, TaskPriority, TaskStatus, WorkConstraint, SubCategoryDef, CategoryDef } from '../types';
import {
  CheckSquare,
  Plus,
  Clock,
  AlertCircle,
  Play,
  Trash2,
  Lock,
  Sparkles,
  Shield,
  Sliders,
  X,
  Info,
  Pencil
} from 'lucide-react';

interface TaskBoardViewProps {
  tasks: Task[];
  constraints: WorkConstraint[];
  subCategories?: SubCategoryDef[];
  categories?: CategoryDef[];
  onOpenAddTask: () => void;
  onSelectTaskForTimer: (task: Task) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onDeleteTask: (taskId: string) => void;
  onAddConstraint: (constraint: Omit<WorkConstraint, 'id'>) => void;
  onUpdateConstraint?: (constraint: WorkConstraint) => void;
  onDeleteConstraint: (constraintId: string) => void;
  onTriggerAISchedule: () => void;
  isAIScheduling: boolean;
}

export const TaskBoardView: React.FC<TaskBoardViewProps> = ({
  tasks,
  constraints,
  subCategories = [],
  categories = [],
  onOpenAddTask,
  onSelectTaskForTimer,
  onUpdateTaskStatus,
  onDeleteTask,
  onAddConstraint,
  onUpdateConstraint,
  onDeleteConstraint,
  onTriggerAISchedule,
  isAIScheduling,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showAddConstraintModal, setShowAddConstraintModal] = useState<boolean>(false);

  // New/Edit Constraint Form State
  const [editingConstraintId, setEditingConstraintId] = useState<string | null>(null);
  const [constTitle, setConstTitle] = useState<string>('');
  const [constCategory, setConstCategory] = useState<string>('all');
  const [allowedStart, setAllowedStart] = useState<string>('08:00');
  const [allowedEnd, setAllowedEnd] = useState<string>('22:00');
  const [minWeeklyHours, setMinWeeklyHours] = useState<number>(30);
  const [maxHoursPerShift, setMaxHoursPerShift] = useState<number>(4);

  const filteredTasks = tasks.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    return true;
  });

  const handleOpenAddConstraint = () => {
    setEditingConstraintId(null);
    setConstTitle('');
    setConstCategory('all');
    setAllowedStart('08:00');
    setAllowedEnd('22:00');
    setMinWeeklyHours(30);
    setMaxHoursPerShift(4);
    setShowAddConstraintModal(true);
  };

  const handleOpenEditConstraint = (c: WorkConstraint) => {
    setEditingConstraintId(c.id);
    setConstTitle(c.title);
    setConstCategory(c.category || 'all');
    setAllowedStart(c.allowedStartTime || '08:00');
    setAllowedEnd(c.allowedEndTime || '22:00');
    setMinWeeklyHours(c.minWeeklyHours ?? 30);
    setMaxHoursPerShift(c.maxHoursPerShift ?? 4);
    setShowAddConstraintModal(true);
  };

  const handleSaveConstraint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!constTitle.trim()) return;

    if (editingConstraintId && onUpdateConstraint) {
      onUpdateConstraint({
        id: editingConstraintId,
        title: constTitle.trim(),
        category: constCategory as any,
        allowedStartTime: allowedStart,
        allowedEndTime: allowedEnd,
        minWeeklyHours,
        maxHoursPerShift,
        offDays: [0], // Default Sunday off
      });
    } else {
      onAddConstraint({
        title: constTitle.trim(),
        category: constCategory as any,
        allowedStartTime: allowedStart,
        allowedEndTime: allowedEnd,
        minWeeklyHours,
        maxHoursPerShift,
        offDays: [0], // Default Sunday off
      });
    }

    setConstTitle('');
    setEditingConstraintId(null);
    setShowAddConstraintModal(false);
  };

  const getCategoryBadge = (category: string) => {
    const matchedCategory = categories.find((c) => c.id === category);
    if (matchedCategory) {
      return (
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center space-x-1"
          style={{
            backgroundColor: `${matchedCategory.color}20`,
            color: matchedCategory.color,
            borderColor: `${matchedCategory.color}40`
          }}
        >
          <span>{matchedCategory.icon}</span>
          <span>{matchedCategory.name}</span>
        </span>
      );
    }
    const catNameMap: Record<string, string> = {
      cskh: 'Ca làm CSKH',
      toeic: 'Luyện TOEIC',
      project: 'Đồ án',
      report: 'Báo cáo',
      reading: 'Đọc tài liệu',
      personal: 'Cá nhân',
      study: 'Học tập',
      work: 'Làm việc',
      health: 'Sức khỏe',
      finance: 'Tài chính',
      entertainment: 'Giải trí'
    };
    const displayName = catNameMap[category] || category || 'Công việc';
    return (
      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
        {displayName}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-cyan-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-100/80 text-cyan-900 text-xs font-bold mb-1 border border-cyan-200">
            <CheckSquare className="w-3.5 h-3.5 text-cyan-700" />
            <span>Danh Sách Công Việc & Quy Định</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-teal-950">
            Quản Lý Công Việc & Quy Định Ca Trực
          </h1>
          <p className="text-xs sm:text-sm text-teal-900/80 font-medium mt-0.5">
            Mỗi công việc được lập lịch tự động dựa theo thời lượng dự kiến, deadline và các quy định bạn thiết lập.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddConstraint}
            className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 rounded-2xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-all"
          >
            <Shield className="w-4 h-4 text-teal-600" />
            <span>Khai Báo Quy Định Ca Làm Việc</span>
          </button>

          <button
            onClick={onOpenAddTask}
            className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-xs shadow-cyan-200 flex items-center space-x-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo Công Việc Mới</span>
          </button>
        </div>
      </div>

      {/* WORK CONSTRAINTS SECTION (Khai Báo Quy Định Làm Việc) */}
      <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-sky-50 rounded-3xl p-5 border border-purple-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Quy Định & Ràng Buộc Công Việc Khai Báo (Work Constraints)</span>
          </h3>
          <span className="text-xs text-purple-700 font-semibold">{constraints.length} quy định</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          {constraints.map((c) => (
            <div
              key={c.id}
              className="bg-white/90 rounded-2xl p-4 border border-purple-100 shadow-2xs space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-800">{c.title}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEditConstraint(c)}
                      className="text-slate-400 hover:text-purple-600 p-1 rounded-lg hover:bg-purple-50 transition-colors"
                      title="Chỉnh sửa quy định"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteConstraint(c.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Xóa quy định"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1.5 font-mono">
                  <div>Cửa sổ ca làm: <strong className="text-indigo-700">{c.allowedStartTime} – {c.allowedEndTime}</strong> (Tự do chọn ca)</div>
                  <div>Chỉ tiêu chung cả tuần: <strong className="text-purple-700">{c.minWeeklyHours} giờ/tuần</strong> <span className="text-[10px] text-slate-500 font-sans">(của cả công việc)</span></div>
                  <div>Độ dài 1 ca: <strong>Tối đa {c.maxHoursPerShift} tiếng/ca</strong></div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 italic border-t border-slate-100 pt-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-500 flex-shrink-0" />
                <span>AI tự động chia ca linh hoạt để đủ chỉ tiêu tuần này.</span>
              </div>
            </div>
          ))}
          {constraints.length === 0 && (
            <div className="md:col-span-3 text-center py-4 text-xs text-slate-400 italic">
              Chưa có quy định ca làm việc nào. Bấm nút "Khai Báo Quy Định Ca Làm Việc" ở trên để tạo mới.
            </div>
          )}
        </div>
      </div>

      {/* FILTER BAR & TASK BOARD */}
      <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold text-slate-700">Lọc theo loại công việc:</span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium"
            >
              <option value="all">Tất cả ({tasks.length})</option>
              {Array.from(
                new Set([
                  ...tasks.map((t) => t.category).filter(Boolean),
                  ...constraints.map((c) => c.category).filter(Boolean),
                  ...categories.map((c) => c.id)
                ])
              ).map((catId) => {
                const catDef = categories.find((c) => c.id === catId);
                const count = tasks.filter((t) => t.category === catId).length;
                const catNameMap: Record<string, string> = {
                  cskh: 'Ca làm CSKH',
                  toeic: 'Luyện TOEIC',
                  project: 'Đồ án',
                  report: 'Báo cáo',
                  reading: 'Đọc tài liệu',
                  personal: 'Cá nhân',
                  study: 'Học tập',
                  work: 'Làm việc'
                };
                const label = catDef ? `${catDef.icon} ${catDef.name}` : (catNameMap[catId] || catId);
                return (
                  <option key={catId} value={catId}>
                    {label} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            Hiển thị {filteredTasks.length} công việc
          </span>
        </div>

        {/* Tasks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((t) => {
            const isCompleted = t.status === 'completed';

            return (
              <div
                key={t.id}
                className={`rounded-2xl p-4 border space-y-3 flex flex-col justify-between transition-all ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-85'
                    : 'bg-white border-indigo-100 hover:border-indigo-300 shadow-2xs'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getCategoryBadge(t.category)}
                    <button
                      onClick={() => onDeleteTask(t.id)}
                      className="text-slate-400 hover:text-rose-500 transition-all"
                      title="Xóa công việc"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h3 className={`font-bold text-xs sm:text-sm text-slate-800 ${isCompleted ? 'line-through text-slate-500' : ''}`}>
                    {t.title}
                  </h3>

                  <div className="text-[11px] text-slate-600 space-y-1 font-mono">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Dự kiến: {t.estimatedMinutes} phút | Đã làm: {t.actualMinutesSpent} phút</span>
                    </div>

                    {t.deadline && (
                      <div className="flex items-center space-x-1 text-rose-600 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Hạn chót: {t.deadline}</span>
                      </div>
                    )}
                  </div>

                  {t.scheduledSlot && (
                    <div className="p-2 bg-purple-50/70 rounded-xl border border-purple-100 text-[11px] text-purple-900 font-mono">
                      📅 Lịch AI xếp: {t.scheduledSlot.date} ({t.scheduledSlot.startTime} - {t.scheduledSlot.endTime})
                    </div>
                  )}

                  {t.rules && (
                    <p className="text-[10px] text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                      "{t.rules}"
                    </p>
                  )}
                </div>

                {/* Bottom Actions */}
                <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                  <select
                    value={t.status}
                    onChange={(e) => onUpdateTaskStatus(t.id, e.target.value as TaskStatus)}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-semibold text-slate-700"
                  >
                    <option value="pending">Chờ xếp lịch</option>
                    <option value="scheduled">Đã xếp lịch</option>
                    <option value="in_progress">Đang làm</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="deferred">Hoãn lại</option>
                  </select>

                  {!isCompleted && (
                    <button
                      onClick={() => onSelectTaskForTimer(t)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-2xs"
                      title="Bắt đầu theo dõi thời gian thực tế"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Bắt đầu</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal: Add Work Constraint */}
      {showAddConstraintModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-purple-200 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-purple-600" />
                <span>{editingConstraintId ? 'Chỉnh Sửa Quy Định Lập Lịch' : 'Khai Báo Quy Định Lập Lịch Mới'}</span>
              </h3>
              <button onClick={() => setShowAddConstraintModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleSaveConstraint} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Tên quy định / Tên ca:</label>
                <input
                  type="text"
                  required
                  value={constTitle}
                  onChange={(e) => setConstTitle(e.target.value)}
                  placeholder="Ví dụ: Quy định ca làm CSKH online..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Áp dụng cho loại công việc:</label>
                <select
                  value={constCategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setConstCategory(val);
                    // Find matched subcategory to auto populate defaults if available
                    const matched = subCategories.find((s) => s.name === val || s.id === val);
                    if (matched) {
                      if (matched.minWeeklyHours) setMinWeeklyHours(matched.minWeeklyHours);
                      if (matched.preferredStartTime) setAllowedStart(matched.preferredStartTime);
                      if (matched.preferredEndTime) setAllowedEnd(matched.preferredEndTime);
                      if (matched.maxHoursPerShift) setMaxHoursPerShift(matched.maxHoursPerShift);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">Tất cả công việc</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                  {subCategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      ↳ {sub.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  💡 Bạn có thể tự thiết lập các Loại công việc theo ý muốn tại mục <b>⚙️ Cài đặt -&gt; Danh mục &amp; Loại công việc</b>.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Cửa sổ khung giờ được phép làm (Tự do chọn ca):</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Giờ bắt đầu tối đa từ:</span>
                    <input
                      type="time"
                      value={allowedStart}
                      onChange={(e) => setAllowedStart(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-0.5">Giờ kết thúc trễ nhất:</span>
                    <input
                      type="time"
                      value={allowedEnd}
                      onChange={(e) => setAllowedEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-100 space-y-3">
                <div>
                  <label className="block text-purple-900 font-bold mb-0.5">
                    1. Tổng chỉ tiêu giờ tối thiểu / tuần (chung cho toàn bộ công việc):
                  </label>
                  <p className="text-[10px] text-purple-700 mb-1">
                    *Con số này dành cho <b>TỔNG số giờ cả tuần</b> của loại công việc này (không phải chỉ của 1 ca đơn lẻ). AI sẽ tự chia thành các ca linh hoạt trong tuần sao cho đạt đủ chỉ tiêu.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={minWeeklyHours}
                      onChange={(e) => setMinWeeklyHours(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white border border-purple-200 rounded-xl p-2 font-mono text-xs text-purple-950 font-bold"
                    />
                    <span className="text-xs font-bold text-purple-800 whitespace-nowrap">giờ/tuần</span>
                  </div>
                </div>

                <div>
                  <label className="block text-purple-900 font-bold mb-0.5">
                    2. Độ dài tối đa cho 1 ca làm việc đơn lẻ:
                  </label>
                  <p className="text-[10px] text-purple-700 mb-1">
                    *Giới hạn độ dài liên tục của 1 ca đơn lẻ (Ví dụ 4 tiếng/ca).
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={maxHoursPerShift}
                      onChange={(e) => setMaxHoursPerShift(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white border border-purple-200 rounded-xl p-2 font-mono text-xs text-purple-950 font-bold"
                    />
                    <span className="text-xs font-bold text-purple-800 whitespace-nowrap">tiếng / ca</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddConstraintModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
                >
                  {editingConstraintId ? 'Cập Nhật Quy Định' : 'Lưu Quy Định'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
