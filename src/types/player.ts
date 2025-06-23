export interface PlayerFormData {
  full_name: string;
  birth_date?: Date;
  age?: number;
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
  injuries: Injury[];
  surgeries: Surgery[];
  allergies: string;
  medical_notes: string;
  primary_position: string;
  secondary_position: string;
  preferred_foot: string;
  club_history: ClubHistory[];
  experience_years: string;
  sports_notes?: string;
  technical_skills?: Record<string, number>;
  physical_skills?: Record<string, number>;
  social_skills?: Record<string, number>;
  objectives?: {
    professional: boolean;
    trials: boolean;
    local_leagues: boolean;
    arab_leagues: boolean;
    european_leagues: boolean;
    training: boolean;
    other: string;
  };
  profile_image?: string;
  additional_images: Image[];
  videos: Video[];
  video_urls?: string[];
  training_courses?: string[];
  has_passport: 'yes' | 'no';
  ref_source: string;
  contract_history?: ContractHistory[];
  agent_history?: AgentHistory[];
  official_contact?: {
    name: string;
    title: string;
    phone: string;
    email: string;
  };
  currently_contracted: 'yes' | 'no';
  achievements: Achievement[];
  medical_history?: {
    blood_type: string;
    chronic_conditions: string[];
    allergies: string[];
    injuries: Injury[];
    last_checkup: string;
  };
  current_club: string;
  previous_clubs: string[];
  documents?: Document[];
  updated_at: Date;
  subscription_end?: Date;
  profile_image_url?: string;
  subscription_status: string;
  subscription_type: string;
  address?: string;
  player_number?: string;
  favorite_jersey_number?: string;
}

export interface Injury {
  type: string;
  date: string;
  status?: string;
  recovery_status?: string;
}

export interface Surgery {
  type: string;
  date: string;
}

export interface ClubHistory {
  name: string;
  from: string;
  to: string;
}

export interface ContractHistory {
  club: string;
  from: string;
  to: string;
  role: string;
}

export interface AgentHistory {
  agent: string;
  from: string;
  to: string;
}

export interface Document {
  type: string;
  url: string;
  name: string;
}

export interface Image {
  url: string;
  name?: string;
  caption?: string; // إضافة caption للصور
}

export interface Video {
  url: string;
  desc?: string;
}

export interface Achievement {
  title: string;
  date: string;
  description?: string;
}

export interface Player extends PlayerFormData {
  id: string;
  name?: string; // حقل بديل للـ full_name للتوافق مع البيانات القديمة
  created_at?: any; // تاريخ الإنشاء
  position?: string; // موقع بديل للـ primary_position
}