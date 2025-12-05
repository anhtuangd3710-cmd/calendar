
export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
  dayName: string; // Can Chi Ngày
  monthName: string; // Can Chi Tháng
  yearName: string; // Can Chi Năm
}

export interface CalendarDay {
  solarDate: Date;
  lunarDate: LunarDate;
  isCurrentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  holidays: string[];
}

export interface AdviceResponse {
  quote: string;
  goodActivities: string[];
  badActivities: string[];
}

export enum ViewMode {
  MONTH = 'MONTH',
  YEAR = 'YEAR'
}
