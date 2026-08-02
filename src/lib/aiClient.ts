import { GoogleGenAI, Type } from '@google/genai';
import { AIScheduleProposal } from '../types';

/**
 * Lấy danh sách Gemini API Key được lưu trong Browser LocalStorage
 * hoặc từ biến môi trường VITE_GEMINI_API_KEY.
 */
export function getStoredGeminiKeys(): string[] {
  const keys: string[] = [];

  // 1. Key người dùng tự lưu trong Cài đặt ứng dụng
  const userKeysRaw = localStorage.getItem('planner_gemini_key');
  if (userKeysRaw) {
    const parsed = userKeysRaw.split(/[\n,;]+/).map((k) => k.trim()).filter(Boolean);
    keys.push(...parsed);
  }

  // 2. Key từ biến môi trường Vite (nếu có)
  const viteKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (viteKey && typeof viteKey === 'string' && viteKey.trim()) {
    const parsed = viteKey.split(/[\n,;]+/).map((k) => k.trim()).filter(Boolean);
    keys.push(...parsed);
  }

  return Array.from(new Set(keys));
}

/**
 * Thực thi gọi Gemini API trực tiếp từ Trình duyệt (Client-side)
 * tự động xoay tua danh sách API Keys nếu gặp lỗi Rate Limit (429) hoặc hết Quota.
 */
async function executeClientGemini<T>(
  generatorFn: (ai: GoogleGenAI) => Promise<T>
): Promise<T> {
  const keys = getStoredGeminiKeys();

  if (keys.length === 0) {
    throw new Error(
      'Chưa cấu hình Gemini API Key trên Web Tĩnh (GitHub Pages).\n\nVui lòng mở trang [⚙️ Cài Đặt] -> [Cấu Hình AI & API Key] và paste API Key Gemini của bạn để dùng AI trực tiếp trên trình duyệt nhé!'
    );
  }

  const errors: string[] = [];
  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
    try {
      const ai = new GoogleGenAI({ apiKey });
      return await generatorFn(ai);
    } catch (err: any) {
      console.warn(`[Client Gemini Key #${i + 1} Error]:`, err);
      errors.push(`Key #${i + 1}: ${err?.message || String(err)}`);
    }
  }

  throw new Error(
    'Tất cả Gemini API Key đã cấu hình đều gặp lỗi hoặc hết hạn mức.\n' + errors.join('\n')
  );
}

// -----------------------------------------------------------------------------
// 1. AI Lập Lịch Tự Động (AI Smart Scheduler)
// -----------------------------------------------------------------------------
export async function requestAISchedule(payload: {
  events: any[];
  tasks: any[];
  profile: any;
  userPrompt?: string;
}): Promise<AIScheduleProposal> {
  // Thử gọi Server API trước
  try {
    const res = await fetch('/api/ai/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
      if (data.error) throw new Error(data.error);
    }
  } catch (serverErr: any) {
    console.warn('Server API /api/ai/schedule không khả dụng hoặc trả về Web Tĩnh 404, chuyển sang Client-side AI:', serverErr.message);
  }

  // Fallback Client-Side Direct Call
  return executeClientGemini(async (ai) => {
    const systemInstruction = `
Bạn là Trí tuệ Nhân tạo Lập lịch Tự động của ứng dụng "Adaptive Personal Planner".
Nhiệm vụ: Phân tích các sự kiện lịch cố định (lịch học, lịch thi, họp CLB) đã bị KHÓA KHUNG GIỜ, khoảng thời gian trống, hạn chót công việc (deadline), mức ưu tiên, các RÀNG BUỘC CÔNG VIỆC và các QUY LUẬT THÍCH ỨNG để tự động phân bổ lịch làm việc tối ưu.

RÀNG BUỘC CA LÀM VIỆC LINH HOẠT & CHỈ TIÊU TỔNG TUẦN:
- Người dùng được phép TỰ DO CHỌN giờ bắt đầu và giờ kết thúc cho ca làm việc của họ, miễn là thời gian đó nằm hoàn toàn trong cửa sổ khung giờ được phép (từ allowedStartTime đến allowedEndTime).
- GIỜ TỐI THIỂU / TUẦN (minWeeklyHours): Con số này là TỔNG CHỈ TIÊU GIỜ TỐI THIỂU CẦN ĐẠT TRONG CẢ TUẦN CHO CẢ LOẠI CÔNG VIỆC ĐÓ (ví dụ: CSKH 30 giờ/tuần), KHÔNG PHẢI độ dài của 1 ca đơn lẻ. AI hãy tự động chia thành các ca nhỏ linh hoạt trong tuần (mỗi ca <= maxHoursPerShift) sao cho tổng thời lượng cả tuần đạt đủ chỉ tiêu này.
- AI hãy chủ động chọn giờ bắt đầu & kết thúc linh hoạt nhất cho từng ca làm việc trong khung giờ giới hạn này.

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG xếp công việc đè lên các sự kiện lịch cố định (Lịch bị khóa).
2. Tôn trọng các Ràng buộc công việc & Ca làm việc linh hoạt.
3. Tôn trọng các Quy luật Thích ứng (Adaptive Rules) đang được BẬT.
4. Trả về kết quả hoàn toàn bằng TIẾNG VIỆT tự nhiên, thân thiện.
    `.trim();

    const promptText = `
Lịch cố định (Bị khóa khung giờ):
${JSON.stringify(payload.events, null, 2)}

Danh sách Công việc cần xếp lịch:
${JSON.stringify(payload.tasks, null, 2)}

Hồ sơ Thích ứng & Quy định Công việc (Ca làm việc linh hoạt):
${JSON.stringify(payload.profile, null, 2)}

Yêu cầu thêm từ người dùng:
"${payload.userPrompt || 'Hãy tự động lập lịch làm việc và học tập tối ưu cho tuần này.'}"
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            proposedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  taskId: { type: Type.STRING },
                  taskTitle: { type: Type.STRING },
                  category: { type: Type.STRING },
                  date: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ['taskId', 'taskTitle', 'category', 'date', 'startTime', 'endTime', 'reasoning']
              }
            },
            conflictsResolved: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['summary', 'proposedItems']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    return parsed as AIScheduleProposal;
  });
}

// -----------------------------------------------------------------------------
// 2. AI Copilot Chat Assistant
// -----------------------------------------------------------------------------
export async function requestAICopilotReply(payload: {
  message: string;
  stateContext: any;
}): Promise<string> {
  // Thử gọi Server API trước
  try {
    const res = await fetch('/api/ai/copilot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.reply) {
        return data.reply;
      }
    }
  } catch (err: any) {
    console.warn('Server API /api/ai/copilot không khả dụng, dùng Client-side AI:', err.message);
  }

  // Fallback Client-Side Call
  return executeClientGemini(async (ai) => {
    const systemInstruction = `
Bạn là Trợ Lý AI Lập Lịch Thích Ứng (Adaptive Planner Copilot).
Nhiệm vụ: Tư vấn, gợi ý phân bổ thời gian, tư vấn ca làm việc linh hoạt, học tập và giải đáp thắc mắc cho người dùng.

LƯU Ý VỀ CA LÀM VIỆC LINH HOẠT:
Người dùng có ca làm việc tự do chọn giờ bắt đầu và kết thúc miễn là nằm trong khung giờ quy định. Hãy hỗ trợ họ chọn giờ làm hiệu quả nhất!

Hãy trả lời bằng TIẾNG VIỆT tự nhiên, ngắn gọn, súc tích, định dạng Markdown đẹp mắt.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `
Bối cảnh ứng dụng hiện tại:
${JSON.stringify(payload.stateContext, null, 2)}

Câu hỏi/Yêu cầu từ người dùng:
"${payload.message}"
      `.trim(),
      config: {
        systemInstruction
      }
    });

    return response.text || 'Rất tiếc, tôi chưa thể trả lời ngay lúc này.';
  });
}

// -----------------------------------------------------------------------------
// 3. Behavior Analyzer (Phân Tích Hành Vi Định Kỳ)
// -----------------------------------------------------------------------------
export async function requestAIBatchAnalyze(payload: {
  feedbackLogs: any[];
  trackingSessions: any[];
  currentRules: any[];
}): Promise<{
  analysisSummary: string;
  newRules: Array<{ ruleText: string; category?: string; confidence: number; derivedFrom: string }>;
  recommendedAdjustments?: string[];
}> {
  try {
    const res = await fetch('/api/ai/batch-analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data.success && data.data) {
        return data.data;
      }
    }
  } catch (err: any) {
    console.warn('Server API /api/ai/batch-analyze không khả dụng, dùng Client-side AI:', err.message);
  }

  return executeClientGemini(async (ai) => {
    const systemInstruction = `
Bạn là Bộ Phân Tích Hành Vi (Behavior Analyzer) của Adaptive Personal Planner.
Nhiệm vụ: Xem xét nhật ký đổi giờ, đổi ca làm việc linh hoạt, hoãn task và thời gian thực hiện thực tế để rút ra Quy luật Thích ứng mới bằng TIẾNG VIỆT.
    `.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `
Lịch sử Phản hồi: ${JSON.stringify(payload.feedbackLogs, null, 2)}
Phiên Theo Dõi: ${JSON.stringify(payload.trackingSessions, null, 2)}
Quy luật hiện tại: ${JSON.stringify(payload.currentRules, null, 2)}
      `.trim(),
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysisSummary: { type: Type.STRING },
            newRules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  ruleText: { type: Type.STRING },
                  category: { type: Type.STRING },
                  confidence: { type: Type.NUMBER },
                  derivedFrom: { type: Type.STRING }
                },
                required: ['ruleText', 'confidence', 'derivedFrom']
              }
            },
            recommendedAdjustments: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['analysisSummary', 'newRules']
        }
      }
    });

    return JSON.parse(response.text || '{}');
  });
}
