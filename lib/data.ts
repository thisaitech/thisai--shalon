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
    tags: ['Indian Bridal', 'Groom Makeover', 'Unisex Styling'],
    rating: 4.9,
    startingPrice: 499,
    businessHours: defaultBusinessHours,
    services: [
      {
        id: 'bridal',
        name: 'Indian Bridal Couture',
        description: 'HD makeup, saree drape, jewelry set, touch-up kit.',
        price: 12999,
        duration: 180
      },
      {
        id: 'groom',
        name: 'Groom Makeover',
        description: 'Skin prep, haircut, beard sculpt, matte finish.',
        price: 3999,
        duration: 90
      },
      {
        id: 'reception',
        name: 'Reception Glam',
        description: 'Soft glam, contour, lashes, glossy waves.',
        price: 8999,
        duration: 120
      },
      {
        id: 'sangeet',
        name: 'Sangeet Night Styling',
        description: 'Long-wear glow, hair styling, dupatta set.',
        price: 6999,
        duration: 90
      },
      {
        id: 'party-makeup',
        name: 'Party Makeup',
        description: 'Statement eyes, luminous skin, styled hair.',
        price: 2999,
        duration: 75
      },
      {
        id: 'mehendi',
        name: 'Mehendi Art',
        description: 'Bridal and celebration designs.',
        price: 1999,
        duration: 60
      },
      {
        id: 'unisex-cut',
        name: 'Unisex Signature Cut',
        description: 'Precision cut, wash, and blow finish.',
        price: 499,
        duration: 50
      },
      {
        id: 'hairstyle',
        name: 'Hairstyle & Setting Spray',
        description: 'Bridal updo, curls, and long-hold finish.',
        price: 1499,
        duration: 60
      },
      {
        id: 'beard',
        name: 'Beard Sculpt & Grooming',
        description: 'Line-up, steam towel, conditioning.',
        price: 399,
        duration: 35
      },
      {
        id: 'hairspa',
        name: 'Ayurvedic Hair Spa',
        description: 'Scalp detox, oils, and steam therapy.',
        price: 1299,
        duration: 60
      },
      {
        id: 'smoothening',
        name: 'Keratin & Smoothening',
        description: 'Frizz control + silk finish.',
        price: 4999,
        duration: 120
      },
      {
        id: 'skin',
        name: 'Radiance Facial',
        description: 'Brightening ritual + hydration veil.',
        price: 999,
        duration: 60
      },
      {
        id: 'nails',
        name: 'Nail Art & Gel',
        description: 'Custom art, shaping, and gloss finish.',
        price: 799,
        duration: 50
      }
    ]
  }
];
