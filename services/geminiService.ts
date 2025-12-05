import { GoogleGenAI, Type } from "@google/genai";
import { AdviceResponse } from '../types';

export const getDailyAdvice = async (solarDate: string, lunarDate: string): Promise<AdviceResponse> => {
  try {
    // Initialize here to prevent top-level execution crashes
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";
    const prompt = `
      Bạn là một người bạn đồng hành thông thái, hướng thiện. Hãy đưa ra lời khuyên cho ngày:
      Dương lịch: ${solarDate}
      Âm lịch: ${lunarDate}
      
      Yêu cầu nội dung:
      - Đơn giản, dễ hiểu, phù hợp với mọi người.
      - Tập trung vào đạo đức, lối sống đẹp, nhân quả (làm việc thiện, tránh việc ác).
      - KHÔNG dùng từ ngữ chuyên môn phong thủy khó hiểu (như sát chủ, thiên cương...).
      - QUAN TRỌNG: "quote" phải CỰC KỲ NGẮN GỌN (tối đa 20 từ), súc tích.
      
      Hãy trả về dưới dạng JSON với cấu trúc:
      - quote: Một câu châm ngôn, ca dao tục ngữ hoặc lời chúc ngắn về cuộc sống, tình thương, đạo đức (Tối đa 20 từ).
      - goodActivities: 3 việc thiện nhỏ nên làm trong ngày (Ví dụ: Giúp đỡ người già, nói lời ái ngữ, phóng sinh, trồng cây...).
      - badActivities: 3 việc xấu nên tránh (Ví dụ: Nóng giận, nói dối, sát sinh, lãng phí...).
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            goodActivities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            badActivities: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            }
          }
        }
      }
    });

    if (response.text) {
      // Safely parse and fallback to default structure to prevent UI crashes
      try {
        const parsed = JSON.parse(response.text);
        return {
          quote: parsed.quote || "Tâm an vạn sự an.",
          goodActivities: Array.isArray(parsed.goodActivities) ? parsed.goodActivities : [],
          badActivities: Array.isArray(parsed.badActivities) ? parsed.badActivities : []
        };
      } catch (e) {
        console.warn("JSON parse error in geminiService", e);
        return {
            quote: "Làm việc thiện, tâm hồn thanh thản.",
            goodActivities: [],
            badActivities: []
        };
      }
    }
    throw new Error("No response text");
  } catch (error) {
    console.error("Error fetching advice:", error);
    return {
      quote: "Mỗi ngày là một món quà.",
      goodActivities: ["Mỉm cười", "Giúp đỡ người khác", "Giữ gìn vệ sinh"],
      badActivities: ["Nổi nóng", "Lãng phí thức ăn"]
    };
  }
};