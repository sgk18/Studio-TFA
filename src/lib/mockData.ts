export interface Product {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  story: string;
  inspiration: string;
}

export const products: Product[] = [
  {
    id: "1",
    title: "The Quiet Morning",
    price: 120,
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "art",
    story: "A reflection on the stillness before dawn. This piece was created during a season of profound silence, an attempt to capture the peace that passes all understanding.",
    inspiration: "Psalm 46:10 - 'Be still, and know that I am God.'"
  },
  {
    id: "2",
    title: "Rooted",
    price: 85,
    image: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "home",
    story: "Handcrafted from fallen oak, this vessel serves as a reminder that true growth happens deep beneath the surface.",
    inspiration: "Jeremiah 17:8 - 'They will be like a tree planted by the water...'"
  },
  {
    id: "3",
    title: "Light Dawns",
    price: 150,
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "art",
    story: "Abstract strokes of gold over deep crimson, evoking the feeling of first light piercing through an elongated darkness.",
    inspiration: "John 1:5 - 'The light shines in the darkness, and the darkness has not overcome it.'"
  },
  {
    id: "4",
    title: "Abundance Bowl",
    price: 65,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    category: "home",
    story: "A beautifully imperfect ceramic bowl formed on an ancient wheel. It is left intentionally uneven at the rim to symbolise the overflowing grace in our everyday lives.",
    inspiration: "Psalm 23:5 - 'My cup overflows.'"
  }
];

export const categories = [
  { id: "art", name: "Art", description: "Visual expressions of faith and inner healing." },
  { id: "home", name: "Home", description: "Intentional objects to anchor your space in peace." }
];
