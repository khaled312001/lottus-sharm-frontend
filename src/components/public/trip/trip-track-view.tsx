'use client';

import { useEffect } from 'react';
import { trackRecentlyViewed } from '../recently-viewed-strip';

export function TripTrackView({ id, slug, title, image, price }: {
  id: number;
  slug: string;
  title: string;
  image: string;
  price: string;
}) {
  useEffect(() => {
    trackRecentlyViewed({ id, slug, title, image, price });
  }, [id, slug, title, image, price]);
  return null;
}
