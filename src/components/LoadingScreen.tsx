'use client';

import Image from 'next/image';
import { Spinner } from '@heroui/react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <Image
          src="/angelina-logo-full.png"
          alt="Aangelina AI"
          width={200}
          height={100}
          className="mx-auto mb-6 object-contain"
          priority
        />
        <Spinner color="success" size="lg" />
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}