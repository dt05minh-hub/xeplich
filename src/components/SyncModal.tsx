import React, { useState } from 'react';
import { RefreshCw, Check, Copy, QrCode, Smartphone, Monitor, ShieldCheck, Zap } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  syncKey: string;
  onUpdateSyncKey: (newKey: string) => void;
  isSynced: boolean;
  lastSyncedAt: Date | null;
}

export function SyncModal({
  isOpen,
  onClose,
  syncKey,
  onUpdateSyncKey,
  isSynced,
  lastSyncedAt
}: SyncModalProps) {
  const [inputKey, setInputKey] = useState(syncKey);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!isOpen) return null;

  const rawOrigin = window.location.origin;
  const publicOrigin = rawOrigin.replace('ais-dev-', 'ais-pre-');
  const shareUrl = `${publicOrigin}${window.location.pathname}?sync=${encodeURIComponent(inputKey)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onUpdateSyncKey(inputKey.trim().toLowerCase());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Đồng Bộ Máy Tính & Điện Thoại</h3>
              <p className="text-xs text-slate-500">Cập nhật thời gian thực 2 chiều tự động 100%</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* Status badge */}
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <div>
                <span className="text-sm font-semibold text-emerald-900">
                  {isSynced ? 'Đang kết nối đám mây Cloud' : 'Đang đồng bộ dữ liệu...'}
                </span>
                {lastSyncedAt && (
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Cập nhật lần cuối: {lastSyncedAt.toLocaleTimeString('vi-VN')}
                  </p>
                )}
              </div>
            </div>
            <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Miễn phí 100%
            </span>
          </div>

          {/* Sync Code Settings */}
          <form onSubmit={handleSaveKey} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Mã Đồng Bộ Của Bạn (Sync Key)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inputKey}
                onChange={(e) => setInputKey(e.target.value)}
                placeholder="Nhập mã ví dụ: minh123"
                className="flex-1 px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-800 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-xs"
              >
                Lưu Mã
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Chỉ cần nhập cùng mã này trên bất kỳ thiết bị nào (điện thoại, laptop) để dùng chung dữ liệu.
            </p>
          </form>

          {/* How to Connect Phone */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-600" />
              Cách mở trên Điện Thoại nhanh nhất:
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                {copied ? 'Đã chép link!' : 'Chép Link Mở Trực Tiếp'}
              </button>

              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
              >
                <QrCode className="w-4 h-4" />
                {showQR ? 'Ẩn Mã QR' : 'Quét Mã QR Điện Thoại'}
              </button>
            </div>

            <div className="p-2.5 bg-slate-100/80 rounded-lg text-[11px] font-mono text-slate-600 break-all border border-slate-200">
              <span className="font-semibold text-slate-700 font-sans block mb-0.5">Link Công Khai Cho Điện Thoại:</span>
              <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                {shareUrl}
              </a>
            </div>

            {showQR && (
              <div className="flex flex-col items-center justify-center pt-2 pb-1 space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                <img
                  src={qrUrl}
                  alt="QR Code Sync"
                  className="w-44 h-44 border border-slate-100 rounded-lg shadow-xs"
                />
                <p className="text-xs text-slate-500 text-center">
                  Dùng camera điện thoại quét mã QR để mở trang web đã tự động gắn mã đồng bộ!
                </p>
              </div>
            )}
          </div>

          {/* Flow representation */}
          <div className="flex items-center justify-center gap-4 py-2 text-xs text-slate-600 font-medium">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
              <Monitor className="w-4 h-4 text-slate-700" /> Máy Tính (PC)
            </div>
            <div className="flex items-center gap-1 text-indigo-600 font-bold animate-pulse">
              ◄─── Cloud Firestore ───►
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
              <Smartphone className="w-4 h-4 text-slate-700" /> Điện Thoại
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
