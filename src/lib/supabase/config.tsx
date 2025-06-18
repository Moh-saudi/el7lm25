'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/firebase/auth-provider';
import { auth, db } from "@/lib/firebase/config";
import { createBrowserClient } from '@supabase/ssr';
import { supabase } from './client';
import 'firebase/compat/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { Check, Plus, Trash, X, Star, StarHalf } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Slider } from "@/components/ui/slider";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
  </div>
);

// Success Message Component
const SuccessMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="fixed inset-x-0 top-0 z-50 p-4">
    <div className="w-full max-w-md p-4 mx-auto bg-green-100 rounded-lg shadow-lg">
      <div className="flex items-center">
        <Check className="w-5 h-5 mr-2 text-green-500" />
        <p className="text-green-700">{message}</p>
      </div>
    </div>
  </div>
);

// Error Message Component
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-4 mb-4 bg-red-100 border border-red-400 rounded-md">
    <div className="flex items-center">
      <X className="w-5 h-5 mr-2 text-red-500" />
      <p className="text-red-700">{message}</p>
    </div>
  </div>
);

// Types
interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

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
  objectives: Record<string, boolean> & { other: string };
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
  [key: string]: string | undefined;
}

interface PlayerFormData {
  full_name: string;
  birth_date: string;
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
  injuries: Array<{ type: string; date: string; status: string }>;
  surgeries: Array<{ type: string; date: string }>;
  allergies: string;
  medical_notes: string;
  primary_position: string;
  secondary_position: string;
  preferred_foot: string;
  club_history: Array<{ name: string; from: string; to: string }>;
  experience_years: string;
  sports_notes: string;
  technical_skills: Record<string, number>;
  physical_skills: Record<string, number>;
  social_skills: Record<string, number>;
  objectives: {
    other: string;
    professional: boolean;
    trials: boolean;
    local_leagues: boolean;
    arab_leagues: boolean;
    european_leagues: boolean;
    training: boolean;
  };
  profile_image: { url: string } | null;
  additional_images: Array<{ url: string }>;
  videos: { url: string; desc: string }[];
  training_courses: string[];
  has_passport: 'yes' | 'no';
  ref_source: string;
  contract_history: Array<{ club: string; from: string; to: string; role: string }>;
  agent_history: Array<{ agent: string; from: string; to: string }>;
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
  // المهارات الأساسية
  speed?: number;
  strength?: number;
  stamina?: number;
  flexibility?: number;
  
  // المهارات التقنية
  ball_control?: number;
  shooting?: number;
  passing?: number;
  defending?: number;
  
  // المهارات العقلية
  concentration?: number;
  decision_making?: number;
  vision?: number;
  leadership?: number;
}

const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

type ObjectiveKey = 'professional' | 'trials' | 'local_leagues' | 'arab_leagues' | 'european_leagues' | 'training';

interface UploadResponse {
  url: string;
  error?: string;
}

const getSupabaseWithAuth = async () => {
  // Implementation details...
  return null;
};

const renderRating = (rating: number | undefined, field: keyof PlayerFormData) => {
  // Implementation details...
  return null;
};

// Placeholder for playerData check
let playerData: any = null;
let isLoading = false;
let user: any = null;

if (!playerData && !isLoading && user) {
  // Implementation details...
}

// تعريف أسماء buckets التخزين في Supabase
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  ADDITIONAL_IMAGES: 'additional-images',
  PLAYER_AVATAR: 'player-avatar',
  PLAYER_ADDITIONAL_IMAGES: 'player-additional-images',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents'
};

// تصدير عنوان وAPI key الخاص بـ Supabase
export const supabaseUrl = 'https://ekyerljzfokqimbabzxm.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY';

// دالة للحصول على عميل Supabase مع المصادقة
export const getSupabaseClient = () => {
  return supabase;
};

export default {
  LoadingSpinner,
  SuccessMessage,
  ErrorMessage,
  getSupabaseWithAuth,
  renderRating
};
