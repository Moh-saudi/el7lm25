'use client';

import React from 'react';

export default function PlayerReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Full screen layout بدون sidebar للملف الشخصي للاعب */}
      {children}
    </div>
  );
} 
