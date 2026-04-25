import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns'
import useAppStore from '../store/useAppStore'

const VIEWS = ['7 days', 'Monthly', 'Per habit']

export default function History() {
  const { habits, loadLogsForRange, allLogs } = useAppStore()
  const [view, setView] = useState(0)
  const [loading, setLoading] = useState(true)
  const [selectedHabit, setSelectedHabit] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const start = subDays(new Date(), 365)
      await loadLogsForRange(start, new Date())
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-bloom-50 via-white to-white">
      <div className="px-5 pt-14 pb-4">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-6">History</h1>

        {/* View toggle */}
        <div className="flex bg-bloom-50 rounded-2xl p-1 gap-1 mb-6">
          {VIEWS.map((v, i) => (
            <button
              key={v}
              onClick={() => setView(i)}
              className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                view === i
                  ? 'bg-white text-bloom-600 shadow-bloom-sm'
                  : 'text-gray-400'
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingSkeleton />
        ) : view === 0 ? (
          <SevenDayView habits={habits} logs={allLogs} />
        ) : view === 1 ? (
          <MonthlyHeatmap logs={allLogs} habits={habits} />
        ) : (
          <PerHabitView
            habits={habits}
            logs={allLogs}
            selected={selectedHabit}
            onSelect={setSelectedHabit}
          />
        )}
      </div>
    </div>
  )
}

// ── 7-Day View ────────────────────────────────────────────────
function SevenDayView({ habits, logs }) {
  const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i))

  if (habits.length === 0) {
    return <EmptyHistory />
  }

  return (
    <div className="space-y-3 pb-32">
      {/* Day headers — match the data row column widths */}
      <div className="grid pb-2" style={{ gridTemplateColumns: `112px repeat(7, 1fr)` }}>
        <div />
        {days.map(day => (
          <div key={day.toISOString()} className="text-center">
            <p className="text-xs text-gray-400">{format(day, 'EEE')}</p>
            <p className={`text-xs font-semibold ${isSameDay(day, new Date()) ? 'text-bloom-500' : 'text-gray-600'}`}>
              {format(day, 'd')}
            </p>
          </div>
        ))}
      </div>

      {habits.map((habit, i) => (
        <motion.div
          key={habit.id}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="grid items-center gap-1 bg-white rounded-2xl px-3 py-3 shadow-bloom-sm overflow-visible"
          style={{ gridTemplateColumns: `112px repeat(7, 1fr)` }}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-base">{habit.emoji}</span>
            <span className="text-xs font-medium text-gray-700 truncate">{habit.name}</span>
          </div>
          {days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr)
            const done = log?.completed
            return (
              <div key={dateStr} className="flex justify-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px]
                  ${done
                    ? 'bg-bloom-gradient text-bloom-600 shadow-bloom-sm'
                    : isSameDay(parseISO(dateStr), new Date())
                      ? 'border-2 border-dashed border-bloom-300'
                      : 'bg-gray-100'
                  }`}>
                  {done ? '✓' : ''}
                </div>
              </div>
            )
          })}
        </motion.div>
      ))}
    </div>
  )
}

// ── Monthly Heatmap ───────────────────────────────────────────
function MonthlyHeatmap({ logs, habits }) {
  const today = new Date()
  const start = startOfMonth(today)
  const end = endOfMonth(today)
  const days = eachDayOfInterval({ start, end })
  const totalHabits = habits.length || 1

  const getIntensity = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    const dayLogs = logs.filter(l => l.date === dateStr && l.completed)
    return dayLogs.length / totalHabits
  }

  const intensityToColor = (v) => {
    if (v === 0) return 'bg-gray-50'
    if (v < 0.25) return 'bg-bloom-100'
    if (v < 0.5) return 'bg-bloom-200'
    if (v < 0.75) return 'bg-bloom-300'
    return 'bg-bloom-400'
  }

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const firstDow = (start.getDay() + 6) % 7 // Monday-first

  return (
    <div className="pb-32">
      <h2 className="font-display text-xl font-semibold text-gray-800 mb-4">
        {format(today, 'MMMM yyyy')}
      </h2>

      <div className="bg-white rounded-3xl p-4 shadow-bloom-sm">
        {/* Weekday labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(d => (
            <div key={d} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leading empty cells */}
          {Array.from({ length: firstDow }).map((_, i) => <div key={`empty-${i}`} />)}

          {days.map(day => {
            const intensity = getIntensity(day)
            const isToday = isSameDay(day, today)
            return (
              <div
                key={day.toISOString()}
                className={`aspect-square rounded-lg flex items-center justify-center text-[10px] font-medium
                  ${intensityToColor(intensity)}
                  ${isToday ? 'ring-2 ring-bloom-400' : ''}
                  ${intensity > 0.5 ? 'text-white' : 'text-gray-500'}
                `}
              >
                {format(day, 'd')}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 justify-end">
          <span className="text-xs text-gray-400">Less</span>
          {['bg-gray-50', 'bg-bloom-100', 'bg-bloom-200', 'bg-bloom-300', 'bg-bloom-400'].map(c => (
            <div key={c} className={`w-4 h-4 rounded ${c}`} />
          ))}
          <span className="text-xs text-gray-400">More</span>
        </div>
      </div>
    </div>
  )
}

// ── Per-Habit View ────────────────────────────────────────────
function PerHabitView({ habits, logs, selected, onSelect }) {
  if (habits.length === 0) return <EmptyHistory />

  if (selected) {
    const habit = habits.find(h => h.id === selected)
    const habitLogs = logs.filter(l => l.habit_id === selected && l.completed)
    const completedDates = new Set(habitLogs.map(l => l.date))

    const today = new Date()
    const start = startOfMonth(today)
    const end = endOfMonth(today)
    const days = eachDayOfInterval({ start, end })
    const firstDow = (start.getDay() + 6) % 7

    return (
      <div className="pb-32">
        <button onClick={() => onSelect(null)} className="flex items-center gap-2 text-bloom-500 text-sm mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          All habits
        </button>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{habit?.emoji}</span>
          <h2 className="font-display text-xl font-semibold text-gray-800">{habit?.name}</h2>
        </div>

        <div className="bg-white rounded-3xl p-4 shadow-bloom-sm">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
              <div key={d} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDow }).map((_, i) => <div key={i} />)}
            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const done = completedDates.has(dateStr)
              const isToday = isSameDay(day, today)
              return (
                <div key={dateStr} className={`aspect-square rounded-lg flex items-center justify-center text-[10px]
                  ${done ? 'bg-bloom-300 text-white' : 'bg-gray-50 text-gray-400'}
                  ${isToday ? 'ring-2 ring-bloom-400' : ''}
                `}>
                  {done ? '✓' : format(day, 'd')}
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 shadow-bloom-sm text-center">
            <p className="text-2xl font-display font-bold text-bloom-500">{completedDates.size}</p>
            <p className="text-xs text-gray-400 mt-1">Total completions</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-bloom-sm text-center">
            <p className="text-2xl font-display font-bold text-gold-400">
              {Math.round((completedDates.size / Math.max(days.length, 1)) * 100)}%
            </p>
            <p className="text-xs text-gray-400 mt-1">This month</p>
          </div>
        </div>

        {/* Notes */}
        {habit?.config?.notes && (
          <div className="mt-4 bg-white rounded-2xl p-4 shadow-bloom-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">📝 Notes</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{habit.config.notes}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-32">
      {habits.map((habit, i) => {
        const completions = logs.filter(l => l.habit_id === habit.id && l.completed).length
        return (
          <motion.button
            key={habit.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => onSelect(habit.id)}
            className="w-full flex items-center gap-4 bg-white rounded-2xl px-4 py-3.5 shadow-bloom-sm text-left"
          >
            <span className="text-2xl">{habit.emoji}</span>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">{habit.name}</p>
              <p className="text-xs text-gray-400">{completions} total completions</p>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </motion.button>
        )
      })}
    </div>
  )
}

function EmptyHistory() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <div className="text-6xl mb-4">📅</div>
      <p className="font-display text-xl font-semibold text-gray-700 mb-2">No history yet</p>
      <p className="text-gray-400 text-sm">Complete some habits to see your progress here.</p>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="h-14 bg-bloom-50 rounded-2xl animate-pulse" />
      ))}
    </div>
  )
}
