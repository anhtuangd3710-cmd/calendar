import React from 'react';
import { SOLAR_HOLIDAYS, LUNAR_HOLIDAYS } from '../constants';

interface YearGridProps {
  year: number;
  onSelectMonth: (monthIndex: number) => void;
}

const YearGrid: React.FC<YearGridProps> = ({ year, onSelectMonth }) => {
  const months = Array.from({ length: 12 }, (_, i) => i);
  const currentMonthIndex = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Helper to find major holidays in this month roughly (simplified for overview)
  const getHolidayPreview = (monthIndex: number) => {
    const preview: string[] = [];
    const m = monthIndex + 1;
    
    // Check Solar Holidays
    Object.entries(SOLAR_HOLIDAYS).forEach(([key, name]) => {
      const [d, mo] = key.split('-').map(Number);
      if (mo === m) preview.push(`${d}/${mo}: ${name}`);
    });

    // Check Lunar Holidays (Approximate for visual aid - mostly Tet)
    // Note: Accurate lunar holiday mapping to solar month requires complex calculation for every day.
    // We will stick to static Solar holidays for the preview card to keep performance high and UI clean.
    if (m === 1 || m === 2) { 
        // Tet usually falls here, generic label
        preview.push("Tết Nguyên Đán (Âm lịch)");
    }

    return preview.slice(0, 2); // Show max 2 items
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {months.map((monthIndex) => {
          const isCurrentMonth = monthIndex === currentMonthIndex && year === currentYear;
          const holidays = getHolidayPreview(monthIndex);

          return (
            <button
              key={monthIndex}
              onClick={() => onSelectMonth(monthIndex)}
              className={`
                flex flex-col p-4 rounded-xl border text-left transition-all hover:shadow-md active:scale-95
                ${isCurrentMonth ? 'border-red-500 bg-red-50 ring-1 ring-red-500' : 'border-slate-100 bg-white hover:border-red-200'}
              `}
            >
              <div className="flex justify-between items-start w-full mb-2">
                <span className={`text-lg font-bold ${isCurrentMonth ? 'text-red-600' : 'text-slate-700'}`}>
                  Tháng {monthIndex + 1}
                </span>
                {isCurrentMonth && (
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                )}
              </div>
              
              <div className="flex-1 w-full">
                {holidays.length > 0 ? (
                  <ul className="text-xs text-slate-500 space-y-1">
                    {holidays.map((h, i) => (
                      <li key={i} className="truncate">• {h}</li>
                    ))}
                    {monthIndex + 1 === 4 && <li className="truncate">• Giỗ Tổ Hùng Vương (Âm)</li>}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-300 italic mt-1">Không có ngày lễ lớn</p>
                )}
              </div>

              <div className="mt-3 text-xs font-semibold text-blue-600 bg-blue-50 w-fit px-2 py-1 rounded">
                Xem chi tiết
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default YearGrid;