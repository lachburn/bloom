import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import EmojiPicker from './EmojiPicker'
import useAppStore from '../../store/useAppStore'

const TYPES = [
  { id: 'boolean',  label: 'Yes / No',  desc: 'Simple daily checkbox',   emoji: '✅' },
  { id: 'timed',    label: 'Timed',     desc: 'Count down a duration',   emoji: '⏱️' },
  { id: 'quantity', label: 'Quantity',  desc: 'Track volume or amount',  emoji: '💧' },
  { id: 'count',    label: 'Count',     desc: 'Increment toward a goal', emoji: '🔢' },
]

// formId lets the parent render a <button type="submit" form={formId}> anywhere in the tree
export const HABIT_FORM_ID = 'habit-form'

export default function HabitForm({ habit, onClose, onSavingChange }) {
  const { addHabit, editHabit, loadStreaks, loadHabits } = useAppStore()
  const isEdit = !!habit?.id

  const [name, setName] = useState(habit?.name || '')
  const [emoji, setEmoji] = useState(habit?.emoji || '🌸')
  const [type, setType] = useState(habit?.type || 'boolean')
  const [config, setConfig] = useState(habit?.config || {})
  const [showEmoji, setShowEmoji] = useState(false)
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [saveError, setSaveError] = useState('')

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Give your habit a name'
    if (type === 'timed' && !config.duration_minutes) e.duration = 'Set a duration'
    if (type === 'quantity' && !config.goal) e.goal = 'Set a goal'
    if (type === 'count' && !config.goal) e.goal = 'Set a goal'
    setFieldErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    onSavingChange?.(true)
    setSaveError('')
    try {
      if (isEdit) {
        await editHabit(habit.id, { name, emoji, type, config })
      } else {
        await addHabit({ name, emoji, type, config })
      }
      await loadHabits()
      await loadStreaks()
      onClose()
    } catch (err) {
      console.error('Save habit error:', err)
      setSaveError(err?.message || 'Could not save habit. Please try again.')
    } finally {
      setSaving(false)
      onSavingChange?.(false)
    }
  }

  const setConfigField = (key, val) => setConfig(c => ({ ...c, [key]: val }))

  return (
    // form element — the save button lives OUTSIDE this form in the BottomSheet footer
    // and targets it via form={HABIT_FORM_ID}
    <form id={HABIT_FORM_ID} onSubmit={handleSubmit} className="space-y-6 pb-2">

      {/* Name + emoji */}
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
          Habit name
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowEmoji(v => !v)}
            className="w-12 h-12 rounded-2xl bg-bloom-50 flex items-center justify-center text-2xl flex-shrink-0 active:scale-95 transition-transform"
          >
            {emoji}
          </button>
          <input
            value={name}
            onChange={e => { setName(e.target.value); setFieldErrors(v => ({ ...v, name: '' })) }}
            placeholder="e.g. Morning meditation"
            className="input-base flex-1"
          />
        </div>
        {fieldErrors.name && (
          <p className="text-rose-300 text-xs mt-1.5">{fieldErrors.name}</p>
        )}
      </div>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <EmojiPicker value={emoji} onChange={v => { setEmoji(v); setShowEmoji(false) }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Type selector — only shown on create */}
      {!isEdit && (
        <div>
          <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2 block">
            Habit type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setType(t.id); setFieldErrors(v => ({ ...v, goal: '', duration: '' })) }}
                className={`p-3 rounded-2xl text-left transition-all duration-150 ${
                  type === t.id
                    ? 'bg-bloom-100 border-2 border-bloom-300 shadow-bloom-sm'
                    : 'bg-bloom-50 border-2 border-transparent'
                }`}
              >
                <div className="text-xl mb-1">{t.emoji}</div>
                <div className="text-xs font-semibold text-gray-700">{t.label}</div>
                <div className="text-xs text-gray-400">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Type-specific config */}
      <AnimatePresence mode="wait">
        {type === 'timed' && (
          <motion.div key="timed" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={config.duration_minutes || ''}
              onChange={e => setConfigField('duration_minutes', parseInt(e.target.value) || '')}
              placeholder="30"
              min="1"
              className="input-base"
            />
            {fieldErrors.duration && <p className="text-rose-300 text-xs mt-1">{fieldErrors.duration}</p>}
          </motion.div>
        )}

        {type === 'quantity' && (
          <motion.div key="quantity" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Goal</label>
                <input type="number" value={config.goal || ''} onChange={e => setConfigField('goal', parseInt(e.target.value) || '')} placeholder="2000" className="input-base" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Unit</label>
                <input type="text" value={config.unit || ''} onChange={e => setConfigField('unit', e.target.value)} placeholder="ml" className="input-base" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Increment per tap</label>
              <input type="number" value={config.increment || ''} onChange={e => setConfigField('increment', parseInt(e.target.value) || '')} placeholder="250" className="input-base" />
            </div>
            {fieldErrors.goal && <p className="text-rose-300 text-xs mt-1">{fieldErrors.goal}</p>}
          </motion.div>
        )}

        {type === 'count' && (
          <motion.div key="count" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Goal</label>
                <input type="number" value={config.goal || ''} onChange={e => setConfigField('goal', parseInt(e.target.value) || '')} placeholder="10000" className="input-base" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5 block">Unit</label>
                <input type="text" value={config.unit || ''} onChange={e => setConfigField('unit', e.target.value)} placeholder="steps" className="input-base" />
              </div>
            </div>
            {fieldErrors.goal && <p className="text-rose-300 text-xs mt-1">{fieldErrors.goal}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline save error (stays inside scrollable area) */}
      <AnimatePresence>
        {saveError && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="text-rose-400 text-sm text-center bg-rose-50 rounded-2xl py-3 px-4"
          >
            {saveError}
          </motion.p>
        )}
      </AnimatePresence>

    </form>
  )
}
