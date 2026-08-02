import React, { useState } from 'react';
import { CalendarEvent, EventCategory, EventType, CategoryDef } from '../types';
import { Calendar as CalendarIcon, Clock, Lock, X } from 'lucide-react';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: CategoryDef[];
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  categories = [],
  onAddEvent,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('weekly');
  const [category, setCategory] = useState<string>(categories[0]?.id || 'class');
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Thứ 2
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('11:00');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Calculate start ISO
    const now = new Date();
    const isoDateStr = now.toISOString().split('T')[0];

    onAddEvent({
      title: title.trim(),
      type,
      category: category as EventCategory,
      startTime: `${isoDateStr}T${startTime}:00`,
      endTime: `${isoDateStr}T${endTime}:00`,
      dayOfWeek,
      location: location.trim(),
      isLocked: true, // Lịch cố định mặc định bị khóa
      notes: notes.trim(),
      color: categories.find(c => c.id === category)?.color || '#93c5fd'
    });

    setTitle('');
    setLocation('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-indigo-200 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl text-slate-800">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">Thêm Lịch Cố Định Mới</h3>
              <p className="text-[11px] text-slate-500">Khung thời gian sẽ bị khóa, AI không xếp đè</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Tên sự kiện lịch cố định:</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Lớp Lý thuyết Hệ thống, Lịch Thi Giữa Kỳ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Loại sự kiện:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs"
              >
                <option value="weekly">Theo tuần (Lặp lại)</option>
                <option value="adhoc">Một lần (Cố định)</option>
                <option value="recurring">Hằng ngày</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Danh mục:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="class">📚 Lịch học</option>
                    <option value="work">💼 Công việc</option>
                    <option value="fitness">💪 Thể thao</option>
                    <option value="personal">🏠 Cá nhân</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Thứ trong tuần:</label>
            <select
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(parseInt(e.target.value, 10))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold"
            >
              <option value={1}>Thứ 2</option>
              <option value={2}>Thứ 3</option>
              <option value={3}>Thứ 4</option>
              <option value={4}>Thứ 5</option>
              <option value={5}>Thứ 6</option>
              <option value={6}>Thứ 7</option>
              <option value={0}>Chủ Nhật</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Giờ bắt đầu:</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Giờ kết thúc:</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Địa điểm (không bắt buộc):</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ví dụ: Phòng A101, Tòa H1..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
            >
              Lưu Lịch Cố Định
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
