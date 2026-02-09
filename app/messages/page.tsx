'use client';

import { useState } from 'react';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import CustomerContainer from '@/components/layout/CustomerContainer';
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
    <div className="min-h-screen pb-32">
      <CustomerContainer className="pt-7 space-y-5">
        <header className="space-y-1">
          <p className="text-xs text-charcoal/60">Messages</p>
          <h1 className="text-2xl font-semibold text-ink">Message your studio</h1>
          <p className="text-sm text-charcoal/70">Confirm details and keep every look timed.</p>
        </header>

        <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-4 space-y-3">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
            {threads.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => setActiveThread(thread)}
                className={
                  thread.id === activeThread.id
                    ? 'shrink-0 rounded-2xl bg-primary text-white px-4 py-3 text-left shadow-glow min-w-[220px]'
                    : 'shrink-0 rounded-2xl bg-white/95 border border-white/70 px-4 py-3 text-left shadow-soft min-w-[220px]'
                }
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{thread.name}</p>
                  <span className={thread.id === activeThread.id ? 'text-xs text-white/70' : 'text-xs text-charcoal/50'}>
                    {thread.time}
                  </span>
                </div>
                <p className={thread.id === activeThread.id ? 'text-xs text-white/80 mt-1' : 'text-xs text-charcoal/60 mt-1'}>
                  {thread.preview}
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-2xl bg-secondary/80 border border-white/70 p-3 text-xs text-charcoal/70 flex items-center gap-2">
            <Sparkles size={14} className="text-primary" />
            New booking alerts appear here.
          </div>
        </div>

        <div className="rounded-3xl bg-white/92 shadow-soft border border-white/70 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-2xl bg-primary/10 text-primary shadow-soft flex items-center justify-center">
              <MessageCircle size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">{activeThread.name}</p>
              <p className="text-xs text-charcoal/60">Online · replies in minutes</p>
            </div>
          </div>

          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.from === 'user'
                    ? 'ml-auto max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-primary text-white shadow-soft'
                    : 'max-w-[85%] rounded-2xl px-4 py-3 text-sm bg-white/95 border border-white/70 shadow-soft'
                }
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
      </CustomerContainer>
    </div>
  );
}
