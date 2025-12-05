import { CalendarDay, LunarDate } from '../types';
import { SOLAR_HOLIDAYS, LUNAR_HOLIDAYS, CAN, CHI } from '../constants';

// Use Intl to get Lunar Date (Chinese Calendar is very close to Vietnamese)
// Note: This is an approximation sufficient for a general app. 
// For strict Vietnamese astronomical precision, a heavy library would be needed.
export const getLunarDate = (date: Date): LunarDate => {
  const formatter = new Intl.DateTimeFormat('vi-VN', {
    calendar: 'chinese',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });

  const parts = formatter.formatToParts(date);
  let lunarDay = 1;
  let lunarMonth = 1;
  let lunarYear = 2024;
  let yearName = '';

  // Extract parts
  parts.forEach(p => {
    if (p.type === 'day') lunarDay = parseInt(p.value, 10);
    if (p.type === 'month') lunarMonth = parseInt(p.value, 10);
    if (p.type === 'year') {
        // Intl returns generic year number like "41" or "2024" depending on browser implementation of chinese calendar
        // But we actually need the Sexagenary cycle year usually provided by `relatedYear` or parsing the string if available.
        // Simplified: Calculate Can Chi manually based on Solar Year for Year Name
        // The numeric year from Intl might be cycle year. We'll rely on solar year mapping for CanChi Year.
    }
  });
  
  // Correction for Intl which sometimes returns the numeric year of the cycle
  // We use the solar date to determine the Lunar Year roughly, then adjust
  // This is a simplified approach for Can Chi
  const solarYear = date.getFullYear();
  // If month is late in solar year (Jan/Feb) but lunar month is 11/12, it belongs to previous solar year's mapping usually
  // But strictly, Can Chi depends on the Lunar Year transition (Tet).
  // We will calculate Can Chi based on the calculated lunar year number.
  
  // Since Intl 'chinese' doesn't easily give us the absolute lunar year number to calculate CanChi,
  // We will map based on the solar year, adjusting if the date is before Tet.
  // This is a heuristic.
  let effectiveYear = solarYear;
  if (date.getMonth() < 3 && lunarMonth > 9) {
      effectiveYear = solarYear - 1;
  }
  
  lunarYear = effectiveYear;

  const getCanChiYear = (year: number) => {
      const can = CAN[(year + 6) % 10];
      const chi = CHI[(year + 8) % 12];
      return `${can} ${chi}`;
  };

  yearName = getCanChiYear(effectiveYear);

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    leap: false, // Intl doesn't easily return leap info without complex parsing string
    dayName: '', // Complex calculation omitted for brevity
    monthName: '', // Complex calculation omitted for brevity
    yearName: yearName
  };
};

export const checkHolidays = (solarDate: Date, lunarDate: LunarDate): string[] => {
  const holidays: string[] = [];
  
  const solarKey = `${solarDate.getDate()}-${solarDate.getMonth() + 1}`;
  const lunarKey = `${lunarDate.day}-${lunarDate.month}`;

  if (SOLAR_HOLIDAYS[solarKey]) {
    holidays.push(SOLAR_HOLIDAYS[solarKey]);
  }

  if (LUNAR_HOLIDAYS[lunarKey]) {
    holidays.push(LUNAR_HOLIDAYS[lunarKey]);
  }

  return holidays;
};

export const getCalendarMonth = (year: number, month: number): CalendarDay[] => {
  const days: CalendarDay[] = [];
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Start from the beginning of the week (Sunday)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  // End at the end of the week (Saturday)
  const endDate = new Date(lastDayOfMonth);
  if (endDate.getDay() !== 6) {
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
  }

  let currentDate = new Date(startDate);
  const today = new Date();

  while (currentDate <= endDate) {
    const lunar = getLunarDate(currentDate);
    const dayHolidays = checkHolidays(currentDate, lunar);

    days.push({
      solarDate: new Date(currentDate),
      lunarDate: lunar,
      isCurrentMonth: currentDate.getMonth() === month,
      isToday: currentDate.getDate() === today.getDate() && 
               currentDate.getMonth() === today.getMonth() && 
               currentDate.getFullYear() === today.getFullYear(),
      isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
      holidays: dayHolidays
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return days;
};

export const formatDateFull = (date: Date): string => {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};