import React from 'react';
import { CalendarDay } from '../types';
import { WEEKDAYS } from '../constants';

interface CalendarGridProps {
  days: CalendarDay[];
  onSelectDate: (day: CalendarDay) => void;
  selectedDate: Date;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ days, onSelectDate, selectedDate }) => {
  const isSelected = (day: CalendarDay) => {
    return day.solarDate.getDate() === selectedDate.getDate() &&
           day.solarDate.getMonth() === selectedDate.getMonth() &&
           day.solarDate.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-100">
        {WEEKDAYS.map((day, index) => (
          <div 
            key={day} 
            className={`py-4 text-center text-sm font-bold ${index === 0 ? 'text-red-500' : 'text-slate-500'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const selected = isSelected(day);
          const hasHoliday = day.holidays.length > 0;
          
          return (
            <div 
              key={index}
              onClick={() => onSelectDate(day)}
              className={`
                min-h-[100px] md:min-h-[120px] p-2 border-b border-r border-slate-50 relative cursor-pointer transition-all duration-200
                ${!day.isCurrentMonth ? 'bg-slate-50/50 grayscale opacity-60' : 'bg-white hover:bg-red-50/30'}
                ${selected ? 'ring-2 ring-inset ring-red-500 bg-red-50/50 z-10' : ''}
              `}
            >
              <div className="flex flex-col h-full justify-between items-center">
                
                {/* Solar Date */}
                <span className={`
                  text-xl md:text-2xl font-semibold mt-1
                  ${day.isToday ? 'bg-red-500 text-white w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full shadow-md' : ''}
                  ${!day.isToday && day.solarDate.getDay() === 0 ? 'text-red-500' : 'text-slate-700'}
                  ${!day.isCurrentMonth && !day.isToday ? 'text-slate-400' : ''}
                `}>
                  {day.solarDate.getDate()}
                </span>

                {/* Holiday Indicator */}
                {hasHoliday && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 absolute top-2 right-2 animate-pulse"></div>
                )}

                {/* Lunar Date */}
                <div className="flex flex-col items-center gap-1 mb-1">
                  <span className={`text-xs md:text-sm font-medium ${hasHoliday ? 'text-red-600' : 'text-slate-500'}`}>
                    {day.lunarDate.day === 1 ? `${day.lunarDate.day}/${day.lunarDate.month}` : day.lunarDate.day}
                  </span>
                  
                  {/* Holiday Name (Truncated) */}
                  {hasHoliday && (
                    <span className="text-[10px] text-red-500 text-center leading-tight line-clamp-1 font-semibold px-1">
                      {day.holidays[0]}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;