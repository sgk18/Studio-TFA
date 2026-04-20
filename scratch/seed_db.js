const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function seedProducts() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables.');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const products = [
    {
      id: '919f0775-8025-46fd-94eb-73d8a149c45e',
      title: 'The Quiet Morning',
      category: 'Art Prints',
      description: 'A serene morning landscape.',
      story: 'Imagine waking up to the soft rays of the sun hitting the dew on the grass.',
      image_url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&q=80&w=2070',
      price: 2499,
      stock: 10,
      is_active: true,
      is_archived: false,
      metadata: {}
    },
    {
      id: 'a0602e5f-24bc-4fe4-b9f7-30184bcfc21f',
      title: 'Sacred Presence',
      category: 'Home Decor',
      description: 'A minimal wooden cross.',
      story: 'Crafted from reclaimed teak wood, this piece anchors your space in truth.',
      image_url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=2070',
      price: 4999,
      stock: 5,
      is_active: true,
      is_archived: false,
      metadata: {}
    },
    {
       id: 'e184de52-35fc-4f2e-b08d-f4c982cd1e2a',
       title: 'Digital Gratitude Journal',
       category: 'Digital',
       description: 'A 30-day guided journal.',
       story: 'Interactive PDF designed for iPad or printing.',
       image_url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=2070',
       price: 999,
       stock: 0, // Testing Out of Stock
       is_active: true,
       is_archived: false,
       metadata: {}
    }
  ];

  const { error } = await supabase.from('products').upsert(products);

  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Successfully seeded 3 products.');
  }
}

seedProducts();
