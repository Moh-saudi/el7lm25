'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Send, Users } from 'lucide-react';

export default function TrainerMessages() {
  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold text-blue-700">الرسائل</h1>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            مركز الرسائل
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">صفحة إدارة الرسائل والتواصل مع اللاعبين والإدارة</p>
        </CardContent>
      </Card>
    </div>
  );
} 