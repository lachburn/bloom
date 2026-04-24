import { create } from 'zustand'
import { supabase, getUserProfile, upsertUserProfile } from '../lib/supabase'
import { fetchHabits, fetchLogsForDate, upsertLog, createHabit, updateHabit, deleteHabit, calculateStreak, fetchLogsForRange } from '../lib/habits'
import { format } from 'date-fns'

const useAppStore = create((set, get) => ({
  // ── Auth ────────────────────────────────────────────────────
  user: null,
  profile: null,
  authLoading: true,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setAuthLoading: (v) => set({ authLoading: v }),

  loadProfile: async (userId) => {
    try {
      const profile = await getUserProfile(userId)
      set({ profile })
    } catch {
      // Profile may not exist yet (trigger will create it)
    }
  },

  updateProfile: async (updates) => {
    const { user, profile } = get()
    if (!user) return
    const updated = await upsertUserProfile({ id: user.id, email: user.email, ...profile, ...updates })
    set({ profile: updated })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, profile: null, habits: [], logs: [] })
  },

  // ── Habits ──────────────────────────────────────────────────
  habits: [],
  habitsLoading: false,

  loadHabits: async () => {
    const { user } = get()
    if (!user) return
    set({ habitsLoading: true })
    try {
      const habits = await fetchHabits(user.id)
      set({ habits })
    } finally {
      set({ habitsLoading: false })
    }
  },

  addHabit: async (habitData) => {
    const { user, habits } = get()
    if (!user) return
    const habit = await createHabit({
      ...habitData,
      user_id: user.id,
      sort_order: habits.length,
    })
    set({ habits: [...habits, habit] })
    return habit
  },

  editHabit: async (id, updates) => {
    const updated = await updateHabit(id, updates)
    set(state => ({
      habits: state.habits.map(h => h.id === id ? updated : h)
    }))
  },

  removeHabit: async (id) => {
    await deleteHabit(id)
    set(state => ({
      habits: state.habits.filter(h => h.id !== id),
      logs: state.logs.filter(l => l.habit_id !== id),
    }))
  },

  // ── Logs ────────────────────────────────────────────────────
  logs: [], // today's logs
  allLogs: [], // range logs for history
  logsLoading: false,
  today: format(new Date(), 'yyyy-MM-dd'),

  loadTodayLogs: async () => {
    const { user, today } = get()
    if (!user) return
    set({ logsLoading: true })
    try {
      const logs = await fetchLogsForDate(user.id, new Date(today))
      set({ logs })
    } finally {
      set({ logsLoading: false })
    }
  },

  loadLogsForRange: async (startDate, endDate) => {
    const { user } = get()
    if (!user) return []
    const logs = await fetchLogsForRange(user.id, startDate, endDate)
    set({ allLogs: logs })
    return logs
  },

  getLogForHabit: (habitId) => {
    const { logs, today } = get()
    return logs.find(l => l.habit_id === habitId && l.date === today) || null
  },

  updateLog: async (habitId, updates) => {
    const { user, today, logs } = get()
    if (!user) return
    const existing = logs.find(l => l.habit_id === habitId)
    const log = await upsertLog({
      id: existing?.id,
      habit_id: habitId,
      user_id: user.id,
      date: today,
      value: updates.value ?? existing?.value ?? 0,
      completed: updates.completed ?? existing?.completed ?? false,
    })
    set(state => ({
      logs: existing
        ? state.logs.map(l => l.habit_id === habitId ? log : l)
        : [...state.logs, log]
    }))
    return log
  },

  // ── Streaks ─────────────────────────────────────────────────
  streaks: {}, // habitId -> number

  loadStreaks: async () => {
    const { user, habits } = get()
    if (!user || !habits.length) return
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 365)
    const allLogs = await fetchLogsForRange(user.id, startDate, endDate)
    const today = format(new Date(), 'yyyy-MM-dd')
    const streaks = {}
    for (const habit of habits) {
      const habitLogs = allLogs.filter(l => l.habit_id === habit.id)
      streaks[habit.id] = calculateStreak(habitLogs, today)
    }
    set({ streaks })
  },
}))

export default useAppStore
