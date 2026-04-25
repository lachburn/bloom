import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import useAppStore from '../store/useAppStore'
import HabitTile from '../components/habits/HabitTile'
import HabitForm from '../components/habits/HabitForm'
import BottomSheet from '../components/ui/BottomSheet'
import SkeletonCard from '../components/ui/SkeletonCard'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Dashboard() {
  const { profile, habits, habitsLoading, loadHabits, loadTodayLogs, loadStreaks, logs, removeHabit, editHabit } = useAppStore()
  const [addOpen, setAddOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  useEffect(() => {
    loadHabits().then(() => {
      loadTodayLogs()
      loadStreaks()
    })
  }, [])

  const completedToday = logs.filter(l => l.completed).length
  const totalHabits = habits.length
  const today = format(new Date(), 'EEEE, MMMM d')

  const confirmDelete = async () => {
    if (deleteTarget) {
      await removeHabit(deleteTarget.id)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bloom-50 via-white to-white">

      {/* Sticky header — owns the safe-area-top padding so it fills the status bar */}
      <div
        className="sticky top-0 z-20 px-5 pb-4 bg-gradient-to-b from-bloom-100 to-bloom-50/80 backdrop-blur-md"
        style={{ paddingTop: 'max(env(safe-area-inset-top), 16px)' }}
      >
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-display text-3xl font-bold text-gray-800">
            {getGreeting()}{profile?.name ? `, ${profile.name}` : ''} 🌸
          </h1>
          <p className="text-gray-400 text-sm mt-1">{today}</p>
        </motion.div>

        {/* Summary pill */}
        {totalHabits > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="mt-3 inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow-bloom-sm"
          >
            <span className="text-bloom-400 text-sm">✨</span>
            <span className="text-sm font-medium text-gray-700">
              {completedToday} of {totalHabits} habits done today
            </span>
            {completedToday === totalHabits && totalHabits > 0 && (
              <span className="text-sm">🎉</span>
            )}
          </motion.div>
        )}
      </div>

      {/* Habits grid — pb large enough to clear nav bar + FAB */}
      <div className="px-5 pt-4 pb-40">
        {habitsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : habits.length === 0 ? (
          <EmptyState onAdd={() => setAddOpen(true)} />
        ) : (
          <motion.div
            className="grid grid-cols-2 gap-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.07 } }
            }}
          >
            <AnimatePresence>
              {habits.map(habit => (
                <motion.div
                  key={habit.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
                  }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <HabitTile
                    habit={habit}
                    onEdit={h => {
                      if (h.archived) {
                        editHabit(h.id, { archived: true })
                      } else {
                        setEditingHabit(h)
                      }
                    }}
                    onDelete={h => setDeleteTarget(h)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* FAB — positioned above the nav bar, accounting for safe area */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setAddOpen(true)}
        className="fixed right-5 w-14 h-14 bg-button-gradient rounded-full shadow-bloom-lg
          flex items-center justify-center text-white z-40"
        style={{
          bottom: 'calc(env(safe-area-inset-bottom) + 80px)',
          boxShadow: '0 8px 32px rgba(232, 74, 133, 0.4)',
        }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </motion.button>

      {/* Add habit sheet */}
      <BottomSheet open={addOpen} onClose={() => setAddOpen(false)} title="New habit" tall>
        <HabitForm onClose={() => setAddOpen(false)} />
      </BottomSheet>

      {/* Edit habit sheet */}
      <BottomSheet open={!!editingHabit} onClose={() => setEditingHabit(null)} title="Edit habit" tall>
        {editingHabit && <HabitForm habit={editingHabit} onClose={() => setEditingHabit(null)} />}
      </BottomSheet>

      {/* Delete confirmation */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                bg-white rounded-3xl p-6 shadow-bloom-lg w-72 text-center"
            >
              <div className="text-4xl mb-3">{deleteTarget.emoji}</div>
              <h3 className="font-display font-semibold text-gray-800 text-lg mb-1">Delete habit?</h3>
              <p className="text-gray-400 text-sm mb-6">
                "{deleteTarget.name}" and all its history will be permanently removed.
              </p>
              <div className="space-y-2">
                <button
                  onClick={confirmDelete}
                  className="w-full py-3 rounded-2xl bg-rose-400 text-white font-medium text-sm"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="w-full py-3 rounded-2xl bg-bloom-50 text-gray-600 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col items-center justify-center pt-16 pb-8 text-center"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="text-7xl mb-6"
      >
        🌱
      </motion.div>
      <h2 className="font-display text-2xl font-semibold text-gray-700 mb-2">
        Your garden awaits
      </h2>
      <p className="text-gray-400 text-sm max-w-xs leading-relaxed mb-8">
        Add your first habit and start building the life you want, one day at a time.
      </p>
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onAdd}
        className="btn-primary px-8 py-3.5"
      >
        Add your first habit 🌸
      </motion.button>
    </motion.div>
  )
}
