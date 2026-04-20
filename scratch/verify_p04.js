const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function runVerification() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('Verifying P-04 prerequisites...\n');

  // Check columns exist by selecting them
  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select('id, is_first_login, welcome_email_sent')
    .limit(1);

  if (profileError) {
    if (profileError.message.includes('column')) {
      console.error('❌ Missing columns: is_first_login / welcome_email_sent');
      console.log('\n▶ Run this SQL in your Supabase SQL Editor:');
      console.log('-----------------------------------------------');
      console.log('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_first_login boolean NOT NULL DEFAULT true;');
      console.log('ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;');
      console.log('-----------------------------------------------\n');
    } else {
      console.log('ℹ Profile query info:', profileError.message);
    }
  } else {
    console.log('✅ Columns is_first_login and welcome_email_sent EXIST in profiles.');
  }

  // Seed + verify WELCOME10
  const { error: upsertError } = await supabase
    .from('discount_codes')
    .upsert({ code: 'WELCOME10', type: 'percent', value: 10, min_order: 0, max_uses: 9999, used_count: 0, is_active: true, expires_at: null }, { onConflict: 'code', ignoreDuplicates: true });

  if (upsertError) {
    console.warn('⚠ WELCOME10 upsert:', upsertError.message);
  }

  const { data: code } = await supabase
    .from('discount_codes')
    .select('code, value, is_active')
    .eq('code', 'WELCOME10')
    .maybeSingle();

  if (code) {
    console.log(`✅ WELCOME10 discount code: ${code.value}% off, active=${code.is_active}`);
  } else {
    console.log('⚠ WELCOME10 not found — run the migration SQL manually.');
  }
}

runVerification();
