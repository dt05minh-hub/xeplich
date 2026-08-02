import React, { useState } from 'react';
import { WeeklyReport, MonthlyReport } from '../types';
import { CLEAN_MONTHLY_REPORT } from '../data/mockData';
import {
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  Sparkles,
  PieChart,
  Lightbulb,
  ArrowUpRight,
  Calendar,
  Briefcase,
  Printer
} from 'lucide-react';

interface WeeklyReportViewProps {
  report: WeeklyReport;
  monthlyReport?: MonthlyReport;
}

export const WeeklyReportView: React.FC<WeeklyReportViewProps> = ({
  report,
  monthlyReport = CLEAN_MONTHLY_REPORT
}) => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('weekly');

  const totalWorkHours = (report.totalWorkMinutes / 60).toFixed(1);
  const totalStudyHours = (report.totalStudyMinutes / 60).toFixed(1);
  const totalPersonalHours = (report.totalPersonalMinutes / 60).toFixed(1);
  const totalExerciseHours = (report.totalExerciseMinutes / 60).toFixed(1);

  const mWorkHours = (monthlyReport.totalWorkMinutes / 60).toFixed(1);
  const mStudyHours = (monthlyReport.totalStudyMinutes / 60).toFixed(1);
  const mPersonalHours = (monthlyReport.totalPersonalMinutes / 60).toFixed(1);
  const mExerciseHours = (monthlyReport.totalExerciseMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top Controls: Switch between Weekly and Monthly Report */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-2.5 rounded-2xl border border-teal-200/80 shadow-2xs">
        <div className="flex items-center space-x-1.5 bg-teal-50/80 p-1 rounded-xl border border-teal-100">
          <button
            onClick={() => setReportType('weekly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              reportType === 'weekly'
                ? 'bg-white text-teal-950 shadow-2xs border border-teal-200'
                : 'text-slate-600 hover:text-teal-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span>Báo Cáo Theo Tuần</span>
          </button>

          <button
            onClick={() => setReportType('monthly')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              reportType === 'monthly'
                ? 'bg-white text-teal-950 shadow-2xs border border-teal-200'
                : 'text-slate-600 hover:text-teal-900'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-teal-600" />
            <span>Báo Cáo Theo Tháng</span>
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3.5 py-1.5 bg-teal-50/80 hover:bg-teal-100/80 text-teal-900 border border-teal-200/80 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-2xs"
        >
          <Printer className="w-3.5 h-3.5 text-teal-600" />
          <span>Xuất Báo Cáo / In PDF</span>
        </button>
      </div>

      {reportType === 'weekly' ? (
        /* WEEKLY REPORT VIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 rounded-3xl p-6 border border-indigo-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-200/60 text-purple-900 text-xs font-bold mb-2">
                <FileSpreadsheet className="w-3.5 h-3.5 text-purple-700" />
                <span>Báo Cáo Năng Suất Cá Nhân Tuần</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800">
                Tổng Kết Kết Quả Học Tập & Ca Làm Việc Tuần Qua
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Tuần bắt đầu từ ngày {report.weekStartDate}. Toàn bộ số liệu được tự động tổng hợp bởi AI.
              </p>
            </div>

            <div className="px-5 py-3 bg-white/90 rounded-2xl border border-indigo-200 text-center shadow-xs shrink-0">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Độ Chính Xác Dự Kiến</span>
              <span className="text-2xl font-black text-indigo-800 font-mono">{report.estimationAccuracyPercent}%</span>
            </div>
          </div>

          {/* Grid 1: Total Hours Distribution */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-4 border border-blue-100 shadow-2xs space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Làm Việc / Ca Làm</span>
              <div className="text-2xl font-black text-blue-700 font-mono">{totalWorkHours} tiếng</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Tự động tích lũy</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-2xs space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Học Tập & Nghiên Cứu</span>
              <div className="text-2xl font-black text-purple-700 font-mono">{totalStudyHours} tiếng</div>
              <span className="text-[10px] text-purple-600 font-semibold">Tự động tích lũy</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-pink-100 shadow-2xs space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Hoạt Động Cá Nhân</span>
              <div className="text-2xl font-black text-pink-700 font-mono">{totalPersonalHours} tiếng</div>
              <span className="text-[10px] text-slate-500">Cân bằng cuộc sống</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-2xs space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Rèn Luyện Thể Thao</span>
              <div className="text-2xl font-black text-emerald-700 font-mono">{totalExerciseHours} tiếng</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Duy trì thể lực</span>
            </div>
          </div>

          {/* Grid 2: Completed Tasks & AI Analysis Text */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tỷ Lệ Hoàn Thành Nhiệm Vụ</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center font-bold text-emerald-900">
                  <span>Công việc đã hoàn thành:</span>
                  <span className="font-mono text-base">{report.completedTasksCount} công việc</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between items-center font-bold text-amber-900">
                  <span>Công việc tạm hoãn:</span>
                  <span className="font-mono text-base">{report.deferredTasksCount} công việc</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Đánh Giá Chi Tiết Từ Trợ Lý AI</span>
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {report.aiAnalysisText}
              </p>
            </div>
          </div>

          {/* Grid 3: Strengths & Next Week Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>3 Điểm Sáng Năng Suất Trong Tuần</span>
              </h3>

              <ul className="space-y-2 text-xs">
                {report.strengths.map((s, idx) => (
                  <li key={idx} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-slate-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <span>Gợi Ý Cải Thiện Cho Tuần Tiếp Theo</span>
              </h3>

              <ul className="space-y-2 text-xs">
                {report.recommendations.map((r, idx) => (
                  <li key={idx} className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-slate-800 flex items-start space-x-2">
                    <ArrowUpRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* MONTHLY REPORT VIEW */
        <div className="space-y-6 animate-fadeIn">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold mb-2 backdrop-blur-xs">
                <FileSpreadsheet className="w-3.5 h-3.5 text-amber-300" />
                <span>Báo Cáo Tổng Kết Năng Suất Tháng</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Báo Cáo Tổng Hợp {monthlyReport.monthName}
              </h1>
              <p className="text-xs sm:text-sm text-indigo-100 mt-1">
                Thống kê chi tiết ca làm việc, tiến độ học tập và phân tích xu hướng hiệu suất hàng tháng.
              </p>
            </div>

            <div className="px-5 py-3 bg-white/10 rounded-2xl border border-white/20 text-center shadow-xs backdrop-blur-xs shrink-0">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider block">Tuân Thủ Quy Định Ca Làm</span>
              <span className="text-2xl font-black text-amber-300 font-mono">{monthlyReport.shiftCompletionRatePercent}%</span>
            </div>
          </div>

          {/* Grid 1: Monthly Total Hours */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-4 border border-blue-100 shadow-2xs space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Làm Việc / Ca Làm</span>
              <div className="text-2xl font-black text-blue-700 font-mono">{mWorkHours} tiếng</div>
              <span className="text-[10px] text-blue-800 font-semibold">{monthlyReport.totalShiftsCompleted} ca làm việc</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-purple-100 shadow-2xs space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Học Tập & Nghiên Cứu</span>
              <div className="text-2xl font-black text-purple-700 font-mono">{mStudyHours} tiếng</div>
              <span className="text-[10px] text-purple-600 font-semibold">Tích lũy cả tháng</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-pink-100 shadow-2xs space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Hoạt Động Cá Nhân</span>
              <div className="text-2xl font-black text-pink-700 font-mono">{mPersonalHours} tiếng</div>
              <span className="text-[10px] text-slate-500">Cân bằng cuộc sống</span>
            </div>

            <div className="bg-white rounded-3xl p-4 border border-emerald-100 shadow-2xs space-y-1 text-center">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Rèn Luyện Thể Thao</span>
              <div className="text-2xl font-black text-emerald-700 font-mono">{mExerciseHours} tiếng</div>
              <span className="text-[10px] text-emerald-600 font-semibold">Sức khỏe & Thể lực</span>
            </div>
          </div>

          {/* Grid 2: Monthly Task Stats & AI Monthly Narrative */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Chỉ Số Hoàn Thành Tháng</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 flex justify-between items-center font-bold text-blue-900">
                  <span>Số ca làm việc hoàn thành:</span>
                  <span className="font-mono text-base text-blue-800">{monthlyReport.totalShiftsCompleted} ca</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex justify-between items-center font-bold text-emerald-900">
                  <span>Công việc đã xong:</span>
                  <span className="font-mono text-base">{monthlyReport.completedTasksCount} công việc</span>
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex justify-between items-center font-bold text-amber-900">
                  <span>Công việc dời lịch:</span>
                  <span className="font-mono text-base">{monthlyReport.deferredTasksCount} công việc</span>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Nhận Xét & Đánh Giá Năng Suất Hàng Tháng</span>
              </h3>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                {monthlyReport.aiAnalysisText}
              </p>
            </div>
          </div>

          {/* Grid 3: Monthly Highlights & Recommendations for Next Month */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <Award className="w-4 h-4 text-amber-500" />
                <span>3 Cột Mốc Đáng Tự Hào Trong Tháng</span>
              </h3>

              <ul className="space-y-2 text-xs">
                {monthlyReport.monthlyHighlights.map((hl, idx) => (
                  <li key={idx} className="p-3 bg-amber-50/50 rounded-2xl border border-amber-100 text-slate-800 flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{hl}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-3xl p-5 border border-indigo-100 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Định Hướng Cải Thiện Cho Tháng Tiếp Theo</span>
              </h3>

              <ul className="space-y-2 text-xs">
                {monthlyReport.recommendationsNextMonth.map((rec, idx) => (
                  <li key={idx} className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-slate-800 flex items-start space-x-2">
                    <ArrowUpRight className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

