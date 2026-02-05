'use client';

import { Disclosure } from '@headlessui/react';
import { ChevronDown, Mail, MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I reschedule an appointment?',
    answer: 'Open My Appointments, choose your booking, and select “Reschedule”.'
  },
  {
    question: 'Can I book multiple services together?',
    answer: 'Yes. Book your first service and add an add-on from the confirmation panel.'
  },
  {
    question: 'Do you support all hair textures?',
    answer: 'Absolutely. Our studios are vetted for inclusive, unisex services.'
  }
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Help</p>
        <h1 className="text-3xl font-display text-primary">We’re here for you</h1>
        <p className="mt-2 text-sm text-charcoal/70">
          Find quick answers or reach out for support.
        </p>
      </div>

      <div className="glass rounded-2xl p-6 space-y-4">
        {faqs.map((faq) => (
          <Disclosure key={faq.question}>
            {({ open }) => (
              <div className="rounded-2xl border border-white/60 bg-white/80 p-4">
                <Disclosure.Button className="w-full flex items-center justify-between text-left focus-ring rounded-2xl">
                  <span className="font-medium text-primary">{faq.question}</span>
                  <ChevronDown className={`transition-transform ${open ? 'rotate-180' : ''}`} size={18} />
                </Disclosure.Button>
                <Disclosure.Panel className="mt-3 text-sm text-charcoal/70">
                  {faq.answer}
                </Disclosure.Panel>
              </div>
            )}
          </Disclosure>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card-surface p-6 space-y-2">
          <MessageCircle className="text-primary" size={20} />
          <p className="font-medium text-primary">Chat with us</p>
          <p className="text-sm text-charcoal/70">Available 9am - 8pm EST</p>
        </div>
        <div className="card-surface p-6 space-y-2">
          <Mail className="text-primary" size={20} />
          <p className="font-medium text-primary">Email support</p>
          <p className="text-sm text-charcoal/70">support@lumiere.studio</p>
        </div>
      </div>
    </div>
  );
}
