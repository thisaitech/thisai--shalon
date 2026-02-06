import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MapPin, MessageCircle, Phone, Share2 } from 'lucide-react';
import BookingFlow from '@/components/salon/BookingFlow';
import Carousel from '@/components/ui/carousel';
import Badge from '@/components/ui/badge';
import { salons } from '@/lib/data';

export default function SalonDetailPage({ params }: { params: { id: string } }) {
  const salon = salons.find((item) => item.id === params.id);
  if (!salon) return notFound();

  const gallery = [
    salon.image,
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1400&q=80'
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
      <div className="flex items-center justify-between">
        <Link href="/salons" className="inline-flex items-center gap-2 text-sm text-primary focus-ring rounded-md px-1">
          <ArrowLeft size={16} /> Back to services
        </Link>
        <button className="h-9 w-9 rounded-full bg-white/80 shadow-soft flex items-center justify-center">
          <Share2 size={16} className="text-primary" />
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <Carousel className="rounded-3xl">
            {gallery.map((image) => (
              <div key={image} className="relative h-80 w-full overflow-hidden rounded-3xl">
                <Image
                  src={image}
                  alt={salon.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 60vw"
                />
              </div>
            ))}
          </Carousel>

          <div className="space-y-3">
            <h1 className="text-3xl font-display text-primary">{salon.name}</h1>
            <p className="text-sm text-charcoal/70 flex items-center gap-2">
              <MapPin size={16} className="text-primary" />
              {salon.location} · {salon.distance} away
            </p>
            <div className="flex flex-wrap gap-2">
              {salon.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Call', icon: Phone },
              { label: 'Message', icon: MessageCircle },
              { label: 'Directions', icon: MapPin },
              { label: 'Share', icon: Share2 }
            ].map(({ label, icon: Icon }) => (
              <button
                key={label}
                className="card-spotlight px-3 py-4 flex flex-col items-center gap-2 text-sm"
              >
                <Icon size={18} className="text-primary" />
                {label}
              </button>
            ))}
          </div>

          <div className="card-surface p-6 space-y-3">
            <h2 className="font-display text-lg text-primary">Our recent work</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {gallery.map((image) => (
                <div key={image} className="relative h-28 w-44 shrink-0 overflow-hidden rounded-2xl">
                  <Image src={image} alt="Recent work" fill className="object-cover" sizes="176px" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-display text-primary">Book appointment</h2>
            <Badge className="bg-primary/15 text-primary">Instant</Badge>
          </div>
          <BookingFlow salon={salon} />
        </div>
      </div>
    </div>
  );
}
