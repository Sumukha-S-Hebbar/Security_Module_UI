'use client';

import { useState, useEffect } from 'react';

export function ClientDate({ date, format }: { date: string, format?: 'date' | 'time' | 'datetime' }) {
  const [formattedDate, setFormattedDate] = useState('');

  useEffect(() => {
    const d = new Date(date);
    if (format === 'date') {
      setFormattedDate(d.toLocaleDateString());
    } else if (format === 'time') {
      setFormattedDate(d.toLocaleTimeString());
    } else {
      setFormattedDate(d.toLocaleString());
    }
  }, [date, format]);

  if (!formattedDate) {
    return null; // or a loading skeleton
  }

  return <>{formattedDate}</>;
}
