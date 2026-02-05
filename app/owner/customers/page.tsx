import OwnerSubnav from '@/components/layout/OwnerSubnav';

const customers = [
  { name: 'Jordan Lee', visits: 6, last: 'Feb 1' },
  { name: 'Alex Kim', visits: 3, last: 'Jan 28' },
  { name: 'Sam Rivera', visits: 4, last: 'Jan 22' }
];

export default function OwnerCustomersPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Customers</p>
        <h1 className="text-3xl font-display text-primary">Client history</h1>
      </div>

      <OwnerSubnav />

      <div className="glass rounded-2xl p-6">
        <div className="grid grid-cols-3 text-xs uppercase tracking-[0.3em] text-charcoal/50">
          <span>Name</span>
          <span>Visits</span>
          <span>Last booking</span>
        </div>
        <div className="mt-4 space-y-3">
          {customers.map((customer) => (
            <div key={customer.name} className="card-surface p-4 grid grid-cols-3 text-sm">
              <span className="font-medium text-primary">{customer.name}</span>
              <span>{customer.visits}</span>
              <span>{customer.last}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
