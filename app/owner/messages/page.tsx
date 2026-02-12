'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Send, User } from 'lucide-react';
import OwnerSubnav from '@/components/layout/OwnerSubnav';
import Skeleton from '@/components/ui/skeleton';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { useOwnerAuth } from '@/lib/hooks/useOwnerAuth';
import { formatDate, toDateKey } from '@/lib/utils';

type Thread = {
  appointmentId: string;
  serviceName: string;
  date: string;
  time: string;
  status: string;
  salonName: string;
  salonLocation: string;
  customerName: string;
  customerEmail: string;
  lastMessageText: string;
  lastMessageAt: string;
  lastSender: 'owner' | 'customer' | null;
  unreadCount: number;
};

type ChatMessage = {
  id: string;
  appointmentId: string;
  sender: 'owner' | 'customer';
  text: string;
  read: boolean;
  createdAt: string;
};

function formatThreadTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  if (toDateKey(date) === toDateKey(new Date())) {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }
  return formatDate(date);
}

export default function OwnerMessagesPage() {
  const { user, loading: authLoading, fetchWithAuth } = useOwnerAuth();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState<string | null>(null);

  const [activeAppointmentId, setActiveAppointmentId] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  const activeThread = useMemo(
    () => threads.find((thread) => thread.appointmentId === activeAppointmentId) || null,
    [activeAppointmentId, threads]
  );

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setThreads([]);
      setActiveAppointmentId('');
      setThreadsLoading(false);
      return;
    }

    let cancelled = false;

    const loadThreads = async (showLoading = false) => {
      if (showLoading) setThreadsLoading(true);
      try {
        const res = await fetchWithAuth('/api/messages?mode=threads&role=owner');
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          threads?: Thread[];
        };
        if (!res.ok) {
          throw new Error(data.error || 'Unable to load conversations');
        }
        if (cancelled) return;
        const next = Array.isArray(data.threads) ? data.threads : [];
        setThreads(next);
        setThreadsError(null);
        setActiveAppointmentId((current) => {
          if (current && next.some((thread) => thread.appointmentId === current)) {
            return current;
          }
          return next[0]?.appointmentId || '';
        });
      } catch (error) {
        if (cancelled) return;
        setThreadsError((error as Error).message || 'Unable to load conversations');
      } finally {
        if (!cancelled && showLoading) setThreadsLoading(false);
      }
    };

    loadThreads(true);
    const intervalId = setInterval(() => {
      loadThreads(false);
    }, 12000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [authLoading, fetchWithAuth, user]);

  useEffect(() => {
    if (!activeAppointmentId || !user) {
      setMessages([]);
      setMessagesLoading(false);
      return;
    }

    let cancelled = false;

    const loadMessages = async (showLoading = false) => {
      if (showLoading) setMessagesLoading(true);
      try {
        const res = await fetchWithAuth(
          `/api/messages?appointmentId=${encodeURIComponent(activeAppointmentId)}&role=owner`
        );
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
          messages?: ChatMessage[];
        };
        if (!res.ok) {
          throw new Error(data.error || 'Unable to load messages');
        }
        if (cancelled) return;
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setMessagesError(null);
      } catch (error) {
        if (cancelled) return;
        setMessagesError((error as Error).message || 'Unable to load messages');
      } finally {
        if (!cancelled && showLoading) setMessagesLoading(false);
      }
    };

    loadMessages(true);
    const intervalId = setInterval(() => {
      loadMessages(false);
    }, 7000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [activeAppointmentId, fetchWithAuth, user]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!activeThread || !text || sending) return;
    setSending(true);
    setSendError(null);
    setDraft('');

    try {
      const res = await fetchWithAuth('/api/messages', {
        method: 'POST',
        body: JSON.stringify({
          appointmentId: activeThread.appointmentId,
          text
        })
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: ChatMessage;
      };
      if (!res.ok) {
        throw new Error(data.error || 'Unable to send message');
      }
      if (data.message) {
        setMessages((prev) => [...prev, data.message as ChatMessage]);
      }
    } catch (error) {
      setSendError((error as Error).message || 'Unable to send message');
      setDraft(text);
    } finally {
      setSending(false);
    }
  };

  if (authLoading || threadsLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-24" />
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.35em] text-primary/70">Messages</p>
        <h1 className="text-3xl font-display text-primary">Customer Conversations</h1>
      </div>

      <OwnerSubnav />

      {threadsError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {threadsError}
        </div>
      ) : null}

      <div className="glass rounded-2xl p-4 space-y-4">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          {threads.length === 0 ? (
            <div className="rounded-xl bg-white/80 border border-white/70 p-4 text-sm text-charcoal/60 min-w-full">
              No message conversations yet.
            </div>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.appointmentId}
                type="button"
                onClick={() => setActiveAppointmentId(thread.appointmentId)}
                className={
                  thread.appointmentId === activeAppointmentId
                    ? 'shrink-0 rounded-2xl bg-primary text-white px-4 py-3 text-left shadow-glow min-w-[250px]'
                    : 'shrink-0 rounded-2xl bg-white/95 border border-white/70 px-4 py-3 text-left shadow-soft min-w-[250px]'
                }
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold truncate">
                    {thread.customerName || thread.customerEmail || 'Customer'}
                  </p>
                  <span className="text-xs opacity-80">{formatThreadTime(thread.lastMessageAt)}</span>
                </div>
                <p className="text-xs mt-1 truncate opacity-90">
                  {thread.lastMessageText || `${thread.serviceName} · ${thread.date}`}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="rounded-xl bg-white/80 border border-white/70 p-4 space-y-4">
          {activeThread ? (
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-9 w-9 rounded-xl bg-primary/10 text-primary grid place-items-center">
                  <User size={16} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {activeThread.customerName || activeThread.customerEmail || 'Customer'}
                  </p>
                  <p className="text-xs text-charcoal/60 truncate">
                    {activeThread.serviceName} · {activeThread.date} {activeThread.time}
                  </p>
                </div>
              </div>
              <Link
                href={`/owner/appointments/${activeThread.appointmentId}`}
                className="pill bg-primary text-white"
              >
                Open Appointment
              </Link>
            </div>
          ) : (
            <p className="text-sm text-charcoal/60">Select a conversation.</p>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {messagesLoading ? (
              <p className="text-sm text-charcoal/60 text-center py-4">Loading messages...</p>
            ) : messagesError ? (
              <p className="text-sm text-red-700 text-center py-4">{messagesError}</p>
            ) : !activeThread ? (
              <p className="text-sm text-charcoal/60 text-center py-4">No conversation selected.</p>
            ) : messages.length === 0 ? (
              <p className="text-sm text-charcoal/60 text-center py-4">No messages yet.</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={message.sender === 'owner' ? 'ml-auto max-w-[85%]' : 'max-w-[85%]'}
                >
                  <div
                    className={
                      message.sender === 'owner'
                        ? 'rounded-2xl px-4 py-3 text-sm bg-primary text-white'
                        : 'rounded-2xl px-4 py-3 text-sm bg-secondary/70 text-primary'
                    }
                  >
                    {message.text}
                  </div>
                  <p className="text-[11px] text-charcoal/45 mt-1 px-1">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              ))
            )}
            <div ref={endRef} />
          </div>

          {sendError ? (
            <div className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              {sendError}
            </div>
          ) : null}

          <div className="flex gap-2">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  sendMessage();
                }
              }}
              disabled={!activeThread || sending}
              placeholder={activeThread ? 'Type message for customer...' : 'Select conversation'}
            />
            <Button
              onClick={sendMessage}
              className="flex items-center gap-2"
              disabled={!activeThread || !draft.trim() || sending}
            >
              {sending ? 'Sending...' : 'Send'} <Send size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
