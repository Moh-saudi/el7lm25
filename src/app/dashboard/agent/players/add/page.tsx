'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus, Trash2, Save, User, GraduationCap, Heart, Trophy, Camera, FileText, Target, Video, ExternalLink } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { uploadPlayerProfileImage, uploadPlayerAdditionalImage, uploadPlayerDocument, agentUpload } from '@/lib/firebase/upload-media';
import { toast } from 'sonner';

import { PlayerFormData } from '@/types/player';

// Constants
const STEPS = {
  PERSONAL: 0,
  EDUCATION: 1,
  MEDICAL: 2,
  SPORTS: 3,
  SKILLS: 4,
  OBJECTIVES: 5,
  MEDIA: 6,
  CONTRACTS: 7,
};

const STEP_TITLES = {
  [STEPS.PERSONAL]: 'البيانات الشخصية',
  [STEPS.EDUCATION]: 'المعلومات التعليمية',
  [STEPS.MEDICAL]: 'السجل الطبي',
  [STEPS.SPORTS]: 'المعلومات الرياضية',
  [STEPS.SKILLS]: 'المهارات والقدرات',
  [STEPS.OBJECTIVES]: 'الأهداف والطموحات',
  [STEPS.MEDIA]: 'الصور والفيديوهات',
  [STEPS.CONTRACTS]: 'العقود والاتصالات',
};

const STEP_ICONS = {
  [STEPS.PERSONAL]: User,
  [STEPS.EDUCATION]: GraduationCap,
  [STEPS.MEDICAL]: Heart,
  [STEPS.SPORTS]: Trophy,
  [STEPS.SKILLS]: Target,
  [STEPS.OBJECTIVES]: Target,
  [STEPS.MEDIA]: Camera,
  [STEPS.CONTRACTS]: FileText,
};

const POSITIONS = [
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
];

const NATIONALITIES = [
  "سعودي", "مصري", "أردني", "سوري", "مغربي", "جزائري", "تونسي", "ليبي", 
  "فلسطيني", "يمني", "سوداني", "إماراتي", "قطري", "بحريني", "كويتي", "عماني"
];

const COUNTRIES = [
  "السعودية", "مصر", "الأردن", "سوريا", "المغرب", "الجزائر", "تونس", "ليبيا", 
  "فلسطين", "اليمن", "السودان", "الإمارات", "قطر", "البحرين", "الكويت", "عمان"
];

const EDUCATION_LEVELS = [
  'ابتدائي', 'متوسط', 'ثانوي', 'دبلوم', 'بكالوريوس', 'ماجستير', 'دكتوراه'
];

const LANGUAGE_LEVELS = [
  'مبتدئ', 'متوسط', 'متقدم', 'محترف'
];

const BLOOD_TYPES = [
  'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'
];

const FOOT_PREFERENCES = [
  'اليمنى', 'اليسرى', 'كلتاهما'
];

// Default values
const defaultFormData: Partial<PlayerFormData> = {
  full_name: '',
  birth_date: undefined,
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
    professional: false,
    trials: false,
    local_leagues: false,
    arab_leagues: false,
    european_leagues: false,
    training: false,
    other: ''
  },
  profile_image: null,
  additional_images: [],
  videos: [],
  training_courses: [],
  has_passport: 'no',
  ref_source: '',
  player_number: '',
  favorite_jersey_number: '',
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
  documents: [],
  address: ''
};

export default function AddAgentPlayerPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Check if we're in edit mode
  const editId = searchParams?.get('edit');
  const isEditing = !!editId;
  
  const [formData, setFormData] = useState<Partial<PlayerFormData>>({
    ...defaultFormData
  });
  const [currentStep, setCurrentStep] = useState(STEPS.PERSONAL);
  const [loading, setLoading] = useState(false);
  const [loadingPlayer, setLoadingPlayer] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Media states
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newImageCaption, setNewImageCaption] = useState('');
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const additionalImagesRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);

  // Load player data if editing
  useEffect(() => {
    if (isEditing && editId && user?.uid) {
      loadPlayerData(editId);
    }
  }, [isEditing, editId, user]);

  const loadPlayerData = async (playerId: string) => {
    setLoadingPlayer(true);
    try {
      const playerDoc = await getDoc(doc(db, 'players', playerId));
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        
        // Verify this player belongs to the current agent
        if (playerData.agent_id !== user?.uid && playerData.agentId !== user?.uid) {
          toast.error('غير مسموح لك بتعديل هذا اللاعب');
          router.push('/dashboard/agent/players');
          return;
        }
        
        // Format birth_date if it exists
        let formattedBirthDate = null;
        if (playerData.birth_date) {
          try {
            if (typeof playerData.birth_date === 'object' && playerData.birth_date.toDate) {
              formattedBirthDate = playerData.birth_date.toDate().toISOString().split('T')[0];
            } else if (playerData.birth_date instanceof Date) {
              formattedBirthDate = playerData.birth_date.toISOString().split('T')[0];
            } else if (typeof playerData.birth_date === 'string') {
              formattedBirthDate = new Date(playerData.birth_date).toISOString().split('T')[0];
            }
          } catch (error) {
            console.warn('Error formatting birth date:', error);
          }
        }
        
        setFormData({
          ...defaultFormData,
          ...playerData,
          birth_date: formattedBirthDate,
          profile_image: playerData.profile_image_url || playerData.profile_image || null,
          additional_images: playerData.additional_images || [],
          videos: playerData.videos || [],
          technical_skills: playerData.technical_skills || {},
          physical_skills: playerData.physical_skills || {},
          social_skills: playerData.social_skills || {},
          objectives: playerData.objectives || defaultFormData.objectives,
          official_contact: playerData.official_contact || defaultFormData.official_contact
        });
        
      } else {
        toast.error('اللاعب غير موجود');
        router.push('/dashboard/agent/players');
      }
    } catch (error) {
      console.error('Error loading player data:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات اللاعب');
    } finally {
      setLoadingPlayer(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle profile image upload
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setUploadingImage(true);
    try {
      const result = await agentUpload.profileImage(file, user.uid);
      if (result?.url) {
        setFormData(prev => ({
          ...prev,
          profile_image: result.url
        }));
        toast.success('تم رفع الصورة الشخصية بنجاح إلى بوكت الوكلاء');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('فشل في رفع الصورة الشخصية');
    } finally {
      setUploadingImage(false);
    }
  };

  // Media handling functions
  const addVideoUrl = () => {
    if (!newVideoUrl.trim()) {
      toast.error('يرجى إدخال رابط الفيديو');
      return;
    }
    
    if (!isValidVideoUrl(newVideoUrl)) {
      toast.error('رابط الفيديو غير صالح');
      return;
    }

    const newVideo = {
      url: newVideoUrl.trim(),
      desc: newVideoDesc.trim() || 'فيديو جديد'
    };

    setFormData(prev => ({
      ...prev,
      videos: [...prev.videos, newVideo]
    }));

    setNewVideoUrl('');
    setNewVideoDesc('');
    toast.success('تم إضافة الفيديو بنجاح');
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    setIsUploadingMedia(true);
    try {
      const result = await agentUpload.document(file, user.uid, 'video');
      if (result?.url) {
        const newVideo = {
          url: result.url,
          desc: file.name || 'فيديو مرفوع'
        };

        setFormData(prev => ({
          ...prev,
          videos: [...prev.videos, newVideo]
        }));

        toast.success('تم رفع الفيديو بنجاح إلى بوكت الوكلاء');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      toast.error('فشل في رفع الفيديو');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleAdditionalImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user?.uid) return;

    setIsUploadingMedia(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const result = await agentUpload.additionalImage(file, user.uid);
        return {
          url: result.url,
          caption: newImageCaption.trim() || 'صورة جديدة'
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        additional_images: [...prev.additional_images, ...newImages]
      }));

      setNewImageCaption('');
      toast.success('تم رفع الصور بنجاح إلى بوكت الوكلاء');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('فشل في رفع الصور');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: prev.videos.filter((_, i) => i !== index)
    }));
    toast.success('تم حذف الفيديو');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_images: prev.additional_images.filter((_, i) => i !== index)
    }));
    toast.success('تم حذف الصورة');
  };

  const isValidVideoUrl = (url: string) => {
    const patterns = [
      /youtube\.com\/watch\?v=/,
      /youtu\.be\//,
      /vimeo\.com\//,
      /\.mp4$/,
      /\.webm$/,
      /\.mov$/
    ];
    return patterns.some(pattern => pattern.test(url));
  };

  // Validation
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === STEPS.PERSONAL) {
      if (!formData.full_name) newErrors.full_name = 'الاسم الكامل مطلوب';
      if (!formData.birth_date) newErrors.birth_date = 'تاريخ الميلاد مطلوب';
      if (!formData.nationality) newErrors.nationality = 'الجنسية مطلوبة';
      if (!formData.country) newErrors.country = 'الدولة مطلوبة';
      if (!formData.city) newErrors.city = 'المدينة مطلوبة';
      if (!formData.phone) newErrors.phone = 'رقم الهاتف مطلوب';
      if (!formData.email) newErrors.email = 'البريد الإلكتروني مطلوب';
    }
    
    if (currentStep === STEPS.SPORTS) {
      if (!formData.primary_position) newErrors.primary_position = 'المركز الأساسي مطلوب';
      if (!formData.preferred_foot) newErrors.preferred_foot = 'القدم المفضلة مطلوبة';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle navigation
  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, Object.keys(STEPS).length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!user?.uid) {
      toast.error('يجب تسجيل الدخول أولاً');
      return;
    }
    
    if (!validateCurrentStep()) return;
    
    setLoading(true);
    try {
      const processedFormData = {
        ...formData,
        birth_date: formData.birth_date ? new Date(formData.birth_date) : undefined,
        profile_image_url: formData.profile_image || '',
        updated_at: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (isEditing && editId) {
        await updateDoc(doc(db, 'players', editId), processedFormData);
        toast.success('تم تحديث بيانات اللاعب بنجاح');
      } else {
        const newPlayerData = {
          ...processedFormData,
          agent_id: user.uid,
          agentId: user.uid,
          created_at: serverTimestamp(),
          createdAt: serverTimestamp(),
          subscription_status: 'inactive',
          subscription_type: '',
          subscription_end: null
        };
        
        await addDoc(collection(db, 'players'), newPlayerData);
        toast.success('تم إضافة اللاعب بنجاح');
      }
      
      router.push('/dashboard/agent/players');
      
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} player:`, error);
      toast.error(`حدث خطأ أثناء ${isEditing ? 'تحديث' : 'إضافة'} اللاعب`);
    } finally {
      setLoading(false);
    }
  };

  // Get current step icon
  const getCurrentStepIcon = () => {
    const IconComponent = STEP_ICONS[currentStep];
    return <IconComponent size={24} />;
  };

  // Show loading spinner while loading player data
  if (loadingPlayer) {
    return (
      <main className="flex-1 min-h-0 p-6 mx-4 my-6 overflow-auto rounded-lg shadow-inner md:p-10 bg-gray-50" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-cyan-600 rounded-full border-t-transparent animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">جاري تحميل بيانات اللاعب...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 min-h-0 p-6 mx-4 my-6 overflow-auto rounded-lg shadow-inner md:p-10 bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-cyan-600 mb-2">
                {isEditing ? 'تعديل بيانات اللاعب' : 'إضافة لاعب جديد'}
              </h1>
              <p className="text-gray-600">
                {isEditing 
                  ? 'قم بتعديل بيانات اللاعب وحفظ التغييرات' 
                  : 'أضف لاعب جديد لقائمة اللاعبين المتعاقدين مع الوكيل'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {Object.entries(STEP_TITLES).map(([step, title], index) => {
              const stepNum = parseInt(step);
              const IconComponent = STEP_ICONS[stepNum];
              const isActive = stepNum === currentStep;
              const isCompleted = stepNum < currentStep;
              
              return (
                <div key={step} className="flex flex-col items-center flex-1">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors
                    ${isActive ? 'bg-cyan-600 text-white' : 
                      isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}>
                    <IconComponent size={20} />
                  </div>
                  <p className={`text-sm text-center ${isActive ? 'text-cyan-600 font-semibold' : 'text-gray-500'}`}>
                    {title}
                  </p>
                </div>
              );
            })}
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-cyan-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / Object.keys(STEPS).length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-cyan-100 rounded-full text-cyan-600">
              {getCurrentStepIcon()}
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {STEP_TITLES[currentStep]}
            </h2>
          </div>

          {/* Step Content */}
          {currentStep === STEPS.PERSONAL && (
            <div className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center mb-8">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-cyan-200">
                    {formData.profile_image ? (
                      <img
                        src={formData.profile_image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={48} className="text-gray-400" />
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="absolute bottom-0 right-0 p-2 bg-cyan-600 text-white rounded-full hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {uploadingImage ? (
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfileImageUpload}
                  className="hidden"
                />
                <p className="text-sm text-gray-500 mt-2">اضغط لرفع الصورة الشخصية</p>
              </div>

              {/* Personal Info Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم الكامل *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.full_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل الاسم الكامل"
                  />
                  {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الميلاد *
                  </label>
                  <input
                    type="date"
                    name="birth_date"
                    value={formData.birth_date ? new Date(formData.birth_date).toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                      const value = e.target.value ? new Date(e.target.value) : null;
                      setFormData(prev => ({ ...prev, birth_date: value }));
                      if (errors.birth_date) {
                        setErrors(prev => ({ ...prev, birth_date: '' }));
                      }
                    }}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.birth_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.birth_date && <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنسية *
                  </label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.nationality ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="الجنسية"
                  />
                  {errors.nationality && <p className="text-red-500 text-sm mt-1">{errors.nationality}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدولة *
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.country ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="الدولة"
                  />
                  {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.city ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل المدينة"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل رقم الهاتف"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الواتساب
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="أدخل رقم الواتساب"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    البريد الإلكتروني *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نبذة شخصية
                </label>
                <textarea
                  name="brief"
                  value={formData.brief}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="اكتب نبذة قصيرة عن اللاعب..."
                />
              </div>
            </div>
          )}

          {currentStep === STEPS.EDUCATION && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المستوى التعليمي
                  </label>
                  <select
                    name="education_level"
                    value={formData.education_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">اختر المستوى التعليمي</option>
                    {EDUCATION_LEVELS.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سنة التخرج
                  </label>
                  <input
                    type="number"
                    name="graduation_year"
                    value={formData.graduation_year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="مثال: 2020"
                    min="1990"
                    max={new Date().getFullYear()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدرجة العلمية
                  </label>
                  <input
                    type="text"
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="مثال: بكالوريوس هندسة"
                  />
                </div>
              </div>

              {/* اللغات */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">مستوى اللغات</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الإنجليزية
                    </label>
                    <select
                      name="english_level"
                      value={formData.english_level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">اختر المستوى</option>
                      {LANGUAGE_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      العربية
                    </label>
                    <select
                      name="arabic_level"
                      value={formData.arabic_level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">اختر المستوى</option>
                      {LANGUAGE_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الإسبانية
                    </label>
                    <select
                      name="spanish_level"
                      value={formData.spanish_level}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">اختر المستوى</option>
                      {LANGUAGE_LEVELS.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStep === STEPS.MEDICAL && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    فصيلة الدم
                  </label>
                  <select
                    name="blood_type"
                    value={formData.blood_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">اختر فصيلة الدم</option>
                    {BLOOD_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="chronic_conditions"
                    checked={formData.chronic_conditions}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label className="mr-2 text-sm font-medium text-gray-700">
                    يعاني من أمراض مزمنة
                  </label>
                </div>
              </div>

              {formData.chronic_conditions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تفاصيل الأمراض المزمنة
                  </label>
                  <textarea
                    name="chronic_details"
                    value={formData.chronic_details}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="اذكر تفاصيل الأمراض المزمنة..."
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحساسية
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="اذكر أي حساسية (طعام، دواء، الخ)..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات طبية إضافية
                </label>
                <textarea
                  name="medical_notes"
                  value={formData.medical_notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="أي ملاحظات طبية أخرى..."
                />
              </div>
            </div>
          )}

          {currentStep === STEPS.SPORTS && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المركز الأساسي *
                  </label>
                  <select
                    name="primary_position"
                    value={formData.primary_position}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.primary_position ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر المركز الأساسي</option>
                    {POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                  {errors.primary_position && <p className="text-red-500 text-sm mt-1">{errors.primary_position}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المركز الثانوي
                  </label>
                  <select
                    name="secondary_position"
                    value={formData.secondary_position}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">اختر المركز الثانوي</option>
                    {POSITIONS.map(position => (
                      <option key={position} value={position}>{position}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الطول (سم) *
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.height ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="مثال: 180"
                    min="140"
                    max="220"
                  />
                  {errors.height && <p className="text-red-500 text-sm mt-1">{errors.height}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوزن (كغ) *
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="مثال: 75"
                    min="40"
                    max="150"
                  />
                  {errors.weight && <p className="text-red-500 text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    القدم المفضلة *
                  </label>
                  <select
                    name="preferred_foot"
                    value={formData.preferred_foot}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.preferred_foot ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر القدم المفضلة</option>
                    <option value="يمين">يمين</option>
                    <option value="يسار">يسار</option>
                    <option value="كلاهما">كلاهما</option>
                  </select>
                  {errors.preferred_foot && <p className="text-red-500 text-sm mt-1">{errors.preferred_foot}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المستوى الحالي
                  </label>
                  <select
                    name="current_level"
                    value={formData.current_level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">اختر المستوى</option>
                    <option value="هاوي">هاوي</option>
                    <option value="نصف محترف">نصف محترف</option>
                    <option value="محترف">محترف</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  النادي الحالي
                </label>
                <input
                  type="text"
                  name="current_club"
                  value={formData.current_club}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="اسم النادي الحالي"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سنوات الخبرة
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="عدد سنوات الخبرة"
                    min="0"
                    max="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الراتب المطلوب (دولار شهرياً)
                  </label>
                  <input
                    type="number"
                    name="desired_salary"
                    value={formData.desired_salary}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="مثال: 5000"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الإنجازات الرياضية
                </label>
                <textarea
                  name="sports_achievements"
                  value={formData.sports_achievements}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="اذكر الإنجازات والبطولات السابقة..."
                />
              </div>
            </div>
          )}

          {currentStep === STEPS.SUBSCRIPTION && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة الاشتراك *
                  </label>
                  <select
                    name="subscription_status"
                    value={formData.subscription_status}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      errors.subscription_status ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">اختر حالة الاشتراك</option>
                    <option value="مجاني">مجاني</option>
                    <option value="مدفوع">مدفوع</option>
                  </select>
                  {errors.subscription_status && <p className="text-red-500 text-sm mt-1">{errors.subscription_status}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الاشتراك
                  </label>
                  <select
                    name="subscription_type"
                    value={formData.subscription_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">اختر نوع الاشتراك</option>
                    <option value="شهري">شهري</option>
                    <option value="سنوي">سنوي</option>
                  </select>
                </div>
              </div>

              {formData.subscription_status === 'مدفوع' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ بداية الاشتراك
                    </label>
                    <input
                      type="date"
                      name="subscription_start"
                      value={formData.subscription_start ? new Date(formData.subscription_start).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const value = e.target.value ? new Date(e.target.value) : null;
                        setFormData(prev => ({ ...prev, subscription_start: value }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تاريخ انتهاء الاشتراك
                    </label>
                    <input
                      type="date"
                      name="subscription_end"
                      value={formData.subscription_end ? new Date(formData.subscription_end).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        const value = e.target.value ? new Date(e.target.value) : null;
                        setFormData(prev => ({ ...prev, subscription_end: value }));
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات الاشتراك
                </label>
                <textarea
                  name="subscription_notes"
                  value={formData.subscription_notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="أي ملاحظات حول الاشتراك..."
                />
              </div>
            </div>
          )}

          {currentStep === STEPS.CAREER && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الخبرة المهنية
                </label>
                <textarea
                  name="career_history"
                  value={formData.career_history}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="اكتب تاريخ الخبرة المهنية والأندية السابقة..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الأهداف المهنية
                </label>
                <textarea
                  name="career_goals"
                  value={formData.career_goals}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="اكتب الأهداف المهنية المستقبلية..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="available_for_transfer"
                    checked={formData.available_for_transfer}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label className="mr-2 text-sm font-medium text-gray-700">
                    متاح للانتقال
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="willing_to_relocate"
                    checked={formData.willing_to_relocate}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                  />
                  <label className="mr-2 text-sm font-medium text-gray-700">
                    مستعد للانتقال لمدينة أخرى
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  name="additional_notes"
                  value={formData.additional_notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </div>
          )}

          {currentStep === STEPS.MEDIA && (
            <div className="space-y-6">
              {/* Video URLs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  روابط الفيديوهات
                </label>
                <div className="space-y-3">
                  {formData.video_urls.map((url, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newUrls = [...formData.video_urls];
                          newUrls[index] = e.target.value;
                          setFormData(prev => ({ ...prev, video_urls: newUrls }));
                        }}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVideoUrl}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                  >
                    إضافة رابط فيديو
                  </button>
                </div>
              </div>

              {/* Video Files Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رفع ملفات فيديو
                </label>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={handleVideoFileUpload}
                  disabled={uploadingVideos}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                {uploadingVideos && (
                  <div className="mt-2 text-sm text-cyan-600">جاري رفع الفيديوهات...</div>
                )}
                {formData.video_files && formData.video_files.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-2">الفيديوهات المرفوعة:</p>
                    <div className="space-y-2">
                      {formData.video_files.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{video.name}</span>
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            حذف
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صور إضافية
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleAdditionalImagesUpload}
                  disabled={uploadingImages}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
                {uploadingImages && (
                  <div className="mt-2 text-sm text-cyan-600">جاري رفع الصور...</div>
                )}
                {formData.additional_images && formData.additional_images.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">الصور المرفوعة:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {formData.additional_images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8 border-t">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === STEPS.PERSONAL}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>

            <div className="flex gap-3">
              {currentStep === Object.keys(STEPS).length - 1 ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      {isEditing ? 'جاري التحديث...' : 'جاري الحفظ...'}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {isEditing ? 'تحديث البيانات' : 'حفظ اللاعب'}
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
                >
                  التالي
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}