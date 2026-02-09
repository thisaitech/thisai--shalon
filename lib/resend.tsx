import { Resend } from 'resend';
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text
} from '@react-email/components';
import { formatCurrency } from '@/lib/utils';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type EmailAppointment = {
  serviceName: string;
  date: string;
  time: string;
  price: number;
  salonName: string;
  salonAddress?: string;
};

export function BookingConfirmationEmail({
  appointment
}: {
  appointment: EmailAppointment;
}) {
  return (
    <Html>
      <Head />
      <Preview>Your appointment is confirmed</Preview>
      <Body style={{ backgroundColor: '#F8F4F0', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ padding: '32px', backgroundColor: '#ffffff', borderRadius: '24px' }}>
          <Text style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#3A3A3A' }}>
            Lumiére
          </Text>
          <Heading style={{ fontFamily: 'Playfair Display, serif', color: '#3A3A3A' }}>
            Your appointment is confirmed.
          </Heading>
          <Text style={{ color: '#3A3A3A', fontSize: '16px' }}>
            Your glow-up awaits. Here are your details:
          </Text>
          <Section style={{ marginTop: '24px', padding: '16px', backgroundColor: '#F8F4F0', borderRadius: '16px' }}>
            <Text><strong>Salon:</strong> {appointment.salonName}</Text>
            {appointment.salonAddress ? (
              <Text><strong>Location:</strong> {appointment.salonAddress}</Text>
            ) : null}
            <Text><strong>Service:</strong> {appointment.serviceName}</Text>
            <Text><strong>Date:</strong> {appointment.date}</Text>
            <Text><strong>Time:</strong> {appointment.time}</Text>
            <Text><strong>Price:</strong> {formatCurrency(appointment.price)}</Text>
          </Section>
          <Hr style={{ margin: '24px 0' }} />
          <Text style={{ color: '#3A3A3A' }}>
            Need to make a change? Reply to this email and our concierge will help.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function NewBookingAlertEmail({
  appointment,
  acceptUrl,
  rejectUrl
}: {
  appointment: EmailAppointment;
  acceptUrl: string;
  rejectUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>New booking request</Preview>
      <Body style={{ backgroundColor: '#F8F4F0', fontFamily: 'Inter, sans-serif' }}>
        <Container style={{ padding: '32px', backgroundColor: '#ffffff', borderRadius: '24px' }}>
          <Text style={{ fontFamily: 'Playfair Display, serif', fontSize: '18px', color: '#3A3A3A' }}>
            Lumiére
          </Text>
          <Heading style={{ fontFamily: 'Playfair Display, serif', color: '#3A3A3A' }}>
            New booking request
          </Heading>
          <Text style={{ color: '#3A3A3A' }}>
            A new appointment request has arrived.
          </Text>
          <Section style={{ marginTop: '16px', padding: '16px', backgroundColor: '#F8F4F0', borderRadius: '16px' }}>
            <Text><strong>Service:</strong> {appointment.serviceName}</Text>
            <Text><strong>Date:</strong> {appointment.date}</Text>
            <Text><strong>Time:</strong> {appointment.time}</Text>
          </Section>
          <Section style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <Button
              href={acceptUrl}
              style={{
                backgroundColor: '#8BC34A',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: '14px',
                textDecoration: 'none'
              }}
            >
              Accept
            </Button>
            <Button
              href={rejectUrl}
              style={{
                backgroundColor: '#3A3A3A',
                color: '#ffffff',
                padding: '12px 18px',
                borderRadius: '14px',
                textDecoration: 'none'
              }}
            >
              Reject
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export async function sendBookingConfirmation({
  to,
  appointment
}: {
  to: string;
  appointment: EmailAppointment;
}) {
  if (!resend || !process.env.RESEND_FROM_EMAIL) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: 'Your Lumiére appointment is confirmed',
    react: <BookingConfirmationEmail appointment={appointment} />
  });
}

export async function sendNewBookingAlert({
  to,
  appointment,
  acceptUrl,
  rejectUrl
}: {
  to: string;
  appointment: EmailAppointment;
  acceptUrl: string;
  rejectUrl: string;
}) {
  if (!resend || !process.env.RESEND_FROM_EMAIL) return;
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to,
    subject: 'New booking request for your salon',
    react: (
      <NewBookingAlertEmail
        appointment={appointment}
        acceptUrl={acceptUrl}
        rejectUrl={rejectUrl}
      />
    )
  });
}
