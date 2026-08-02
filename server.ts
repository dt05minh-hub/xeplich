import express from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

let globalKeyRotationIndex = 0;

export async function callGeminiApiRest(
  key: string,
  modelName: string,
  promptText: string,
  systemInstruction?: string,
  responseSchema?: any
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const isAQKey = key.startsWith('AQ.') || !key.startsWith('AIzaSy');
  if (isAQKey) {
    headers['Authorization'] = `Bearer ${key}`;
  } else {
    headers['x-goog-api-key'] = key;
  }

  let actualModel = modelName;
  if (actualModel === 'gemini-3.6-flash' || actualModel === 'gemini-2.5-flash') {
    actualModel = 'gemini-2.5-flash';
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent`;

  const bodyPayload: any = {
    contents: [
      {
        parts: [{ text: promptText }],
      },
    ],
  };

  if (systemInstruction) {
    bodyPayload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  if (responseSchema) {
    bodyPayload.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema,
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(bodyPayload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.error?.message || `Lỗi HTTP ${res.status}: ${JSON.stringify(data)}`);
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Không nhận được văn bản phản hồi từ Gemini API.');
  }

  return text;
}

async function executeGeminiWithRotation<T>(
  customApiKeys: string[] | undefined,
  generatorFn: (ai: GoogleGenAI, key: string) => Promise<T>,
  restFallbackFn?: (key: string) => Promise<T>
): Promise<T> {
  let candidateKeys: string[] = [];

  if (Array.isArray(customApiKeys) && customApiKeys.length > 0) {
    candidateKeys.push(...customApiKeys.filter((k) => typeof k === 'string' && k.trim().length > 0));
  }

  if (process.env.GEMINI_API_KEYS) {
    const envKeys = process.env.GEMINI_API_KEYS.split(/[\n,;]+/).map((k) => k.trim()).filter(Boolean);
    candidateKeys.push(...envKeys);
  }
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim()) {
    const envKeys = process.env.GEMINI_API_KEY.split(/[\n,;]+/).map((k) => k.trim()).filter(Boolean);
    candidateKeys.push(...envKeys);
  }

  candidateKeys = Array.from(new Set(candidateKeys)).filter(Boolean);

  if (candidateKeys.length === 0) {
    throw new Error('Chưa cấu hình GEMINI_API_KEY. Vui lòng dán API Key Gemini vào phần [⚙️ Cài Đặt] -> [Cấu Hình AI & API Key].');
  }

  const errors: string[] = [];
  const totalKeys = candidateKeys.length;

  for (let attempt = 0; attempt < totalKeys; attempt++) {
    const keyIdx = (globalKeyRotationIndex + attempt) % totalKeys;
    const currentKey = candidateKeys[keyIdx];
    const isAQToken = currentKey.startsWith('AQ.');

    // Attempt direct REST call first if it is an AQ token
    if (isAQToken && restFallbackFn) {
      try {
        const result = await restFallbackFn(currentKey);
        globalKeyRotationIndex = (keyIdx + 1) % totalKeys;
        return result;
      } catch (restErr: any) {
        const errMsg = restErr?.message || String(restErr);
        console.warn(`[Gemini AQ Token #${keyIdx + 1} Direct REST Failed]: ${errMsg}.`);
        errors.push(`Key #${keyIdx + 1} (AQ Token): ${errMsg}`);
      }
    }

    // Try standard SDK
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'aistudio-build',
      };
      if (isAQToken) {
        headers['Authorization'] = `Bearer ${currentKey}`;
      }

      const ai = new GoogleGenAI({
        apiKey: currentKey,
        httpOptions: { headers },
      });

      const result = await generatorFn(ai, currentKey);
      globalKeyRotationIndex = (keyIdx + 1) % totalKeys;
      return result;
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini Key #${keyIdx + 1} Failed]: ${errMsg}.`);

      if (restFallbackFn && !isAQToken) {
        try {
          const result = await restFallbackFn(currentKey);
          globalKeyRotationIndex = (keyIdx + 1) % totalKeys;
          return result;
        } catch (restErr: any) {
          errors.push(`Key #${keyIdx + 1}: ${restErr?.message || String(restErr)}`);
          continue;
        }
      }

      errors.push(`Key #${keyIdx + 1}: ${errMsg}`);
    }
  }

  throw new Error(`Tất cả ${totalKeys} API Key Gemini đã cấu hình đều không thành công.\n\nChi tiết lỗi:\n` + errors.join('\n'));
}

// 1. AI Lập lịch Tự động (AI Smart Scheduler)
app.post('/api/ai/schedule', async (req, res) => {
  try {
    const { events = [], tasks = [], profile = {}, userPrompt = '', apiKeys = [] } = req.body;

    const systemInstruction = `
Bạn là Trí tuệ Nhân tạo Lập lịch Tự động của ứng dụng "Adaptive Personal Planner".
Nhiệm vụ của bạn là phân tích các sự kiện lịch cố định (lịch học, lịch thi, họp CLB) đã bị KHÓA KHUNG GIỜ, khoảng thời gian trống, hạn chót công việc (deadline), mức ưu tiên, các RÀNG BUỘC CÔNG VIỆC (khung giờ được làm, số giờ tối thiểu cả tuần, độ dài tối đa 1 ca, ngày nghỉ) và các QUY LUẬT THÍCH ỨNG (Adaptive Rules) đã học để tự động phân bổ lịch làm việc tuần tối ưu.

RÀNG BUỘC CA LÀM VIỆC LINH HOẠT (Flexible Work Shift Window & Total Weekly Target):
- Người dùng được phép TỰ DO CHỌN giờ bắt đầu và giờ kết thúc cho ca làm việc của họ, miễn là thời gian đó nằm hoàn toàn trong cửa sổ khung giờ được phép (từ allowedStartTime đến allowedEndTime).
- CHI TIÊU GIỜ TỐI THIỂU / TUẦN (minWeeklyHours): Con số này là TỔNG CHỈ TIÊU GIỜ TỐI THIỂU CẦN ĐẠT TRONG CẢ TUẦN CHO CẢ LOẠI CÔNG VIỆC ĐÓ (ví dụ: CSKH 30 giờ/tuần), KHÔNG PHẢI độ dài của 1 ca đơn lẻ. AI hãy tự động chia thành các ca linh hoạt trong tuần (mỗi ca <= maxHoursPerShift) sao cho tổng thời lượng cả tuần đạt đủ chỉ tiêu.
- AI hãy chủ động chọn giờ bắt đầu & giờ kết thúc phù hợp nhất cho từng ca làm việc trong khoảng thời gian này.

QUY TẮC BẮT BUỘC:
1. TUYỆT ĐỐI KHÔNG xếp công việc đè lên các sự kiện lịch cố định (Lịch bị khóa).
2. Tôn trọng các Ràng buộc công việc & cửa sổ ca làm việc linh hoạt.
3. Tôn trọng các Quy luật Thích ứng (Adaptive Rules) đang được BẬT.
4. Xếp công việc vào khung giờ có điểm năng lượng cao phù hợp với mức ưu tiên.
5. Tất cả nội dung giải thích, phản hồi, lời khuyên PHẢI viết hoàn toàn bằng TIẾNG VIỆT tự nhiên, thân thiện.
    `.trim();

    const promptText = `
Lịch cố định (Bị khóa khung giờ):
${JSON.stringify(events, null, 2)}

Danh sách Công việc cần xếp lịch:
${JSON.stringify(tasks, null, 2)}

Hồ sơ Thích ứng & Quy định Công việc (Adaptive Profile & Constraints):
${JSON.stringify(profile, null, 2)}

Yêu cầu thêm từ người dùng:
"${userPrompt || 'Hãy tự động lập lịch làm việc và học tập tối ưu cho tuần này.'}"

Hãy trả về JSON đúng định dạng với:
- summary: Tóm tắt tổng quan phương án xếp lịch (Tiếng Việt)
- proposedItems: Mảng các công việc được xếp lịch gồm (taskId, taskTitle, category, date (YYYY-MM-DD), startTime (HH:mm), endTime (HH:mm), reasoning (lý do chọn khung giờ này bằng Tiếng Việt))
- conflictsResolved: Mảng các giải thích cách giải quyết xung đột thời gian (Tiếng Việt)
- tips: Mảng lời khuyên thực tế cho người dùng (Tiếng Việt)
    `.trim();

    const scheduleSchema = {
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
    };

    const result = await executeGeminiWithRotation(
      apiKeys,
      async (ai) => {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: scheduleSchema
          }
        });
        return JSON.parse(response.text || '{}');
      },
      async (key) => {
        const text = await callGeminiApiRest(key, 'gemini-2.5-flash', promptText, systemInstruction, scheduleSchema);
        return JSON.parse(text || '{}');
      }
    );

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Lỗi API /api/ai/schedule:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Lỗi hệ thống AI lập lịch'
    });
  }
});

// 2. Behavior Analyzer - Bộ Phân Tích Hành Vi Định Kỳ Sinh Adaptive Rules
app.post('/api/ai/batch-analyze', async (req, res) => {
  try {
    const { feedbackLogs = [], currentRules = [], trackingSessions = [], apiKeys = [] } = req.body;

    const systemInstruction = `
Bạn là Bộ Phân Tích Hành Vi (Behavior Analyzer) và Sinh Quy Luật Thích Ứng (Adaptive Rule Generator) của hệ thống Adaptive Personal Planner.
Nhiệm vụ của bạn là xem xét toàn bộ lịch sử phản hồi đổi giờ, đổi ngày, yêu cầu xếp lại lịch, thời gian thực tế thực hiện công việc và các lần hoãn task của người dùng trong khoảng thời gian qua.

QUY TẮC:
- Chỉ rút ra Quy luật mới khi phát hiện một hành vi lặp lại nhiều lần hoặc có xu hướng rõ ràng.
- Viết Quy luật bằng TIẾNG VIỆT ngắn gọn, thực tế, chính xác (Ví dụ: "Ưu tiên xếp Ca làm CSKH sau 13:00 chiều", "Học TOEIC sau 20:00 tối mang lại hiệu quả cao").
- Gán độ tin cậy confidence từ 0.70 đến 0.98.
    `.trim();

    const promptText = `
Nhật ký Phản hồi của Người dùng (User Feedback Logs):
${JSON.stringify(feedbackLogs, null, 2)}

Phiên Theo dõi Thời gian Thực tế:
${JSON.stringify(trackingSessions, null, 2)}

Danh sách Quy luật Thích ứng hiện tại:
${JSON.stringify(currentRules, null, 2)}

Hãy tổng hợp và trả về JSON:
- analysisSummary: Tóm tắt phân tích xu hướng hành vi (Tiếng Việt)
- newRules: Mảng các Quy luật thích ứng mới được sinh ra (mỗi object gồm ruleText, category, confidence, derivedFrom)
- recommendedAdjustments: Mảng gợi ý điều chỉnh khung giờ làm việc cho tuần sau (Tiếng Việt)
    `.trim();

    const analyzeSchema = {
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
    };

    const result = await executeGeminiWithRotation(
      apiKeys,
      async (ai) => {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: analyzeSchema
          }
        });
        return JSON.parse(response.text || '{}');
      },
      async (key) => {
        const text = await callGeminiApiRest(key, 'gemini-2.5-flash', promptText, systemInstruction, analyzeSchema);
        return JSON.parse(text || '{}');
      }
    );

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Lỗi API /api/ai/batch-analyze:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 3. AI Insights & Báo cáo Tuần
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { trackingSessions = [], tasks = [], profile = {}, apiKeys = [] } = req.body;

    const systemInstruction = `
Bạn là Cố vấn Năng suất & Thời gian của ứng dụng Adaptive Personal Planner.
Nhiệm vụ: Phân tích kết quả theo dõi thời gian thực tế, mức độ hoàn thành nhiệm vụ, sai số dự kiến và tạo ra báo cáo tuần chi tiết hoàn toàn bằng TIẾNG VIỆT.
    `.trim();

    const promptText = `
Dữ liệu Phiên làm việc thực tế:
${JSON.stringify(trackingSessions, null, 2)}

Danh sách Công việc tuần qua:
${JSON.stringify(tasks, null, 2)}

Hồ sơ Thích ứng Người dùng:
${JSON.stringify(profile, null, 2)}

Trả về JSON gồm:
- aiAnalysisText: Đoạn văn nhận xét tổng quan bằng Tiếng Việt
- strengths: Mảng 3 điểm sáng năng suất trong tuần
- recommendations: Mảng 3 gợi ý cải thiện cho tuần sau
- estimationAccuracyPercent: Tỷ lệ phần trăm độ chính xác dự kiến (0-100)
    `.trim();

    const insightsSchema = {
      type: Type.OBJECT,
      properties: {
        aiAnalysisText: { type: Type.STRING },
        strengths: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        recommendations: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        estimationAccuracyPercent: { type: Type.NUMBER }
      },
      required: ['aiAnalysisText', 'strengths', 'recommendations', 'estimationAccuracyPercent']
    };

    const result = await executeGeminiWithRotation(
      apiKeys,
      async (ai) => {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: insightsSchema
          }
        });
        return JSON.parse(response.text || '{}');
      },
      async (key) => {
        const text = await callGeminiApiRest(key, 'gemini-2.5-flash', promptText, systemInstruction, insightsSchema);
        return JSON.parse(text || '{}');
      }
    );

    return res.json({ success: true, insights: result });
  } catch (error: any) {
    console.error('Lỗi API /api/ai/insights:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Trợ lý AI Co-Pilot Chat
app.post('/api/ai/copilot', async (req, res) => {
  try {
    const { message, stateContext, apiKeys = [] } = req.body;

    const systemInstruction = `
Bạn là "Trợ lý AI Lập lịch Thích ứng" (Adaptive AI Co-Pilot), người đồng hành quản lý thời gian thông minh và thân thiện.
Trả lời người dùng bằng TIẾNG VIỆT ấm áp, chu đáo, đưa ra lời khuyên thực tế về cách sắp xếp lịch học, lịch làm CSKH, đồ án, thi cử.
    `.trim();

    const promptText = `
Bối cảnh ứng dụng hiện tại:
${JSON.stringify(stateContext, null, 2)}

Câu hỏi từ người dùng:
"${message}"
    `.trim();

    const replyText = await executeGeminiWithRotation(
      apiKeys,
      async (ai) => {
        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: promptText,
          config: { systemInstruction }
        });
        return response.text;
      },
      async (key) => {
        return await callGeminiApiRest(key, 'gemini-2.5-flash', promptText, systemInstruction);
      }
    );

    return res.json({ success: true, reply: replyText });
  } catch (error: any) {
    console.error('Lỗi API /api/ai/copilot:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Adaptive Personal Planner API' });
});

// Fallback for missing API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Không tìm thấy endpoint API: ${req.method} ${req.originalUrl}`
  });
});

// Global API Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    console.error('Lỗi máy chủ API:', err);
    return res.status(500).json({
      success: false,
      error: err?.message || 'Lỗi xử lý máy chủ AI'
    });
  }
  next(err);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Adaptive Personal Planner đang chạy tại: http://localhost:${PORT}`);
  });
}

startServer();
