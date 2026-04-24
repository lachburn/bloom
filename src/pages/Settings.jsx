import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useAppStore from '../store/useAppStore'

export default function Settings() {
  const { profile, updateProfile, signOut } = useAppStore()
  const [name, setName] = useState(profile?.name || '')
  const [notifTime, setNotifTime] = useState(profile?.notification_time?.slice(0, 5) || '08:00')
  const [waterGoal, setWaterGoal] = useState(profile?.water_goal || 2000)
  const [waterIncrement, setWaterIncrement] = useState(profile?.water_increment || 250)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setNotifTime(profile.notification_time?.slice(0, 5) || '08:00')
      setWaterGoal(profile.water_goal || 2000)
      setWaterIncrement(profile.water_increment || 250)
    }
  }, [profile])

  useEffect(() => {
    setNotifEnabled(Notification?.permission === 'granted')
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await updateProfile({
      name,
      notification_time: notifTime,
      water_goal: parseInt(waterGoal),
      water_increment: parseInt(waterIncrement),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const requestNotifications = async () => {
    if (!('Notification' in window)) return
    const permission = await Notification.requestPermission()
    setNotifEnabled(permission === 'granted')
    if (permission === 'granted') {
      // Register push subscription here (requires VAPID key from env)
      try {
        const reg = await navigator.serviceWorker.ready
        // Subscribe to push (VAPID key needed from Supabase/Edge Function)
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
        if (vapidKey) {
          await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          })
        }
      } catch (e) {
        console.warn('Push subscription failed:', e)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bloom-50 via-white to-white">
      <div className="px-5 pt-14 pb-32">
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">Settings</h1>

        {/* Profile */}
        <Section title="Profile" icon="👤">
          <Field label="Display name">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="input-base"
            />
          </Field>
          <Field label="Email">
            <input
              value={profile?.email || ''}
              readOnly
              className="input-base opacity-60 cursor-not-allowed"
            />
          </Field>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon="🔔">
          {!notifEnabled ? (
            <div className="bg-bloom-50 rounded-2xl p-4">
              <p className="text-sm text-gray-600 mb-3">
                Enable daily reminders to stay on top of your habits.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={requestNotifications}
                className="btn-primary text-sm py-2.5 px-5"
              >
                Enable notifications
              </motion.button>
            </div>
          ) : (
            <Field label="Daily reminder time">
              <input
                type="time"
                value={notifTime}
                onChange={e => setNotifTime(e.target.value)}
                className="input-base"
              />
            </Field>
          )}
        </Section>

        {/* Water tracker defaults */}
        <Section title="Water tracker defaults" icon="💧">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Daily goal (ml)">
              <input
                type="number"
                value={waterGoal}
                onChange={e => setWaterGoal(e.target.value)}
                className="input-base"
              />
            </Field>
            <Field label="Increment (ml)">
              <input
                type="number"
                value={waterIncrement}
                onChange={e => setWaterIncrement(e.target.value)}
                className="input-base"
              />
            </Field>
          </div>
        </Section>

        {/* Save button */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary py-4 text-base mt-2 disabled:opacity-60"
        >
          {saved ? '✓ Saved!' : saving ? 'Saving…' : 'Save settings'}
        </motion.button>

        {/* Sign out */}
        <Section title="Account" icon="🔐">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={signOut}
            className="w-full py-3.5 rounded-2xl bg-bloom-50 text-gray-600 font-medium text-sm"
          >
            Sign out
          </motion.button>
        </Section>

        {/* App info */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-300">Bloom v1.0 • Made with 🌸</p>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-base">{icon}</span>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="bg-white rounded-3xl p-5 shadow-bloom-sm space-y-4">
        {children}
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1.5 block">{label}</label>
      {children}
    </div>
  )
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
