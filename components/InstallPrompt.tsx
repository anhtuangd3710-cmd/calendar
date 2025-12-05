
import React, { useState, useEffect } from 'react';
import { Download, Share, X } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    // Handle Android/Desktop Chrome install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Detect iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIOS && !isStandalone) {
      // Show iOS prompt only if not in standalone mode
      // We can use a session storage flag to not annoy user every time
      const hasSeenPrompt = sessionStorage.getItem('iosInstallPromptSeen');
      if (!hasSeenPrompt) {
        setShowIOSPrompt(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const closeIOSPrompt = () => {
    setShowIOSPrompt(false);
    sessionStorage.setItem('iosInstallPromptSeen', 'true');
  };

  if (isStandalone) return null;

  return (
    <>
      {/* Android / Desktop Install Button */}
      {deferredPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 animate-fade-in">
          <div className="bg-slate-900 text-white p-4 rounded-xl shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-500 p-2 rounded-lg">
                <Download size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">Cài đặt ứng dụng</p>
                <p className="text-xs text-slate-300">Xem lịch nhanh hơn, không cần mạng</p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors"
            >
              Cài đặt
            </button>
            <button 
                onClick={() => setDeferredPrompt(null)}
                className="absolute -top-2 -right-2 bg-slate-200 text-slate-600 rounded-full p-1 shadow-sm"
            >
                <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* iOS Instructions */}
      {showIOSPrompt && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-6 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] animate-slide-up rounded-t-2xl">
          <button 
            onClick={closeIOSPrompt}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
          
          <div className="flex flex-col items-center text-center space-y-4">
             <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-1">
                <Download size={24} />
             </div>
             <h3 className="text-lg font-bold text-slate-800">Cài đặt Lịch Vạn Niên</h3>
             <p className="text-slate-600 text-sm max-w-xs">
               Để cài đặt ứng dụng vào màn hình chính iPhone/iPad:
             </p>
             
             <div className="flex flex-col gap-3 text-sm text-slate-700 w-full max-w-xs bg-slate-50 p-4 rounded-xl text-left">
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-slate-200 rounded-full text-xs font-bold shrink-0">1</span>
                    <span>Nhấn vào nút <strong>Chia sẻ</strong> <Share size={14} className="inline mx-1" /> ở thanh công cụ.</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-slate-200 rounded-full text-xs font-bold shrink-0">2</span>
                    <span>Chọn <strong>Thêm vào MH chính</strong> (Add to Home Screen).</span>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstallPrompt;
