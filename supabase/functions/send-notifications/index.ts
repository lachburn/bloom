// Supabase Edge Function — sends daily push notifications
// Deploy with: supabase functions deploy send-notifications
// Schedule via Supabase Dashboard → Edge Functions → Cron (e.g. "0 * * * *" to check hourly)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') || 'mailto:hello@bloom.app'

Deno.serve(async () => {
  const nowUTC = new Date()
  const currentHour = nowUTC.getUTCHours()
  const currentMinute = nowUTC.getUTCMinutes()

  // Find users whose notification time matches current UTC hour
  // (In production, store timezone-aware times)
  const { data: users } = await supabase
    .from('users')
    .select('id, name, notification_time')
    .not('notification_time', 'is', null)

  const targets = (users ?? []).filter(u => {
    const [h, m] = (u.notification_time || '08:00').split(':').map(Number)
    return h === currentHour && Math.abs(m - currentMinute) < 5
  })

  let sent = 0
  for (const user of targets) {
    // Count incomplete habits for today
    const today = nowUTC.toISOString().split('T')[0]
    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', user.id)
      .eq('archived', false)

    const { data: completedLogs } = await supabase
      .from('habit_logs')
      .select('habit_id')
      .eq('user_id', user.id)
      .eq('date', today)
      .eq('completed', true)

    const total = habits?.length ?? 0
    const completed = completedLogs?.length ?? 0
    const remaining = total - completed

    if (remaining <= 0) continue

    // TODO: Look up push subscriptions stored per user and send via web-push
    // This requires a push_subscriptions table and web-push library
    console.log(`Would notify ${user.id}: ${remaining} habits remaining`)
    sent++
  }

  return new Response(JSON.stringify({ sent }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
