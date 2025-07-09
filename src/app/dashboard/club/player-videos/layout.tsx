'use client';

import React from 'react';

export default function PlayerVideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black">
      {/* Full screen layout بدون sidebar */}
      {children}
    </div>
  );
} 
