'use client';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/lib/firebase/auth-provider';
import { auth, db } from "@/lib/firebase/config";
import { createBrowserClient } from '@supabase/ssr';
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

// Constants
const STEPS = {
  PERSONAL: 1,
  EDUCATION: 2,
  MEDICAL: 3,
  SPORTS: 4,
  SKILLS: 5,
  OBJECTIVES: 6,
  MEDIA: 7,
  CONTRACTS: 8 // التعاقدات والاتصالات
};

const STEP_TITLES = {
  [STEPS.PERSONAL]: 'البيانات الشخصية',
  [STEPS.EDUCATION]: 'المعلومات التعليمية',
  [STEPS.MEDICAL]: 'السجل الطبي',
  [STEPS.SPORTS]: 'المعلومات الرياضية',
  [STEPS.SKILLS]: 'المهارات والقدرات',
  [STEPS.OBJECTIVES]: 'الأهداف والطموحات',
  [STEPS.MEDIA]: 'الصور والفيديوهات',
  [STEPS.CONTRACTS]: 'التعاقدات والاتصالات'
};

const REFERENCE_DATA = {
  educationLevels: ['ابتدائي', 'متوسط', 'ثانوي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'],
  languageLevels: ['مبتدئ', 'متوسط', 'متقدم', 'محترف'],
  bloodTypes: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'],
  positions: [
    'حارس مرمى',
    'مدافع أيمن',
    'مدافع أيسر',
    'قلب دفاع',
    'وسط دفاعي',
    'وسط',
    'جناح أيمن',
    'جناح أيسر',
    'مهاجم صريح',
    'مهاجم ثاني'
  ],
  footPreferences: ['اليمنى', 'اليسرى', 'كلتاهما']
};

// Default player fields
const defaultPlayerFields: PlayerFormData = {
  full_name: '',
  birth_date: '',
  nationality: '',
  city: '',
  country: '',
  phone: '',
  whatsapp: '',
  email: '',
  brief: '',
  education_level: '',
  graduation_year: '',
  degree: '',
  english_level: '',
  arabic_level: '',
  spanish_level: '',
  blood_type: '',
  height: '',
  weight: '',
  chronic_conditions: false,
  chronic_details: '',
  injuries: [],
  surgeries: [],
  allergies: '',
  medical_notes: '',
  primary_position: '',
  secondary_position: '',
  preferred_foot: '',
  club_history: [],
  experience_years: '',
  sports_notes: '',
  technical_skills: {},
  physical_skills: {},
  social_skills: {},
  objectives: {
    other: '',
    professional: false,
    trials: false,
    local_leagues: false,
    arab_leagues: false,
    european_leagues: false,
    training: false
  },
  profile_image: null,
  additional_images: [],
  videos: [],
  training_courses: [],
  has_passport: 'no',
  ref_source: '',
  contract_history: [],
  agent_history: [],
  official_contact: {
    name: '',
    title: '',
    phone: '',
    email: ''
  },
  currently_contracted: 'no',
  achievements: [],
  medical_history: {
    blood_type: '',
    chronic_conditions: [],
    allergies: [],
    injuries: [],
    last_checkup: ''
  },
  current_club: '',
  previous_clubs: [],
  documents: []
};

// Helper function to combine classes
const classNames = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};


// قائمة الأهداف والطموحات
const OBJECTIVES_OPTIONS = [
  "الاحتراف في نادٍ محلي",
  "الاحتراف في نادٍ خارجي",
  "تمثيل المنتخب الوطني",
  "الحصول على منحة رياضية",
  "تطوير المهارات الشخصية",
  "الحصول على جوائز فردية",
  "المساهمة في العمل الجماعي",
  "العمل في مجال التدريب مستقبلاً"
];

// قوائم الجنسيات والدول (مختصرة هنا، يمكن استبدالها بقائمة كاملة)
const NATIONALITIES = [
  "سعودي", "مصري", "أردني", "سوري", "مغربي", "جزائري", "تونسي", "ليبي", "فلسطيني", "يمني", "سوداني", "إماراتي", "قطري", "بحريني", "كويتي", "عماني", "لبناني", "عراقي", "تركي", "فرنسي", "أمريكي", "بريطاني", "ألماني", "إيطالي", "إسباني", "هندي", "باكستاني", "إيراني", "صيني", "ياباني"
];
const COUNTRIES = [
  "السعودية", "مصر", "الأردن", "سوريا", "المغرب", "الجزائر", "تونس", "ليبيا", "فلسطين", "اليمن", "السودان", "الإمارات", "قطر", "البحرين", "الكويت", "عمان", "لبنان", "العراق", "تركيا", "فرنسا", "أمريكا", "بريطانيا", "ألمانيا", "إيطاليا", "إسبانيا", "الهند", "باكستان", "إيران", "الصين", "اليابان"
];

// قوائم المؤهلات والدرجات والمستويات
const EDUCATION_LEVELS = [
  'ابتدائي', 'متوسط', 'ثانوي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'
];
const DEGREES = [
  'مقبول', 'جيد', 'جيد جدًا', 'ممتاز', 'امتياز مع مرتبة الشرف'
];
const LANGUAGE_LEVELS = [
  'مبتدئ', 'متوسط', 'متقدم', 'محترف'
];

const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
];

const POSITIONS = [
  'حارس مرمى', 'مدافع أيمن', 'مدافع أيسر', 'قلب دفاع', 'وسط دفاعي', 'وسط', 'جناح أيمن', 'جناح أيسر', 'مهاجم صريح', 'مهاجم ثاني'
];
const FOOT_PREFERENCES = [
  'اليمنى', 'اليسرى', 'كلتاهما'
];

const TECHNICAL_SKILLS = [
  { key: 'ball_control', label: 'التحكم بالكرة' },
  { key: 'passing', label: 'التمرير' },
  { key: 'shooting', label: 'التسديد' },
  { key: 'dribbling', label: 'المراوغة' },
];
const PHYSICAL_SKILLS = [
  { key: 'speed', label: 'السرعة' },
  { key: 'strength', label: 'القوة البدنية' },
  { key: 'stamina', label: 'التحمل' },
  { key: 'agility', label: 'الرشاقة' },
  { key: 'balance', label: 'التوازن' },
  { key: 'flexibility', label: 'المرونة' },
];
const SOCIAL_SKILLS = [
  { key: 'teamwork', label: 'العمل الجماعي' },
  { key: 'communication', label: 'التواصل' },
  { key: 'discipline', label: 'الانضباط' },
  { key: 'self_confidence', label: 'الثقة بالنفس' },
  { key: 'pressure_handling', label: 'تحمل الضغط' },
  { key: 'punctuality', label: 'الالتزام بالمواعيد' },
];

const OBJECTIVES_CHECKBOXES = [
  { key: 'professional', label: 'الاحتراف الكامل' },
  { key: 'trials', label: 'معايشات احترافية' },
  { key: 'local_leagues', label: 'المشاركة في دوريات محلية' },
  { key: 'arab_leagues', label: 'المشاركة في دوريات عربية' },
  { key: 'european_leagues', label: 'المشاركة في دوريات أوروبية' },
  { key: 'training', label: 'تدريبات احترافية' },
];

const MAX_IMAGES = 10;
const MAX_VIDEOS = 10;

interface UploadResponse {
  url: string;
  error?: string;
}

const SUPABASE_URL = "https://ekyerljzfokqimbabzxm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVreWVybGp6Zm9rcWltYmFienhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTcyODMsImV4cCI6MjA2MjIzMzI4M30.Xd6Cg8QUISHyCG-qbgo9HtWUZz6tvqAqG6KKXzuetBY";

const getSupabaseWithAuth = async () => {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error("Supabase URL or Anon Key is missing.");
    throw new Error("Supabase configuration is missing.");
  }
  return createBrowserClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
};

export default function ProfilePage(props: Record<string, never>) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [supabase, setSupabase] = useState<any>(null);
  const [playerData, setPlayerData] = useState<PlayerFormData | null>(null);
  const [formData, setFormData] = useState<PlayerFormData>(defaultPlayerFields);
  const [editFormData, setEditFormData] = useState<PlayerFormData>(defaultPlayerFields);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(STEPS.PERSONAL);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [newVideo, setNewVideo] = useState<{ url: string; desc: string }>({ url: '', desc: '' });
  const [showVideoForm, setShowVideoForm] = useState(false);

  // =========== Section Renderers ===========
  const renderPersonalInfo = () => (
    <div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">الاسم الكامل</label>
        {renderField('full_name')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">تاريخ الميلاد</label>
        {isEditing ? (
          <input
            type="date"
            name="birth_date"
            value={editFormData.birth_date}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          />
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.birth_date}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">الجنسية</label>
        {renderField('nationality')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">المدينة</label>
        {renderField('city')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">الدولة</label>
        {renderField('country')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">رقم الجوال</label>
        {renderField('phone')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">رقم الواتساب</label>
        {renderField('whatsapp')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">البريد الإلكتروني</label>
        {renderField('email')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">نبذة مختصرة</label>
        {renderTextarea('brief')}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">المؤهل الدراسي</label>
        {isEditing ? (
          <select
            name="education_level"
            value={editFormData.education_level}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          >
            <option value="">اختر المؤهل</option>
            {REFERENCE_DATA.educationLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.education_level}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">سنة التخرج</label>
        {isEditing ? (
          <input
            type="number"
            name="graduation_year"
            value={editFormData.graduation_year}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          />
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.graduation_year}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">الدرجة</label>
        {renderField('degree')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">مستوى الإنجليزية</label>
        {isEditing ? (
          <select
            name="english_level"
            value={editFormData.english_level}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          >
            <option value="">اختر المستوى</option>
            {REFERENCE_DATA.languageLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.english_level}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">مستوى العربية</label>
        {isEditing ? (
          <select
            name="arabic_level"
            value={editFormData.arabic_level}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          >
            <option value="">اختر المستوى</option>
            {REFERENCE_DATA.languageLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.arabic_level}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">مستوى الإسبانية</label>
        {isEditing ? (
          <select
            name="spanish_level"
            value={editFormData.spanish_level}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          >
            <option value="">اختر المستوى</option>
            {REFERENCE_DATA.languageLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.spanish_level}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">الدورات التدريبية</label>
        {isEditing ? (
          <div>
            {editFormData.training_courses.map((course, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={course}
                  onChange={e => {
                    const newCourses = [...editFormData.training_courses];
                    newCourses[idx] = e.target.value;
                    setEditFormData(prev => ({
                      ...prev,
                      training_courses: newCourses
                    }));
                  }}
                  className="flex-1 p-2 border rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    setEditFormData(prev => ({
                      ...prev,
                      training_courses: prev.training_courses.filter((_, i) => i !== idx)
                    }));
                  }}
                  className="px-2 py-1 text-white bg-red-500 rounded"
                >
                  حذف
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                setEditFormData(prev => ({
                  ...prev,
                  training_courses: [...prev.training_courses, ""]
                }));
              }}
              className="px-4 py-2 mt-2 text-sm text-white bg-blue-600 rounded"
            >
              إضافة دورة جديدة
            </button>
          </div>
        ) : (
          formData.training_courses && formData.training_courses.length > 0 ? (
            <ul className="list-disc list-inside">
              {formData.training_courses.map((course, idx) => (
                <li key={idx}>{course}</li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">لا توجد دورات تدريبية</div>
          )
        )}
      </div>
    </div>
  );

  const renderMedicalRecord = () => (
    <div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">فصيلة الدم</label>
        {isEditing ? (
          <select
            name="blood_type"
            value={editFormData.blood_type}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          >
            <option value="">اختر الفصيلة</option>
            {REFERENCE_DATA.bloodTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.blood_type}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">الطول (سم)</label>
        {isEditing ? (
          <input
            type="number"
            name="height"
            value={editFormData.height}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          />
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.height}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">الوزن (كجم)</label>
        {isEditing ? (
          <input
            type="number"
            name="weight"
            value={editFormData.weight}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          />
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.weight}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">هل لديك أمراض مزمنة؟</label>
        {isEditing ? (
          <select
            name="chronic_conditions"
            value={editFormData.chronic_conditions ? 'yes' : 'no'}
            onChange={e => setEditFormData(prev => ({ ...prev, chronic_conditions: e.target.value === 'yes' }))}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          >
            <option value="no">لا</option>
            <option value="yes">نعم</option>
          </select>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.chronic_conditions ? 'نعم' : 'لا'}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">تفاصيل الأمراض المزمنة</label>
        {renderTextarea('chronic_details')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">الحساسية</label>
        {renderTextarea('allergies')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">ملاحظات طبية</label>
        {renderTextarea('medical_notes')}
      </div>
    </div>
  );

  const renderSportsInfo = () => (
    <div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">المركز الأساسي</label>
        {renderField('primary_position')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">المركز الثانوي</label>
        {renderField('secondary_position')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">القدم المفضلة</label>
        {isEditing ? (
          <select
            name="preferred_foot"
            value={editFormData.preferred_foot}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          >
            <option value="">اختر القدم</option>
            {REFERENCE_DATA.footPreferences.map(foot => (
              <option key={foot} value={foot}>{foot}</option>
            ))}
          </select>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.preferred_foot}</div>
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">سنوات الخبرة</label>
        {renderField('experience_years')}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">تاريخ الأندية</label>
        {isEditing ? (
          <div>
            <table className="min-w-full mb-2 text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">اسم النادي</th>
                  <th className="p-2 border">من</th>
                  <th className="p-2 border">إلى</th>
                  <th className="p-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {editFormData.club_history.map((club, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={club.name}
                        onChange={e => {
                          const newArr = [...editFormData.club_history];
                          newArr[idx] = { ...newArr[idx], name: e.target.value };
                          setEditFormData(prev => ({ ...prev, club_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={club.from}
                        onChange={e => {
                          const newArr = [...editFormData.club_history];
                          newArr[idx] = { ...newArr[idx], from: e.target.value };
                          setEditFormData(prev => ({ ...prev, club_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={club.to}
                        onChange={e => {
                          const newArr = [...editFormData.club_history];
                          newArr[idx] = { ...newArr[idx], to: e.target.value };
                          setEditFormData(prev => ({ ...prev, club_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <button
                        type="button"
                        onClick={() => {
                          setEditFormData(prev => ({
                            ...prev,
                            club_history: prev.club_history.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="px-2 py-1 text-white bg-red-500 rounded"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => {
                setEditFormData(prev => ({
                  ...prev,
                  club_history: [...prev.club_history, { name: '', from: '', to: '' }]
                }));
              }}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded"
            >
              إضافة نادي
            </button>
          </div>
        ) : (
          formData.club_history && formData.club_history.length > 0 ? (
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">اسم النادي</th>
                  <th className="p-2 border">من</th>
                  <th className="p-2 border">إلى</th>
                </tr>
              </thead>
              <tbody>
                {formData.club_history.map((club, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{club.name}</td>
                    <td className="p-2 border">{club.from}</td>
                    <td className="p-2 border">{club.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">لا يوجد تاريخ أندية</div>
          )
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">ملاحظات رياضية</label>
        {renderTextarea('sports_notes')}
      </div>
    </div>
  );

  const renderSkills = () => {
    if (!playerData) return null;

    const renderRating = (rating: number | undefined, field: keyof PlayerFormData) => {
      const value = rating || 0;
      
      return (
        <div className="flex items-center gap-4 w-full">
          <div className="w-full">
            <Slider
              defaultValue={[value]}
              max={5}
              step={0.5}
              onValueChange={(newValue) => {
                if (playerData) {
                  setPlayerData({
                    ...playerData,
                    [field]: newValue[0]
                  });
                }
              }}
              className="w-full"
            />
          </div>
          <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">
            {value.toFixed(1)}
          </span>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* المهارات الأساسية */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">المهارات الأساسية</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">السرعة</span>
                </div>
                {renderRating(playerData.speed, 'speed')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">القوة</span>
                </div>
                {renderRating(playerData.strength, 'strength')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">التحمل</span>
                </div>
                {renderRating(playerData.stamina, 'stamina')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">المرونة</span>
                </div>
                {renderRating(playerData.flexibility, 'flexibility')}
              </div>
            </div>
          </div>

          {/* المهارات التقنية */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">المهارات التقنية</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">التحكم بالكرة</span>
                </div>
                {renderRating(playerData.ball_control, 'ball_control')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">التسديد</span>
                </div>
                {renderRating(playerData.shooting, 'shooting')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">التمرير</span>
                </div>
                {renderRating(playerData.passing, 'passing')}
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">الدفاع</span>
                </div>
                {renderRating(playerData.defending, 'defending')}
              </div>
            </div>
          </div>
        </div>

        {/* المهارات العقلية */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">المهارات العقلية</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">التركيز</span>
              </div>
              {renderRating(playerData.concentration, 'concentration')}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">اتخاذ القرار</span>
              </div>
              {renderRating(playerData.decision_making, 'decision_making')}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">الرؤية</span>
              </div>
              {renderRating(playerData.vision, 'vision')}
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">القيادة</span>
              </div>
              {renderRating(playerData.leadership, 'leadership')}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderObjectives = () => (
    <div>
      <div className="mb-4">
        <label className="block mb-2 font-medium">الأهداف والطموحات</label>
        <div className="space-y-2">
          {OBJECTIVES_CHECKBOXES.map(obj => (
            <label key={obj.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                name={`objectives.${obj.key}`}
                checked={!!editFormData.objectives?.[obj.key]}
                disabled={!isEditing}
                onChange={e => {
                  if (!isEditing) return;
                  const fieldName = e.target.name.split('.')[1];
                  setEditFormData(prev => ({
                    ...prev,
                    objectives: {
                      ...prev.objectives,
                      [fieldName]: e.target.checked
                    }
                  }));
                }}
              />
              <span>{obj.label}</span>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <label className="block mb-1">هدف آخر</label>
          <input
            type="text"
            name="objectives.other"
            value={editFormData.objectives?.other || ''}
            disabled={!isEditing}
            onChange={e => {
              if (!isEditing) return;
              setEditFormData(prev => ({
                ...prev,
                objectives: {
                  ...prev.objectives,
                  other: e.target.value
                }
              }));
            }}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>
    </div>
  );

  // Render Media Section
  const renderMedia = () => {
    return (
      <div className="space-y-6">
        {/* Profile Image Section */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">الصورة الشخصية</h3>
          <div className="flex items-center space-x-4">
            {editFormData.profile_image?.url ? (
              <div className="relative">
                <img
                  src={editFormData.profile_image.url}
                  alt="Profile"
                  className="object-cover w-32 h-32 rounded-full"
                />
                {isEditing && (
                  <button
                    onClick={handleDeleteProfileImage}
                    className="absolute p-1 text-white bg-red-500 rounded-full -top-2 -right-2 hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center w-32 h-32 bg-gray-200 rounded-full">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
            {isEditing && (
              <div>
                <label className="block">
                  <span className="sr-only">اختر صورة</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfileImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  يفضل أن تكون الصورة واضحة وحديثة
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Images Section */}
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="mb-4 text-lg font-medium text-gray-900">صور إضافية</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {editFormData.additional_images?.map((image, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={image.url}
                  alt={`Additional ${idx + 1}`}
                  className="object-cover w-full h-32 rounded-lg"
                />
                {isEditing && (
                  <button
                    onClick={() => handleDeleteAdditionalImage(idx)}
                    className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {isEditing && editFormData.additional_images?.length < 10 && (
              <div className="flex items-center justify-center p-4 border-2 border-gray-300 border-dashed rounded-lg">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdditionalImageUpload}
                    className="hidden"
                  />
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="block mt-2 text-sm text-gray-600">
                      إضافة صورة
                    </span>
                  </div>
                </label>
              </div>
            )}
          </div>
          {isEditing && (
            <p className="mt-2 text-sm text-gray-500">
              يمكنك إضافة حتى 10 صور إضافية
            </p>
          )}
        </div>

        {/* Videos Section */}
        <div className="p-6 bg-white rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">فيديوهات</h3>
            {isEditing && (editFormData.videos?.length ?? 0) < MAX_VIDEOS && (
              <button
                onClick={() => setShowVideoForm(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                إضافة فيديو جديد
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {editFormData.videos?.map((video, idx) => (
              <div key={idx} className="relative group">
                <div className="overflow-hidden bg-gray-100 rounded-lg">
                  {getVideoEmbed(video.url)}
                  <div className="p-4">
                    <p className="text-sm text-gray-700">{video.desc}</p>
                  </div>
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleRemoveVideo(idx)}
                    className="absolute p-1 text-white transition-opacity bg-red-500 rounded-full opacity-0 top-2 right-2 group-hover:opacity-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isEditing && (editFormData.videos?.length ?? 0) < MAX_VIDEOS && (
            <div className="p-4 mt-4 bg-white border rounded-lg shadow-sm">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    رابط الفيديو
                  </label>
                  <input
                    type="url"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    وصف الفيديو
                  </label>
                  <input
                    type="text"
                    value={newVideo.desc}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, desc: e.target.value }))}
                    placeholder="مثال: مهاراتي في التسديد"
                    className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (newVideo.url && newVideo.desc) {
                        handleAddVideo(newVideo);
                        setNewVideo({ url: '', desc: '' });
                      }
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    إضافة الفيديو
                  </button>
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <p className="mt-2 text-sm text-gray-500">
              يمكنك إضافة حتى {MAX_VIDEOS} فيديوهات من يوتيوب أو فيميو
            </p>
          )}
        </div>
   </div>
 );
  };

  const renderContracts = () => (
    <div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">تاريخ التعاقدات</label>
        {isEditing ? (
          <div>
            <table className="min-w-full mb-2 text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">النادي</th>
                  <th className="p-2 border">الدور</th>
                  <th className="p-2 border">من</th>
                  <th className="p-2 border">إلى</th>
                  <th className="p-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {editFormData.contract_history.map((contract, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={contract.club}
                        onChange={e => {
                          const newArr = [...editFormData.contract_history];
                          newArr[idx] = { ...newArr[idx], club: e.target.value };
                          setEditFormData(prev => ({ ...prev, contract_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={contract.role}
                        onChange={e => {
                          const newArr = [...editFormData.contract_history];
                          newArr[idx] = { ...newArr[idx], role: e.target.value };
                          setEditFormData(prev => ({ ...prev, contract_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={contract.from}
                        onChange={e => {
                          const newArr = [...editFormData.contract_history];
                          newArr[idx] = { ...newArr[idx], from: e.target.value };
                          setEditFormData(prev => ({ ...prev, contract_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={contract.to}
                        onChange={e => {
                          const newArr = [...editFormData.contract_history];
                          newArr[idx] = { ...newArr[idx], to: e.target.value };
                          setEditFormData(prev => ({ ...prev, contract_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <button
                        type="button"
                        onClick={() => {
                          setEditFormData(prev => ({
                            ...prev,
                            contract_history: prev.contract_history.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="px-2 py-1 text-white bg-red-500 rounded"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => {
                setEditFormData(prev => ({
                  ...prev,
                  contract_history: [...prev.contract_history, { club: '', role: '', from: '', to: '' }]
                }));
              }}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded"
            >
              إضافة تعاقد
            </button>
          </div>
        ) : (
          formData.contract_history && formData.contract_history.length > 0 ? (
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">النادي</th>
                  <th className="p-2 border">الدور</th>
                  <th className="p-2 border">من</th>
                  <th className="p-2 border">إلى</th>
                </tr>
              </thead>
              <tbody>
                {formData.contract_history.map((contract, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{contract.club}</td>
                    <td className="p-2 border">{contract.role}</td>
                    <td className="p-2 border">{contract.from}</td>
                    <td className="p-2 border">{contract.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">لا يوجد تاريخ تعاقدات</div>
          )
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">تاريخ الوكلاء</label>
        {isEditing ? (
          <div>
            <table className="min-w-full mb-2 text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">اسم الوكيل</th>
                  <th className="p-2 border">من</th>
                  <th className="p-2 border">إلى</th>
                  <th className="p-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {editFormData.agent_history.map((agent, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">
                      <input
                        type="text"
                        value={agent.agent}
                        onChange={e => {
                          const newArr = [...editFormData.agent_history];
                          newArr[idx] = { ...newArr[idx], agent: e.target.value };
                          setEditFormData(prev => ({ ...prev, agent_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={agent.from}
                        onChange={e => {
                          const newArr = [...editFormData.agent_history];
                          newArr[idx] = { ...newArr[idx], from: e.target.value };
                          setEditFormData(prev => ({ ...prev, agent_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <input
                        type="date"
                        value={agent.to}
                        onChange={e => {
                          const newArr = [...editFormData.agent_history];
                          newArr[idx] = { ...newArr[idx], to: e.target.value };
                          setEditFormData(prev => ({ ...prev, agent_history: newArr }));
                        }}
                        className="p-1 border rounded"
                      />
                    </td>
                    <td className="p-2 border">
                      <button
                        type="button"
                        onClick={() => {
                          setEditFormData(prev => ({
                            ...prev,
                            agent_history: prev.agent_history.filter((_, i) => i !== idx)
                          }));
                        }}
                        className="px-2 py-1 text-white bg-red-500 rounded"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              onClick={() => {
                setEditFormData(prev => ({
                  ...prev,
                  agent_history: [...prev.agent_history, { agent: '', from: '', to: '' }]
                }));
              }}
              className="px-4 py-2 text-sm text-white bg-blue-600 rounded"
            >
              إضافة وكيل
            </button>
          </div>
        ) : (
          formData.agent_history && formData.agent_history.length > 0 ? (
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-2 border">اسم الوكيل</th>
                  <th className="p-2 border">من</th>
                  <th className="p-2 border">إلى</th>
                </tr>
              </thead>
              <tbody>
                {formData.agent_history.map((agent, idx) => (
                  <tr key={idx}>
                    <td className="p-2 border">{agent.agent}</td>
                    <td className="p-2 border">{agent.from}</td>
                    <td className="p-2 border">{agent.to}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">لا يوجد تاريخ وكلاء</div>
          )
        )}
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">بيانات التواصل الرسمية</label>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1">اسم المسؤول</label>
            {isEditing ? (
              <input
                type="text"
                name="official_contact.name"
                value={editFormData.official_contact.name}
                onChange={e => {
                  setEditFormData(prev => ({
                    ...prev,
                    official_contact: {
                      ...prev.official_contact,
                      name: e.target.value
                    }
                  }));
                }}
                className="w-full p-2 border rounded"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded">{formData.official_contact.name}</div>
            )}
          </div>
          <div>
            <label className="block mb-1">الصفة</label>
            {isEditing ? (
              <input
                type="text"
                name="official_contact.title"
                value={editFormData.official_contact.title}
                onChange={e => {
                  setEditFormData(prev => ({
                    ...prev,
                    official_contact: {
                      ...prev.official_contact,
                      title: e.target.value
                    }
                  }));
                }}
                className="w-full p-2 border rounded"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded">{formData.official_contact.title}</div>
            )}
          </div>
          <div>
            <label className="block mb-1">رقم الجوال</label>
            {isEditing ? (
              <input
                type="text"
                name="official_contact.phone"
                value={editFormData.official_contact.phone}
                onChange={e => {
                  setEditFormData(prev => ({
                    ...prev,
                    official_contact: {
                      ...prev.official_contact,
                      phone: e.target.value
                    }
                  }));
                }}
                className="w-full p-2 border rounded"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded">{formData.official_contact.phone}</div>
            )}
          </div>
          <div>
            <label className="block mb-1">البريد الإلكتروني</label>
            {isEditing ? (
              <input
                type="email"
                name="official_contact.email"
                value={editFormData.official_contact.email}
                onChange={e => {
                  setEditFormData(prev => ({
                    ...prev,
                    official_contact: {
                      ...prev.official_contact,
                      email: e.target.value
                    }
                  }));
                }}
                className="w-full p-2 border rounded"
              />
            ) : (
              <div className="p-2 bg-gray-100 rounded">{formData.official_contact.email}</div>
            )}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">هل اللاعب متعاقد حاليًا؟</label>
        {isEditing ? (
          <select
            name="currently_contracted"
            value={editFormData.currently_contracted}
            onChange={handleInputChange}
            className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
          >
            <option value="no">لا</option>
            <option value="yes">نعم</option>
          </select>
        ) : (
          <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">{formData.currently_contracted === 'yes' ? 'نعم' : 'لا'}</div>
        )}
      </div>
    </div>
  );

  // تعريف مصفوفة التبويبات بعد الدوال
  const TABS = [
    { name: 'البيانات الشخصية', render: renderPersonalInfo },
    { name: 'التعليم', render: renderEducation },
    { name: 'السجل الطبي', render: renderMedicalRecord },
    { name: 'المعلومات الرياضية', render: renderSportsInfo },
    { name: 'المهارات', render: renderSkills },
    { name: 'الأهداف', render: renderObjectives },
    { name: 'الوسائط', render: renderMedia },
    { name: 'التعاقدات', render: renderContracts },
  ];

  // دوال رفع/حذف الصور
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    setUploadingProfileImage(true);
    setFormErrors(prev => ({ ...prev, profile_image: undefined }));
    try {
      const supabase = await getSupabaseWithAuth();
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.uid}.${fileExt}`; // فقط اسم الملف بدون مجلدات
      // حذف الصورة القديمة إذا وجدت
      if (editFormData.profile_image?.url) {
        const oldPath = editFormData.profile_image.url.split('/storage/v1/object/public/')[1];
        if (oldPath) await supabase.storage.from('avatars').remove([oldPath.replace('avatars/', '')]);
      }
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      setEditFormData(prev => ({ ...prev, profile_image: { url: publicUrl } }));
    } catch (err: any) {
      setFormErrors(prev => ({ ...prev, profile_image: 'فشل رفع الصورة. حاول مرة أخرى.' }));
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleDeleteProfileImage = async () => {
    if (!user?.uid || !editFormData.profile_image?.url) return;
    setUploadingProfileImage(true);
    setFormErrors(prev => ({ ...prev, profile_image: undefined }));
    try {
      const supabase = await getSupabaseWithAuth();
      const filePath = editFormData.profile_image.url.split('/storage/v1/object/public/')[1];
      if (filePath) await supabase.storage.from('avatars').remove([filePath.replace('avatars/', '')]);
      setEditFormData(prev => ({ ...prev, profile_image: null }));
    } catch (err: any) {
      setFormErrors(prev => ({ ...prev, profile_image: 'فشل حذف الصورة.' }));
    } finally {
      setUploadingProfileImage(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    setIsUploading(true);
    setFormErrors(prev => ({ ...prev, additionalImage: undefined }));
    try {
      const supabase = await getSupabaseWithAuth();
      const fileExt = file.name.split('.').pop();
      const filePath = `additional-images/${user.uid}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('additional-images').upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('additional-images').getPublicUrl(filePath);
      setEditFormData(prev => ({ ...prev, additional_images: [...prev.additional_images, { url: publicUrl }] }));
    } catch (err: any) {
      setFormErrors(prev => ({ ...prev, additionalImage: 'فشل رفع الصورة الإضافية.' }));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAdditionalImage = async (idx: number) => {
    if (!user?.uid || !editFormData.additional_images[idx]?.url) return;
    setIsUploading(true);
    setFormErrors(prev => ({ ...prev, additionalImage: undefined }));
    try {
      const supabase = await getSupabaseWithAuth();
      const filePath = editFormData.additional_images[idx].url.split('/storage/v1/object/public/')[1];
      if (filePath) await supabase.storage.from('additional-images').remove([filePath.replace('additional-images/', '')]);
      setEditFormData(prev => ({ ...prev, additional_images: prev.additional_images.filter((_, i) => i !== idx) }));
    } catch (err: any) {
      setFormErrors(prev => ({ ...prev, additionalImage: 'فشل حذف الصورة الإضافية.' }));
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (playerData) {
      setFormData(playerData);
      setEditFormData(playerData);
      setIsLoading(false);
    }
  }, [playerData]);

  // جلب بيانات اللاعب عند توفر المستخدم
  useEffect(() => {
    if (user) {
      fetchPlayerData();
    }
  }, [user]);

  const fetchPlayerData = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const docRef = doc(db, 'players', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as PlayerFormData; // Cast to PlayerFormData
        console.log('[fetchPlayerData] player data:', data);
        setPlayerData(data);
        setFormData(data); // Also update formData directly here
        setEditFormData(data); // And editFormData
      } else {
        console.log('[fetchPlayerData] no player data found');
        setPlayerData(null); // Explicitly set to null if no data
        setFormData(defaultPlayerFields); // Reset form if no player data
        setEditFormData(defaultPlayerFields);
      }
    } catch (err: any) {
      console.error('[fetchPlayerData] Error fetching data:', err);
      setError('فشل في جلب بيانات اللاعب.');
      setFormErrors(prev => ({ ...prev, fetch: 'فشل في جلب بيانات اللاعب.' }));
      setPlayerData(null);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('PlayerProfile: state initialized', { isLoading, playerData, formData });

  if (isLoading || isUploading) {
    console.log('PlayerProfile: Rendering loading state', {
      isLoading,
      isUploading,
      authState: isLoading ? 'Auth loading' : 'Auth loaded',
      dataState: isLoading ? 'Data loading' : 'Data loaded'
    });
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    console.log('PlayerProfile: No user found, redirecting to login');
    router.push('/auth/login');
    return null;
  }

  if (error || (formErrors && 'fetch' in formErrors)) {
    // إذا كان الخطأ هو فقط "عدم وجود بيانات لاعب"، أظهر نموذج الإكمال
    if (!playerData && !isLoading && user) {
      return (
        
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h2 className="mb-4 text-2xl font-semibold text-blue-600">مرحبًا بك! يرجى إكمال بيانات ملفك الشخصي كلاعب.</h2>
            <form className="w-full max-w-4xl p-6 mx-auto bg-white rounded-lg shadow-lg">
              {currentStep === STEPS.PERSONAL && renderPersonalInfo()}
              {currentStep === STEPS.EDUCATION && renderEducation()}
              {currentStep === STEPS.MEDICAL && renderMedicalRecord()}
              {currentStep === STEPS.SPORTS && renderSportsInfo()}
              {currentStep === STEPS.SKILLS && renderSkills()}
              {currentStep === STEPS.OBJECTIVES && renderObjectives()}
              {currentStep === STEPS.MEDIA && renderMedia()}
              {currentStep === STEPS.CONTRACTS && renderContracts()}
            </form>
          </div>
      );
    } else {
      // إذا كان خطأ آخر، أظهر رسالة الخطأ العادية
      console.log('PlayerProfile: Rendering error state', error, formErrors.fetch);
      return (
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="p-8 text-center bg-white rounded-lg shadow-md">
              <h2 className="mb-4 text-2xl font-semibold text-red-600">حدث خطأ</h2>
              <p className="mb-6 text-gray-600">{typeof error === 'string' ? error : formErrors.fetch}</p>
              <Button onClick={() => router.push('/auth/login')} className="text-white bg-blue-600 hover:bg-blue-700">
                العودة إلى صفحة تسجيل الدخول
              </Button>
            </div>
          </div>
        </DashboardLayout>
      );
    }
  }

  console.log('PlayerProfile: Rendering main form');
  // =========== Supabase Storage Functions ===========

  /**
   * رفع صورة البروفايل إلى bucket للصور الشخصية
   * @param {File} file - ملف الصورة
   * @param {string} userId - معرف المستخدم
   * @returns {Promise<string>} - رابط الصورة
   */


  // =========== Form Handling Functions ===========

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  // دالة التحقق حسب التبويب الحالي
  const validateCurrentStep = (step: number, data: PlayerFormData) => {
    if (step === STEPS.PERSONAL) return validatePersonalInfo(data);
    if (step === STEPS.EDUCATION) return validateEducation(data);
    if (step === STEPS.MEDICAL) return validateMedical(data);
    if (step === STEPS.SPORTS) return validateSports(data);
    if (step === STEPS.SKILLS) return validateSkills(data);
    if (step === STEPS.OBJECTIVES) return validateObjectives(data);
    if (step === STEPS.MEDIA) return validateMedia(data);
    return {};
  };

  // زر التالي
  const handleNext = () => {
    const errors = validateCurrentStep(currentStep, editFormData);
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setCurrentStep(currentStep + 1);
  };

  // Handle Save Button
  const handleSave = async () => {
    try {
      // Validate all required fields
      const errors: FormErrors = {};
      let hasErrors = false;

      const requiredFields: (keyof PlayerFormData)[] = [
        'full_name',
        'birth_date',
        'nationality',
        'country',
        'city',
        'height',
        'weight',
        'primary_position',
        'preferred_foot',
        'spanish_level'
      ];

      requiredFields.forEach(field => {
        const error = validateField(field, playerData?.[field]);
        if (error) {
          errors[field] = error;
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setFormErrors(errors);
        toast.error('يرجى تصحيح الأخطاء قبل الحفظ');
        return;
      }

      // Clear any existing errors
      setFormErrors({});

      // Show loading state
      setIsUploading(true);

      // Update the document
      await updateDoc(doc(db, 'players', user.uid), {
        ...editFormData,
        updated_at: serverTimestamp()
      });

      // Show success message
      toast.success('تم حفظ البيانات بنجاح');
      
      // Refresh the data
      await fetchPlayerData();

    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Cancel button
  const handleCancel = () => {
    setEditFormData({ ...formData });
    setIsEditing(false);
    setEditError('');
  };

  // =========== Media Handling Functions ===========

  // Add/remove images and videos
  const handleAddImage = (url: string) => {
    setEditFormData(prev => ({
      ...prev,
      additional_images: [...(prev.additional_images || []), { url }]
    }));
  };

  const handleRemoveImage = (idx: number) => {
    setEditFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== idx),
    }));
  };

  const handleAddVideo = (video: { url: string; desc: string }) => {
    setEditFormData(prev => ({
      ...prev,
      videos: [...(prev.videos || []), video],
    }));
  };

  const handleRemoveVideo = (idx: number) => {
    setEditFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== idx),
    }));
  };



  // =========== Field Rendering Helpers ===========

  // Render input or value based on edit mode
  const renderField = (name: keyof PlayerFormData, type: string = 'text') =>
    isEditing ? (
      <input
        type={type}
        name={name}
        value={typeof editFormData[name] === 'string' ? editFormData[name] as string : ''}
        onChange={handleInputChange}
        className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
      />
    ) : (
      <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
        {typeof formData[name] === 'string' ? formData[name] as string :
         typeof formData[name] === 'object' ? JSON.stringify(formData[name]) : 'غير محدد'}
      </div>
    );

  // Render textarea based on edit mode
  const renderTextarea = (name: keyof PlayerFormData) =>
    isEditing ? (
      <textarea
        name={name}
        value={typeof editFormData[name] === 'string' ? editFormData[name] as string : ''}
        onChange={handleInputChange}
        className="w-full p-2 mt-1 text-gray-900 bg-white border rounded-md"
      />
    ) : (
      <div className="p-2 mt-1 text-gray-900 bg-gray-100 rounded-md">
        {typeof formData[name] === 'string' ? formData[name] as string :
         typeof formData[name] === 'object' ? JSON.stringify(formData[name]) :
         'غير محدد'}
      </div>
    );

  // Helper to check if a video URL is embeddable
  const getVideoEmbed = (url: string) => {
    if (!url) return null;

    // YouTube
    const ytMatch = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})/);
    if (ytMatch) {
      return (
        <div className="relative w-full pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://www.youtube.com/embed/${ytMatch[1]}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo.com\/(\d+)/);
    if (vimeoMatch) {
      return (
        <div className="relative w-full pt-[56.25%]">
          <iframe
            className="absolute inset-0 w-full h-full rounded-lg"
            src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    return null;
  };

  // =========== Validation Functions ===========
  const validatePersonalInfo = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    // if (!data.profile_image) errors.profile_image = 'الصورة الشخصية مطلوبة'; // تم جعل الصورة غير إلزامية
    if (!data.full_name) errors.full_name = 'الاسم الكامل مطلوب';
    if (!data.birth_date) {
      errors.birth_date = 'تاريخ الميلاد مطلوب';
    } else {
      const birthDate = new Date(data.birth_date);
      const minDate = new Date();
      minDate.setFullYear(minDate.getFullYear() - 6);
      if (birthDate > minDate) {
        errors.birth_date = 'يجب أن يكون عمر اللاعب 6 سنوات أو أكثر';
      }
    }
    if (!data.nationality) errors.nationality = 'الجنسية مطلوبة';
    if (!data.city) errors.city = 'المدينة مطلوبة';
    if (!data.country) errors.country = 'الدولة مطلوبة';
    if (!data.phone) errors.phone = 'رقم الهاتف مطلوب';
    if (!data.whatsapp) errors.whatsapp = 'رقم الواتساب مطلوب';
    if (!data.email) errors.email = 'البريد الإلكتروني مطلوب';
    if (!data.brief) errors.brief = 'نبذة مختصرة مطلوبة';
    return errors;
  };

  const validateEducation = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    if (!data.education_level) errors.education_level = 'المؤهل الدراسي مطلوب';
    if (!data.graduation_year) errors.graduation_year = 'سنة التخرج مطلوبة';
    if (!data.degree) errors.degree = 'الدرجة مطلوبة';
    if (!data.english_level) errors.english_level = 'مستوى الإنجليزية مطلوب';
    return errors;
  };

  const validateMedical = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    // الطول والوزن اختياريان لكن يمكن التحقق من الأرقام
    if (data.height && isNaN(Number(data.height))) errors.height = 'الطول يجب أن يكون رقمًا';
    if (data.weight && isNaN(Number(data.weight))) errors.weight = 'الوزن يجب أن يكون رقمًا';
    // إذا كان هناك أمراض مزمنة يجب إدخال التفاصيل
    if (data.chronic_conditions && !data.chronic_details) errors.chronic_details = 'يرجى إدخال تفاصيل الأمراض المزمنة';
    // تحقق من الإصابات والعمليات (يمكنك تخصيصه أكثر)
    return errors;
  };

  const validateSports = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    if (!data.primary_position) errors.primary_position = 'المركز الأساسي مطلوب';
    if (!data.preferred_foot) errors.preferred_foot = 'القدم المفضلة مطلوبة';
    // تحقق من تاريخ الأندية (يمكن تخصيصه)
    return errors;
  };

  const validateSkills = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    // المهارات اختيارية لكن يمكن التحقق من وجود تقييمات أساسية إذا رغبت
    return errors;
  };

  const validateObjectives = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    const hasAny = OBJECTIVES_CHECKBOXES.some(obj => data.objectives?.[obj.key]) ||
      (typeof data.objectives?.other === 'string' && data.objectives.other.trim() !== '');
    if (!hasAny) errors.objectives = 'يرجى اختيار هدف واحد على الأقل أو كتابة هدف آخر';
    return errors;
  };

  const validateMedia = (data: PlayerFormData) => {
    const errors: Partial<FormErrors> = {};
    if ((data.additional_images || []).length > MAX_IMAGES) errors.additionalImage = `يمكن رفع حتى ${MAX_IMAGES} صور فقط`;
    if ((data.videos || []).length > MAX_VIDEOS) errors.video = `يمكن رفع حتى ${MAX_VIDEOS} فيديو فقط`;
    // تحقق من وجود وصف لكل فيديو
    if ((data.videos || []).some(v => !v || !v.url || !v.desc || v.desc.trim() === '')) errors.video = 'يجب كتابة وصف لكل فيديو';
    return errors;
  };

  // =========== Media Handling Functions ===========

  // دالة لجلب صورة مصغرة للفيديو
  const getVideoThumbnail = (url: string) => {
    // يوتيوب
    const ytMatch = url.match(/(?:youtu.be\/|youtube.com\/(?:embed\/|v\/|watch\?v=))([\w-]{11})/);
    if (ytMatch) {
      return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }
    // Vimeo (عرض رمز فيديو افتراضي)
    const vimeoMatch = url.match(/vimeo.com\/(\d+)/);
    if (vimeoMatch) {
      return '/video-icon.png'; // رمز فيديو افتراضي (يمكنك استبداله)
    }
    // MP4 أو غير ذلك
    if (url.endsWith('.mp4')) {
      return '/video-icon.png';
    }
    return '/video-icon.png';
  };

  // الـ return الرئيسي
  return (
    <div className="container p-4 mx-auto">
      {isLoading && <LoadingSpinner />}
      {successMessage && <SuccessMessage message={successMessage} />}
      {formErrors.fetch && <ErrorMessage message={formErrors.fetch} />}
      {formErrors.submit && <ErrorMessage message={formErrors.submit} />}

      <div className="mb-6">
        <h1 className="mb-4 text-2xl font-bold">الملف الشخصي</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          {TABS.map((tab, idx) => (
            <button
              key={tab.name}
              onClick={() => setCurrentStep(idx)}
              className={`px-4 py-2 rounded ${
                currentStep === idx 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 bg-white rounded-lg shadow">
        {TABS[currentStep].render()}
      </div>

      <div className="flex justify-end gap-4 mt-6">
        {isEditing ? (
          <>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="px-4 py-2"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleSave}
              className="px-4 py-2 text-white bg-blue-600"
            >
              حفظ
            </Button>
          </>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-white bg-blue-600"
          >
            تعديل
          </Button>
        )}
      </div>
    </div>
  );
}

const validateField = (field: keyof PlayerFormData, value: any): string | null => {
  switch (field) {
    case 'full_name':
      return !value ? 'الاسم الكامل مطلوب' : null;
    case 'birth_date':
      return !value ? 'تاريخ الميلاد مطلوب' : null;
    case 'nationality':
      return !value ? 'الجنسية مطلوبة' : null;
    case 'country':
      return !value ? 'البلد مطلوب' : null;
    case 'city':
      return !value ? 'المدينة مطلوبة' : null;
    case 'height':
      return !value ? 'الطول مطلوب' : null;
    case 'weight':
      return !value ? 'الوزن مطلوب' : null;
    case 'primary_position':
      return !value ? 'المركز الأساسي مطلوب' : null;
    case 'preferred_foot':
      return !value ? 'القدم المفضلة مطلوبة' : null;
    case 'spanish_level':
      return !value ? 'مستوى اللغة الإسبانية مطلوب' : null;
    default:
      return null;
  }
};
