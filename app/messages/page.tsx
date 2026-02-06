'use client';

import { useState } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';

const threads = [
  {
    id: 'bridal',
    name: 'Bridal Concierge',
    preview: 'Your draping artist is available at 5:00 PM.',
    time: '2m'
  },
  {
    id: 'groom',
    name: 'Groom Studio',
    preview: 'Would you like the beard sculpt add-on?',
    time: '1h'
  },
  {
    id: 'spa',
    name: 'Hair & Spa',
    preview: 'We prepped your hair spa oils based on your notes.',
    time: '1d'
  }
];

const messages = [
  { id: 1, from: 'studio', text: 'Welcome! How can we make your glow-up perfect?' },
  { id: 2, from: 'user', text: 'Can you reserve a bridal trial for Saturday evening?' },
  { id: 3, from: 'studio', text: 'Absolutely. We have 6:30 PM and 7:15 PM available.' }
];

export default function MessagesPage() {
  const [activeThread, setActiveThread] = useState(threads[0]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Messages</p>
        <h1 className="text-4xl font-display text-gradient">Stay in the glow loop</h1>
        <p className="text-sm text-charcoal/80 max-w-2xl">
          Chat with your artist, confirm details, and keep every look perfectly timed.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="glass-panel p-4 space-y-4">
          <div className="flex gap-3 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            {threads.map((thread) => (
              <button
                key={thread.id}
                className={`min-w-[220px] text-left rounded-2xl px-4 py-3 transition-all lg:min-w-0 ${
                  thread.id === activeThread.id
                    ? 'bg-white shadow-soft border border-white/80'
                    : 'hover:bg-white/70'
                }`}
                onClick={() => setActiveThread(thread)}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary">{thread.name}</p>
                  <span className="text-xs text-charcoal/50">{thread.time}</span>
                </div>
                <p className="text-xs text-charcoal/60 mt-1">{thread.preview}</p>
              </button>
            ))}
          </div>
          <div className="card-surface p-4 text-sm text-charcoal/80 flex items-center gap-3">
            <Sparkles size={16} className="text-primary" />
            New booking alerts appear here.
          </div>
        </div>

        <div className="card-spotlight p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="icon-orb">
              <MessageCircle size={18} />
            </span>
            <div>
              <p className="text-sm font-medium text-primary">{activeThread.name}</p>
              <p className="text-xs text-charcoal/60">Online · replies in minutes</p>
            </div>
          </div>

          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  message.from === 'user'
                    ? 'ml-auto bg-gradient-to-r from-primary via-lilac to-accent text-white'
                    : 'bg-white/85 text-charcoal'
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <Input placeholder="Send a message..." />
            <Button className="w-full">
              Send message <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
