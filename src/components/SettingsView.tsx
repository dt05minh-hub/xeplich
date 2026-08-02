import React, { useState } from 'react';
import {
  FolderPlus,
  Tag,
  Clock,
  Palette,
  Bell,
  Brain,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Plus,
  Check,
  Settings,
  ChevronRight,
  Sliders,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  CategoryDef,
  SubCategoryDef,
  NotificationSettings,
  LearnedPreference,
  WorkConstraint
} from '../types';

interface SettingsViewProps {
  categories: CategoryDef[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryDef[]>>;
  subCategories: SubCategoryDef[];
  setSubCategories: React.Dispatch<React.SetStateAction<SubCategoryDef[]>>;
  notifications: NotificationSettings;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationSettings>>;
  learnedRules: LearnedPreference[];
  setLearnedRules: React.Dispatch<React.SetStateAction<LearnedPreference[]>>;
  workConstraints: WorkConstraint[];
  setWorkConstraints: React.Dispatch<React.SetStateAction<WorkConstraint[]>>;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  categories,
  setCategories,
  subCategories,
  setSubCategories,
  notifications,
  setNotifications,
  learnedRules,
  setLearnedRules,
  workConstraints,
  setWorkConstraints,
  onResetData,
  onExportData,
  onImportData
}) => {
  const [activeTab, setActiveTab] = useState<
    'categories_package' | 'notifications' | 'backup' | 'ai_config'
  >('categories_package');

  // Client-Side Gemini Key State
  const [clientApiKey, setClientApiKey] = useState<string>(
    () => localStorage.getItem('planner_gemini_key') || ''
  );
  const [isKeySaved, setIsKeySaved] = useState<boolean>(false);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('planner_gemini_key', clientApiKey.trim());
    setIsKeySaved(true);
    setTimeout(() => setIsKeySaved(false), 3000);
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('planner_gemini_key');
    setClientApiKey('');
  };

  const safeCategories = categories || [];
  const safeSubCategories = subCategories || [];
  const safeLearnedRules = learnedRules || [];

  // Currently selected category in Category Package editor
  const [selectedCatId, setSelectedCatId] = useState<string>(
    safeCategories[0]?.id || 'study'
  );

  // New Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🎯');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Subcategory Creation State for selected Category
  const [newSubName, setNewSubName] = useState('');
  const [newSubDuration, setNewSubDuration] = useState(120);
  const [newSubMinHours, setNewSubMinHours] = useState(10);
  const [newSubStart, setNewSubStart] = useState('08:00');
  const [newSubEnd, setNewSubEnd] = useState('22:00');

  // Manual Rule State
  const [newRuleText, setNewRuleText] = useState('');

  const colorPresets = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#ef4444', // Red
    '#06b6d4', // Cyan
    '#64748b'  // Slate
  ];

  const emojiPresets = ['📚', '💼', '🏠', '💪', '💰', '🎮', '🎯', '🎨', '✈️', '🛒', '⚡', '📌'];

  // Current active category object
  const activeCategory = safeCategories.find((c) => c.id === selectedCatId) || safeCategories[0];

  // Subcategories belonging to active category
  const activeSubCategories = safeSubCategories.filter(
    (sc) => sc.categoryId === activeCategory?.id
  );

  // Add Category Handler
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const id = 'cat_' + Date.now();
    const newCat: CategoryDef = {
      id,
      name: newCatName.trim(),
      icon: newCatIcon || '📌',
      color: newCatColor,
      description: newCatDesc.trim()
    };

    setCategories((prev) => [...prev, newCat]);
    setSelectedCatId(id);
    setNewCatName('');
    setNewCatDesc('');
    setIsAddingCategory(false);
  };

  // Update Category Handler
  const handleUpdateCategory = (updated: Partial<CategoryDef>) => {
    if (!activeCategory) return;
    setCategories((prev) =>
      prev.map((c) => (c.id === activeCategory.id ? { ...c, ...updated } : c))
    );
  };

  // Delete Category
  const handleDeleteCategory = (id: string) => {
    if (safeCategories.length <= 1) {
      alert('Phải giữ lại ít nhất 1 danh mục!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này cùng các loại công việc thuộc về nó?')) {
      const remaining = safeCategories.filter((c) => c.id !== id);
      setCategories(remaining);
      setSubCategories((prev) => (prev || []).filter((sc) => sc.categoryId !== id));
      if (selectedCatId === id) {
        setSelectedCatId(remaining[0]?.id || '');
      }
    }
  };

  // Add Subcategory Handler
  const handleAddSubCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !activeCategory) return;

    const newSub: SubCategoryDef = {
      id: 'sub_' + Date.now(),
      categoryId: activeCategory.id,
      name: newSubName.trim(),
      defaultDurationMinutes: Number(newSubDuration) || 60,
      preferredStartTime: newSubStart,
      preferredEndTime: newSubEnd,
      minWeeklyHours: Number(newSubMinHours) || 0,
      maxHoursPerShift: Math.ceil(Number(newSubDuration) / 60) || 3,
      defaultPriority: 'medium'
    };

    setSubCategories((prev) => [...prev, newSub]);
    setNewSubName('');
  };

  // Delete Subcategory
  const handleDeleteSubCategory = (id: string) => {
    setSubCategories((prev) => prev.filter((s) => s.id !== id));
  };

  // Add Manual Rule
  const handleAddRule = () => {
    if (!newRuleText.trim()) return;
    const rule: LearnedPreference = {
      id: 'rule_' + Date.now(),
      ruleText: newRuleText.trim(),
      confidence: 1.0,
      derivedFrom: 'Người dùng thiết lập thủ công',
      isEnabled: true,
      createdAt: new Date().toISOString()
    };
    setLearnedRules((prev) => [rule, ...prev]);
    setNewRuleText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportData(e.target.files[0]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Header */}
      <div className="mb-6 bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <span>⚙️ Cài Đặt Hệ Thống</span>
        </h1>
        <p className="text-sm text-slate-600 font-medium mt-1">
          Quản lý trọn gói danh mục công việc, loại công việc, quy định lập lịch, màu sắc và học hỏi AI.
        </p>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('categories_package')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'categories_package'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>📁 1. Thiết lập danh mục (Trọn gói)</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'notifications'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>🔔 2. Thông báo & Nhắc nhở</span>
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'backup'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>☁️ 3. Dữ liệu & Sao lưu</span>
        </button>

        <button
          onClick={() => setActiveTab('ai_config')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'ai_config'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs'
              : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>✨ 4. Cấu hình AI & Ca linh hoạt</span>
        </button>
      </div>

      {/* Tab 1: Comprehensive Category Package Config */}
      {activeTab === 'categories_package' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Category Selector & Add New */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span>Các danh mục hiện có</span>
                  <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">
                    {safeCategories.length}
                  </span>
                </h3>
                <div className="flex items-center space-x-1">
                  {safeSubCategories.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Bạn muốn xóa tất cả các loại công việc mẫu có sẵn (CSKH, TOEIC, Đồ án...) để tự thiết lập lại từ đầu?')) {
                          setSubCategories([]);
                        }
                      }}
                      className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-xs font-bold border border-rose-200 transition-all"
                      title="Xóa tất cả loại công việc mẫu có sẵn"
                    >
                      🧹 Xóa mẫu
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tạo mới</span>
                  </button>
                </div>
              </div>

              {/* Form Create Category */}
              {isAddingCategory && (
                <form onSubmit={handleCreateCategory} className="mb-4 p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl space-y-3">
                  <h4 className="font-bold text-indigo-900 text-xs">Thêm Danh Mục Mới</h4>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên danh mục</label>
                    <input
                      type="text"
                      placeholder="Ví dụ: Dự án, Ngoại ngữ..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Biểu tượng Emoji</label>
                    <div className="flex gap-1 flex-wrap mb-1">
                      {emojiPresets.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setNewCatIcon(emoji)}
                          className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center border ${
                            newCatIcon === emoji ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-200'
                          }`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Màu sắc</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                      />
                      <input
                        type="text"
                        value={newCatColor}
                        onChange={(e) => setNewCatColor(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Lưu Danh Mục
                    </button>
                  </div>
                </form>
              )}

              {/* Categories list items */}
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {safeCategories.map((cat) => {
                  const isSelected = cat.id === selectedCatId;
                  const catSubCount = safeSubCategories.filter((s) => s.categoryId === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-2xs border border-white"
                          style={{ backgroundColor: `${cat.color}25` }}
                        >
                          {cat.icon}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{cat.name}</h4>
                          <p className="text-[11px] text-slate-500">{catSubCount} loại công việc</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-slate-300"
                          style={{ backgroundColor: cat.color }}
                          title={cat.color}
                        />
                        <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-300'}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Category Configuration Package Card */}
          <div className="lg:col-span-8">
            {activeCategory ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                
                {/* Category Identity Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-xs border border-white"
                      style={{ backgroundColor: `${activeCategory.color}25` }}
                    >
                      {activeCategory.icon}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-xl font-bold text-slate-900">{activeCategory.name}</h2>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-mono text-white font-semibold"
                          style={{ backgroundColor: activeCategory.color }}
                        >
                          {activeCategory.color}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {activeCategory.description || 'Chưa có mô tả chi tiết cho danh mục này.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCategory(activeCategory.id)}
                    className="self-start sm:self-center px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold flex items-center space-x-1.5 border border-rose-200 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa danh mục</span>
                  </button>
                </div>

                {/* Section A: Name, Icon & Color Picker */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-indigo-600" />
                    <span>A. Cấu hình Nhận diện & Màu sắc</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Tên danh mục</label>
                      <input
                        type="text"
                        value={activeCategory.name}
                        onChange={(e) => handleUpdateCategory({ name: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Biểu tượng (Emoji)</label>
                      <input
                        type="text"
                        value={activeCategory.icon}
                        onChange={(e) => handleUpdateCategory({ icon: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Màu sắc hiển thị</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="color"
                          value={activeCategory.color}
                          onChange={(e) => handleUpdateCategory({ color: e.target.value })}
                          className="w-9 h-9 rounded-xl border border-slate-200 cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={activeCategory.color}
                          onChange={(e) => handleUpdateCategory({ color: e.target.value })}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Palette Presets */}
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1.5 font-medium">Chọn nhanh từ dải màu preset:</label>
                    <div className="flex items-center space-x-2">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleUpdateCategory({ color: preset })}
                          className={`w-7 h-7 rounded-full border transition-transform ${
                            activeCategory.color === preset ? 'scale-125 border-slate-900 shadow-md' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: preset }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Section B: Sub-categories list */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-indigo-600" />
                      <span>B. Các loại công việc thuộc "{activeCategory.name}"</span>
                    </h3>
                  </div>

                  {/* Add Subcategory Form */}
                  <form onSubmit={handleAddSubCategory} className="p-3 bg-white border border-slate-200 rounded-xl space-y-3">
                    <h4 className="font-bold text-slate-800 text-xs">Thêm loại công việc mới vào danh mục này</h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên loại công việc</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Luyện TOEIC, Đồ án..."
                          value={newSubName}
                          onChange={(e) => setNewSubName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mặc định (phút)</label>
                        <input
                          type="number"
                          value={newSubDuration}
                          onChange={(e) => setNewSubDuration(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                          step={15}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1" title="Chỉ tiêu tổng số giờ tối thiểu cần làm trong 1 tuần của loại công việc này">
                          Chỉ tiêu tổng giờ/tuần
                        </label>
                        <input
                          type="number"
                          value={newSubMinHours}
                          onChange={(e) => setNewSubMinHours(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">Khung giờ ưu tiên</label>
                        <div className="flex items-center space-x-1">
                          <input
                            type="time"
                            value={newSubStart}
                            onChange={(e) => setNewSubStart(e.target.value)}
                            className="w-full px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg"
                          />
                          <span className="text-slate-400">-</span>
                          <input
                            type="time"
                            value={newSubEnd}
                            onChange={(e) => setNewSubEnd(e.target.value)}
                            className="w-full px-1.5 py-1 text-[11px] bg-slate-50 border border-slate-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm loại công việc</span>
                      </button>
                    </div>
                  </form>

                  {/* List of subcategories */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {activeSubCategories.map((sub) => (
                      <div key={sub.id} className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-slate-900 text-xs">{sub.name}</span>
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                              style={{ backgroundColor: `${activeCategory.color}15`, color: activeCategory.color, borderColor: `${activeCategory.color}40` }}
                            >
                              {activeCategory.icon} {activeCategory.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 space-y-0.5">
                            <p>• Thời lượng 1 ca mặc định: <b>{sub.defaultDurationMinutes} phút</b></p>
                            <p>• Cửa sổ khung giờ: <b>{sub.preferredStartTime} – {sub.preferredEndTime}</b></p>
                            <p>• Chỉ tiêu tổng tuần: <b>{sub.minWeeklyHours} giờ/tuần</b> (của cả loại công việc)</p>
                          </div>
                        </div>

                        <div className="flex justify-end pt-2 border-t border-slate-100 mt-2">
                          <button
                            onClick={() => handleDeleteSubCategory(sub.id)}
                            className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                            title="Xóa loại công việc này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {activeSubCategories.length === 0 && (
                      <div className="sm:col-span-2 text-center py-6 text-slate-400 text-xs italic">
                        Chưa có loại công việc nào trong danh mục này. Bạn có thể thêm ở biểu mẫu phía trên!
                      </div>
                    )}
                  </div>
                </div>

                {/* Section C: Scheduling & Boundary rules summary */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>C. Quy định lập lịch của danh mục</span>
                  </h3>
                  <p className="text-xs text-slate-600">
                    Khi bạn tạo công việc thuộc danh mục <b>{activeCategory.name}</b>, công cụ Lập lịch tự động AI sẽ ưu tiên đưa công việc vào các khoảng thời gian trống phù hợp với các quy định trên.
                  </p>
                </div>

              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400 text-sm">
                Vui lòng chọn hoặc tạo một danh mục bên trái để cấu hình.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-600" />
              <span>Cài Đặt Thông Báo & Nhắc Nhở</span>
            </h2>
            <p className="text-xs text-slate-500">
              Bật hoặc tắt các loại nhắc nhở giúp bạn duy trì tiến độ công việc và cân bằng năng lượng.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
              <div>
                <span className="font-bold text-slate-800 text-sm block">Nhắc trước khi bắt đầu công việc</span>
                <span className="text-xs text-slate-500">Thông báo trước thời gian làm việc để chuẩn bị tập trung</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.remindStart}
                onChange={(e) => setNotifications((prev) => ({ ...prev, remindStart: e.target.checked }))}
                className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
              <div>
                <span className="font-bold text-slate-800 text-sm block">Nhắc khi sắp đến hạn deadline</span>
                <span className="text-xs text-slate-500">Báo động các công việc quan trọng cần ưu tiên gấp</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.remindDeadline}
                onChange={(e) => setNotifications((prev) => ({ ...prev, remindDeadline: e.target.checked }))}
                className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
              <div>
                <span className="font-bold text-slate-800 text-sm block">Nhắc hoàn thành mục tiêu tuần</span>
                <span className="text-xs text-slate-500">Cập nhật tiến độ số giờ làm việc và học tập định kỳ</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.remindWeeklyGoal}
                onChange={(e) => setNotifications((prev) => ({ ...prev, remindWeeklyGoal: e.target.checked }))}
                className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100/80 transition-all">
              <div>
                <span className="font-bold text-slate-800 text-sm block">Nhắc nghỉ giữa giờ (Break)</span>
                <span className="text-xs text-slate-500">Gợi ý thả lỏng sau các ca làm việc kéo dài</span>
              </div>
              <input
                type="checkbox"
                checked={notifications.remindBreak}
                onChange={(e) => setNotifications((prev) => ({ ...prev, remindBreak: e.target.checked }))}
                className="w-5 h-5 text-indigo-600 rounded-md focus:ring-indigo-500"
              />
            </label>
          </div>
        </div>
      )}

      {/* Tab 4: Backup & Restoring */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Download className="w-5 h-5 text-indigo-600" />
              <span>Quản Lý Sao Lưu & Phục Hồi Dữ Liệu</span>
            </h2>
            <p className="text-xs text-slate-500">
              Xuất tệp sao lưu `.json` để lưu trữ an toàn hoặc nhập dữ liệu đã sao lưu trước đó.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Export */}
            <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-indigo-900 text-sm mb-1">Xuất Tệp Dữ Liệu Backup</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Tải về toàn bộ danh mục, lịch cá nhân, danh sách công việc và quy luật AI dưới dạng tệp `.json`.
                </p>
              </div>
              <button
                onClick={onExportData}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Xuất Tệp Dữ Liệu (.JSON)</span>
              </button>
            </div>

            {/* Import */}
            <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-purple-900 text-sm mb-1">Nhập Tệp Dữ Liệu Phục Hồi</h3>
                <p className="text-xs text-slate-600 mb-4">
                  Tải lên tệp `.json` đã sao lưu trước đây để phục hồi lại toàn bộ trạng thái cá nhân.
                </p>
              </div>
              <label className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Chọn Tệp Restore (.JSON)</span>
                <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Reset button */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-900 text-xs">Đặt Lại & Xóa Sạch Dữ Liệu</h4>
              <p className="text-xs text-slate-500">
                Lưu ý: Thao tác này sẽ đặt lại hoặc làm trống dữ liệu trong trình duyệt của bạn.
              </p>
            </div>
            <button
              onClick={onResetData}
              className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs rounded-xl flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Đặt Lại / Xóa Dữ Liệu</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: AI Config & Flexible Shift */}
      {activeTab === 'ai_config' && (
        <div className="space-y-6">
          {/* Section 1: Client Gemini API Key */}
          <div className="bg-white p-6 rounded-2xl border border-purple-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg">
                🔑
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Khóa API Gemini (Dùng khi chạy trên Web Tĩnh / GitHub Pages)
                </h2>
                <p className="text-xs text-slate-500">
                  Khi bạn tải tệp về hoặc đẩy app lên GitHub Pages (không có máy chủ Node.js backend), hãy dán Gemini API Key tại đây để ứng dụng tự gọi AI trực tiếp từ trình duyệt!
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Gemini API Key của bạn:
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={clientApiKey}
                    onChange={(e) => setClientApiKey(e.target.value)}
                    placeholder="AQ.Ab8RN6... hoặc AIzaSy..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold whitespace-nowrap shadow-xs transition-all"
                  >
                    {isKeySaved ? '✓ Đã Lưu!' : 'Lưu Key'}
                  </button>
                  {clientApiKey && (
                    <button
                      type="button"
                      onClick={handleClearApiKey}
                      className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-100 text-xs text-purple-900 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <span>💡 Hướng dẫn lấy Key Gemini miễn phí:</span>
                </p>
                <p>
                  1. Truy cập <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline font-bold text-purple-700">Google AI Studio</a> và đăng nhập bằng tài khoản Google.
                </p>
                <p>2. Chọn <b>"Create API Key"</b> và dán chuỗi key đó vào ô trên.</p>
                <p className="text-[11px] text-purple-700 italic">
                  🔒 LƯU Ý: Key được lưu an toàn trong trình duyệt (LocalStorage) của riêng bạn và KHÔNG bao giờ bị gửi đi đâu khác.
                </p>
              </div>
            </form>
          </div>

          {/* Section 2: Flexible Shift Explanation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                ⏰
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cấu Hình Ca Làm Việc Linh Hoạt (Flexible Shift)
                </h2>
                <p className="text-xs text-slate-500">
                  Tự do lựa chọn giờ bắt đầu & giờ kết thúc cho ca làm việc thực tế của bạn
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-100 space-y-2">
                <h3 className="font-bold text-indigo-900 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Cơ chế Ca Làm Việc Tự Do:</span>
                </h3>
                <p>
                  • <b>Cửa sổ khung giờ quy định:</b> Khi bạn tạo Ràng buộc ca làm việc (ví dụ: CSKH từ <b>08:00 đến 22:00</b>), đây chỉ là <i>khung giới hạn tối đa</i>.
                </p>
                <p>
                  • <b>Tự do chọn ca:</b> Bạn có thể chọn bất kỳ giờ bắt đầu và giờ kết thúc nào (ví dụ ca sáng 09:00 - 12:00, ca chiều 13:30 - 17:30 hoặc ca tối 18:00 - 21:00) miễn là nằm hoàn toàn trong cửa sổ 08:00 - 22:00.
                </p>
                <p>
                  • <b>AI Tự Động Xếp Lịch Thích Ứng:</b> Khi bấm <b>"✨ Lập Lịch Tự Động AI"</b>, AI sẽ tự động tính toán thời gian rảnh của bạn và đề xuất giờ bắt đầu/kết thúc tối ưu nhất cho từng ca làm việc!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
