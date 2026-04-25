import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function BottomSheet({ open, onClose, title, children, footer, tall = false }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          />

          {/* Sheet — z-[70] so it always sits above the z-50 bottom nav */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 400 }}
            className={`fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[2rem] shadow-bloom-lg
              ${tall ? 'max-h-[92vh]' : 'max-h-[80vh]'} overflow-hidden flex flex-col`}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-6 pb-4 flex-shrink-0">
                <h2 className="font-display text-xl font-semibold text-gray-800">{title}</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-bloom-50 flex items-center justify-center text-gray-400"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Scrollable content */}
            <div className="overflow-y-auto flex-1 px-6 pb-4">
              {children}
            </div>

            {/* Footer — always visible above home indicator, never scrolls away */}
            {footer && (
              <div
                className="flex-shrink-0 px-6 pt-3 bg-white border-t border-bloom-50"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}
              >
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
