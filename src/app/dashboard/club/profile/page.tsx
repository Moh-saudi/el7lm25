'use client';
import { useAuth } from '@/lib/firebase/auth-provider';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, Users, FileText, Trophy, User, MapPin, Phone, Mail, Globe, Facebook, Twitter, Instagram, Calendar, ArrowLeft, School, Award, Building2, UserCircle2, Plus, Sun, Moon, LogOut } from 'lucide-react';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';
import { db } from '@/lib/firebase/config';
import { uploadFile, getPublicUrl } from '@/lib/supabase/storage';

interface ClubData {
  name: string;
  logo: string;
  coverImage: string;
  gallery: string[];
  phone: string;
  email: string;
  city: string;
  country: string;
  founded: string;
  type: string;
  description: string;
  manager: string;
  address: string;
  website: string;
  facebook: string;
  twitter: string;
  instagram: string;
  stats: {
    players: number;
    contracts: number;
    trophies: number;
    staff: number;
  };
  academies: {
    total: number;
    locations: string[];
  };
  schools: {
    men: number;
    women: number;
    locations: string[];
  };
  trophies: {
    name: string;
    year: string;
    category: string;
  }[];
  board: {
    chairman: {
      name: string;
      phone: string;
      email: string;
      image: string;
    };
    youthDirector: {
      name: string;
      phone: string;
      email: string;
      image: string;
    };
  };
}

const initialClubData: ClubData = {
  name: '',
  logo: '/images/club-avatar.png',
  coverImage: '/images/hero-1.jpg',
  gallery: [],
  phone: '',
  email: '',
  city: '',
  country: '',
  founded: '',
  type: '',
  description: '',
  manager: '',
  address: '',
  website: '',
  facebook: '',
  twitter: '',
  instagram: '',
  stats: {
    players: 0,
    contracts: 0,
    trophies: 0,
    staff: 0
  },
  academies: {
    total: 0,
    locations: []
  },
  schools: {
    men: 0,
    women: 0,
    locations: []
  },
  trophies: [],
  board: {
    chairman: {
      name: '',
      phone: '',
      email: '',
      image: '/images/club-avatar.png'
    },
    youthDirector: {
      name: '',
      phone: '',
      email: '',
      image: '/images/club-avatar.png'
    }
  }
};

const LOGO_WIDTH = 300, LOGO_HEIGHT = 300;
const COVER_WIDTH = 1200, COVER_HEIGHT = 400;

function validateImage(file: File, type: 'logo' | 'cover'): Promise<string | null> {
  return new Promise((resolve) => {
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      resolve('الرجاء اختيار صورة بصيغة PNG أو JPG فقط.');
      return;
    }
    const img = new window.Image();
    img.onload = function () {
      if (type === 'logo' && (img.width !== LOGO_WIDTH || img.height !== LOGO_HEIGHT)) {
        resolve(`مقاس اللوجو يجب أن يكون ${LOGO_WIDTH}×${LOGO_HEIGHT} بكسل.`);
      } else if (type === 'cover' && (img.width !== COVER_WIDTH || img.height !== COVER_HEIGHT)) {
        resolve(`مقاس الغلاف يجب أن يكون ${COVER_WIDTH}×${COVER_HEIGHT} بكسل.`);
      } else {
        resolve(null);
      }
    };
    img.onerror = function () {
      resolve('تعذر قراءة الصورة.');
    };
    img.src = URL.createObjectURL(file);
  });
}

const getSupabaseImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const { data: { publicUrl } } = supabase.storage.from('clubavatar').getPublicUrl(path);
  return publicUrl || '';
};

const requiredFields = [
  { key: 'name', label: 'اسم النادي' },
  { key: 'city', label: 'المدينة' },
  { key: 'country', label: 'الدولة' },
  { key: 'phone', label: 'رقم الهاتف' },
  { key: 'email', label: 'البريد الإلكتروني' },
  { key: 'logo', label: 'شعار النادي' },
  { key: 'coverImage', label: 'صورة الغلاف' }
];

export default function ClubProfilePage() {
  const { userData, user, signOut: authSignOut } = useAuth();
  const router = useRouter();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clubData, setClubData] = useState<ClubData>(initialClubData);
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [darkMode, setDarkMode] = useState(false);

  const fetchClubData = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const clubRef = doc(db, 'clubs', user.uid);
      const clubDoc = await getDoc(clubRef);
      
      let data = {};
      
      if (clubDoc.exists()) {
        data = clubDoc.data();
      } else {
        // إنشاء مستند أساسي إذا لم يكن موجوداً
        const basicData = {
          ...initialClubData,
          name: userData?.name || 'نادي جديد',
          email: userData?.email || '',
          phone: userData?.phone || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          accountType: 'club',
          isVerified: false,
          isPremium: false
        };
        
        await setDoc(clubRef, basicData);
        data = basicData;
      }
      
      const mergedData = {
        ...initialClubData,
        ...data,
        name: (data.name && data.name.trim()) ? data.name : (userData?.name || 'نادي جديد'),
        phone: (data.phone && data.phone.trim()) ? data.phone : (userData?.phone || ''),
        email: (data.email && data.email.trim()) ? data.email : (userData?.email || ''),
        coverImage: getSupabaseImageUrl(data.coverImage || initialClubData.coverImage),
        logo: getSupabaseImageUrl(data.logo || initialClubData.logo),
        board: {
          chairman: {
            ...initialClubData.board.chairman,
            ...(data.board?.chairman || {}),
            image: getSupabaseImageUrl(data.board?.chairman?.image || initialClubData.board.chairman.image)
          },
          youthDirector: {
            ...initialClubData.board.youthDirector,
            ...(data.board?.youthDirector || {}),
            image: getSupabaseImageUrl(data.board?.youthDirector?.image || initialClubData.board.youthDirector.image)
          }
        }
      };
      setClubData(mergedData);
    } catch (error) {
      console.error('Error fetching club data:', error);
      toast.error('حدث خطأ أثناء جلب بيانات النادي');
    } finally {
      setLoading(false);
    }
  }, [user, userData]);

  useEffect(() => {
    if (user && userData) {
      fetchClubData();
    }
  }, [user, userData, fetchClubData]);

  useEffect(() => {
    // تحقق من إعدادات النظام عند تحميل الصفحة
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDarkMode);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Log coverImage after fetching data
  useEffect(() => {
    console.log('coverImage from DB:', clubData.coverImage);
  }, [clubData.coverImage]);

  const handleInputChange = (field: string, value: any, parentField?: string, subField?: string) => {
    setClubData(prev => {
      if (!prev) return prev;
      
      if (parentField && subField) {
        const parent = prev[parentField as keyof ClubData] as Record<string, any>;
        return {
          ...prev,
          [parentField]: {
            ...parent,
            [subField]: value
          }
        };
      } else if (parentField) {
        return {
          ...prev,
          [parentField]: value
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'cover' | 'gallery' | 'chairman' | 'youthDirector') => {
    if (!user?.uid) return;
    try {
      if (!file.type.startsWith('image/')) {
        toast.error('يرجى اختيار ملف صورة صالح');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }
      
      setUploading(true);
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${timestamp}.${fileExt}`;
      const filePath = `${user.uid}/${type}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('clubavatar')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) {
        toast.error('حدث خطأ أثناء رفع الصورة');
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('clubavatar')
        .getPublicUrl(filePath);

      let updatedData = { ...clubData };
      
      if (type === 'gallery') {
        updatedData.gallery = [...(clubData.gallery || []), publicUrl];
      } else if (type === 'chairman') {
        updatedData.board.chairman.image = publicUrl;
      } else if (type === 'youthDirector') {
        updatedData.board.youthDirector.image = publicUrl;
      } else if (type === 'cover') {
        updatedData.coverImage = publicUrl;
      } else if (type === 'logo') {
        updatedData.logo = publicUrl;
      }
      
      setClubData(updatedData);
      toast.success('تم رفع الصورة بنجاح - اضغط "حفظ التغييرات" لحفظها نهائياً');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!user?.uid || !clubData) {
      toast.error('لم يتم العثور على بيانات المستخدم');
      return;
    }
    setUploading(true);
    try {
      // تحضير البيانات للتنظيف
      const rawData = {
        name: clubData.name || '',
        logo: clubData.logo || initialClubData.logo,
        coverImage: clubData.coverImage || initialClubData.coverImage,
        gallery: Array.isArray(clubData.gallery) ? clubData.gallery.filter(Boolean) : [],
        phone: clubData.phone || '',
        email: clubData.email || '',
        city: clubData.city || '',
        country: clubData.country || '',
        founded: clubData.founded || '',
        type: clubData.type || '',
        description: clubData.description || '',
        manager: clubData.manager || '',
        address: clubData.address || '',
        website: clubData.website || '',
        facebook: clubData.facebook || '',
        twitter: clubData.twitter || '',
        instagram: clubData.instagram || '',
        stats: {
          players: Number(clubData.stats?.players) || 0,
          contracts: Number(clubData.stats?.contracts) || 0,
          trophies: Number(clubData.stats?.trophies) || 0,
          staff: Number(clubData.stats?.staff) || 0
        },
        academies: {
          total: Number(clubData.academies?.total) || 0,
          locations: Array.isArray(clubData.academies?.locations) ? clubData.academies.locations.filter(Boolean) : []
        },
        schools: {
          men: Number(clubData.schools?.men) || 0,
          women: Number(clubData.schools?.women) || 0,
          locations: Array.isArray(clubData.schools?.locations) ? clubData.schools.locations.filter(Boolean) : []
        },
        trophies: Array.isArray(clubData.trophies) ? clubData.trophies.filter(Boolean) : [],
        board: {
          chairman: {
            name: clubData.board?.chairman?.name || '',
            phone: clubData.board?.chairman?.phone || '',
            email: clubData.board?.chairman?.email || '',
            image: clubData.board?.chairman?.image || initialClubData.board.chairman.image
          },
          youthDirector: {
            name: clubData.board?.youthDirector?.name || '',
            phone: clubData.board?.youthDirector?.phone || '',
            email: clubData.board?.youthDirector?.email || '',
            image: clubData.board?.youthDirector?.image || initialClubData.board.youthDirector.image
          }
        },
        updatedAt: new Date(),
        accountType: 'club',
        isVerified: false,
        isPremium: false
      };

      // استخدام دالة تنظيف البيانات العالمية من firestore-fix.js
      const dataToSave = (window as any).cleanFirestoreData ? 
        (window as any).cleanFirestoreData(rawData) : 
        rawData;

      console.log('Raw data:', rawData);
      console.log('Cleaned data to save:', dataToSave);

      const clubRef = doc(db, 'clubs', user.uid);
      
      // التحقق من وجود المستند أولاً
      const clubDoc = await getDoc(clubRef);
      
      if (clubDoc.exists()) {
        // المستند موجود - نحدثه
        await updateDoc(clubRef, dataToSave);
      } else {
        // المستند غير موجود - ننشئه
        await setDoc(clubRef, {
          ...dataToSave,
          createdAt: new Date(),
          accountType: 'club',
          isVerified: false,
          isPremium: false
        });
      }
      
      toast.success('🎉 تم حفظ بيانات النادي بنجاح! أنت رائع، استمر في تطوير ناديك! 🏆');
      await fetchClubData(); // إعادة جلب البيانات بعد الحفظ
      setEditMode(false);
      setMissingFields([]);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authSignOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل بيانات النادي...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 min-h-0 p-6 mx-4 my-6 overflow-auto rounded-lg shadow-inner md:p-10 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl px-4 py-10 mx-auto">
        {/* زر العودة */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-6 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          العودة للوحة التحكم
        </button>

        {/* صورة الغلاف */}
        <div className="relative h-48 mb-8 overflow-hidden rounded-2xl">
          <img
            src={clubData?.coverImage || '/images/hero-1.jpg'}
            alt="صورة الغلاف"
            className="object-cover w-full h-full"
          />
          {editMode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <label className="p-2 transition rounded-lg cursor-pointer bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                />
                {uploading ? 'جاري الرفع...' : 'تغيير صورة الغلاف'}
              </label>
            </div>
          )}
        </div>

        {/* كرت بيانات النادي */}
        <div className="flex flex-col items-center gap-8 p-8 mb-8 bg-white shadow-lg dark:bg-gray-800 rounded-2xl md:flex-row">
          <div className="relative">
            <img
              src={clubData?.logo || '/images/club-avatar.png'}
              alt="شعار النادي"
              className="object-cover w-32 h-32 border-4 rounded-full shadow border-primary dark:border-primary/80"
            />
            {editMode && (
              <label className="absolute inset-0 flex items-center justify-center transition rounded-full cursor-pointer bg-black/50 hover:bg-black/60">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                />
                <Edit className="text-white" size={24} />
              </label>
            )}
          </div>
          <div className="flex-1 text-right">
            <h2 className="mb-2 text-3xl font-bold text-primary dark:text-primary/90">{clubData?.name}</h2>
            <p className="mb-2 text-gray-600 dark:text-gray-300">{clubData?.description}</p>
            <div className="flex flex-wrap gap-4 mt-2 text-base text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1"><MapPin size={18} /> {clubData?.city}, {clubData?.country}</span>
              <span className="flex items-center gap-1"><Calendar size={18} /> تأسس {clubData?.founded}</span>
              <span className="flex items-center gap-1"><User size={18} /> نوع النادي: {clubData?.type}</span>
            </div>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2 text-white transition rounded-lg shadow bg-gradient-to-l from-blue-400 to-blue-600 hover:scale-105 dark:from-blue-500 dark:to-blue-700"
            onClick={() => editMode ? handleSaveChanges() : setEditMode(true)}
            disabled={uploading}
          >
            <Edit size={18} /> {editMode ? 'حفظ التغييرات' : 'تعديل البيانات'}
          </button>
        </div>

        {/* كروت الإحصائيات */}
        <div className="grid grid-cols-2 gap-6 mb-8 md:grid-cols-4">
          <div className="flex flex-col items-center p-5 text-white shadow bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 rounded-xl">
            <Users size={28} />
            <div className="mt-2 text-2xl font-bold">{clubData?.stats?.players ?? 0}</div>
            <div className="mt-1 text-sm">اللاعبون</div>
          </div>
          <div className="flex flex-col items-center p-5 text-white shadow bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 rounded-xl">
            <FileText size={28} />
            <div className="mt-2 text-2xl font-bold">{clubData?.stats?.contracts ?? 0}</div>
            <div className="mt-1 text-sm">العقود النشطة</div>
          </div>
          <div className="flex flex-col items-center p-5 text-white shadow bg-gradient-to-br from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700 rounded-xl">
            <Trophy size={28} />
            <div className="mt-2 text-2xl font-bold">{clubData?.stats?.trophies ?? 0}</div>
            <div className="mt-1 text-sm">البطولات</div>
          </div>
          <div className="flex flex-col items-center p-5 text-white shadow bg-gradient-to-br from-purple-400 to-purple-600 dark:from-purple-500 dark:to-purple-700 rounded-xl">
            <User size={28} />
            <div className="mt-2 text-2xl font-bold">{clubData?.stats?.staff ?? 0}</div>
            <div className="mt-1 text-sm">المدربون/الإداريون</div>
          </div>
        </div>

        {/* معلومات الأكاديميات والمدارس */}
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
          <div className="p-6 bg-white shadow dark:bg-gray-800 rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-primary dark:text-primary/90">
              <School size={20} /> الأكاديميات والمدارس
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">عدد الأكاديميات</span>
                <span className="font-bold dark:text-white">{clubData?.academies?.total ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">مدارس كرة القدم للرجال</span>
                <span className="font-bold dark:text-white">{clubData?.schools?.men ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-300">مدارس كرة القدم للسيدات</span>
                <span className="font-bold dark:text-white">{clubData?.schools?.women ?? 0}</span>
              </div>
            </div>
          </div>

          {/* البطولات */}
          <div className="p-6 bg-white shadow dark:bg-gray-800 rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-primary dark:text-primary/90">
              <Award size={20} /> البطولات
            </h3>
            <div className="space-y-3">
              {clubData?.trophies?.map((trophy, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <span className="font-medium dark:text-white">{trophy.name}</span>
                  <span className="text-gray-600 dark:text-gray-300">{trophy.year}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* معلومات مجلس الإدارة */}
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-2">
          <div className="p-6 bg-white shadow dark:bg-gray-800 rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-primary dark:text-primary/90">
              <UserCircle2 size={20} /> رئيس مجلس الإدارة
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={clubData?.board?.chairman?.image || '/images/club-avatar.png'}
                alt="صورة رئيس مجلس الإدارة"
                className="object-cover w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <h4 className="font-bold dark:text-white">{clubData?.board?.chairman?.name}</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <Phone size={16} /> {clubData?.board?.chairman?.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={16} /> {clubData?.board?.chairman?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white shadow dark:bg-gray-800 rounded-xl">
            <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-primary dark:text-primary/90">
              <UserCircle2 size={20} /> رئيس قطاع الناشئين
            </h3>
            <div className="flex items-center gap-4">
              <img
                src={clubData?.board?.youthDirector?.image || '/images/club-avatar.png'}
                alt="صورة رئيس قطاع الناشئين"
                className="object-cover w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <h4 className="font-bold dark:text-white">{clubData?.board?.youthDirector?.name}</h4>
                <div className="space-y-1 text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <Phone size={16} /> {clubData?.board?.youthDirector?.phone}
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={16} /> {clubData?.board?.youthDirector?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* معرض الصور */}
        <div className="p-6 mb-8 bg-white shadow dark:bg-gray-800 rounded-xl">
          <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-primary dark:text-primary/90">
            <Building2 size={20} /> معرض الصور
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {clubData?.gallery?.map((image, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg aspect-square">
                <img
                  src={image}
                  alt={`صورة ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
            {editMode && (
              <label className="flex items-center justify-center transition border-2 border-gray-300 border-dashed rounded-lg cursor-pointer dark:border-gray-600 aspect-square hover:border-primary dark:hover:border-primary/80">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'gallery')}
                />
                <Plus size={24} className="text-gray-400 dark:text-gray-500" />
              </label>
            )}
          </div>
        </div>

        {/* معلومات التواصل */}
        <div className="p-6 bg-white shadow dark:bg-gray-800 rounded-xl">
          <h3 className="mb-4 text-lg font-bold text-primary dark:text-primary/90">معلومات التواصل</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Phone size={18} /> {clubData?.phone}
              </p>
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Mail size={18} /> {clubData?.email}
              </p>
              <p className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <MapPin size={18} /> {clubData?.address}
              </p>
            </div>
            <div className="space-y-3">
              <a href={clubData?.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <Globe size={18} /> الموقع الإلكتروني
              </a>
              <a href={clubData?.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <Facebook size={18} /> Facebook
              </a>
              <a href={clubData?.twitter} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <Twitter size={18} /> Twitter
              </a>
              <a href={clubData?.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400">
                <Instagram size={18} /> Instagram
              </a>
            </div>
          </div>
        </div>

        {/* نافذة التعديل */}
        {editMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setEditMode(false)}
                className="absolute top-4 left-4 text-gray-400 hover:text-red-500 text-2xl font-bold"
                aria-label="إغلاق"
                type="button"
              >
                ×
              </button>
              <h2 className="mb-6 text-xl font-bold text-primary dark:text-primary/90">تعديل بيانات النادي</h2>
              {missingFields.length > 0 && (
                <div className="mb-2 font-bold text-red-600 dark:text-red-400">يرجى استكمال الحقول التالية: {missingFields.join('، ')}</div>
              )}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* المعلومات الأساسية */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">المعلومات الأساسية</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">اسم النادي</label>
                    <input
                      type="text"
                      value={clubData?.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">الوصف</label>
                    <textarea
                      value={clubData?.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">نوع النادي</label>
                    <input
                      type="text"
                      value={clubData?.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">تاريخ التأسيس</label>
                    <input
                      type="text"
                      value={clubData?.founded}
                      onChange={(e) => handleInputChange('founded', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* معلومات الموقع */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">معلومات الموقع</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">المدينة</label>
                    <input
                      type="text"
                      value={clubData?.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">الدولة</label>
                    <input
                      type="text"
                      value={clubData?.country}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">العنوان</label>
                    <input
                      type="text"
                      value={clubData?.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* معلومات التواصل */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">معلومات التواصل</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={clubData?.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={clubData?.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">الموقع الإلكتروني</label>
                    <input
                      type="url"
                      value={clubData?.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* روابط التواصل الاجتماعي */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">روابط التواصل الاجتماعي</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">Facebook</label>
                    <input
                      type="url"
                      value={clubData?.facebook}
                      onChange={(e) => handleInputChange('facebook', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">Twitter</label>
                    <input
                      type="url"
                      value={clubData?.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">Instagram</label>
                    <input
                      type="url"
                      value={clubData?.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* معلومات الأكاديميات والمدارس */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">الأكاديميات والمدارس</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">عدد الأكاديميات</label>
                    <input
                      type="number"
                      value={clubData?.academies?.total}
                      onChange={(e) => handleInputChange('total', parseInt(e.target.value), 'academies')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">مدارس كرة القدم للرجال</label>
                    <input
                      type="number"
                      value={clubData?.schools?.men}
                      onChange={(e) => handleInputChange('men', parseInt(e.target.value), 'schools')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">مدارس كرة القدم للسيدات</label>
                    <input
                      type="number"
                      value={clubData?.schools?.women}
                      onChange={(e) => handleInputChange('women', parseInt(e.target.value), 'schools')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* معلومات مجلس الإدارة */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">معلومات مجلس الإدارة</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">اسم رئيس مجلس الإدارة</label>
                    <input
                      type="text"
                      value={clubData?.board?.chairman?.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'board', 'chairman')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">هاتف رئيس مجلس الإدارة</label>
                    <input
                      type="tel"
                      value={clubData?.board?.chairman?.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'board', 'chairman')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">بريد رئيس مجلس الإدارة</label>
                    <input
                      type="email"
                      value={clubData?.board?.chairman?.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'board', 'chairman')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* معلومات رئيس قطاع الناشئين */}
                <div className="space-y-4">
                  <h3 className="mb-3 text-lg font-bold dark:text-white">معلومات رئيس قطاع الناشئين</h3>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">الاسم</label>
                    <input
                      type="text"
                      value={clubData?.board?.youthDirector?.name}
                      onChange={(e) => handleInputChange('name', e.target.value, 'board', 'youthDirector')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">رقم الهاتف</label>
                    <input
                      type="tel"
                      value={clubData?.board?.youthDirector?.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value, 'board', 'youthDirector')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium dark:text-gray-300">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={clubData?.board?.youthDirector?.email}
                      onChange={(e) => handleInputChange('email', e.target.value, 'board', 'youthDirector')}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* صور الغلاف واللوجو */}
                <div className="flex flex-col gap-4 mb-4">
                  <label className="font-bold dark:text-white">شعار النادي (PNG/JPG، {LOGO_WIDTH}×{LOGO_HEIGHT} بكسل):</label>
                  <input type="file" accept="image/png,image/jpeg" onChange={e => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'logo');
                  }} disabled={uploading} className="dark:text-gray-300" />
                  <label className="font-bold dark:text-white">صورة الغلاف (PNG/JPG، {COVER_WIDTH}×{COVER_HEIGHT} بكسل):</label>
                  <input type="file" accept="image/png,image/jpeg" onChange={e => {
                    if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'cover');
                  }} disabled={uploading} className="dark:text-gray-300" />
                  {imageError && <div className="font-bold text-red-600 dark:text-red-400">{imageError}</div>}
                </div>

                {/* صورة رئيس مجلس الإدارة */}
                <div>
                  <label className="block mb-2 font-medium dark:text-gray-300">صورة رئيس مجلس الإدارة</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'chairman');
                    }}
                    className="dark:text-gray-300"
                  />
                </div>

                {/* صورة رئيس قطاع الناشئين */}
                <div>
                  <label className="block mb-2 font-medium dark:text-gray-300">صورة رئيس قطاع الناشئين</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      if (e.target.files?.[0]) handleImageUpload(e.target.files[0], 'youthDirector');
                    }}
                    className="dark:text-gray-300"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setEditMode(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleSaveChanges}
                  disabled={uploading}
                  className="px-4 py-2 text-white rounded-lg bg-gradient-to-l from-blue-400 to-blue-600 hover:opacity-90 disabled:opacity-50 dark:from-blue-500 dark:to-blue-700"
                >
                  {uploading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 