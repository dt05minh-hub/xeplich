export type NavTab = 'dashboard' | 'calendar' | 'tasks' | 'timer' | 'insights' | 'report' | 'settings';

export interface CategoryDef {
  id: string;
  name: string;
  icon: string;       // e.g. "📚", "💼", "🏠", "💪", "💰", "🎮"
  color: string;      // HEX or CSS color e.g. "#3b82f6"
  bgClass?: string;   // Tailwind badge class e.g. "bg-blue-50 text-blue-700 border-blue-200"
  description?: string;
}

export interface SubCategoryDef {
  id: string;
  categoryId: string; // e.g. "study"
  name: string;       // e.g. "Luyện TOEIC", "Đồ án", "CSKH"
  defaultDurationMinutes: number; // e.g. 120
  preferredStartTime: string;     // e.g. "08:00"
  preferredEndTime: string;       // e.g. "22:00"
  minWeeklyHours: number;         // e.g. 10
  maxHoursPerShift: number;       // e.g. 3
  defaultPriority: TaskPriority;
}

export interface NotificationSettings {
  remindStart: boolean;
  remindDeadline: boolean;
  remindWeeklyGoal: boolean;
  remindBreak: boolean;
  remindMinutesBefore: number;
}

export type EventCategory = 'class' | 'exam' | 'work' | 'personal' | 'study' | 'fitness' | 'club';
export type EventType = 'recurring' | 'weekly' | 'adhoc';

export interface CalendarEvent {
  id: string;
  title: string;
  type: EventType;
  category: EventCategory;
  startTime: string; // ISO string e.g. "2026-08-03T08:00:00"
  endTime: string;   // ISO string e.g. "2026-08-03T10:00:00"
  dayOfWeek?: number; // 0 (CN) to 6 (Thứ 7)
  location?: string;
  color?: string;
  isLocked: boolean; // Lịch cố định bị khóa, AI không được chèn task vào
  notes?: string;
}

export type TaskCategory = 'cskh' | 'toeic' | 'project' | 'report' | 'reading' | 'personal' | 'exercise';
export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'deferred';

export interface ScheduledSlot {
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:mm
  endTime: string;    // HH:mm
  isLocked?: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  estimatedMinutes: number;
  actualMinutesSpent: number;
  deadline?: string;  // YYYY-MM-DD
  priority: TaskPriority;
  status: TaskStatus;
  scheduledSlot?: ScheduledSlot;
  rules?: string;     // Ràng buộc riêng của task
  createdAt: string;
  completedAt?: string;
}

export interface WorkConstraint {
  id: string;
  title: string;
  category: TaskCategory | 'all';
  allowedStartTime: string; // HH:mm e.g. "08:00"
  allowedEndTime: string;   // HH:mm e.g. "22:00"
  minWeeklyHours: number;   // e.g. 30
  maxHoursPerShift: number; // e.g. 3
  offDays: number[];        // [0] = Chủ Nhật
  notes?: string;
}

export interface TimeTrackSession {
  id: string;
  taskId: string;
  taskTitle: string;
  category: TaskCategory;
  startTime: string; // ISO string
  endTime?: string;  // ISO string
  durationMinutes: number;
  estimatedMinutes: number;
  interruptionCount: number;
  status: 'running' | 'paused' | 'completed';
  notes?: string;
}

export interface LearnedPreference {
  id: string;
  ruleText: string;
  category?: TaskCategory;
  confidence: number;      // 0.0 đến 1.0
  derivedFrom: string;     // e.g. "Phân tích 5 lần đổi lịch của người dùng"
  isEnabled: boolean;      // Bật/Tắt Rule
  createdAt: string;
}

export interface PeakHourSlot {
  hour: number;           // 0 to 23
  productivityScore: number; // 0 to 100
  label: string;          // e.g. "Sáng sớm (08:00 - 10:00)"
}

export interface AdaptiveUserProfile {
  peakEnergyHours: PeakHourSlot[];
  categoryAccuracyRatio: Record<TaskCategory, number>;
  delayProneCategories: TaskCategory[];
  learnedPreferences: LearnedPreference[];
  weeklyCompletionRate: number;
  workConstraints: WorkConstraint[];
  weeklyTargetHours: Record<TaskCategory, number>; // Chỉ tiêu số giờ theo loại/tuần
}

export interface ProposedScheduleItem {
  taskId: string;
  taskTitle: string;
  category: TaskCategory;
  date: string;      // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  reasoning: string;
}

export interface AIScheduleProposal {
  summary: string;
  proposedItems: ProposedScheduleItem[];
  conflictsResolved?: string[];
  tips?: string[];
}

export interface WeeklyReport {
  weekStartDate: string;
  totalStudyMinutes: number;
  totalWorkMinutes: number;
  totalPersonalMinutes: number;
  totalExerciseMinutes: number;
  completedTasksCount: number;
  deferredTasksCount: number;
  estimationAccuracyPercent: number;
  aiAnalysisText: string;
  strengths: string[];
  recommendations: string[];
  newLearnedRulesThisWeek?: string[];
}

export interface MonthlyReport {
  monthName: string;
  totalStudyMinutes: number;
  totalWorkMinutes: number;
  totalPersonalMinutes: number;
  totalExerciseMinutes: number;
  completedTasksCount: number;
  deferredTasksCount: number;
  shiftCompletionRatePercent: number;
  totalShiftsCompleted: number;
  estimationAccuracyPercent: number;
  aiAnalysisText: string;
  monthlyHighlights: string[];
  recommendationsNextMonth: string[];
}

// Lịch sử phản hồi đổi giờ/đổi ngày để Behavior Analyzer xử lý định kỳ
export interface UserFeedbackLog {
  id: string;
  taskId: string;
  taskTitle: string;
  action: 'change_time' | 'change_day' | 'replan' | 'completed' | 'deferred';
  oldSlot?: ScheduledSlot;
  newSlot?: ScheduledSlot;
  timestamp: string;
}
