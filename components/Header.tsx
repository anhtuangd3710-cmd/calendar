import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Grid, CalendarDays, ChevronDown, Check, X } from 'lucide-react';
import { ViewMode } from '../types';

interface HeaderProps {
  currentDate: Date;
  viewMode: ViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewModeChange: (mode: ViewMode) => void;
  onYearChange: (year: number) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  currentDate, 
  viewMode, 
  onPrev, 
  onNext, 
  onToday,
  onViewModeChange,
  onYearChange
}) => {
  const [isYearPickerOpen, setIsYearPickerOpen] = useState(false);
  const yearListRef = useRef<HTMLDivElement>(null);
  const currentYear = currentDate.getFullYear();
  
  // Generate a range of years (e.g., 1900 to 2100)
  const startYear = 1900;
  const endYear = 2100;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // Auto scroll to current year when opening picker
  useEffect(() => {
    if (isYearPickerOpen && yearListRef.current) {
      // Small timeout to ensure rendering is done before scrolling
      setTimeout(() => {
        const selectedEl = yearListRef.current?.querySelector(`[data-year="${currentYear}"]`);
        if (selectedEl) {
          selectedEl.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }, 100);
    }
  }, [isYearPickerOpen, currentYear]);

  // Prevent background scrolling when modal is open on mobile
  useEffect(() => {
    if (isYearPickerOpen) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'unset';
    }
    return () => {
        document.body.style.overflow = 'unset';
    }
  }, [isYearPickerOpen]);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white shadow-sm rounded-2xl mb-4 border border-slate-100 z-20 relative">
      <div className="flex items-center gap-3 mb-4 md:mb-0 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-lg text-white shadow-red-200 shadow-lg">
                <CalendarIcon size={24} />
            </div>
            <div>
                <div className="flex items-center gap-1 relative">
                    {viewMode === ViewMode.MONTH && (
                        <span className="text-2xl font-bold text-slate-800 capitalize leading-none mr-1">
                            Tháng {currentDate.getMonth() + 1}
                        </span>
                    )}
                    
                    {/* Modern Year Selector */}
                    <div>
                        <button 
                            onClick={() => setIsYearPickerOpen(!isYearPickerOpen)}
                            className="flex items-center gap-1 text-2xl font-bold text-slate-800 hover:text-red-600 transition-colors outline-none group"
                        >
                            <span>Năm {currentYear}</span>
                            <ChevronDown size={20} className={`text-slate-400 group-hover:text-red-500 transition-transform duration-200 ${isYearPickerOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown / Modal */}
                        {isYearPickerOpen && (
                            <>
                                {/* Backdrop */}
                                <div 
                                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:bg-black/5 md:backdrop-blur-none" 
                                    onClick={() => setIsYearPickerOpen(false)}
                                ></div>
                                
                                {/* Content Container */}
                                <div className={`
                                    fixed md:absolute z-50 bg-white shadow-2xl border border-slate-100 overflow-hidden flex flex-col
                                    
                                    /* Mobile Styles: Centered Modal */
                                    top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                    w-[90vw] max-w-sm h-[70vh] rounded-2xl
                                    
                                    /* Desktop Styles: Dropdown */
                                    md:top-full md:left-0 md:translate-x-0 md:translate-y-2 
                                    md:w-80 md:h-auto md:max-h-96 md:rounded-xl
                                    
                                    animate-in fade-in zoom-in-95 duration-200
                                `}>
                                    {/* Header of Picker */}
                                    <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
                                        <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Chọn năm</span>
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => {
                                                    onToday(); // Use onToday instead of onYearChange to fully reset date
                                                    setIsYearPickerOpen(false);
                                                }}
                                                className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline"
                                            >
                                                Về năm nay
                                            </button>
                                            <button 
                                                onClick={() => setIsYearPickerOpen(false)}
                                                className="md:hidden text-slate-400 hover:text-slate-600"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Grid of Years */}
                                    <div 
                                        ref={yearListRef}
                                        className="overflow-y-auto p-2 grid grid-cols-3 md:grid-cols-4 gap-2 scroll-smooth flex-1"
                                    >
                                        {years.map(year => (
                                            <button
                                                key={year}
                                                data-year={year}
                                                onClick={() => {
                                                    onYearChange(year);
                                                    setIsYearPickerOpen(false);
                                                }}
                                                className={`
                                                    py-3 md:py-2 rounded-lg text-base md:text-sm font-medium transition-all
                                                    ${year === currentYear 
                                                        ? 'bg-red-500 text-white shadow-md' 
                                                        : 'text-slate-600 hover:bg-slate-100 border border-transparent hover:border-slate-200'
                                                    }
                                                `}
                                            >
                                                {year}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <p className="text-slate-500 font-medium text-sm mt-1">
                    {viewMode === ViewMode.MONTH 
                    ? 'Lịch Vạn Niên' 
                    : 'Tổng quan 12 tháng'}
                </p>
            </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-end">
        
        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
                onClick={() => onViewModeChange(ViewMode.MONTH)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === ViewMode.MONTH 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <CalendarDays size={16} />
                <span className="hidden sm:inline">Tháng</span>
            </button>
            <button
                onClick={() => onViewModeChange(ViewMode.YEAR)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                    viewMode === ViewMode.YEAR 
                    ? 'bg-white text-slate-800 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                <Grid size={16} />
                <span className="hidden sm:inline">Năm</span>
            </button>
        </div>

        <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

        {/* Navigation */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
          <button 
            onClick={onPrev}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600 active:scale-95"
            aria-label="Trước"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button 
            onClick={onToday}
            className="px-3 py-2 text-sm font-bold text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all whitespace-nowrap"
          >
            Hôm nay
          </button>

          <button 
            onClick={onNext}
            className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600 active:scale-95"
            aria-label="Sau"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;