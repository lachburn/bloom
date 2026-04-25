import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState('email') // 'email' | 'otp'
  const [error, setError] = useState('')

  const handleSendCode = async (e) => {
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
        options: { shouldCreateUser: true },
      })
      if (error) throw error
      setStep('otp')
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
          {step === 'email' ? (
            <EmailStep
              key="email"
              email={email}
              setEmail={setEmail}
              loading={loading}
              error={error}
              setError={setError}
              onSubmit={handleSendCode}
            />
          ) : (
            <OtpStep
              key="otp"
              email={email}
              onBack={() => { setStep('email'); setError('') }}
              onResend={handleSendCode}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Step 1: Email ─────────────────────────────────────────────
function EmailStep({ email, setEmail, loading, error, setError, onSubmit }) {
  return (
    <motion.div
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

      <h1 className="font-display text-5xl font-bold text-gray-800 mb-2 text-center">Bloom</h1>
      <p className="text-gray-400 text-lg mb-12 text-center font-light tracking-wide">
        Your daily bloom
      </p>

      <form onSubmit={onSubmit} className="w-full space-y-4">
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
              <Spinner /> Sending code…
            </span>
          ) : (
            '✨ Send code'
          )}
        </motion.button>
      </form>

      <p className="text-gray-400 text-xs mt-8 text-center leading-relaxed">
        We'll email you a 6-digit code.<br />
        No password needed.
      </p>
    </motion.div>
  )
}

// ── Step 2: 6-digit OTP ───────────────────────────────────────
function OtpStep({ email, onBack, onResend }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRefs = useRef([])

  useEffect(() => {
    // Auto-focus first input
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index, value) => {
    // Strip non-digits, allow paste of full code
    const digits = value.replace(/\D/g, '')

    if (digits.length > 1) {
      // Handle paste of full code
      const newCode = [...code]
      for (let i = 0; i < 6; i++) {
        newCode[i] = digits[i] || ''
      }
      setCode(newCode)
      setError('')
      // Focus last filled or next empty
      const lastFilled = Math.min(digits.length - 1, 5)
      inputRefs.current[lastFilled]?.focus()
      if (digits.length === 6) verifyCode(digits)
      return
    }

    const newCode = [...code]
    newCode[index] = digits
    setCode(newCode)
    setError('')

    if (digits && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    const full = newCode.join('')
    if (full.length === 6) verifyCode(full)
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verifyCode = async (token) => {
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      })
      if (error) throw error
      // Auth state change will handle redirect via App.jsx
    } catch (err) {
      setError(err.message || 'Invalid code. Please try again.')
      setCode(['', '', '', '', '', ''])
      setLoading(false)
      inputRefs.current[0]?.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const full = code.join('')
    if (full.length < 6) {
      setError('Please enter all 6 digits')
      return
    }
    verifyCode(full)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-24 h-24 bg-white rounded-3xl shadow-bloom flex items-center justify-center text-5xl mb-8"
      >
        💌
      </motion.div>

      <h2 className="font-display text-3xl font-bold text-gray-800 mb-2 text-center">
        Check your email
      </h2>
      <p className="text-gray-400 text-sm mb-8 text-center leading-relaxed">
        We sent a 6-digit code to<br />
        <span className="text-bloom-500 font-medium">{email}</span>
      </p>

      <form onSubmit={handleSubmit} className="w-full">
        {/* Code inputs */}
        <div className="flex gap-2 justify-center mb-4">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-11 h-14 text-center text-xl font-bold rounded-2xl border-2 outline-none transition-all duration-200
                bg-bloom-50 text-gray-800
                ${digit
                  ? 'border-bloom-300 bg-white shadow-bloom-sm'
                  : 'border-transparent'
                }
                focus:border-bloom-400 focus:bg-white focus:shadow-bloom-sm`}
            />
          ))}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-rose-400 text-sm mb-4 text-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <motion.button
          type="submit"
          disabled={loading || code.join('').length < 6}
          whileTap={{ scale: 0.97 }}
          className="w-full btn-primary py-4 text-base font-medium disabled:opacity-50 mb-4"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner /> Verifying…
            </span>
          ) : (
            'Verify code'
          )}
        </motion.button>
      </form>

      <div className="flex items-center gap-4 text-sm">
        <button
          onClick={onBack}
          className="text-gray-400 underline underline-offset-2"
        >
          Change email
        </button>
        <span className="text-gray-200">•</span>
        <button
          onClick={onResend}
          className="text-bloom-400 underline underline-offset-2"
        >
          Resend code
        </button>
      </div>
    </motion.div>
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
