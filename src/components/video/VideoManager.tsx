'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  Plus, 
  X, 
  Play, 
  Edit3, 
  Trash2, 
  Save, 
  X as Cancel,
  Link,
  FileVideo
} from 'lucide-react';
import ReactPlayer from 'react-player/lazy';
import { Video } from '@/types/player';

interface VideoManagerProps {
  videos: Video[];
  onUpdate: (videos: Video[]) => void;
  maxVideos?: number;
  allowedTypes?: string[];
}

const VideoManager: React.FC<VideoManagerProps> = ({
  videos = [],
  onUpdate,
  maxVideos = 10,
  allowedTypes = ['video/mp4', 'video/webm', 'video/ogg']
}) => {
  const [isAddingVideo, setIsAddingVideo] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newVideo, setNewVideo] = useState<Video>({ url: '', desc: '' });
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // إضافة فيديو جديد
  const handleAddVideo = () => {
    if (newVideo.url.trim()) {
      const updatedVideos = [...videos, { ...newVideo }];
      onUpdate(updatedVideos);
      setNewVideo({ url: '', desc: '' });
      setIsAddingVideo(false);
    }
  };

  // حذف فيديو
  const handleDeleteVideo = async (index: number) => {
    const videoToDelete = videos[index];
    
    // التأكد من الحذف
    if (!confirm('هل تريد حذف هذا الفيديو نهائياً؟')) {
      return;
    }

    try {
      // إذا كان الفيديو مرفوع على Firebase Storage، احذفه من هناك أيضاً
      if (videoToDelete.url && videoToDelete.url.includes('firebasestorage.googleapis.com')) {
        const { deleteVideo } = await import('@/lib/firebase/storage');
        await deleteVideo(videoToDelete.url);
      }

      // حذف الفيديو من القائمة
      const updatedVideos = videos.filter((_, i) => i !== index);
      onUpdate(updatedVideos);
      
    } catch (error) {
      console.error('خطأ في حذف الفيديو:', error);
      
      // حتى لو فشل حذف الملف من Storage، احذفه من القائمة
      if (confirm('حدث خطأ أثناء حذف الملف من التخزين. هل تريد حذفه من القائمة على أي حال؟')) {
        const updatedVideos = videos.filter((_, i) => i !== index);
        onUpdate(updatedVideos);
      }
    }
  };

  // تعديل فيديو
  const handleEditVideo = (index: number, updatedVideo: Video) => {
    const updatedVideos = videos.map((video, i) => 
      i === index ? updatedVideo : video
    );
    onUpdate(updatedVideos);
    setEditingIndex(null);
  };

  // رفع ملف فيديو
  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // استيراد خدمات Firebase Storage
    const { uploadVideo, validateVideoFile } = await import('@/lib/firebase/storage');

    // التحقق من صحة الملف
    const validation = validateVideoFile(file, { allowedTypes });
    const validationResult = validation as { isValid: boolean; errors: string[] };
    if (!validationResult.isValid) {
      alert(validationResult.errors.join('\n'));
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // الحصول على معرف المستخدم (يجب تمريره من المكون الأب)
      const { auth } = await import('@/lib/firebase/config');
      const { useAuthState } = await import('react-firebase-hooks/auth');
      
      // للحصول على المستخدم الحالي
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('يجب تسجيل الدخول أولاً');
      }

      // رفع الفيديو مع تتبع التقدم
      const uploadedUrl = await uploadVideo(
        file, 
        currentUser.uid, 
        (progress) => setUploadProgress(progress)
      );
      
      setNewVideo(prev => ({ ...prev, url: uploadedUrl }));
      setUploadMethod('url');
      
    } catch (error) {
      console.error('خطأ في رفع الفيديو:', error);
      let errorMessage = 'فشل في رفع الفيديو. يرجى المحاولة مرة أخرى.';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage = 'ليس لديك صلاحية لرفع الملفات.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage = 'تم تجاوز حصة التخزين المتاحة.';
      } else if (error.code === 'storage/invalid-format') {
        errorMessage = 'تنسيق الملف غير صالح.';
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // التحقق من صحة URL
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* عرض الفيديوهات الموجودة */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {videos.map((video, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white rounded-lg shadow-md overflow-hidden"
          >
            {editingIndex === index ? (
              // وضع التعديل
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط الفيديو
                  </label>
                  <input
                    type="url"
                    value={video.url}
                    onChange={(e) => {
                      const updatedVideos = [...videos];
                      updatedVideos[index] = { ...video, url: e.target.value };
                      onUpdate(updatedVideos);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    وصف الفيديو
                  </label>
                  <textarea
                    value={video.desc}
                    onChange={(e) => {
                      const updatedVideos = [...videos];
                      updatedVideos[index] = { ...video, desc: e.target.value };
                      onUpdate(updatedVideos);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="اكتب وصف للفيديو..."
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditVideo(index, video)}
                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    حفظ
                  </button>
                  <button
                    onClick={() => setEditingIndex(null)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    <Cancel className="w-4 h-4" />
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              // وضع العرض
              <>
                <div className="aspect-video">
                  <ReactPlayer
                    url={video.url}
                    width="100%"
                    height="100%"
                    controls
                    light
                    playIcon={
                      <div className="flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    }
                  />
                </div>
                
                <div className="p-4">
                  <p className="text-gray-700 text-sm mb-3">
                    {video.desc || 'لا يوجد وصف'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingIndex(index)}
                        className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(index)}
                        className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                    </div>
                    
                    <span className="text-xs text-gray-500">
                      فيديو {index + 1}
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>

      {/* زر إضافة فيديو جديد */}
      {videos.length < maxVideos && !isAddingVideo && (
        <button
          onClick={() => setIsAddingVideo(true)}
          className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center gap-2 text-gray-600 hover:text-blue-600"
        >
          <Plus className="w-8 h-8" />
          <span className="font-medium">إضافة فيديو جديد</span>
          <span className="text-sm">({videos.length}/{maxVideos})</span>
        </button>
      )}

      {/* نموذج إضافة فيديو جديد */}
      <AnimatePresence>
        {isAddingVideo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">إضافة فيديو جديد</h3>
                <button
                  onClick={() => {
                    setIsAddingVideo(false);
                    setNewVideo({ url: '', desc: '' });
                    setUploadMethod('url');
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* اختيار طريقة الإضافة */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setUploadMethod('url')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    uploadMethod === 'url'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Link className="w-4 h-4" />
                  رابط فيديو
                </button>
                <button
                  onClick={() => setUploadMethod('file')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    uploadMethod === 'file'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FileVideo className="w-4 h-4" />
                  رفع ملف
                </button>
              </div>

              {uploadMethod === 'url' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رابط الفيديو
                  </label>
                  <input
                    type="url"
                    value={newVideo.url}
                    onChange={(e) => setNewVideo(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يمكنك استخدام روابط من YouTube, Vimeo, أو رابط مباشر لملف الفيديو
                  </p>
                </div>
              ) : (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center gap-2 text-gray-600 hover:text-blue-600 disabled:opacity-50"
                  >
                    <FileVideo className="w-8 h-8" />
                    <span className="font-medium">
                      {isUploading ? 'جاري الرفع...' : 'اختر ملف فيديو'}
                    </span>
                    <span className="text-sm">MP4, WebM, OGG (حد أقصى 100MB)</span>
                  </button>
                  
                  {isUploading && (
                    <div className="mt-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>جاري الرفع...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف الفيديو
                </label>
                <textarea
                  value={newVideo.desc}
                  onChange={(e) => setNewVideo(prev => ({ ...prev, desc: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="اكتب وصف مختصر للفيديو (اختياري)..."
                />
              </div>

              {/* معاينة الفيديو */}
              {newVideo.url && isValidUrl(newVideo.url) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    معاينة
                  </label>
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <ReactPlayer
                      url={newVideo.url}
                      width="100%"
                      height="100%"
                      controls
                      light
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddVideo}
                  disabled={!newVideo.url || isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  إضافة الفيديو
                </button>
                <button
                  onClick={() => {
                    setIsAddingVideo(false);
                    setNewVideo({ url: '', desc: '' });
                    setUploadMethod('url');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* رسالة عند الوصول للحد الأقصى */}
      {videos.length >= maxVideos && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            وصلت للحد الأقصى من الفيديوهات ({maxVideos}). يمكنك حذف فيديو موجود لإضافة فيديو جديد.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoManager; 