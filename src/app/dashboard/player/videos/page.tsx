'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { motion } from 'framer-motion';
import { 
  VideoIcon, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Loader,
  FileVideo,
  Upload,
  Youtube,
  Share2
} from 'lucide-react';
import type { Video } from '@/types/player';
import VideoManager from '@/components/video/VideoManager';

export default function VideosPage(props: any) {
  const router = useRouter();
  const [user, loading, authError] = useAuthState(auth);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const MAX_VIDEOS = 10;

  // جلب الفيديوهات من Firebase
  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      try {
        setIsLoading(true);
        const playerDoc = await getDoc(doc(db, 'players', user.uid));
        
        if (playerDoc.exists()) {
          const data = playerDoc.data();
          // تأكد أن كل فيديو له desc نصي وليس undefined
          const safeVideos = (data.videos || []).map((v: any) => ({
            url: v.url,
            desc: v.desc ?? ''
          }));
          setVideos(safeVideos);
        } else {
          console.log('لا توجد بيانات للاعب');
        }
      } catch (error) {
        console.error('خطأ في جلب الفيديوهات:', error);
        setSaveMessage({ type: 'error', text: 'فشل في جلب الفيديوهات' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [user, router]);

  // حفظ الفيديوهات في Firebase
  const handleSaveVideos = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      await updateDoc(doc(db, 'players', user.uid), {
        videos: videos,
        updated_at: new Date()
      });
      
      setHasUnsavedChanges(false);
      setSaveMessage({ type: 'success', text: 'تم حفظ الفيديوهات بنجاح!' });
      
      // إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('خطأ في حفظ الفيديوهات:', error);
      setSaveMessage({ type: 'error', text: 'فشل في حفظ الفيديوهات. يرجى المحاولة مرة أخرى.' });
    } finally {
      setIsSaving(false);
    }
  };

  // تحديث الفيديوهات
  const handleUpdateVideos = (newVideos: Video[]) => {
    // تأكد أن كل فيديو له desc نصي وليس undefined
    const safeVideos = newVideos.map((v: any) => ({
      url: v.url,
      desc: v.desc ?? ''
    }));
    setVideos(safeVideos);
    setHasUnsavedChanges(true);
  };

  // التحقق من وجود تغييرات غير محفوظة عند مغادرة الصفحة
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  if (loading || isLoading) {
    return (
        <div className="flex items-center justify-center min-h-96">
          <div className="flex flex-col items-center gap-4">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-gray-600">جاري تحميل الفيديوهات...</p>
          </div>
        </div>
    );
  }

  // محتوى الصفحة الرئيسي (عرض الفيديوهات)
  return (
    <div className="container p-4 mx-auto">
      {/* الكروت الإحصائية */}
      <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <FileVideo className="w-8 h-8 text-blue-500" />
          <div>
            <div className="text-sm text-gray-500">عدد الفيديوهات المرفوعة</div>
            <div className="text-2xl font-bold">{videos.length}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <Upload className="w-8 h-8 text-green-500" />
          <div>
            <div className="text-sm text-gray-500">الحد الأقصى للرفع</div>
            <div className="text-2xl font-bold">{MAX_VIDEOS}</div>
          </div>
        </div>
      </div>

      {/* ملاحظات وتعليمات */}
      <div className="p-4 mb-6 border-l-4 border-yellow-400 rounded bg-yellow-50">
        <ul className="space-y-1 text-sm text-yellow-800 list-disc list-inside">
          <li>الحد الأقصى لعدد الفيديوهات: {MAX_VIDEOS} فيديو.</li>
          <li>الصيغ المسموحة: mp4, webm, ogg أو رابط يوتيوب/فيميو.</li>
          <li>يفضل أن يكون الفيديو قصير وواضح.</li>
          <li>يمكنك إضافة وصف لكل فيديو.</li>
        </ul>
      </div>

      {/* تعليمات رفع الفيديو */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">كيفية رفع الفيديو</h3>
        
        {/* يوتيوب */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Youtube className="w-12 h-12 text-red-600" />
            <h4 className="text-lg font-medium text-blue-600">رفع الفيديو على يوتيوب:</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>قم بزيارة موقع <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">YouTube</a> وقم بتسجيل الدخول</li>
            <li>اضغط على زر "إنشاء" في الأعلى ثم اختر "رفع فيديو"</li>
            <li>اختر الفيديو من جهازك</li>
            <li>أضف عنوان ووصف للفيديو</li>
            <li>اضبط إعدادات الخصوصية على "عام"</li>
            <li>انتظر حتى يتم رفع الفيديو</li>
            <li>انسخ رابط الفيديو من شريط العنوان</li>
          </ol>
        </div>

        {/* تيك توك */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-12 h-12 text-black" />
            <h4 className="text-lg font-medium text-blue-600">رفع الفيديو على تيك توك:</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>افتح تطبيق تيك توك على هاتفك</li>
            <li>اضغط على زر "+" في الأسفل</li>
            <li>اختر الفيديو من معرض الصور</li>
            <li>أضف وصف للفيديو</li>
            <li>اضغط على "نشر"</li>
            <li>بعد النشر، اضغط على "مشاركة" ثم اختر "نسخ الرابط"</li>
          </ol>
        </div>

        {/* إضافة الفيديو في المنصة */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FileVideo className="w-12 h-12 text-blue-600" />
            <h4 className="text-lg font-medium text-blue-600">إضافة الفيديو في المنصة:</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>اضغط على زر "إضافة فيديو جديد"</li>
            <li>الصق رابط الفيديو من يوتيوب أو تيك توك</li>
            <li>أضف وصفًا مختصرًا للفيديو (مثال: "هدف من مباراة الأهلي")</li>
            <li>اضغط على "حفظ"</li>
          </ol>
        </div>
      </div>

      {/* إدارة الفيديوهات */}
      <VideoManager videos={videos} onUpdate={handleUpdateVideos} maxVideos={MAX_VIDEOS} />

      {/* زر الحفظ */}
      <div className="flex gap-2 mt-6">
        <button
          onClick={handleSaveVideos}
          disabled={!hasUnsavedChanges || isSaving}
          className="px-4 py-2 text-white bg-blue-600 rounded disabled:opacity-50"
        >
          {isSaving ? 'جاري الحفظ...' : 'حفظ الفيديوهات'}
        </button>
      </div>

      {/* رسائل النجاح/الخطأ */}
      {saveMessage && (
        <div className={`mt-4 p-2 rounded ${saveMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {saveMessage.text}
        </div>
      )}
    </div>
  );
} 