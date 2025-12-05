import { GoogleGenAI, Type } from "@google/genai";
import { Pool } from 'pg';

// Sử dụng connection string từ Neon Console
// Trong thực tế production, bạn nên đặt cái này trong biến môi trường Vercel (Settings > Environment Variables)
const CONNECTION_STRING = process.env.DATABASE_URL

// Khởi tạo kết nối Postgres
const pool = new Pool({
  connectionString: CONNECTION_STRING,
});

// Hàm khởi tạo bảng nếu chưa tồn tại (chạy mỗi lần gọi để đảm bảo an toàn, tốn rất ít resource)
const initDb = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS daily_advice (
      date_key VARCHAR(20) PRIMARY KEY,
      data JSONB,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

export default async function handler(req: any, res: any) {
  try {
    const { solarDate, lunarDate } = req.query;

    if (!solarDate) {
      return res.status(400).json({ error: 'Thiếu ngày dương lịch (solarDate)' });
    }

    // 1. Đảm bảo DB đã sẵn sàng
    await initDb();

    // 2. Kiểm tra xem ngày này đã có dữ liệu trong DB chưa
    const dbResult = await pool.query('SELECT data FROM daily_advice WHERE date_key = $1', [solarDate]);
    
    if (dbResult.rows.length > 0) {
      // HIT: Đã có dữ liệu -> Trả về ngay (Đồng bộ cho mọi user)
      return res.status(200).json(dbResult.rows[0].data);
    }

    // 3. MISS: Chưa có dữ liệu -> Gọi AI tạo mới
    // Khởi tạo Gemini ở server-side an toàn hơn
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = "gemini-2.5-flash";
    const prompt = `
      Bạn là một người bạn đồng hành thông thái, hướng thiện. Hãy đưa ra lời khuyên cho ngày:
      Dương lịch: ${solarDate}
      Âm lịch: ${lunarDate}
      
      Yêu cầu nội dung:
      - Đơn giản, dễ hiểu, phù hợp với mọi người.
      - Tập trung vào đạo đức, lối sống đẹp, nhân quả (làm việc thiện, tránh việc ác).
      - KHÔNG dùng từ ngữ chuyên môn phong thủy khó hiểu.
      - QUAN TRỌNG: "quote" phải CỰC KỲ NGẮN GỌN (tối đa 20 từ), súc tích.
      
      Hãy trả về dưới dạng JSON với cấu trúc:
      - quote: Một câu châm ngôn, ca dao tục ngữ hoặc lời chúc ngắn (Tối đa 20 từ).
      - goodActivities: 3 việc thiện nhỏ nên làm.
      - badActivities: 3 việc xấu nên tránh.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        temperature: 0.7, // Có thể để AI sáng tạo một chút vì chúng ta sẽ lưu kết quả này lại mãi mãi
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            quote: { type: Type.STRING },
            goodActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
            badActivities: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Không nhận được phản hồi từ AI");
    
    let adviceData;
    try {
        adviceData = JSON.parse(text);
    } catch (e) {
        console.error("Lỗi parse JSON từ AI", e);
        throw new Error("Dữ liệu AI trả về bị lỗi");
    }

    // 4. Lưu kết quả vào DB để dùng cho các user sau
    await pool.query(
        'INSERT INTO daily_advice (date_key, data) VALUES ($1, $2) ON CONFLICT (date_key) DO NOTHING',
        [solarDate, JSON.stringify(adviceData)]
    );

    // 5. Trả về kết quả
    return res.status(200).json(adviceData);

  } catch (error: any) {
    console.error("Lỗi API Advice:", error);
    return res.status(500).json({ error: error.message || 'Lỗi máy chủ nội bộ' });
  }
}