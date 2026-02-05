# Lumiére Salon Booking MVP

A minimalist, design-forward booking experience built with Next.js, Firebase, Tailwind CSS, and Resend.

## 🚀 Setup
1. `cp .env.example .env.local`
2. Populate Firebase/Resend keys
3. `npm install && npm run dev`

## 🌐 Deployment
Vercel (frontend) + Firebase (backend)

## 📌 MVP Validation
- [ ] Customer books appointment → email sent
- [ ] Salon owner sees booking in dashboard
- [ ] Time slot disappears after booking

## Notes
- Single timezone assumption for MVP.
- Reminder automation is Phase 2 (see `app/api/reminders/route.ts`).
- Firebase security rules are stubbed in `firestore.rules` (TODO for production).
# thisai--shalon
