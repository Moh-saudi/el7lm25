'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/firebase/auth-provider';
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Check, Plus, Trash, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PlayerReportView from '@/components/player/PlayerReportView';

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="w-16 h-16 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
  </div>
);

// Success Message Component
const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed z-50 p-4 text-white bg-green-500 rounded-lg shadow-lg top-4 right-4">
    {message}
  </div>
);

// Error Message Component
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed z-50 p-4 text-white bg-red-500 rounded-lg shadow-lg top-4 right-4">
    {message}
  </div>
);

interface PlayerState {
  full_name: string;
  birth_date: string | null;
  nationality: string;
  city: string;
  country: string;
  phone: string;
  whatsapp: string;
  email: string;
  brief: string;
  education_level: string;
  graduation_year: string;
  degree: string;
  english_level: string;
  arabic_level: string;
  spanish_level: string;
  blood_type: string;
  height: string;
  weight: string;
  chronic_conditions: boolean;
  chronic_details: string;
  injuries: string[];
  surgeries: string[];
  allergies: string;
  medical_notes: string;
  primary_position: string;
  secondary_position: string;
  preferred_foot: string;
  club_history: string[];
  experience_years: string;
  sports_notes: string;
  technical_skills: Record<string, number>;
  physical_skills: Record<string, number>;
  social_skills: Record<string, number>;
  objectives: Record<string, boolean>;
  profile_image: string | null;
  additional_images: string[];
  videos: { url: string; desc: string }[];
  training_courses: string[];
  has_passport: 'yes' | 'no';
  ref_source: string;
  contract_history: string[];
  agent_history: string[];
  official_contact: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
  currently_contracted: 'yes' | 'no';
  achievements: Array<{
    title: string;
    date: string;
    description?: string;
  }>;
  medical_history: {
    blood_type: string;
    chronic_conditions?: string[];
    allergies?: string[];
    injuries?: Array<{
      type: string;
      date: string;
      recovery_status: string;
    }>;
    last_checkup?: string;
  };
  current_club?: string;
  previous_clubs?: string[];
  documents?: Array<{
    type: string;
    url: string;
    name: string;
  }>;
}

interface FormErrors {
  [key: string]: string;
}

export default function TrainerPlayerProfile({ params }: { params: { playerId: string } }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [playerData, setPlayerData] = useState<PlayerState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayerData = async () => {
      if (!params.playerId) return;
      setIsLoading(true);
      setError(null);
      try {
        // جلب بيانات اللاعب من مجموعة اللاعبين العامة
        const docRef = doc(db, 'players', params.playerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPlayerData(docSnap.data() as PlayerState);
        } else {
          setPlayerData(null);
        }
      } catch (err: any) {
        console.error('Error fetching player data:', err);
        setError('فشل في جلب بيانات اللاعب');
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchPlayerData();
    }
  }, [params.playerId, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-green-500 rounded-full border-t-transparent animate-spin"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (error || !playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="p-8 text-center bg-white rounded-lg shadow-md">
          <h2 className="mb-4 text-2xl font-semibold text-red-600">حدث خطأ</h2>
          <p className="mb-6 text-gray-600">{error || 'لا توجد بيانات لهذا اللاعب'}</p>
          <Button onClick={() => router.push('/dashboard/trainer/players')} className="text-white bg-green-600 hover:bg-green-700">
            العودة إلى قائمة اللاعبين
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white" dir="rtl">
      <main className="container px-4 py-8 mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-green-700 hover:text-green-900 font-semibold"
          style={{ direction: 'rtl' }}
        >
          <ArrowRight className="w-5 h-5" />
          العودة للصفحة السابقة
        </button>
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-800 mb-2">ملف اللاعب - عرض المدرب</h2>
            <p className="text-green-600">عرض شامل لبيانات اللاعب من منظور تدريبي</p>
          </div>
          <PlayerReportView player={playerData as any} />
        </div>
      </main>
    </div>
  );
} 