import React from 'react';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  Timer,
  Sparkles,
  BarChart3,
  Settings,
  Plus,
  RotateCcw,
  Zap
} from 'lucide-react';
import { NavTab } from '../types';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onOpenCopilot: () => void;
  onOpenAddEvent: () => void;
  onOpenAddTask: () => void;
  onTriggerAISchedule: () => void;
  onResetData: () => void;
  isAIScheduling: boolean;
  activeTimerRunning: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCopilot,
  onOpenAddEvent,
  onOpenAddTask,
  onTriggerAISchedule,
  onResetData,
  isAIScheduling,
  activeTimerRunning
}) => {
  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Tổng quan',
      icon: LayoutDashboard,
      color: 'text-sky-700 bg-sky-100/80',
      activeBg: 'bg-sky-600 text-white shadow-sky-200'
    },
    {
      id: 'calendar' as NavTab,
      label: 'Lịch',
      icon: CalendarDays,
      color: 'text-emerald-700 bg-emerald-100/80',
      activeBg: 'bg-emerald-600 text-white shadow-emerald-200'
    },
    {
      id: 'tasks' as NavTab,
      label: 'Công việc',
      icon: ListTodo,
      color: 'text-cyan-700 bg-cyan-100/80',
      activeBg: 'bg-cyan-600 text-white shadow-cyan-200'
    },
    {
      id: 'timer' as NavTab,
      label: 'Bấm giờ',
      icon: Timer,
      badge: activeTimerRunning,
      color: 'text-lime-800 bg-lime-100/80',
      activeBg: 'bg-lime-600 text-white shadow-lime-200'
    },
    {
      id: 'insights' as NavTab,
      label: 'Thống kê AI',
      icon: Sparkles,
      color: 'text-indigo-700 bg-indigo-100/80',
      activeBg: 'bg-indigo-600 text-white shadow-indigo-200'
    },
    {
      id: 'report' as NavTab,
      label: 'Báo cáo',
      icon: BarChart3,
      color: 'text-teal-800 bg-teal-100/90',
      activeBg: 'bg-teal-700 text-white shadow-teal-200'
    },
    {
      id: 'settings' as NavTab,
      label: 'Cài đặt',
      icon: Settings,
      color: 'text-slate-700 bg-slate-200/80',
      activeBg: 'bg-slate-700 text-white shadow-slate-200'
    },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-teal-100/80 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo Brand */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center space-x-2.5 shrink-0 cursor-pointer select-none"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-amber-300 via-teal-400 to-emerald-400 text-white flex items-center justify-center shadow-sm shadow-teal-200/50 text-lg sm:text-xl shrink-0">
              🌻
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg bg-gradient-to-r from-teal-800 via-cyan-800 to-sky-800 bg-clip-text text-transparent tracking-tight">
                  SmartPlanner
                </span>
              </div>
              <span className="hidden sm:block text-[10px] text-teal-700/80 font-medium leading-none">
                Quản lý lịch & công việc thông minh
              </span>
            </div>
          </motion.div>

          {/* Desktop Nav Tabs with Pastel Blue/Green Themes */}
          <nav className="hidden lg:flex items-center space-x-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60 backdrop-blur-xs">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all relative ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-xs font-bold border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <div className={`p-1 rounded-lg transition-colors flex items-center ${isActive ? item.activeBg : item.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute -top-0.5 -right-0.5" />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* Top Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            {/* AI Auto Schedule Trigger Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onTriggerAISchedule}
              disabled={isAIScheduling}
              className="h-9 px-3 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-teal-300/40 flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
              title="Tự động sắp xếp công việc vào thời gian trống"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" style={{ animationDuration: '3s' }} />
              <span className="hidden sm:inline whitespace-nowrap">Lập lịch AI</span>
            </motion.button>

            {/* Quick Add Event/Task Controls */}
            <div className="flex items-center space-x-1 bg-teal-50/90 p-1 rounded-xl border border-teal-200/70">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenAddEvent}
                className="h-7 px-2.5 text-teal-900 hover:bg-white rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                title="Thêm lịch cố định (Học, Thi, Họp)"
              >
                <Plus className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span className="text-xs">Lịch</span>
              </motion.button>

              <div className="w-[1px] h-4 bg-teal-200" />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenAddTask}
                className="h-7 px-2.5 text-cyan-900 hover:bg-white rounded-lg text-xs font-semibold transition-all flex items-center space-x-1"
                title="Thêm công việc cần làm"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                <span className="text-xs">Việc</span>
              </motion.button>
            </div>

            {/* Reset / Clear Data Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onResetData}
              className="w-9 h-9 bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 rounded-xl transition-all flex items-center justify-center shrink-0"
              title="Đặt lại dữ liệu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </motion.button>
          </div>

        </div>

        {/* Mobile Navigation Scrollbar */}
        <div className="flex lg:hidden overflow-x-auto pb-2 space-x-1 border-t border-slate-200/50 pt-2 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs font-bold'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-slate-200/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};



