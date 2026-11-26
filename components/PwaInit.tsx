'use client';
import { useEffect } from 'react';
import { registerSW } from '@/lib/pwa';

export default function PwaInit() {
  useEffect(registerSW, []);
  return null;
}
