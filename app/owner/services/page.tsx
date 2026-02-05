import OwnerSubnav from '@/components/layout/OwnerSubnav';

const services = [
  { name: 'Precision Cut', price: '$55', duration: '45 min' },
  { name: 'Texture Reset', price: '$95', duration: '75 min' },
  { name: 'Glow Facial', price: '$120', duration: '60 min' }
];

export default function OwnerServicesPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Services</p>
        <h1 className="text-3xl font-display text-primary">Menu & pricing</h1>
      </div>

      <OwnerSubnav />

      <div className="glass rounded-2xl p-6 space-y-4">
        {services.map((service) => (
          <div key={service.name} className="card-surface p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-primary">{service.name}</p>
              <p className="text-sm text-charcoal/70">{service.duration}</p>
            </div>
            <span className="pill bg-accent/30 text-primary">{service.price}</span>
          </div>
        ))}
        <button className="pill bg-white/90 text-primary w-full">Add new service</button>
      </div>
    </div>
  );
}
