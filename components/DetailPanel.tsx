import React, { useEffect, useState } from 'react';
import { CalendarDay, AdviceResponse } from '../types';
import { formatDateFull } from '../utils/dateUtils';
import { getDailyAdvice } from '../services/geminiService';
import { Sparkles, ThumbsUp, ThumbsDown, Info } from 'lucide-react';

interface DetailPanelProps {
  day: CalendarDay | null;
}

const DetailPanel: React.FC<DetailPanelProps> = ({ day }) => {
  const [advice, setAdvice] = useState<AdviceResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (day) {
      setLoading(true);
      const solarStr = day.solarDate.toLocaleDateString('vi-VN');
      const lunarStr = `${day.lunarDate.day}/${day.lunarDate.month}/${day.lunarDate.year} (${day.lunarDate.yearName})`;
      
      // Debounce slightly or just call
      getDailyAdvice(solarStr, lunarStr)
        .then(setAdvice)
        .catch(() => setAdvice(null))
        .finally(() => setLoading(false));
    }
  }, [day]);

  if (!day) return <div className="hidden lg:block w-96 p-6 text-center text-slate-400">Chọn một ngày để xem chi tiết</div>;

  return (
    <div className="w-full lg:w-[400px] bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full animate-fade-in" key={day.solarDate.toISOString()}>
      {/* Header Color Block */}
      <div className={`p-6 text-white rounded-t-2xl relative overflow-hidden ${day.holidays.length > 0 || day.isWeekend ? 'bg-red-500' : 'bg-blue-600'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Info size={100} />
        </div>
        <div className="relative z-10">
          <p className="text-blue-100 opacity-90 text-sm font-medium uppercase tracking-wider mb-1">
            {formatDateFull(day.solarDate).split(',')[0]}
          </p>
          <div className="flex items-baseline gap-2">
             <span className="text-6xl font-bold">{day.solarDate.getDate()}</span>
             <div className="flex flex-col">
                <span className="text-xl font-medium">Tháng {day.solarDate.getMonth() + 1}</span>
                <span className="text-sm opacity-80">{day.solarDate.getFullYear()}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Lunar Info */}
      <div className="p-6 border-b border-slate-100 bg-orange-50/30">
        <div className="flex justify-between items-end mb-2">
            <div>
                <p className="text-slate-500 text-sm uppercase font-semibold">Âm Lịch</p>
                <div className="flex items-baseline gap-2 text-orange-700">
                    <span className="text-4xl font-bold">{day.lunarDate.day}</span>
                    <span className="text-lg font-medium">Tháng {day.lunarDate.month}</span>
                </div>
            </div>
            <div className="text-right">
                <span className="block text-slate-600 font-medium">Năm {day.lunarDate.yearName}</span>
                {day.holidays.length > 0 && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded">
                        {day.holidays[0]}
                    </span>
                )}
            </div>
        </div>
      </div>

      {/* AI Advice Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-purple-500" size={20} />
            <h3 className="font-bold text-slate-800">Lời Khuyên Hôm Nay</h3>
        </div>

        {loading ? (
            <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                <div className="h-4 bg-slate-100 rounded w-full"></div>
                <div className="h-4 bg-slate-100 rounded w-5/6"></div>
            </div>
        ) : advice ? (
            <div className="space-y-6 animate-fade-in">
                <div className="bg-purple-50 p-4 rounded-xl text-purple-900 italic text-sm border border-purple-100">
                    "{advice.quote}"
                </div>

                <div>
                    <div className="flex items-center gap-2 text-green-600 font-semibold text-sm mb-2">
                        <ThumbsUp size={16} /> Việc nên làm
                    </div>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {advice.goodActivities?.length > 0 ? (
                            advice.goodActivities.map((act, i) => <li key={i}>{act}</li>)
                        ) : (
                            <li className="list-none text-slate-400 italic">Đang cập nhật...</li>
                        )}
                    </ul>
                </div>

                <div>
                    <div className="flex items-center gap-2 text-red-500 font-semibold text-sm mb-2">
                        <ThumbsDown size={16} /> Việc nên tránh
                    </div>
                    <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                        {advice.badActivities?.length > 0 ? (
                            advice.badActivities.map((act, i) => <li key={i}>{act}</li>)
                        ) : (
                            <li className="list-none text-slate-400 italic">Đang cập nhật...</li>
                        )}
                    </ul>
                </div>
            </div>
        ) : (
            <p className="text-sm text-slate-400">Không thể tải dữ liệu lời khuyên.</p>
        )}
      </div>
    </div>
  );
};

export default DetailPanel;