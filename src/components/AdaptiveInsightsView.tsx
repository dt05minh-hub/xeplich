import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AdaptiveUserProfile,
  TimeTrackSession,
  WeeklyReport,
  LearnedPreference
} from '../types';
import {
  BrainCircuit,
  Zap,
  BarChart3,
  TrendingUp,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Clock
} from 'lucide-react';

interface AdaptiveInsightsViewProps {
  profile: AdaptiveUserProfile;
  trackingSessions: TimeTrackSession[];
  weeklyReport: WeeklyReport;
  onRefreshAIInsights: () => void;
  isRefreshingAI: boolean;
  onRunBehaviorAnalyzer: () => void;
  isAnalyzingBehavior: boolean;
  onToggleRule: (ruleId: string) => void;
  onAddCustomRule: (ruleText: string) => void;
  onDeleteRule: (ruleId: string) => void;
  onResetData?: () => void;
}

export const AdaptiveInsightsView: React.FC<AdaptiveInsightsViewProps> = ({
  profile,
  trackingSessions,
  weeklyReport,
  onRefreshAIInsights,
  isRefreshingAI,
  onRunBehaviorAnalyzer,
  isAnalyzingBehavior,
  onToggleRule,
  onAddCustomRule,
  onDeleteRule,
  onResetData,
}) => {
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>('week');
  const [newRuleInput, setNewRuleInput] = useState<string>('');
  const [showAddRuleModal, setShowAddRuleModal] = useState<boolean>(false);

  const handleCreateRule = () => {
    if (!newRuleInput.trim()) return;
    onAddCustomRule(newRuleInput.trim());
    setNewRuleInput('');
    setShowAddRuleModal(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      
      {/* Top Banner & Actions */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 border border-blue-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100/80 text-blue-900 text-xs font-bold mb-1 border border-blue-200">
            <BrainCircuit className="w-3.5 h-3.5 text-blue-700" />
            <span>Thống Kê AI Thích Ứng</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-blue-950">
            Hồ Sơ Thói Quên & Quy Luật AI
          </h1>
          <p className="text-xs sm:text-sm text-blue-900/80 font-medium mt-0.5">
            Hệ thống học từ thói quen kéo đổi lịch thực tế để ngày càng phân bổ thời gian chính xác hơn.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="bg-blue-50/80 p-1 rounded-2xl flex items-center border border-blue-200 text-xs">
            <button
              onClick={() => setTimePeriod('day')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                timePeriod === 'day' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Ngày
            </button>
            <button
              onClick={() => setTimePeriod('week')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                timePeriod === 'week' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tuần
            </button>
            <button
              onClick={() => setTimePeriod('month')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                timePeriod === 'month' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Tháng
            </button>
          </div>

          {onResetData && (
            <button
              onClick={() => {
                if (confirm('Bạn có chắc muốn xóa sạch toàn bộ dữ liệu Thống kê AI và Báo cáo?')) {
                  onResetData();
                }
              }}
              className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-2xl text-xs font-bold shadow-2xs flex items-center space-x-1.5 transition-all"
              title="Xóa dữ liệu Thống kê & Báo cáo"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Thống Kê & Báo Cáo</span>
            </button>
          )}

          <button
            onClick={onRunBehaviorAnalyzer}
            disabled={isAnalyzingBehavior}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingBehavior ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingBehavior ? 'Đang phân tích...' : 'Chạy Behavior Analyzer'}</span>
          </button>
        </div>
      </div>

      {/* Grid 1: Peak Energy Curve & Estimation Variance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Heatmap energy curve */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Biểu Đồ Khung Giờ Năng Lượng & Điểm Năng Suất (Productivity Score)</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">08:00 - 22:00</span>
          </div>

          <p className="text-xs text-slate-500">
            Mức độ tập trung được AI đúc kết từ phản hồi thực tế. Các công việc ưu tiên cao sẽ được xếp vào khung giờ màu vàng.
          </p>

          <div className="grid grid-cols-7 sm:grid-cols-12 gap-1.5 pt-2">
            {(profile?.peakEnergyHours || []).map((slot) => {
              const isHigh = slot.productivityScore >= 88;
              const isMedium = slot.productivityScore >= 70 && slot.productivityScore < 88;
              return (
                <div
                  key={slot.hour}
                  className="flex flex-col items-center p-2 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-amber-400 transition-all group"
                  title={`${slot.label}: ${slot.productivityScore}% điểm năng suất`}
                >
                  <span className="text-[10px] text-slate-500 font-mono">{slot.hour}:00</span>
                  <div className="w-full bg-slate-200/80 h-16 rounded-xl my-1.5 flex items-end p-0.5 overflow-hidden">
                    <div
                      className={`w-full rounded-lg transition-all duration-500 ${
                        isHigh
                          ? 'bg-gradient-to-t from-amber-400 to-amber-300'
                          : isMedium
                          ? 'bg-gradient-to-t from-indigo-400 to-indigo-300'
                          : 'bg-slate-300'
                      }`}
                      style={{ height: `${slot.productivityScore}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-extrabold text-slate-800 font-mono">{slot.productivityScore}%</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end space-x-4 text-xs text-slate-500 pt-1">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded bg-amber-400" />
              <span>Khung giờ vàng (Năng lượng cao)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded bg-indigo-400" />
              <span>Trung bình</span>
            </div>
          </div>
        </div>

        {/* Estimation Accuracy Card */}
        <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span>Sai Số Thời Gian Dự Kiến vs Thực Tế</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Tỷ lệ thời gian thực tế / dự kiến theo từng loại công việc.
            </p>

            {trackingSessions.length > 0 ? (
              <div className="space-y-3 mt-4 text-xs">
                {Object.entries(profile.categoryAccuracyRatio || {}).map(([catKey, ratioVal]) => {
                  const ratio = Number(ratioVal) || 1.0;
                  return (
                    <div key={catKey} className="space-y-1">
                      <div className="flex justify-between text-slate-700 font-semibold capitalize">
                        <span>{catKey}</span>
                        <span className="font-bold text-indigo-800 font-mono">{ratio}x</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            ratio > 1.2 ? 'bg-amber-400' : 'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(100, ratio * 70)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs my-4 space-y-1">
                <BarChart3 className="w-6 h-6 text-indigo-400 mx-auto opacity-60 mb-1" />
                <p className="font-bold text-slate-700">Chưa có dữ liệu sai số</p>
                <p className="text-[11px] text-slate-500">Dữ liệu sẽ tự ghi nhận khi bạn thực hiện bấm giờ các công việc.</p>
              </div>
            )}
          </div>

          <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-100 text-indigo-900 text-xs flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500 shrink-0" />
            <span>Độ chính xác dự kiến trung bình: <strong>{weeklyReport.estimationAccuracyPercent}%</strong></span>
          </div>
        </div>

      </div>

      {/* ADAPTIVE RULES SECTION (Bật / Tắt / Quản Lý Quy Luật) */}
      <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Danh Sách Quy Luật Thích Ứng Đã Học (Adaptive Rules)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Bạn có thể <strong>Bật / Tắt</strong> hoặc Xóa từng quy luật để điều hướng AI lập lịch chính xác hơn.
            </p>
          </div>

          <button
            onClick={() => setShowAddRuleModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center space-x-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>+ Thêm Quy Luật</span>
          </button>
        </div>

        {profile?.learnedPreferences && profile.learnedPreferences.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {profile.learnedPreferences.map((pref) => (
              <div
                key={pref.id}
                className={`rounded-2xl p-4 border space-y-3 flex flex-col justify-between transition-all ${
                  pref.isEnabled
                    ? 'bg-purple-50/60 border-purple-200 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-200 text-purple-900">
                      Độ tin cậy: {Math.round(pref.confidence * 100)}%
                    </span>

                    <div className="flex items-center space-x-1">
                      {/* Toggle On / Off Switch */}
                      <button
                        onClick={() => onToggleRule(pref.id)}
                        className="text-indigo-700 hover:scale-110 transition-all"
                        title={pref.isEnabled ? 'Đang bật - Bấm để tắt' : 'Đang tắt - Bấm để bật'}
                      >
                        {pref.isEnabled ? (
                          <ToggleRight className="w-6 h-6 text-indigo-600" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteRule(pref.id)}
                        className="text-slate-400 hover:text-rose-500 transition-all"
                        title="Xóa quy luật"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {pref.ruleText}
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 border-t border-purple-100 pt-2 italic">
                  Nguồn sinh: {pref.derivedFrom}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs space-y-2">
            <Sparkles className="w-8 h-8 text-purple-400 mx-auto opacity-60" />
            <p className="font-bold text-slate-700">Chưa có quy luật AI nào được ghi nhận</p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Hệ thống sẽ tự động phân tích và rút ra quy luật khi bạn tương tác bấm giờ và kéo thả lịch, hoặc bạn có thể bấm <strong>+ Thêm Quy Luật</strong> ở trên để tự định nghĩa.
            </p>
          </div>
        )}
      </div>

      {/* Modal: Add Custom Rule */}
      {showAddRuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-purple-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-800">Thêm Quy Luật Thích Ứng Cá Nhân</h3>
              <button onClick={() => setShowAddRuleModal(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-700 font-semibold">Nội dung quy luật / thói quen bạn muốn AI tuân thủ:</label>
              <textarea
                rows={3}
                value={newRuleInput}
                onChange={(e) => setNewRuleInput(e.target.value)}
                placeholder="Ví dụ: Ưu tiên xếp ca làm việc vào chiều Thứ 3 và Thứ 5..."
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
              <button onClick={() => setShowAddRuleModal(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-semibold">Hủy</button>
              <button onClick={handleCreateRule} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold">Thêm Quy Luật</button>
            </div>
          </div>
        </div>
      )}

    </motion.div>
  );
};
