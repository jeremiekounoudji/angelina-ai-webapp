'use client';

import { Spinner } from '@heroui/react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-4">AngelinaAI</div>
        <Spinner color="success" size="lg" />
        <p className="text-gray-400 mt-4">Loading...</p>
      </div>
    </div>
  );
}