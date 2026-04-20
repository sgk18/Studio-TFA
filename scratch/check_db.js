const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkProducts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log('Product Count:', count);
  if (data && data.length > 0) {
    console.log('Sample Product columns:', Object.keys(data[0]));
    console.log('Sample Product ID:', data[0].id);
    console.log('Sample Product Active Status:', data[0].is_active);
  } else {
    console.log('No products found in the database.');
  }
}

checkProducts();
