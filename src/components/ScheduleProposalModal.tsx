import React from 'react';
import { AIScheduleProposal } from '../types';
import { Sparkles, CheckCircle2, RefreshCw, X, Calendar, Clock, AlertCircle } from 'lucide-react';

interface ScheduleProposalModalProps {
  proposal: AIScheduleProposal | null;
  isOpen: boolean;
  onClose: () => void;
  onApplyProposal: () => void;
  onReplan: () => void;
}

export const ScheduleProposalModal: React.FC<ScheduleProposalModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onApplyProposal,
  onReplan,
}) => {
  if (!isOpen || !proposal) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-purple-200 rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl text-slate-800 max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-200 to-pink-200 flex items-center justify-center text-purple-800">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-800">Phương Án Lập Lịch Tự Động Từ AI</h3>
              <p className="text-xs text-slate-500">Đã kiểm tra lịch cố định & quy định ca làm việc</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 font-bold">✕</button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Summary Box */}
          <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs text-purple-950 font-medium leading-relaxed">
            <strong>Tóm tắt phương án:</strong> {proposal.summary}
          </div>

          {/* Proposed Slot Items */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Danh sách {proposal.proposedItems.length} vị trí công việc được đề xuất:
            </h4>

            {proposal.proposedItems.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{item.taskTitle}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 text-indigo-900">
                    {item.date} ({item.startTime} - {item.endTime})
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 italic">
                  💡 Lý do chọn khung giờ: {item.reasoning}
                </p>
              </div>
            ))}
          </div>

          {/* Tips / Conflict Resolutions */}
          {proposal.tips && proposal.tips.length > 0 && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 space-y-1">
              <strong>Lời khuyên từ AI:</strong>
              <ul className="list-disc pl-4 space-y-0.5">
                {proposal.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onReplan}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Yêu Cầu Lập Lịch Khác</span>
          </button>

          <button
            onClick={onApplyProposal}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center space-x-2 shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Đồng Ý & Áp Dụng Lịch Này</span>
          </button>
        </div>

      </div>
    </div>
  );
};
