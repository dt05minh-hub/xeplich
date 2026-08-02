import {
  CalendarEvent,
  Task,
  TimeTrackSession,
  AdaptiveUserProfile,
  WeeklyReport,
  MonthlyReport,
  WorkConstraint,
  CategoryDef,
  SubCategoryDef,
  NotificationSettings
} from '../types';

const getWeekDate = (dayOffset: number, hour: number = 8, minute: number = 0): string => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMon = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + distanceToMon + dayOffset);
  monday.setHours(hour, minute, 0, 0);
  return monday.toISOString();
};

const getYYYYMMDD = (dayOffset: number): string => {
  const dateStr = getWeekDate(dayOffset);
  return dateStr.split('T')[0];
};

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  // Thứ 2 (dayOffset 0)
  {
    id: 'evt-1',
    title: 'Lịch học Lý thuyết Hệ thống',
    type: 'weekly',
    category: 'class',
    startTime: getWeekDate(0, 8, 0),
    endTime: getWeekDate(0, 11, 30),
    dayOfWeek: 1,
    location: 'Phòng A101 - Trường ĐH Bách Khoa',
    color: '#93c5fd', // Pastel Blue
    isLocked: true,
    notes: 'Khung giờ bị khóa: Học trực tiếp trên lớp.'
  },
  {
    id: 'evt-2',
    title: 'Tập Gym & Thể thao',
    type: 'recurring',
    category: 'fitness',
    startTime: getWeekDate(0, 17, 30),
    endTime: getWeekDate(0, 18, 45),
    dayOfWeek: 1,
    color: '#86efac', // Pastel Green
    isLocked: true,
    notes: 'Rèn luyện sức khỏe định kỳ.'
  },

  // Thứ 3 (dayOffset 1)
  {
    id: 'evt-3',
    title: 'Lớp Luyện thi TOEIC',
    type: 'weekly',
    category: 'study',
    startTime: getWeekDate(1, 18, 0),
    endTime: getWeekDate(1, 20, 0),
    dayOfWeek: 2,
    location: 'Trung tâm Ngoại ngữ',
    color: '#c084fc', // Pastel Purple
    isLocked: true,
    notes: 'Lịch cố định hàng tuần.'
  },

  // Thứ 4 (dayOffset 2)
  {
    id: 'evt-4',
    title: 'Thực hành Mạng máy tính',
    type: 'weekly',
    category: 'class',
    startTime: getWeekDate(2, 13, 30),
    endTime: getWeekDate(2, 16, 30),
    dayOfWeek: 3,
    location: 'Phòng Lab 3 - Tòa H1',
    color: '#93c5fd',
    isLocked: true
  },
  {
    id: 'evt-5',
    title: 'Họp Ban Truyền thông CLB',
    type: 'weekly',
    category: 'club',
    startTime: getWeekDate(2, 19, 0),
    endTime: getWeekDate(2, 20, 30),
    dayOfWeek: 3,
    location: 'Phòng họp trực tuyến',
    color: '#f472b6', // Pastel Pink
    isLocked: true
  },

  // Thứ 5 (dayOffset 3)
  {
    id: 'evt-6',
    title: 'Lớp Luyện thi TOEIC',
    type: 'weekly',
    category: 'study',
    startTime: getWeekDate(3, 18, 0),
    endTime: getWeekDate(3, 20, 0),
    dayOfWeek: 4,
    color: '#c084fc',
    isLocked: true
  },

  // Thứ 6 (dayOffset 4)
  {
    id: 'evt-7',
    title: 'Thi Giữa kỳ môn Kiến trúc Máy tính',
    type: 'adhoc',
    category: 'exam',
    startTime: getWeekDate(4, 9, 0),
    endTime: getWeekDate(4, 11, 0),
    dayOfWeek: 5,
    location: 'Hội trường C2',
    color: '#fca5a5', // Pastel Red
    isLocked: true,
    notes: 'Lịch thi quan trọng, cần chừa thời gian ôn tập trước ngày thi.'
  },
  {
    id: 'evt-8',
    title: 'Hội thảo Hướng nghiệp AI & Công nghệ',
    type: 'adhoc',
    category: 'personal',
    startTime: getWeekDate(4, 14, 0),
    endTime: getWeekDate(4, 16, 30),
    dayOfWeek: 5,
    color: '#fde047', // Pastel Yellow
    isLocked: true
  }
];

export const INITIAL_WORK_CONSTRAINTS: WorkConstraint[] = [
  {
    id: 'const-1-sang',
    title: 'Ca CSKH 1 - Ca Sáng',
    category: 'cskh',
    allowedStartTime: '08:00',
    allowedEndTime: '12:00',
    minWeeklyHours: 12,
    maxHoursPerShift: 4,
    offDays: [0], // Nghỉ Chủ Nhật
    notes: 'Khung giờ làm ca sáng: 08:00 – 12:00 (4 tiếng).'
  },
  {
    id: 'const-1-chieu',
    title: 'Ca CSKH 2 - Ca Chiều',
    category: 'cskh',
    allowedStartTime: '13:00',
    allowedEndTime: '17:00',
    minWeeklyHours: 12,
    maxHoursPerShift: 4,
    offDays: [0],
    notes: 'Khung giờ làm ca chiều: 13:00 – 17:00 (4 tiếng).'
  },
  {
    id: 'const-1-toi',
    title: 'Ca CSKH 3 - Ca Tối',
    category: 'cskh',
    allowedStartTime: '18:00',
    allowedEndTime: '22:00',
    minWeeklyHours: 12,
    maxHoursPerShift: 4,
    offDays: [0],
    notes: 'Khung giờ làm ca tối: 18:00 – 22:00 (4 tiếng).'
  },
  {
    id: 'const-2',
    title: 'Ôn luyện TOEIC',
    category: 'toeic',
    allowedStartTime: '18:00',
    allowedEndTime: '22:30',
    minWeeklyHours: 8,
    maxHoursPerShift: 2,
    offDays: [],
    notes: 'Nên xếp vào ca tối sau khi học xong.'
  },
  {
    id: 'const-3',
    title: 'Làm Đồ án Chuyên ngành',
    category: 'project',
    allowedStartTime: '09:00',
    allowedEndTime: '21:00',
    minWeeklyHours: 10,
    maxHoursPerShift: 3,
    offDays: [],
    notes: 'Cần khung thời gian liên tục ít nhất 120 phút.'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Ca làm CSKH Trực tuyến - Ca 1',
    category: 'cskh',
    estimatedMinutes: 180, // 3 tiếng
    actualMinutesSpent: 180,
    deadline: getYYYYMMDD(1), // Thứ 3
    priority: 'high',
    status: 'completed',
    scheduledSlot: {
      date: getYYYYMMDD(1),
      startTime: '08:30',
      endTime: '11:30',
      isLocked: true
    },
    rules: 'Làm đúng ca đăng ký 3 tiếng',
    createdAt: new Date().toISOString(),
    completedAt: getWeekDate(1, 11, 30)
  },
  {
    id: 'task-2',
    title: 'Giải 2 đề thi thử TOEIC Full Test (Listening & Reading)',
    category: 'toeic',
    estimatedMinutes: 120,
    actualMinutesSpent: 60,
    deadline: getYYYYMMDD(3), // Thứ 5
    priority: 'high',
    status: 'in_progress',
    scheduledSlot: {
      date: getYYYYMMDD(1),
      startTime: '20:30',
      endTime: '22:30',
      isLocked: false
    },
    rules: 'Khuyên làm ca tối sau 20:00',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-3',
    title: 'Nộp báo cáo Đồ án Chuyên ngành (Chương 2 & 3)',
    category: 'project',
    estimatedMinutes: 180,
    actualMinutesSpent: 90,
    deadline: getYYYYMMDD(5), // Thứ 7
    priority: 'high',
    status: 'scheduled',
    scheduledSlot: {
      date: getYYYYMMDD(3),
      startTime: '13:30',
      endTime: '16:30',
      isLocked: false
    },
    rules: 'Khung giờ cần tập trung cao, kéo dài ít nhất 2.5 tiếng',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-4',
    title: 'Đọc tài liệu Mạng Máy tính (Chương IP Routing)',
    category: 'reading',
    estimatedMinutes: 60,
    actualMinutesSpent: 0,
    deadline: getYYYYMMDD(2), // Thứ 4
    priority: 'medium',
    status: 'scheduled',
    scheduledSlot: {
      date: getYYYYMMDD(2),
      startTime: '09:30',
      endTime: '10:30',
      isLocked: false
    },
    rules: 'Đọc trước buổi thực hành',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-5',
    title: 'Ca làm CSKH Trực tuyến - Ca 2',
    category: 'cskh',
    estimatedMinutes: 240, // 4 tiếng
    actualMinutesSpent: 0,
    deadline: getYYYYMMDD(4), // Thứ 6
    priority: 'high',
    status: 'pending',
    rules: 'Nên xếp vào khung giờ chiều hoặc tối',
    createdAt: new Date().toISOString()
  },
  {
    id: 'task-6',
    title: 'Viết bài tổng kết hoạt động tuần cho CLB',
    category: 'report',
    estimatedMinutes: 90,
    actualMinutesSpent: 0,
    deadline: getYYYYMMDD(6), // Chủ Nhật
    priority: 'low',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_TRACKING_SESSIONS: TimeTrackSession[] = [
  {
    id: 'sess-1',
    taskId: 'task-1',
    taskTitle: 'Ca làm CSKH Trực tuyến - Ca 1',
    category: 'cskh',
    startTime: getWeekDate(1, 8, 30),
    endTime: getWeekDate(1, 11, 30),
    durationMinutes: 180,
    estimatedMinutes: 180,
    interruptionCount: 1,
    status: 'completed',
    notes: 'Trả lời thành công 32 yêu cầu hỗ trợ của khách hàng.'
  },
  {
    id: 'sess-2',
    taskId: 'task-2',
    taskTitle: 'Giải 2 đề thi thử TOEIC Full Test',
    category: 'toeic',
    startTime: getWeekDate(1, 20, 30),
    endTime: getWeekDate(1, 21, 30),
    durationMinutes: 60,
    estimatedMinutes: 120,
    interruptionCount: 0,
    status: 'completed',
    notes: 'Hoàn thành phần Listening Part 1-4.'
  }
];

export const INITIAL_ADAPTIVE_PROFILE: AdaptiveUserProfile = {
  peakEnergyHours: [
    { hour: 8, productivityScore: 85, label: 'Sáng sớm (08:00 - 10:00)' },
    { hour: 9, productivityScore: 92, label: 'Sáng sớm (08:00 - 10:00)' },
    { hour: 10, productivityScore: 88, label: 'Giữa sáng (10:00 - 12:00)' },
    { hour: 14, productivityScore: 65, label: 'Đầu chiều (14:00 - 15:30)' },
    { hour: 19, productivityScore: 90, label: 'Buổi tối (19:00 - 21:00)' },
    { hour: 20, productivityScore: 96, label: 'Khung giờ vàng (20:00 - 22:00)' },
    { hour: 21, productivityScore: 82, label: 'Đêm muộn (21:00 - 22:30)' }
  ],
  categoryAccuracyRatio: {
    cskh: 1.0,
    toeic: 1.1,
    project: 1.35,  // Tốn thêm 35% thời gian so với dự kiến
    report: 1.2,
    reading: 1.25,
    personal: 1.0,
    exercise: 1.0
  },
  delayProneCategories: ['reading', 'project'],
  learnedPreferences: [
    {
      id: 'rule-1',
      ruleText: 'Ưu tiên xếp Ca làm CSKH sau 13:00 chiều để tránh đụng lịch học sáng.',
      category: 'cskh',
      confidence: 0.92,
      derivedFrom: 'Thống kê 6 lần điều chỉnh lịch của người dùng',
      isEnabled: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rule-2',
      ruleText: 'Luyện thi TOEIC thường mang lại hiệu quả cao nhất khi học sau 20:00 tối.',
      category: 'toeic',
      confidence: 0.95,
      derivedFrom: 'Phân tích điểm số năng suất và phản hồi học tập',
      isEnabled: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'rule-3',
      ruleText: 'Tránh xếp các task Đồ án kéo dài quá 2 tiếng ngay sau các buổi học lý thuyết nặng.',
      category: 'project',
      confidence: 0.88,
      derivedFrom: 'Phân tích mức độ gián đoạn và thời gian hoàn thành',
      isEnabled: true,
      createdAt: new Date().toISOString()
    }
  ],
  weeklyCompletionRate: 85,
  workConstraints: INITIAL_WORK_CONSTRAINTS,
  weeklyTargetHours: {
    cskh: 30, // Chỉ tiêu 30 tiếng/tuần
    toeic: 10,
    project: 12,
    report: 4,
    reading: 5,
    personal: 5,
    exercise: 5
  }
};

export const INITIAL_WEEKLY_REPORT: WeeklyReport = {
  weekStartDate: getYYYYMMDD(-7),
  totalStudyMinutes: 720, // 12 tiếng
  totalWorkMinutes: 1080, // 18 tiếng CSKH
  totalPersonalMinutes: 240, // 4 tiếng
  totalExerciseMinutes: 210, // 3.5 tiếng
  completedTasksCount: 12,
  deferredTasksCount: 2,
  estimationAccuracyPercent: 86,
  aiAnalysisText: 'Tuần qua bạn đã hoàn thành xuất sắc 18 giờ làm CSKH và 12 giờ học tập! Khung giờ tối từ 20:00–22:00 ghi nhận hiệu suất đạt 96%. Hệ thống phát hiện nhiệm vụ "Đồ án" thường cần thêm 35% thời gian dự kiến, do đó AI đã tự động đề xuất nới rộng khung giờ làm đồ án cho tuần tiếp theo.',
  strengths: [
    'Đạt 100% chỉ tiêu ca làm CSKH đúng quy định',
    'Hoàn thành bài tập TOEIC đúng khung giờ vàng buổi tối',
    'Chủ động phản hồi điều chỉnh lịch để tối ưu thời gian nghỉ ngơi'
  ],
  recommendations: [
    'Tăng thời lượng dự kiến cho mỗi ca làm Đồ án từ 2 tiếng lên 2.5 tiếng',
    'Giữ khoảng nghỉ đệm 20 phút giữa ca làm CSKH và buổi tập thể thao',
    'Không nên xếp công việc đọc tài liệu phức tạp vào đầu giờ chiều'
  ],
  newLearnedRulesThisWeek: [
    'Ưu tiên xếp Ca làm CSKH sau 13:00 chiều',
    'TOEIC học hiệu quả nhất sau 20:00 tối'
  ]
};

export const INITIAL_MONTHLY_REPORT: MonthlyReport = {
  monthName: 'Tháng 07 / 2026',
  totalStudyMinutes: 3120,
  totalWorkMinutes: 4800,
  totalPersonalMinutes: 960,
  totalExerciseMinutes: 840,
  completedTasksCount: 48,
  deferredTasksCount: 5,
  shiftCompletionRatePercent: 98,
  totalShiftsCompleted: 20,
  estimationAccuracyPercent: 88,
  aiAnalysisText: 'Tổng kết Tháng 07/2026: Bạn đã hoàn thành xuất sắc 80 giờ ca làm CSKH (20 ca làm việc chuẩn) và 52 giờ dành cho học tập & đồ án. Mức độ tuân thủ quy định ca làm đạt 98%. AI nhận thấy chỉ số năng suất của bạn duy trì ổn định nhất vào các khung giờ ca chiều (13:00 - 17:00) và ca tối (18:00 - 22:00).',
  monthlyHighlights: [
    'Đạt và vượt chỉ tiêu 80 giờ làm việc CSKH hàng tháng',
    'Duy trì chuỗi học TOEIC liên tục 28 ngày không đứt đoạn',
    'Cải thiện độ chính xác dự đoán thời gian lên 88%'
  ],
  recommendationsNextMonth: [
    'Đăng ký phân bổ đều các ca CSKH giữa Sáng, Chiều và Tối để tránh quá tải tuần cuối tháng',
    'Tăng tỷ trọng thời gian làm Đồ án tốt nghiệp lên 15 tiếng/tuần trong Tháng 8',
    'Duy trì các khoảng nghỉ giải lao 15 phút giữa các ca trực CSKH liên tục'
  ]
};

export const INITIAL_CATEGORIES: CategoryDef[] = [
  { id: 'study', name: 'Học tập', icon: '📚', color: '#3b82f6', description: 'Các công việc liên quan đến học tập, ôn thi, học ngoại ngữ' },
  { id: 'work', name: 'Làm việc', icon: '💼', color: '#10b981', description: 'Các công việc chuyên môn, trực ca CSKH, báo cáo' },
  { id: 'personal', name: 'Cá nhân', icon: '🏠', color: '#8b5cf6', description: 'Việc nhà, dọn dẹp, gia đình, mua sắm' },
  { id: 'health', name: 'Sức khỏe', icon: '💪', color: '#f59e0b', description: 'Rèn luyện thể thao, gym, thiền định' },
  { id: 'finance', name: 'Tài chính', icon: '💰', color: '#06b6d4', description: 'Quản lý tài chính cá nhân, chi tiêu' },
  { id: 'entertainment', name: 'Giải trí', icon: '🎮', color: '#ec4899', description: 'Thư giãn, chơi game, xem phim' }
];

export const INITIAL_SUBCATEGORIES: SubCategoryDef[] = [];

export const CLEAN_WEEKLY_REPORT: WeeklyReport = {
  weekStartDate: new Date().toISOString().split('T')[0],
  totalStudyMinutes: 0,
  totalWorkMinutes: 0,
  totalPersonalMinutes: 0,
  totalExerciseMinutes: 0,
  completedTasksCount: 0,
  deferredTasksCount: 0,
  estimationAccuracyPercent: 100,
  aiAnalysisText: 'Chưa có dữ liệu thống kê tuần. Hãy bắt đầu thêm công việc và ghi nhận thời gian để AI tổng hợp báo cáo cho bạn!',
  strengths: [
    'Sẵn sàng cho kế hoạch làm việc mới'
  ],
  recommendations: [
    'Tạo các công việc đầu tiên và phân loại danh mục phù hợp'
  ],
  newLearnedRulesThisWeek: []
};

export const CLEAN_MONTHLY_REPORT: MonthlyReport = {
  monthName: `Tháng ${String(new Date().getMonth() + 1).padStart(2, '0')} / ${new Date().getFullYear()}`,
  totalStudyMinutes: 0,
  totalWorkMinutes: 0,
  totalPersonalMinutes: 0,
  totalExerciseMinutes: 0,
  completedTasksCount: 0,
  deferredTasksCount: 0,
  shiftCompletionRatePercent: 100,
  totalShiftsCompleted: 0,
  estimationAccuracyPercent: 100,
  aiAnalysisText: 'Chưa có dữ liệu tổng kết tháng. Dữ liệu sẽ tự động tích lũy khi bạn thực hiện các công việc hằng ngày.',
  monthlyHighlights: [
    'Tài khoản mới được khởi tạo thành công'
  ],
  recommendationsNextMonth: [
    'Bắt đầu thiết lập các danh mục và loại công việc trong Cài đặt'
  ]
};

export const CLEAN_ADAPTIVE_PROFILE: AdaptiveUserProfile = {
  peakEnergyHours: [
    { hour: 8, productivityScore: 80, label: 'Sáng sớm (08:00 - 10:00)' },
    { hour: 9, productivityScore: 85, label: 'Sáng sớm (08:00 - 10:00)' },
    { hour: 10, productivityScore: 90, label: 'Giữa sáng (10:00 - 12:00)' },
    { hour: 14, productivityScore: 75, label: 'Đầu chiều (14:00 - 15:30)' },
    { hour: 19, productivityScore: 85, label: 'Buổi tối (19:00 - 21:00)' },
    { hour: 20, productivityScore: 90, label: 'Khung giờ vàng (20:00 - 22:00)' },
    { hour: 21, productivityScore: 80, label: 'Đêm muộn (21:00 - 22:30)' }
  ],
  categoryAccuracyRatio: {
    cskh: 1.0,
    toeic: 1.0,
    project: 1.0,
    report: 1.0,
    reading: 1.0,
    personal: 1.0,
    exercise: 1.0
  },
  delayProneCategories: [],
  learnedPreferences: [],
  weeklyCompletionRate: 100,
  workConstraints: [],
  weeklyTargetHours: {
    cskh: 0,
    toeic: 0,
    project: 0,
    report: 0,
    reading: 0,
    personal: 0,
    exercise: 0
  }
};

export const INITIAL_NOTIFICATIONS: NotificationSettings = {
  remindStart: true,
  remindDeadline: true,
  remindWeeklyGoal: true,
  remindBreak: true,
  remindMinutesBefore: 15
};

