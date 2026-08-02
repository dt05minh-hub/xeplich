import React, { useState, useEffect } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Check, Info } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [showBanner, setShowBanner] = useState<boolean>(true);
  const [showGuideModal, setShowGuideModal] = useState<boolean>(false);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode (installed as PWA)
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isInStandaloneMode);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isAppleDevice);

    // Catch Chrome/Android/Edge beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no native prompt event (e.g. iOS or manual browser), show guide modal
      setShowGuideModal(true);
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  // If already running as installed standalone app, don't show banner
  if (isStandalone || isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating PWA Install Banner */}
      {showBanner && (
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white border-b border-indigo-700/50 px-4 py-2.5 shadow-md sticky top-16 z-30 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
            
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
                <Smartphone className="w-4 h-4 text-purple-200" />
              </div>
              <div>
                <span className="font-bold text-white block sm:inline mr-2">
                  Cài đặt Adaptive Planner lên điện thoại!
                </span>
                <span className="text-indigo-200 hidden md:inline text-xs">
                  Chạy như ứng dụng độc lập, truy cập nhanh từ Màn hình chính
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={handleInstallClick}
                className="px-3 py-1.5 bg-white text-indigo-900 hover:bg-indigo-50 font-bold rounded-lg text-xs shadow-xs flex items-center space-x-1.5 transition-all active:scale-95"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>{deferredPrompt ? 'Cài Đặt Tự Động' : 'Hướng Dẫn Cài Đặt'}</span>
              </button>

              <button
                onClick={() => setShowGuideModal(true)}
                className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-all hidden sm:flex"
                title="Xem hướng dẫn chi tiết"
              >
                <Info className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowBanner(false)}
                className="p-1.5 text-indigo-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PWA Installation Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-indigo-100 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-indigo-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Cài Đặt Ứng Dụng (PWA)</h3>
                  <p className="text-xs text-slate-500">Đưa Adaptive Planner ra Màn hình chính điện thoại</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-5 text-xs sm:text-sm">
              
              {/* If browser supports native prompt */}
              {deferredPrompt && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-emerald-900">
                  <p className="font-semibold mb-2 flex items-center text-emerald-800">
                    <Check className="w-4 h-4 mr-1 text-emerald-600" /> Trình duyệt hỗ trợ cài đặt 1-Click!
                  </p>
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Bấm Cài Đặt Ngay Bây Giờ</span>
                  </button>
                </div>
              )}

              {/* iOS / iPhone / Safari Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-extrabold">1</span>
                  <span>Dành cho iOS (iPhone / iPad - Trình duyệt Safari):</span>
                </h4>
                <ol className="space-y-2 text-slate-600 pl-2">
                  <li className="flex items-start space-x-2">
                    <Share className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <span>Bấm vào biểu tượng <strong>Chia sẻ (Share)</strong> ở thanh dưới cùng của Safari.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <PlusSquare className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải để hoàn tất.</span>
                  </li>
                </ol>
              </div>

              {/* Android / Chrome Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                <h4 className="font-bold text-slate-800 flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-extrabold">2</span>
                  <span>Dành cho Android (Google Chrome / Edge):</span>
                </h4>
                <ol className="space-y-2 text-slate-600 pl-2">
                  <li>1. Bấm vào dấu <strong>3 chấm (⋮)</strong> ở góc trên bên phải trình duyệt.</li>
                  <li>2. Chọn <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.</li>
                  <li>3. Xạ nhận và ứng dụng sẽ xuất hiện trên màn hình điện thoại.</li>
                </ol>
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-slate-600 text-xs">
                💡 <strong>Ưu điểm PWA:</strong> Không tốn dung lượng bộ nhớ, không cần qua App Store/Google Play, chạy mượt mà không thanh địa chỉ, hỗ trợ ngoại tuyến cơ bản.
              </div>

            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-all"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
