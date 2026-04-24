import { supabase } from './supabase'
import { format } from 'date-fns'

// ── Habits ────────────────────────────────────────────────────

export const fetchHabits = async (userId) => {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export const createHabit = async (habit) => {
  const { data, error } = await supabase
    .from('habits')
    .insert(habit)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateHabit = async (id, updates) => {
  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteHabit = async (id) => {
  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export const reorderHabits = async (habits) => {
  const updates = habits.map((h, i) => ({ id: h.id, sort_order: i }))
  const { error } = await supabase
    .from('habits')
    .upsert(updates, { onConflict: 'id' })
  if (error) throw error
}

// ── Habit Logs ────────────────────────────────────────────────

export const fetchLogsForDate = async (userId, date) => {
  const dateStr = format(date, 'yyyy-MM-dd')
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('date', dateStr)
  if (error) throw error
  return data
}

export const fetchLogsForRange = async (userId, startDate, endDate) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', format(startDate, 'yyyy-MM-dd'))
    .lte('date', format(endDate, 'yyyy-MM-dd'))
  if (error) throw error
  return data
}

export const upsertLog = async (log) => {
  const { data, error } = await supabase
    .from('habit_logs')
    .upsert(log, { onConflict: 'habit_id,date' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Streak calculation ────────────────────────────────────────

export const calculateStreak = (logs, today) => {
  if (!logs || logs.length === 0) return 0
  const completedDates = new Set(
    logs.filter(l => l.completed).map(l => l.date)
  )
  let streak = 0
  let current = new Date(today)
  while (true) {
    const dateStr = format(current, 'yyyy-MM-dd')
    if (completedDates.has(dateStr)) {
      streak++
      current.setDate(current.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}
