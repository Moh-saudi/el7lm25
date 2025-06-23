'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Plus, Trash2, Save, User, GraduationCap, Heart, Trophy, Camera, FileText, Target, Video, ExternalLink } from 'lucide-react';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';
import { uploadPlayerProfileImage, uploadPlayerAdditionalImage, uploadPlayerDocument, clubUpload, uploadClubVideo } from '@/lib/firebase/upload-media';
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
  profile_image: undefined,
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

export default function AddClubPlayerPage() {
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
        
        // Verify this player belongs to the current club
        if (playerData.club_id !== user?.uid && playerData.clubId !== user?.uid) {
          toast.error('غير مسموح لك بتعديل هذا اللاعب');
          router.push('/dashboard/club/players');
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
          profile_image: playerData.profile_image_url || playerData.profile_image || undefined,
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
        router.push('/dashboard/club/players');
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
      const result = await clubUpload.profileImage(file, user.uid);
      if (result?.url) {
        setFormData(prev => ({
          ...prev,
          profile_image: result.url
        }));
        toast.success('تم رفع الصورة الشخصية بنجاح إلى بوكت الأندية');
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
      videos: [...(prev.videos || []), newVideo]
    }));

    setNewVideoUrl('');
    setNewVideoDesc('');
    toast.success('تم إضافة الفيديو بنجاح');
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;

    // التحقق من نوع الملف
    if (!file.type.startsWith('video/')) {
      toast.error('يرجى اختيار ملف فيديو صحيح');
      return;
    }

    // التحقق من حجم الملف (100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('حجم الفيديو كبير جداً. الحد الأقصى 100MB');
      return;
    }

    setIsUploadingMedia(true);
    try {
      // استخدام الدالة الجديدة المحسنة لرفع الفيديوهات
      const result = await uploadClubVideo(file, user.uid);
      
      if (result?.url) {
        const newVideo = {
          url: result.url,
          desc: file.name || 'فيديو مرفوع',
          type: 'file',
          uploaded_at: new Date().toISOString(),
          size: file.size,
          format: file.type
        };

        setFormData(prev => ({
          ...prev,
          videos: [...(prev.videos || []), newVideo]
        }));

        toast.success(`تم رفع الفيديو بنجاح (${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
        console.log('✅ تم رفع الفيديو بنجاح:', {
          url: result.url,
          size: file.size,
          type: file.type,
          name: file.name
        });
      } else {
        console.error('❌ لم يتم إرجاع URL صحيح من دالة الرفع');
        toast.error('فشل في الحصول على رابط الفيديو');
      }
    } catch (error) {
      console.error('❌ خطأ في رفع الفيديو:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      toast.error(`فشل في رفع الفيديو: ${errorMessage}`);
      
      // رسائل خطأ مخصصة
      if (errorMessage.includes('bucket')) {
        console.warn('💡 تلميح: تأكد من وجود bucket "playerclub" في Supabase Dashboard');
      }
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
        const result = await clubUpload.additionalImage(file, user.uid);
        return {
          url: result.url,
          caption: newImageCaption.trim() || 'صورة جديدة',
          uploaded_at: new Date().toISOString()
        };
      });

      const newImages = await Promise.all(uploadPromises);
      setFormData(prev => ({
        ...prev,
        additional_images: [...(prev.additional_images || []), ...newImages]
      }));

      setNewImageCaption('');
      toast.success('تم رفع الصور بنجاح إلى بوكت الأندية');
      console.log('✅ تم رفع الصور بنجاح:', newImages.length);
    } catch (error) {
      console.error('❌ خطأ في رفع الصور:', error);
      toast.error('فشل في رفع الصور: ' + (error instanceof Error ? error.message : 'خطأ غير معروف'));
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const removeVideo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      videos: (prev.videos || []).filter((_, i) => i !== index)
    }));
    toast.success('تم حذف الفيديو');
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additional_images: (prev.additional_images || []).filter((_, i) => i !== index)
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
          club_id: user.uid,
          clubId: user.uid,
          created_at: serverTimestamp(),
          createdAt: serverTimestamp(),
          subscription_status: 'inactive',
          subscription_type: '',
          subscription_end: null
        };
        
        await addDoc(collection(db, 'players'), newPlayerData);
        toast.success('تم إضافة اللاعب بنجاح');
      }
      
      router.push('/dashboard/club/players');
      
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
                  : 'أضف لاعب جديد لقائمة اللاعبين التابعين للنادي'
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
                    {FOOT_PREFERENCES.map(foot => (
                      <option key={foot} value={foot}>{foot}</option>
                    ))}
                  </select>
                  {errors.preferred_foot && <p className="text-red-500 text-sm mt-1">{errors.preferred_foot}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الطول (سم)
                  </label>
                  <input
                    type="number"
                    name="height"
                    value={formData.height}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="الطول بالسنتيمتر"
                    min="140"
                    max="220"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوزن (كجم)
                  </label>
                  <input
                    type="number"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="الوزن بالكيلوجرام"
                    min="40"
                    max="150"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات رياضية
                </label>
                <textarea
                  name="sports_notes"
                  value={formData.sports_notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="ملاحظات حول الأداء الرياضي للاعب..."
                />
              </div>
            </div>
          )}

          {currentStep === STEPS.SKILLS && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">المهارات التقنية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['التمرير', 'السيطرة على الكرة', 'التسديد', 'المراوغة', 'رأسية الكرة', 'الضربات الحرة'].map(skill => (
                    <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <select
                        value={formData.technical_skills[skill] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          technical_skills: {
                            ...prev.technical_skills,
                            [skill]: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">0</option>
                        {[1, 2, 3, 4, 5].map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">المهارات البدنية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['السرعة', 'القوة', 'التحمل', 'الرشاقة', 'التوازن', 'المرونة'].map(skill => (
                    <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <select
                        value={formData.physical_skills[skill] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          physical_skills: {
                            ...prev.physical_skills,
                            [skill]: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">0</option>
                        {[1, 2, 3, 4, 5].map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">المهارات الاجتماعية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['القيادة', 'العمل الجماعي', 'التواصل', 'الانضباط', 'الثقة بالنفس', 'التحكم في الضغط'].map(skill => (
                    <div key={skill} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{skill}</span>
                      <select
                        value={formData.social_skills[skill] || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          social_skills: {
                            ...prev.social_skills,
                            [skill]: parseInt(e.target.value) || 0
                          }
                        }))}
                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-cyan-500"
                      >
                        <option value="">0</option>
                        {[1, 2, 3, 4, 5].map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === STEPS.OBJECTIVES && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">الأهداف الرياضية</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'professional', label: 'الاحتراف' },
                    { key: 'trials', label: 'التجارب مع الأندية' },
                    { key: 'local_leagues', label: 'اللعب في الدوريات المحلية' },
                    { key: 'arab_leagues', label: 'اللعب في الدوريات العربية' },
                    { key: 'european_leagues', label: 'اللعب في الدوريات الأوروبية' },
                    { key: 'training', label: 'أن أكون مدرب' }
                  ].map(objective => (
                    <div key={objective.key} className="flex items-center p-3 border rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.objectives[objective.key] || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          objectives: {
                            ...prev.objectives,
                            [objective.key]: e.target.checked
                          }
                        }))}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500 ml-3"
                      />
                      <span className="font-medium">{objective.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أهداف أخرى
                </label>
                <textarea
                  value={formData.objectives.other || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    objectives: {
                      ...prev.objectives,
                      other: e.target.value
                    }
                  }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="اكتب أي أهداف أخرى..."
                />
              </div>
            </div>
          )}

          {currentStep === STEPS.MEDIA && (
            <div className="space-y-8">
              {/* Videos Section */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  إدارة الفيديوهات
                </h3>
                
                {/* Add Video URL */}
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        رابط الفيديو (YouTube, Vimeo, أو رابط مباشر)
                      </label>
                      <input
                        type="url"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف الفيديو
                      </label>
                      <input
                        type="text"
                        value={newVideoDesc}
                        onChange={(e) => setNewVideoDesc(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="مثال: فيديو التدريب الأسبوعي"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addVideoUrl}
                    disabled={!newVideoUrl.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة رابط فيديو
                  </button>
                </div>

                {/* Upload Video File */}
                <div className="border-t pt-4 mb-6">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => videoFileRef.current?.click()}
                      disabled={isUploadingMedia}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isUploadingMedia ? (
                        <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      رفع ملف فيديو
                    </button>
                    <span className="text-sm text-gray-500">
                      الحد الأقصى: 100MB | الصيغ المدعومة: MP4, WebM, MOV
                    </span>
                  </div>
                  <input
                    ref={videoFileRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />
                </div>

                {/* Video List */}
                {formData.videos.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">الفيديوهات المضافة ({formData.videos.length})</h4>
                    <div className="space-y-3">
                      {formData.videos.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                          <div className="flex items-center gap-3">
                            <Video className="w-5 h-5 text-blue-600" />
                            <div>
                              <p className="font-medium text-gray-800">{video.desc}</p>
                              <a
                                href={video.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="w-3 h-3" />
                                فتح الرابط
                              </a>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Images Section */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  إدارة الصور
                </h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      تعليق على الصور (اختياري)
                    </label>
                    <input
                      type="text"
                      value={newImageCaption}
                      onChange={(e) => setNewImageCaption(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="مثال: صور من التمرين"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => additionalImagesRef.current?.click()}
                      disabled={isUploadingMedia}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                    >
                      {isUploadingMedia ? (
                        <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      رفع صور
                    </button>
                    <span className="text-sm text-gray-500">
                      يمكن اختيار عدة صور | الصيغ المدعومة: JPG, PNG, WebP
                    </span>
                  </div>
                  <input
                    ref={additionalImagesRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleAdditionalImagesUpload}
                    className="hidden"
                  />
                </div>

                {/* Images Grid */}
                {formData.additional_images.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">الصور المضافة ({formData.additional_images.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {formData.additional_images.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={image.url}
                              alt={`صورة ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {image.caption && (
                            <p className="text-xs text-gray-600 mt-1 truncate">{image.caption}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-800 mb-2">ملخص الوسائط</h4>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Video className="w-4 h-4 text-blue-600" />
                    {formData.videos.length} فيديو
                  </span>
                  <span className="flex items-center gap-1">
                    <Camera className="w-4 h-4 text-purple-600" />
                    {formData.additional_images.length} صورة
                  </span>
                </div>
              </div>
            </div>
          )}

          {currentStep === STEPS.CONTRACTS && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    النادي الحالي
                  </label>
                  <input
                    type="text"
                    name="current_club"
                    value={formData.current_club || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="اسم النادي الحالي"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    متعاقد حالياً؟
                  </label>
                  <select
                    name="currently_contracted"
                    value={formData.currently_contracted}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="no">لا</option>
                    <option value="yes">نعم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    يحمل جواز سفر؟
                  </label>
                  <select
                    name="has_passport"
                    value={formData.has_passport}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="no">لا</option>
                    <option value="yes">نعم</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم القميص المفضل
                  </label>
                  <input
                    type="number"
                    name="favorite_jersey_number"
                    value={formData.favorite_jersey_number}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    placeholder="رقم من 1-99"
                    min="1"
                    max="99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  مصدر معرفة اللاعب
                </label>
                <input
                  type="text"
                  name="ref_source"
                  value={formData.ref_source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="كيف تعرفت على هذا اللاعب؟"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <textarea
                  name="address"
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="العنوان الكامل..."
                />
              </div>

              {/* Official Contact */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">معلومات الاتصال الرسمي</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم جهة الاتصال
                    </label>
                    <input
                      type="text"
                      value={formData.official_contact?.name || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        official_contact: {
                          ...prev.official_contact,
                          name: e.target.value,
                          title: prev.official_contact?.title || '',
                          phone: prev.official_contact?.phone || '',
                          email: prev.official_contact?.email || ''
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="اسم الشخص المسؤول"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      المنصب
                    </label>
                    <input
                      type="text"
                      value={formData.official_contact?.title || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        official_contact: {
                          ...prev.official_contact,
                          name: prev.official_contact?.name || '',
                          title: e.target.value,
                          phone: prev.official_contact?.phone || '',
                          email: prev.official_contact?.email || ''
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="مدير، مدرب، والد، الخ"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={formData.official_contact?.phone || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        official_contact: {
                          ...prev.official_contact,
                          name: prev.official_contact?.name || '',
                          title: prev.official_contact?.title || '',
                          phone: e.target.value,
                          email: prev.official_contact?.email || ''
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="رقم هاتف جهة الاتصال"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={formData.official_contact?.email || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        official_contact: {
                          ...prev.official_contact,
                          name: prev.official_contact?.name || '',
                          title: prev.official_contact?.title || '',
                          phone: prev.official_contact?.phone || '',
                          email: e.target.value
                        }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="البريد الإلكتروني لجهة الاتصال"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            
            <div className="text-sm text-gray-500">
              الخطوة {currentStep + 1} من {Object.keys(STEPS).length}
            </div>

            {currentStep === Object.keys(STEPS).length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || loadingPlayer}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {(loading || loadingPlayer) ? (
                  <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {isEditing ? 'حفظ التغييرات' : 'حفظ اللاعب'}
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
    </main>
  );
} 