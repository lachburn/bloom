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

export default function HabitForm({ habit, onClose }) {
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

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
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
    }
  }

  const setConfigField = (key, val) => setConfig(c => ({ ...c, [key]: val }))

  return (
    // Outer wrapper fills the sheet and uses flex so save button can stick to bottom
    <div className="flex flex-col min-h-0">

      {/* Scrollable form fields */}
      <div className="space-y-6 pb-2">

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

      </div>{/* end scrollable fields */}

      {/* Save error */}
      <AnimatePresence>
        {saveError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3"
          >
            <p className="text-rose-400 text-sm text-center bg-rose-50 rounded-2xl py-3 px-4">
              {saveError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button — sticky so it's always visible at the bottom */}
      <div className="sticky bottom-0 bg-white pt-4 pb-2 mt-4">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary py-4 text-base disabled:opacity-60"
        >
          {saving ? 'Saving…' : isEdit ? 'Save changes' : '🌸 Add habit'}
        </motion.button>
      </div>

    </div>
  )
}
