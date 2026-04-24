import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async (e) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Please enter your email address')
      return
    }
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bloom-gradient flex flex-col items-center justify-center px-6 py-12">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-bloom-200 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-lavender-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bloom-100 rounded-full opacity-40 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              {/* Icon */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="mb-8"
              >
                <div className="w-24 h-24 bg-white rounded-3xl shadow-bloom flex items-center justify-center text-5xl">
                  🌸
                </div>
              </motion.div>

              {/* Title */}
              <h1 className="font-display text-5xl font-bold text-gray-800 mb-2 text-center">
                Bloom
              </h1>
              <p className="text-gray-400 text-lg mb-12 text-center font-light tracking-wide">
                Your daily bloom
              </p>

              {/* Form */}
              <form onSubmit={handleSend} className="w-full space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError('') }}
                    placeholder="your@email.com"
                    className="input-base text-center text-base"
                    autoComplete="email"
                    autoCapitalize="none"
                  />
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-rose-400 text-sm mt-2 text-center"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileTap={{ scale: 0.97 }}
                  className="w-full btn-primary py-4 text-base font-medium disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Spinner /> Sending…
                    </span>
                  ) : (
                    '✨ Send magic link'
                  )}
                </motion.button>
              </form>

              <p className="text-gray-400 text-xs mt-8 text-center leading-relaxed">
                We'll send a magic link to your email.<br />
                No password needed.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
                className="w-24 h-24 bg-white rounded-3xl shadow-bloom flex items-center justify-center text-5xl mb-8"
              >
                💌
              </motion.div>
              <h2 className="font-display text-3xl font-bold text-gray-800 mb-3">
                Check your inbox
              </h2>
              <p className="text-gray-400 text-base leading-relaxed mb-8">
                We sent a magic link to<br />
                <span className="text-bloom-500 font-medium">{email}</span>
              </p>
              <button
                onClick={() => setSent(false)}
                className="text-sm text-gray-400 underline underline-offset-2"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}
