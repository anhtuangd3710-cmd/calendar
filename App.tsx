
import React, { useState, useMemo } from 'react';
import Header from './components/Header';
import CalendarGrid from './components/CalendarGrid';
import YearGrid from './components/YearGrid';
import DetailPanel from './components/DetailPanel';
import InstallPrompt from './components/InstallPrompt';
import { getCalendarMonth, getLunarDate, checkHolidays } from './utils/dateUtils';
import { CalendarDay, ViewMode } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.MONTH);
  const [transitionDirection, setTransitionDirection] = useState<'next' | 'prev' | 'fade'>('fade');
  
  // Create a proper CalendarDay object for the selected date to pass to DetailPanel
  const selectedDayObj: CalendarDay = useMemo(() => {
    const lunar = getLunarDate(selectedDate);
    return {
        solarDate: selectedDate,
        lunarDate: lunar,
        isCurrentMonth: true,
        isToday: false, // Not strictly needed for detail view visual
        isWeekend: selectedDate.getDay() === 0 || selectedDate.getDay() === 6,
        holidays: checkHolidays(selectedDate, lunar)
    };
  }, [selectedDate]);

  const days = useMemo(() => {
    return getCalendarMonth(currentDate.getFullYear(), currentDate.getMonth());
  }, [currentDate]);

  const handlePrev = () => {
    if (viewMode === ViewMode.MONTH) {
        // Change to Previous Day
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);

        // If the new day belongs to a different month/year than currently viewed, update the view
        if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
            setTransitionDirection('prev');
            setCurrentDate(newDate);
        }
    } else {
        // Year View: Go back 1 year
        setTransitionDirection('prev');
        const prevYear = currentDate.getFullYear() - 1;
        const newDate = new Date(prevYear, currentDate.getMonth(), 1);
        setCurrentDate(newDate);
        
        // Sync selected date to the same relative date in the previous year
        const newSelected = new Date(selectedDate);
        newSelected.setFullYear(prevYear);
        setSelectedDate(newSelected);
    }
  };

  const handleNext = () => {
    if (viewMode === ViewMode.MONTH) {
        // Change to Next Day
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);

        // If the new day belongs to a different month/year than currently viewed, update the view
        if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
            setTransitionDirection('next');
            setCurrentDate(newDate);
        }
    } else {
        // Year View: Go forward 1 year
        setTransitionDirection('next');
        const nextYear = currentDate.getFullYear() + 1;
        const newDate = new Date(nextYear, currentDate.getMonth(), 1);
        setCurrentDate(newDate);

        // Sync selected date to the same relative date in the next year
        const newSelected = new Date(selectedDate);
        newSelected.setFullYear(nextYear);
        setSelectedDate(newSelected);
    }
  };

  const handleToday = () => {
    setTransitionDirection('fade');
    const now = new Date();
    // Reset time to start of day to avoid comparison issues
    now.setHours(0, 0, 0, 0); 
    
    // Explicitly set both current view date and selected date
    setCurrentDate(new Date(now));
    setSelectedDate(new Date(now));
    
    // Always switch back to month view to see the day
    setViewMode(ViewMode.MONTH);
  };

  const handleYearChange = (year: number) => {
    setTransitionDirection('fade');
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);

    // Sync selectedDate to the new year so the detail panel updates immediately
    const newSelected = new Date(selectedDate);
    newSelected.setFullYear(year);
    setSelectedDate(newSelected);
  };

  const handleSelectDate = (day: CalendarDay) => {
    setSelectedDate(day.solarDate);
    // If user clicks a gray date from prev/next month, switch view to that month
    if (!day.isCurrentMonth) {
        setTransitionDirection(day.solarDate < currentDate ? 'prev' : 'next');
        // Create a new date object based on the clicked day to properly switch month views
        // We set the date to the 1st of the clicked month to ensure the grid renders that month
        const newViewDate = new Date(day.solarDate.getFullYear(), day.solarDate.getMonth(), 1);
        setCurrentDate(newViewDate);
    }
  };

  const handleSelectMonthFromYearView = (monthIndex: number) => {
    setTransitionDirection('fade');
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    setCurrentDate(newDate);
    
    // Also update selected date to the 1st of that month so detail panel matches context
    const newSelected = new Date(currentDate.getFullYear(), monthIndex, 1);
    setSelectedDate(newSelected);

    // Auto switch to detailed month view
    setViewMode(ViewMode.MONTH);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setTransitionDirection('fade');
    setViewMode(mode);
  };

  const animationClass = transitionDirection === 'next' ? 'animate-slide-right' : 
                         transitionDirection === 'prev' ? 'animate-slide-left' : 'animate-zoom-fade';

  // Use a key that changes when the relevant view parameters change to trigger the animation
  // For month view: month/year change. For year view: year change.
  const gridKey = viewMode === ViewMode.MONTH 
    ? `month-${currentDate.getMonth()}-${currentDate.getFullYear()}`
    : `year-${currentDate.getFullYear()}`;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-900 pb-24 md:pb-8">
      <InstallPrompt />
      <div className="max-w-7xl mx-auto">
        <Header 
          currentDate={currentDate} 
          viewMode={viewMode}
          onPrev={handlePrev} 
          onNext={handleNext} 
          onToday={handleToday}
          onViewModeChange={handleViewModeChange}
          onYearChange={handleYearChange}
        />
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 order-2 lg:order-1 overflow-hidden">
             {/* We use a key on the wrapper to trigger React re-mount and CSS animation */}
             <div key={gridKey} className={animationClass}>
                {viewMode === ViewMode.MONTH ? (
                    <>
                        <CalendarGrid 
                          days={days} 
                          onSelectDate={handleSelectDate} 
                          selectedDate={selectedDate}
                        />
                        <div className="mt-4 text-center text-xs text-slate-400">
                            * Dữ liệu âm lịch được tính toán dựa trên thuật toán tiêu chuẩn. 
                            Các lời khuyên được hỗ trợ bởi AI với mục đích hướng thiện.
                        </div>
                    </>
                ) : (
                    <YearGrid 
                        year={currentDate.getFullYear()} 
                        onSelectMonth={handleSelectMonthFromYearView} 
                    />
                )}
            </div>
          </div>
          
          <div className="order-1 lg:order-2 lg:sticky lg:top-8 h-fit">
            <DetailPanel day={selectedDayObj} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
