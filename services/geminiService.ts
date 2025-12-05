import { AdviceResponse } from '../types';

const CACHE_PREFIX = 'LICH_VAN_NIEN_ADVICE_';

export const getDailyAdvice = async (solarDate: string, lunarDate: string): Promise<AdviceResponse> => {
  const cacheKey = `${CACHE_PREFIX}${solarDate}`;

  // 1. Kiểm tra Cache trình duyệt trước (Để app chạy nhanh mượt)
  try {
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData) as AdviceResponse;
    }
  } catch (e) {
    console.warn("Lỗi đọc cache", e);
  }

  try {
    // 2. Gọi API Backend (Serverless Function) của chính mình
    // Backend sẽ lo việc kiểm tra Database và gọi AI nếu cần
    const response = await fetch(`/api/advice?solarDate=${encodeURIComponent(solarDate)}&lunarDate=${encodeURIComponent(lunarDate)}`);
    
    if (!response.ok) {
        throw new Error("Lỗi kết nối đến máy chủ");
    }

    const result = await response.json();

    // 3. Lưu vào Cache trình duyệt cho lần sau vào lại không cần tải
    try {
        localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (storageError) {
        console.warn("Không thể lưu cache", storageError);
    }

    return result as AdviceResponse;
  } catch (error) {
    console.error("Lỗi lấy lời khuyên:", error);
    // Dữ liệu dự phòng khi mất mạng hoặc lỗi server
    return {
      quote: "Mỗi ngày là một món quà.",
      goodActivities: ["Mỉm cười", "Giúp đỡ người khác", "Giữ gìn vệ sinh"],
      badActivities: ["Nổi nóng", "Lãng phí thức ăn"]
    };
  }
};