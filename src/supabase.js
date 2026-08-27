import { createClient } from '@supabase/supabase-js'

const URL = import.meta.env.VITE_SUPABASE_URL  || 'https://snjshukjuxgcfsncpjbi.supabase.co'
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bFtCIzCfVuuSOhEudS4x1Q_PhvPD1H2'

export const supabase = createClient(URL, KEY)
