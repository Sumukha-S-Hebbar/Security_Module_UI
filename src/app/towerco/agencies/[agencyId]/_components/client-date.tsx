'use client';

import { useState, useEffect } from 'react';

export function ClientDate({ date }: { date: string }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    setFormattedDate(new Date(date).toLocaleString());
  }, [date]);

  if (!formattedDate) {
    return null; // or a loading skeleton
  }

  return <>{formattedDate}</>;
}
