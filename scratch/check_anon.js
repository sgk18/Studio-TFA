const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkAnonAccess() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('Testing Anon Access...');
  console.log('URL:', supabaseUrl);
  console.log('Key (prefix):', anonKey.substring(0, 15));

  const supabase = createClient(supabaseUrl, anonKey);

  const { data, error } = await supabase
    .from('products')
    .select('*');

  if (error) {
    console.error('Anon Fetch Error:', error.message, error.details, error.hint);
  } else {
    console.log('Anon Fetch Success! Rows:', data.length);
  }
}

checkAnonAccess();
