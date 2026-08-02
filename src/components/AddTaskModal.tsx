import React, { useState } from 'react';
import { Task, TaskPriority, CategoryDef, SubCategoryDef } from '../types';
import { CheckSquare, Clock, AlertCircle, Sparkles } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: CategoryDef[];
  subCategories?: SubCategoryDef[];
  onAddTask: (task: Omit<Task, 'id' | 'createdAt' | 'actualMinutesSpent' | 'status'>) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  categories = [],
  subCategories = [],
  onAddTask,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<string>(categories[0]?.id || 'study');
  const [customCategory, setCustomCategory] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('high');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(60);
  const [deadline, setDeadline] = useState<string>('');
  const [rules, setRules] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalCategory = category === 'custom' ? (customCategory.trim() || 'Cá nhân') : category;

    onAddTask({
      title: title.trim(),
      category: finalCategory,
      priority,
      estimatedMinutes,
      deadline: deadline || undefined,
      rules: rules.trim() || undefined
    });

    // Reset form
    setTitle('');
    setRules('');
    onClose();
  };

  const matchingSubCategories = subCategories.filter(s => s.categoryId === category);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-purple-200 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-slate-800">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">Tạo Công Việc Mới</h3>
              <p className="text-[11px] text-slate-500">Thêm công việc thực tế của riêng bạn</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tên công việc:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tên công việc của bạn..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Danh mục / Loại:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.name}
                  </option>
                ))}
                <option value="custom">✨ + Thêm danh mục mới</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Mức ưu tiên:</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold focus:bg-white"
              >
                <option value="high">🔥 Cao (Cần gấp)</option>
                <option value="medium">⚡ Trung bình</option>
                <option value="low">🌱 Thấp</option>
              </select>
            </div>
          </div>

          {category === 'custom' && (
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Nhập tên danh mục riêng:</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ví dụ: Thiết kế, Nghiên cứu..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Thời lượng dự kiến (phút):</label>
              <input
                type="number"
                min={15}
                max={600}
                step={15}
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 60)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Hạn chót (Deadline):</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Ghi chú / Ràng buộc (không bắt buộc):</label>
            <input
              type="text"
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              placeholder="Ghi chú thêm cho AI hoặc nhắc nhở cá nhân..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-xs"
            >
              Tạo Công Việc
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
