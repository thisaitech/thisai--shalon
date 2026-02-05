import { defaultBusinessHours } from '@/lib/utils';

export type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
};

export type Salon = {
  id: string;
  name: string;
  location: string;
  distance: string;
  image: string;
  tags: string[];
  rating: number;
  startingPrice: number;
  businessHours: typeof defaultBusinessHours;
  services: Service[];
};

export const salons: Salon[] = [
  {
    id: 'lumiere-unisex',
    name: 'Lumiére Unisex Studio',
    location: 'Southall, London',
    distance: '0.2 mi',
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1600&q=80',
    tags: ['Indian Bridal', 'Unisex Styling', 'Beauty Rituals'],
    rating: 4.9,
    startingPrice: 35,
    businessHours: defaultBusinessHours,
    services: [
      {
        id: 'bridal',
        name: 'Indian Bridal Glam',
        description: 'HD makeup, draping, jewelry set + touch-up kit.',
        price: 220,
        duration: 150
      },
      {
        id: 'sangeet',
        name: 'Sangeet Night Styling',
        description: 'Soft glam, waves, and long-wear finish.',
        price: 140,
        duration: 90
      },
      {
        id: 'mehendi',
        name: 'Mehendi Art',
        description: 'Intricate bridal & party designs.',
        price: 75,
        duration: 60
      },
      {
        id: 'unisex-cut',
        name: 'Unisex Precision Cut',
        description: 'Texture-focused cut + styling.',
        price: 45,
        duration: 45
      },
      {
        id: 'beard',
        name: 'Groom Beard Sculpt',
        description: 'Line-up, steam, and conditioning.',
        price: 35,
        duration: 30
      },
      {
        id: 'hairspa',
        name: 'Ayurvedic Hair Spa',
        description: 'Herbal cleanse and scalp therapy.',
        price: 65,
        duration: 60
      },
      {
        id: 'skin',
        name: 'Radiance Facial',
        description: 'Brightening ritual + hydration veil.',
        price: 80,
        duration: 60
      },
      {
        id: 'nails',
        name: 'Nail Art & Gel',
        description: 'Custom art, shaping, and gloss finish.',
        price: 55,
        duration: 50
      }
    ]
  }
];
