'use client';

import { use, useEffect, useState } from 'react';
import { useAdminApi } from '@/lib/admin-auth';
import { TripForm } from '@/components/admin/trip-form';
import type { TripDTO } from '@/types/api';
import { Loader2 } from 'lucide-react';

export default function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const api = useAdminApi();
  const [trip, setTrip] = useState<TripDTO | null>(null);

  useEffect(() => {
    api.get<TripDTO>(`/admin/trips/${id}`).then(setTrip).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!trip) return <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
  return <TripForm initialTrip={trip} />;
}
