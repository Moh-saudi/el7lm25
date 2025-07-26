'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/translations/simple-context';
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
  const { t, tWithVars } = useTranslation();
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
        setSaveMessage({ type: 'error', text: t('dashboard.player.videos.fetchError') });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [user, router, t]);

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
      setSaveMessage({ type: 'success', text: t('dashboard.player.videos.saveSuccess') });
      
      // إخفاء الرسالة بعد 3 ثواني
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      console.error('خطأ في حفظ الفيديوهات:', error);
      setSaveMessage({ type: 'error', text: t('dashboard.player.videos.saveError') });
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
            <p className="text-gray-600">{t('dashboard.player.videos.loading')}</p>
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
            <div className="text-sm text-gray-500">{t('dashboard.player.videos.uploadedCount')}</div>
            <div className="text-2xl font-bold">{videos.length}</div>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <Upload className="w-8 h-8 text-green-500" />
          <div>
            <div className="text-sm text-gray-500">{t('dashboard.player.videos.maxUpload')}</div>
            <div className="text-2xl font-bold">{MAX_VIDEOS}</div>
          </div>
        </div>
      </div>

      {/* ملاحظات وتعليمات */}
      <div className="p-4 mb-6 border-l-4 border-yellow-400 rounded bg-yellow-50">
        <ul className="space-y-1 text-sm text-yellow-800 list-disc list-inside">
          <li>{tWithVars('dashboard.player.videos.notes.maxVideos', { count: MAX_VIDEOS })}</li>
          <li>{t('dashboard.player.videos.notes.formats')}</li>
          <li>{t('dashboard.player.videos.notes.quality')}</li>
          <li>{t('dashboard.player.videos.notes.description')}</li>
        </ul>
      </div>

      {/* تعليمات رفع الفيديو */}
      <div className="p-6 mb-6 bg-white rounded-lg shadow">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">{t('dashboard.player.videos.howToUpload.title')}</h3>
        
        {/* يوتيوب */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Youtube className="w-12 h-12 text-red-600" />
            <h4 className="text-lg font-medium text-blue-600">{t('dashboard.player.videos.howToUpload.youtube.title')}</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>{t('dashboard.player.videos.howToUpload.youtube.step1')}</li>
            <li>{t('dashboard.player.videos.howToUpload.youtube.step2')}</li>
            <li>{t('dashboard.player.videos.howToUpload.youtube.step3')}</li>
            <li>{t('dashboard.player.videos.howToUpload.youtube.step4')}</li>
            <li>{t('dashboard.player.videos.howToUpload.youtube.step5')}</li>
            <li>{t('dashboard.player.videos.howToUpload.youtube.step6')}</li>
            <li>{t('dashboard.player.videos.howToUpload.youtube.step7')}</li>
          </ol>
        </div>

        {/* تيك توك */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-12 h-12 text-black" />
            <h4 className="text-lg font-medium text-blue-600">{t('dashboard.player.videos.howToUpload.tiktok.title')}</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>{t('dashboard.player.videos.howToUpload.tiktok.step1')}</li>
            <li>{t('dashboard.player.videos.howToUpload.tiktok.step2')}</li>
            <li>{t('dashboard.player.videos.howToUpload.tiktok.step3')}</li>
            <li>{t('dashboard.player.videos.howToUpload.tiktok.step4')}</li>
            <li>{t('dashboard.player.videos.howToUpload.tiktok.step5')}</li>
            <li>{t('dashboard.player.videos.howToUpload.tiktok.step6')}</li>
          </ol>
        </div>

        {/* إضافة الفيديو في المنصة */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <FileVideo className="w-12 h-12 text-blue-600" />
            <h4 className="text-lg font-medium text-blue-600">{t('dashboard.player.videos.howToUpload.platform.title')}</h4>
          </div>
          <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
            <li>{t('dashboard.player.videos.howToUpload.platform.step1')}</li>
            <li>{t('dashboard.player.videos.howToUpload.platform.step2')}</li>
            <li>{t('dashboard.player.videos.howToUpload.platform.step3')}</li>
            <li>{t('dashboard.player.videos.howToUpload.platform.step4')}</li>
          </ol>
        </div>
      </div>

      {/* مدير الفيديوهات */}
      <VideoManager 
        videos={videos}
        onVideosChange={handleUpdateVideos}
        maxVideos={MAX_VIDEOS}
      />

      {/* زر الحفظ */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleSaveVideos}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? t('dashboard.player.videos.saving') : t('dashboard.player.videos.save')}
          </button>
        </div>
      )}

      {/* رسائل الحفظ */}
      {saveMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          saveMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {saveMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            {saveMessage.text}
          </div>
        </div>
      )}
    </div>
  );
} 
