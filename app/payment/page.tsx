import { notFound } from 'next/navigation';
import PaymentScreen from '@/components/payment/PaymentScreen';
import { salons } from '@/lib/data';
import { serviceImages } from '@/lib/service-images';

export default function PaymentPage({
  searchParams
}: {
  searchParams?: { salon?: string; service?: string; date?: string; time?: string };
}) {
  const salonId = searchParams?.salon || salons[0]?.id;
  const serviceId = searchParams?.service;
  const date = searchParams?.date;
  const time = searchParams?.time;

  const salon = salons.find((item) => item.id === salonId);
  const service = salon?.services.find((item) => item.id === serviceId);

  if (!salon || !service || !date || !time) return notFound();

  return (
    <PaymentScreen
      salonId={salon.id}
      salonName={salon.name}
      salonLocation={salon.location}
      salonImage={salon.image}
      service={service}
      serviceImage={serviceImages[service.id] ?? salon.image}
      date={date}
      time={time}
    />
  );
}

