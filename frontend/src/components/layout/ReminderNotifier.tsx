import { useEffect, useRef, useState, useCallback } from 'react'
import { Bell, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import client from '@/api/client'
import { format } from 'date-fns'

interface DueReminder {
  id: string
  title: string
  reminder_type: string
  scheduled_at: string | null
}

interface Toast {
  id: string
  reminder: DueReminder
  dismissed: boolean
}

const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null

function playNotificationSound() {
  if (!audioCtx) return
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()
  osc.connect(gain)
  gain.connect(audioCtx.destination)

  gain.gain.setValueAtTime(0, audioCtx.currentTime)
  gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05)
  gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.5)

  osc.type = 'sine'
  osc.frequency.setValueAtTime(800, audioCtx.currentTime)
  osc.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + 0.1)
  osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.3)

  osc.start(audioCtx.currentTime)
  osc.stop(audioCtx.currentTime + 0.5)

  setTimeout(() => {
    const osc2 = audioCtx.createOscillator()
    const gain2 = audioCtx.createGain()
    osc2.connect(gain2)
    gain2.connect(audioCtx.destination)
    gain2.gain.setValueAtTime(0, audioCtx.currentTime)
    gain2.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05)
    gain2.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.4)
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1000, audioCtx.currentTime)
    osc2.start(audioCtx.currentTime)
    osc2.stop(audioCtx.currentTime + 0.4)
  }, 600)
}

function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

function showBrowserNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/vite.svg', tag: 'reminder' })
  }
}

export default function ReminderNotifier() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const seenRef = useRef<Set<string>>(new Set())
  const pollingRef = useRef<ReturnType<typeof setInterval>>()

  const poll = useCallback(async () => {
    try {
      const { data } = await client.get<DueReminder[]>('/reminders/', { params: { due: true } })
      if (!Array.isArray(data) || data.length === 0) return

      for (const r of data) {
        if (seenRef.current.has(r.id)) continue
        seenRef.current.add(r.id)

        const typeLabel = (r.reminder_type || '').replace('-', ' ').toUpperCase()
        playNotificationSound()
        showBrowserNotification(
          `Reminder: ${r.title}`,
          `${typeLabel}${r.scheduled_at ? ' — ' + format(new Date(r.scheduled_at), 'MMM d, h:mm a') : ''}`
        )

        setToasts(prev => [...prev.slice(-4), { id: r.id, reminder: r, dismissed: false }])
      }
    } catch {
      // Silently ignore polling errors
    }
  }, [])

  useEffect(() => {
    requestNotificationPermission()
    poll()
    pollingRef.current = setInterval(poll, 15_000)
    return () => clearInterval(pollingRef.current)
  }, [poll])

  const dismiss = (id: string) => {
    setToasts(prev => prev.map(t => (t.id === id ? { ...t, dismissed: true } : t)))
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.filter(t => !t.dismissed).map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="pointer-events-auto glass-card p-4 flex gap-3 items-start shadow-xl border border-amber-200 dark:border-amber-800"
          >
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
              <Bell size={18} className="text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{t.reminder.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {(t.reminder.reminder_type || '').replace('-', ' ')}
                {t.reminder.scheduled_at && ` — ${format(new Date(t.reminder.scheduled_at), 'MMM d, h:mm a')}`}
              </p>
            </div>
            <button onClick={() => dismiss(t.id)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
