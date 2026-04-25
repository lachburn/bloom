import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProgressRing from './ProgressRing'
import useAppStore from '../../store/useAppStore'

const haptic = (pattern = 200) => {
  if ('vibrate' in navigator) navigator.vibrate(pattern)
}

// ── Yes / No ──────────────────────────────────────────────────
function BooleanTile({ habit, log, onComplete }) {
  const done = log?.completed
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={() => !done && onComplete(true, 1)}
      className={`w-full mt-3 py-3 rounded-2xl font-medium text-sm transition-all duration-300 ${
        done
          ? 'bg-bloom-gradient text-bloom-600 shadow-bloom-sm'
          : 'bg-bloom-50 text-bloom-500'
      }`}
    >
      {done ? '✓ Done' : 'Mark done'}
    </motion.button>
  )
}

// ── Timer ─────────────────────────────────────────────────────
function TimedTile({ habit, log, onComplete }) {
  const targetSeconds = (habit.config?.duration_minutes || 30) * 60
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(log?.value || 0)
  const intervalRef = useRef(null)
  const done = log?.completed

  const toggle = () => {
    if (done) return
    if (running) {
      clearInterval(intervalRef.current)
      setRunning(false)
    } else {
      const start = Date.now() - elapsed * 1000
      intervalRef.current = setInterval(() => {
        const newElapsed = Math.floor((Date.now() - start) / 1000)
        setElapsed(newElapsed)
        if (newElapsed >= targetSeconds) {
          clearInterval(intervalRef.current)
          setRunning(false)
          onComplete(true, newElapsed)
        }
      }, 1000)
      setRunning(true)
    }
  }

  const progress = Math.min(elapsed / targetSeconds, 1)
  const remaining = Math.max(targetSeconds - elapsed, 0)
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>{habit.config?.duration_minutes || 30} min target</span>
        <span className="font-mono text-gray-600">
          {done ? '✓ Complete' : `${mins}:${String(secs).padStart(2, '0')}`}
        </span>
      </div>
      <div className="w-full h-1.5 bg-bloom-100 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-button-gradient rounded-full"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {!done && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={toggle}
          className={`w-full py-3 rounded-2xl font-medium text-sm ${
            running ? 'bg-bloom-100 text-bloom-600' : 'bg-bloom-50 text-bloom-500'
          }`}
        >
          {running ? '⏸ Pause' : elapsed > 0 ? '▶ Resume' : '▶ Start'}
        </motion.button>
      )}
    </div>
  )
}

// ── Quantity / Water ──────────────────────────────────────────
function QuantityTile({ habit, log, onComplete }) {
  const goal = habit.config?.goal || 2000
  const increment = habit.config?.increment || 250
  const unit = habit.config?.unit || 'ml'
  const current = log?.value || 0
  const progress = Math.min(current / goal, 1)
  const done = log?.completed

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
        <span>{current.toLocaleString()} / {goal.toLocaleString()} {unit}</span>
        {done && <span className="text-bloom-500">✓ Goal reached</span>}
      </div>
      <div className="w-full h-2 bg-bloom-100 rounded-full overflow-hidden mb-3">
        <motion.div
          className="h-full bg-button-gradient rounded-full"
          animate={{ width: `${progress * 100}%` }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        />
      </div>
      {!done && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onComplete(current + increment >= goal, current + increment)}
          className="w-full py-3 rounded-2xl bg-bloom-50 text-bloom-500 font-medium text-sm"
        >
          + {increment} {unit}
        </motion.button>
      )}
    </div>
  )
}

// ── Count / Steps ─────────────────────────────────────────────
function CountTile({ habit, log, onComplete }) {
  const goal = habit.config?.goal || 10000
  const unit = habit.config?.unit || 'steps'
  const current = log?.value || 0
  const done = log?.completed

  return (
    <div className="mt-3">
      <div className="text-center mb-2">
        <span className="text-lg font-semibold text-gray-700 font-display">
          {current.toLocaleString()}
        </span>
        <span className="text-xs text-gray-400 ml-1">/ {goal.toLocaleString()} {unit}</span>
      </div>
      {!done && (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onComplete(current + 1 >= goal, current + 1)}
          className="w-full py-3 rounded-2xl bg-bloom-50 text-bloom-500 font-medium text-sm"
        >
          + 1
        </motion.button>
      )}
      {done && (
        <p className="text-center text-bloom-500 text-sm font-medium">✓ Goal reached!</p>
      )}
    </div>
  )
}

// ── Main Tile ─────────────────────────────────────────────────
export default function HabitTile({ habit, onEdit, onDelete }) {
  const { getLogForHabit, updateLog, streaks } = useAppStore()
  const log = getLogForHabit(habit.id)
  const streak = streaks[habit.id] || 0
  const done = log?.completed
  const [menuOpen, setMenuOpen] = useState(false)
  const longPressTimer = useRef(null)

  const handleComplete = useCallback(async (completed, value) => {
    haptic(completed ? [100, 50, 100] : 50)
    await updateLog(habit.id, { completed, value })
  }, [habit.id, updateLog])

  const handleLongPress = () => {
    haptic(50)
    setMenuOpen(true)
  }

  const onTouchStart = () => {
    longPressTimer.current = setTimeout(handleLongPress, 500)
  }
  const onTouchEnd = () => clearTimeout(longPressTimer.current)

  const progressValue = () => {
    if (!log) return 0
    if (habit.type === 'boolean') return done ? 1 : 0
    if (habit.type === 'timed') {
      const target = (habit.config?.duration_minutes || 30) * 60
      return Math.min((log.value || 0) / target, 1)
    }
    if (habit.type === 'quantity' || habit.type === 'count') {
      const goal = habit.config?.goal || 1
      return Math.min((log.value || 0) / goal, 1)
    }
    return 0
  }

  const tileContent = () => {
    switch (habit.type) {
      case 'boolean': return <BooleanTile habit={habit} log={log} onComplete={handleComplete} />
      case 'timed':   return <TimedTile habit={habit} log={log} onComplete={handleComplete} />
      case 'quantity': return <QuantityTile habit={habit} log={log} onComplete={handleComplete} />
      case 'count':   return <CountTile habit={habit} log={log} onComplete={handleComplete} />
      default: return null
    }
  }

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{
          opacity: 1,
          scale: done ? [1, 1.03, 1] : 1,
        }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchEnd}
        className={`relative rounded-3xl p-4 shadow-card overflow-hidden transition-all duration-500 flex flex-col h-full ${
          done
            ? 'bg-card-done shadow-bloom'
            : 'bg-card-gradient'
        }`}
      >
        {/* Glow overlay when done */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-radial-pink pointer-events-none rounded-3xl"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(249,168,192,0.18) 0%, transparent 70%)'
              }}
            />
          )}
        </AnimatePresence>

        {/* Header row */}
        <div className="flex items-start justify-between">
          {/* Emoji with progress ring */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <ProgressRing
              progress={progressValue()}
              size={48}
              strokeWidth={2.5}
              color={done ? '#E84A85' : '#F9A8C0'}
              bgColor={done ? '#FFCCD8' : '#FFE4EC'}
            />
            <span className="relative z-10 text-2xl leading-none">{habit.emoji}</span>
          </div>

          {/* Streak + menu */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">
              {streak > 0
                ? <span>🔥 {streak}</span>
                : <span className="text-gray-300">—</span>
              }
            </span>
            <button
              onClick={() => setMenuOpen(true)}
              className="w-6 h-6 flex items-center justify-center text-gray-300 hover:text-gray-500"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Name */}
        <p className="mt-3 font-medium text-gray-800 text-sm leading-tight">{habit.name}</p>

        {/* Streak label */}
        <p className="text-xs mt-0.5 text-gray-400">
          {streak > 0 ? `${streak} day streak` : 'Start your streak today'}
        </p>

        {/* Habit-specific UI — mt-auto pins it to the bottom so all tiles match height */}
        <div className="mt-auto">
          {tileContent()}
        </div>
      </motion.div>

      {/* Context menu — flex wrapper centres the panel without CSS-transform conflicts */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm"
            />
            <div className="fixed inset-0 z-[70] flex items-center justify-center px-8 pointer-events-none">
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="bg-white rounded-3xl shadow-bloom-lg overflow-hidden w-full max-w-xs pointer-events-auto"
              >
                <div className="p-4 border-b border-bloom-50">
                  <p className="text-center font-medium text-gray-700">{habit.emoji} {habit.name}</p>
                </div>
                {[
                  { label: 'Edit habit', icon: '✏️', action: () => { onEdit(habit); setMenuOpen(false) } },
                  { label: 'Archive',    icon: '📦', action: () => { onEdit({ ...habit, archived: true }); setMenuOpen(false) } },
                  { label: 'Delete',     icon: '🗑️', danger: true, action: () => { onDelete(habit); setMenuOpen(false) } },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors
                      ${item.danger ? 'text-rose-400 active:bg-rose-50' : 'text-gray-700 active:bg-bloom-50'}`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="w-full py-4 text-sm text-gray-400 border-t border-bloom-50"
                >
                  Cancel
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
