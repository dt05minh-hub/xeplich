import React, { useState, useEffect } from 'react';
import {
  CalendarEvent,
  Task,
  TaskStatus,
  WorkConstraint,
  TimeTrackSession,
  AdaptiveUserProfile,
  WeeklyReport,
  MonthlyReport,
  AIScheduleProposal,
  UserFeedbackLog,
  CategoryDef,
  SubCategoryDef,
  NotificationSettings,
  LearnedPreference,
  NavTab
} from './types';
import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_TASKS,
  INITIAL_WORK_CONSTRAINTS,
  INITIAL_TRACKING_SESSIONS,
  INITIAL_ADAPTIVE_PROFILE,
  INITIAL_WEEKLY_REPORT,
  INITIAL_MONTHLY_REPORT,
  INITIAL_CATEGORIES,
  INITIAL_SUBCATEGORIES,
  INITIAL_NOTIFICATIONS,
  CLEAN_WEEKLY_REPORT,
  CLEAN_MONTHLY_REPORT,
  CLEAN_ADAPTIVE_PROFILE
} from './data/mockData';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { CalendarTimelineView } from './components/CalendarTimelineView';
import { TaskBoardView } from './components/TaskBoardView';
import { ActiveTimerView } from './components/ActiveTimerView';
import { AdaptiveInsightsView } from './components/AdaptiveInsightsView';
import { WeeklyReportView } from './components/WeeklyReportView';
import { SettingsView } from './components/SettingsView';

import { AddEventModal } from './components/AddEventModal';
import { AddTaskModal } from './components/AddTaskModal';
import { ScheduleProposalModal } from './components/ScheduleProposalModal';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Helper to safely load JSON from localStorage
  const loadStorage = <T,>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : fallback;
    } catch (e) {
      console.warn(`Lỗi đọc localStorage [${key}], dùng dữ liệu mặc định:`, e);
      return fallback;
    }
  };

  // Core Persistent States (Default empty for fresh user start)
  const [events, setEvents] = useState<CalendarEvent[]>(() => loadStorage('planner_events', []));
  const [tasks, setTasks] = useState<Task[]>(() => loadStorage('planner_tasks', []));
  const [constraints, setConstraints] = useState<WorkConstraint[]>(() => loadStorage('planner_constraints', []));
  const [trackingSessions, setTrackingSessions] = useState<TimeTrackSession[]>(() => loadStorage('planner_sessions', []));
  const [profile, setProfile] = useState<AdaptiveUserProfile>(() => loadStorage('planner_profile', CLEAN_ADAPTIVE_PROFILE));
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport>(() => loadStorage('planner_report', CLEAN_WEEKLY_REPORT));
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport>(() => loadStorage('planner_monthly_report', CLEAN_MONTHLY_REPORT));
  const [feedbackLogs, setFeedbackLogs] = useState<UserFeedbackLog[]>(() => loadStorage('planner_feedback_logs', []));
  const [categories, setCategories] = useState<CategoryDef[]>(() => loadStorage('planner_categories', INITIAL_CATEGORIES));
  const [subCategories, setSubCategories] = useState<SubCategoryDef[]>(() => loadStorage('planner_subcategories', INITIAL_SUBCATEGORIES));
  const [notifications, setNotifications] = useState<NotificationSettings>(() => loadStorage('planner_notifications', INITIAL_NOTIFICATIONS));

  // Auto wipe old mock data on first mount if requested
  useEffect(() => {
    // Clear legacy mock data once if user requested clear
    const hasInitializedClean = localStorage.getItem('planner_initialized_clean_v3');
    if (!hasInitializedClean) {
      localStorage.setItem('planner_initialized_clean_v3', 'true');
      setProfile(CLEAN_ADAPTIVE_PROFILE);
      setWeeklyReport(CLEAN_WEEKLY_REPORT);
      setMonthlyReport(CLEAN_MONTHLY_REPORT);
      setFeedbackLogs([]);
      setTrackingSessions([]);
    }
  }, []);

  // Active Timer state
  const [activeTaskForTimer, setActiveTaskForTimer] = useState<Task | null>(tasks[0] || null);

  // Modals & Drawers state
  const [isAddEventOpen, setIsAddEventOpen] = useState<boolean>(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isProposalOpen, setIsProposalOpen] = useState<boolean>(false);
  
  // AI States
  const [isAIScheduling, setIsAIScheduling] = useState<boolean>(false);
  const [isAnalyzingBehavior, setIsAnalyzingBehavior] = useState<boolean>(false);
  const [isRefreshingAI, setIsRefreshingAI] = useState<boolean>(false);
  const [aiProposal, setAiProposal] = useState<AIScheduleProposal | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('planner_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('planner_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('planner_constraints', JSON.stringify(constraints));
  }, [constraints]);

  useEffect(() => {
    localStorage.setItem('planner_sessions', JSON.stringify(trackingSessions));
  }, [trackingSessions]);

  useEffect(() => {
    localStorage.setItem('planner_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('planner_report', JSON.stringify(weeklyReport));
  }, [weeklyReport]);

  useEffect(() => {
    localStorage.setItem('planner_monthly_report', JSON.stringify(monthlyReport));
  }, [monthlyReport]);

  useEffect(() => {
    localStorage.setItem('planner_feedback_logs', JSON.stringify(feedbackLogs));
  }, [feedbackLogs]);

  useEffect(() => {
    localStorage.setItem('planner_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('planner_subcategories', JSON.stringify(subCategories));
  }, [subCategories]);

  useEffect(() => {
    localStorage.setItem('planner_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Handler: Trigger AI Auto Schedule
  const handleTriggerAISchedule = async () => {
    setIsAIScheduling(true);
    try {
      const activeRules = profile.learnedPreferences.filter((r) => r.isEnabled);
      const res = await fetch('/api/ai/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          events,
          tasks,
          profile: {
            ...profile,
            workConstraints: constraints,
            learnedPreferences: activeRules
          }
        })
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Máy chủ trả về dữ liệu không phải định dạng JSON. Vui lòng đảm bảo bạn đang chạy dự án bằng lệnh: npm run dev');
      }

      if (data.success && data.data) {
        setAiProposal(data.data);
        setIsProposalOpen(true);
      } else {
        alert(data.error || 'Không thể tạo lịch AI. Vui lòng kiểm tra lại tệp .env có GEMINI_API_KEY chưa.');
      }
    } catch (err: any) {
      console.error('Lỗi khi gọi AI Schedule:', err);
      alert('Lỗi kết nối AI: ' + (err.message || ''));
    } finally {
      setIsAIScheduling(false);
    }
  };

  // Handler: Apply AI Schedule Proposal
  const handleApplyScheduleProposal = () => {
    if (!aiProposal) return;

    setTasks((prev) =>
      prev.map((t) => {
        const proposed = aiProposal.proposedItems.find((p) => p.taskId === t.id);
        if (proposed) {
          return {
            ...t,
            status: 'scheduled',
            scheduledSlot: {
              date: proposed.date,
              startTime: proposed.startTime,
              endTime: proposed.endTime,
              isLocked: false
            }
          };
        }
        return t;
      })
    );

    setIsProposalOpen(false);
    setActiveTab('calendar');
  };

  // Handler: Move Task Slot (Change Time / Change Day)
  const handleMoveTaskSlot = (
    taskId: string,
    newDate: string,
    newStartTime: string,
    newEndTime: string
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const oldSlot = t.scheduledSlot;

          // Log user feedback action for Behavior Analyzer
          const newLog: UserFeedbackLog = {
            id: Date.now().toString(),
            taskId: t.id,
            taskTitle: t.title,
            action: 'change_time',
            oldSlot,
            newSlot: { date: newDate, startTime: newStartTime, endTime: newEndTime },
            timestamp: new Date().toISOString()
          };

          setFeedbackLogs((logs) => [newLog, ...logs]);

          return {
            ...t,
            scheduledSlot: {
              date: newDate,
              startTime: newStartTime,
              endTime: newEndTime,
              isLocked: true // Chốt vị trí sau khi sửa thủ công
            }
          };
        }
        return t;
      })
    );
  };

  // Handler: Run Behavior Analyzer
  const handleRunBehaviorAnalyzer = async () => {
    setIsAnalyzingBehavior(true);
    try {
      const res = await fetch('/api/ai/batch-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackLogs,
          trackingSessions,
          currentRules: profile.learnedPreferences
        })
      });

      const responseText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Máy chủ trả về định dạng không phải JSON.');
      }

      if (data.success && data.data) {
        const newRulesFromAI = data.data.newRules || [];

        // Append new learned rules to profile
        setProfile((prev) => {
          const updatedRules = [...prev.learnedPreferences];

          newRulesFromAI.forEach((nr: any) => {
            if (!updatedRules.some((r) => r.ruleText === nr.ruleText)) {
              updatedRules.push({
                id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                ruleText: nr.ruleText,
                category: nr.category as any,
                confidence: nr.confidence || 0.85,
                derivedFrom: nr.derivedFrom || 'Bộ phân tích hành vi AI',
                isEnabled: true,
                createdAt: new Date().toISOString()
              });
            }
          });

          return { ...prev, learnedPreferences: updatedRules };
        });

        alert(`Bộ phân tích hành vi hoàn tất! ${newRulesFromAI.length} quy luật thích ứng mới đã được sinh ra.`);
      } else if (data.error) {
        alert('Lỗi phân tích hành vi: ' + data.error);
      }
    } catch (err: any) {
      console.error('Lỗi khi chạy Behavior Analyzer:', err);
      alert('Không thể phân tích hành vi: ' + (err.message || ''));
    } finally {
      setIsAnalyzingBehavior(false);
    }
  };

  // Rule Toggling
  const handleToggleRule = (ruleId: string) => {
    setProfile((prev) => ({
      ...prev,
      learnedPreferences: prev.learnedPreferences.map((r) =>
        r.id === ruleId ? { ...r, isEnabled: !r.isEnabled } : r
      )
    }));
  };

  const handleAddCustomRule = (ruleText: string) => {
    setProfile((prev) => ({
      ...prev,
      learnedPreferences: [
        ...prev.learnedPreferences,
        {
          id: `rule-${Date.now()}`,
          ruleText,
          confidence: 1.0,
          derivedFrom: 'Thêm thủ công bởi người dùng',
          isEnabled: true,
          createdAt: new Date().toISOString()
        }
      ]
    }));
  };

  const handleDeleteRule = (ruleId: string) => {
    setProfile((prev) => ({
      ...prev,
      learnedPreferences: prev.learnedPreferences.filter((r) => r.id !== ruleId)
    }));
  };

  // Log completed time tracking session
  const handleLogCompletedSession = (sessionData: Omit<TimeTrackSession, 'id'>) => {
    const newSession: TimeTrackSession = {
      ...sessionData,
      id: `sess-${Date.now()}`
    };

    setTrackingSessions((prev) => [newSession, ...prev]);

    // Update actual minutes spent on task
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === sessionData.taskId) {
          const updatedSpent = t.actualMinutesSpent + sessionData.durationMinutes;
          const isDone = updatedSpent >= t.estimatedMinutes;
          return {
            ...t,
            actualMinutesSpent: updatedSpent,
            status: isDone ? 'completed' : 'in_progress',
            completedAt: isDone ? new Date().toISOString() : t.completedAt
          };
        }
        return t;
      })
    );
  };

  // Add event & task
  const handleAddEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvt: CalendarEvent = {
      ...eventData,
      id: `evt-${Date.now()}`
    };
    setEvents((prev) => [...prev, newEvt]);
  };

  const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'actualMinutesSpent' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      actualMinutesSpent: 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    setTasks((prev) => [...prev, newTask]);
  };

  const handleUpdateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  };

  const handleAddConstraint = (c: Omit<WorkConstraint, 'id'>) => {
    const newC: WorkConstraint = { ...c, id: `const-${Date.now()}` };
    setConstraints((prev) => [...prev, newC]);
  };

  const handleDeleteConstraint = (id: string) => {
    setConstraints((prev) => prev.filter((c) => c.id !== id));
  };

  // Handler: Reset/Clear Data
  const handleResetData = () => {
    const choice = window.prompt(
      "CHỌN CHẾ ĐỘ XÓA DỮ LIỆU:\n\n" +
      "• Nhập '1' (hoặc 'mau'): Khôi phục về dữ liệu mẫu ban đầu\n" +
      "• Nhập '2' (hoặc 'xoa'): Xóa sạch hoàn toàn (Làm trống tất cả lịch & công việc)\n\n" +
      "Hoặc nhấn Cancel để hủy."
    );

    if (!choice) return;

    const trimmed = choice.trim().toLowerCase();
    if (trimmed === '1' || trimmed === 'mau' || trimmed === 'default') {
      localStorage.clear();
      setEvents(INITIAL_CALENDAR_EVENTS);
      setTasks(INITIAL_TASKS);
      setConstraints(INITIAL_WORK_CONSTRAINTS);
      setTrackingSessions(INITIAL_TRACKING_SESSIONS);
      setProfile(INITIAL_ADAPTIVE_PROFILE);
      setWeeklyReport(INITIAL_WEEKLY_REPORT);
      setMonthlyReport(INITIAL_MONTHLY_REPORT);
      setCategories(INITIAL_CATEGORIES);
      setSubCategories(INITIAL_SUBCATEGORIES);
      setNotifications(INITIAL_NOTIFICATIONS);
      setFeedbackLogs([]);
      alert("Đã đặt lại ứng dụng về dữ liệu mẫu ban đầu!");
    } else if (trimmed === '2' || trimmed === 'xoa' || trimmed === 'clean') {
      localStorage.clear();
      setEvents([]);
      setTasks([]);
      setConstraints([]);
      setTrackingSessions([]);
      setSubCategories([]);
      setFeedbackLogs([]);
      setProfile(CLEAN_ADAPTIVE_PROFILE);
      setWeeklyReport(CLEAN_WEEKLY_REPORT);
      setMonthlyReport(CLEAN_MONTHLY_REPORT);
      alert("Đã xóa toàn bộ dữ liệu lịch, công việc & mẫu có sẵn. Bạn có thể bắt đầu tự khởi tạo 100%!");
    }
  };

  // Handler: Export Data
  const handleExportData = () => {
    const backupObj = {
      events,
      tasks,
      constraints,
      categories,
      subCategories,
      notifications,
      profile,
      weeklyReport,
      monthlyReport,
      exportedAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(backupObj, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `smart_planner_backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Handler: Import Data
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.events) setEvents(parsed.events);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.constraints) setConstraints(parsed.constraints);
        if (parsed.categories) setCategories(parsed.categories);
        if (parsed.subCategories) setSubCategories(parsed.subCategories);
        if (parsed.notifications) setNotifications(parsed.notifications);
        if (parsed.profile) setProfile(parsed.profile);
        alert('Phục hồi dữ liệu thành công!');
      } catch (err) {
        alert('Tệp JSON không hợp lệ hoặc bị lỗi định dạng!');
      }
    };
    reader.readAsText(file);
  };

  // Distinct Pastel Green & Blue theme configuration for each tab (no repeated colors)
  const TAB_THEMES: Record<NavTab, {
    bgClass: string;
  }> = {
    dashboard: {
      bgClass: 'bg-gradient-to-br from-sky-100 via-blue-50 to-sky-50',
    },
    calendar: {
      bgClass: 'bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-50',
    },
    tasks: {
      bgClass: 'bg-gradient-to-br from-cyan-100 via-cyan-50 to-sky-100',
    },
    timer: {
      bgClass: 'bg-gradient-to-br from-lime-100 via-teal-50 to-lime-50',
    },
    insights: {
      bgClass: 'bg-gradient-to-br from-indigo-100 via-blue-50 to-indigo-50',
    },
    report: {
      bgClass: 'bg-gradient-to-br from-teal-100 via-emerald-50 to-teal-50',
    },
    settings: {
      bgClass: 'bg-gradient-to-br from-slate-200/90 via-sky-100/70 to-slate-100',
    },
  };

  const currentTheme = TAB_THEMES[activeTab] || TAB_THEMES.dashboard;

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} text-slate-800 flex flex-col font-sans transition-colors duration-500 relative overflow-hidden`}>
      
      {/* Decorative Floating Background Cute Icons */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        <div className="absolute top-12 left-8 text-3xl animate-float">✨</div>
        <div className="absolute top-36 right-12 text-4xl animate-float-reverse">☁️</div>
        <div className="absolute bottom-20 left-16 text-3xl animate-wiggle">🌱</div>
        <div className="absolute bottom-32 right-24 text-3xl animate-bounce-gentle">🫧</div>
      </div>

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenAddEvent={() => setIsAddEventOpen(true)}
        onOpenAddTask={() => setIsAddTaskOpen(true)}
        onTriggerAISchedule={handleTriggerAISchedule}
        onResetData={handleResetData}
        isAIScheduling={isAIScheduling}
        activeTimerRunning={false}
      />

      {/* PWA Install Notification / Banner */}
      <PWAInstallPrompt />

      {/* Main App Content View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
        {activeTab === 'dashboard' && (
          <DashboardView
            tasks={tasks}
            events={events}
            profile={profile}
            trackingSessions={trackingSessions}
            onSelectTaskForTimer={(task) => {
              setActiveTaskForTimer(task);
              setActiveTab('timer');
            }}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onTriggerAISchedule={handleTriggerAISchedule}
            isAIScheduling={isAIScheduling}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarTimelineView
            events={events}
            tasks={tasks}
            onMoveTaskSlot={handleMoveTaskSlot}
            onToggleTaskLock={(taskId) => {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === taskId && t.scheduledSlot
                    ? { ...t, scheduledSlot: { ...t.scheduledSlot, isLocked: !t.scheduledSlot.isLocked } }
                    : t
                )
              );
            }}
            onSelectTaskForTimer={(task) => {
              setActiveTaskForTimer(task);
              setActiveTab('timer');
            }}
            onDeleteEvent={handleDeleteEvent}
            onTriggerAISchedule={handleTriggerAISchedule}
            isAIScheduling={isAIScheduling}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskBoardView
            tasks={tasks}
            constraints={constraints}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onSelectTaskForTimer={(task) => {
              setActiveTaskForTimer(task);
              setActiveTab('timer');
            }}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onAddConstraint={handleAddConstraint}
            onDeleteConstraint={handleDeleteConstraint}
            onTriggerAISchedule={handleTriggerAISchedule}
            isAIScheduling={isAIScheduling}
          />
        )}

        {activeTab === 'timer' && (
          <ActiveTimerView
            tasks={tasks}
            activeTask={activeTaskForTimer}
            trackingSessions={trackingSessions}
            onSelectTask={(task) => setActiveTaskForTimer(task)}
            onLogCompletedSession={handleLogCompletedSession}
          />
        )}

        {activeTab === 'insights' && (
          <AdaptiveInsightsView
            profile={profile}
            trackingSessions={trackingSessions}
            weeklyReport={weeklyReport}
            onRefreshAIInsights={() => {}}
            isRefreshingAI={isRefreshingAI}
            onRunBehaviorAnalyzer={handleRunBehaviorAnalyzer}
            isAnalyzingBehavior={isAnalyzingBehavior}
            onToggleRule={handleToggleRule}
            onAddCustomRule={handleAddCustomRule}
            onDeleteRule={handleDeleteRule}
            onResetData={() => {
              setProfile(CLEAN_ADAPTIVE_PROFILE);
              setWeeklyReport(CLEAN_WEEKLY_REPORT);
              setMonthlyReport(CLEAN_MONTHLY_REPORT);
              setFeedbackLogs([]);
              setTrackingSessions([]);
            }}
          />
        )}

        {activeTab === 'report' && (
          <WeeklyReportView report={weeklyReport} monthlyReport={monthlyReport} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            categories={categories}
            setCategories={setCategories}
            subCategories={subCategories}
            setSubCategories={setSubCategories}
            notifications={notifications}
            setNotifications={setNotifications}
            learnedRules={profile?.learnedPreferences || []}
            setLearnedRules={(action) => {
              setProfile((prev) => ({
                ...prev,
                learnedPreferences: typeof action === 'function' ? action(prev?.learnedPreferences || []) : action
              }));
            }}
            workConstraints={constraints}
            setWorkConstraints={setConstraints}
            onResetData={handleResetData}
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        )}
      </main>

      {/* Global Modals */}
      <AddEventModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
        categories={categories}
        onAddEvent={handleAddEvent}
      />

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        categories={categories}
        subCategories={subCategories}
        onAddTask={handleAddTask}
      />

      <ScheduleProposalModal
        proposal={aiProposal}
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        onApplyProposal={handleApplyScheduleProposal}
        onReplan={handleTriggerAISchedule}
      />

      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        onOpen={() => setIsCopilotOpen(true)}
        stateContext={{ events, tasks, profile, constraints }}
      />

    </div>
  );
}

export default App;
