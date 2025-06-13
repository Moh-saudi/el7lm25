'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, getDocs, addDoc, serverTimestamp, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Send } from 'lucide-react';

interface Comment {
  id: string;
  text: string;
  userId: string;
  userName: string;
  userImage: string;
  createdAt: any;
}

interface CommentsProps {
  videoId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function Comments({ videoId, isOpen, onClose }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, videoId]);

  const fetchComments = async () => {
    try {
      // استخراج معرف اللاعب من معرف الفيديو
      const [playerId, videoIndex] = videoId.split('_');
      
      // جلب بيانات اللاعب
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        
        if (videos[videoIndexNum] && videos[videoIndexNum].comments) {
          setComments(videos[videoIndexNum].comments);
        } else {
          setComments([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching comments:', error);
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    try {
      // استخراج معرف اللاعب من معرف الفيديو
      const [playerId, videoIndex] = videoId.split('_');
      
      // جلب بيانات اللاعب
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        
        if (videos[videoIndexNum]) {
          // إنشاء تعليق جديد
          const newCommentObj = {
            id: Date.now().toString(),
            text: newComment.trim(),
            userId: user.uid,
            userName: user.displayName || 'مستخدم',
            userImage: user.photoURL || '/default-avatar.png',
            createdAt: serverTimestamp()
          };
          
          // إضافة التعليق إلى مصفوفة التعليقات
          if (!videos[videoIndexNum].comments) {
            videos[videoIndexNum].comments = [];
          }
          videos[videoIndexNum].comments.push(newCommentObj);
          
          // تحديث عدد التعليقات
          videos[videoIndexNum].comments_count = (videos[videoIndexNum].comments_count || 0) + 1;
          
          // حفظ التغييرات في قاعدة البيانات
          await updateDoc(playerRef, { videos });
          
          // تحديث التعليقات محلياً
          setComments(prevComments => [...prevComments, newCommentObj]);
          setNewComment('');
        }
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-lg transform transition-transform duration-300 ease-in-out">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">التعليقات</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 mt-4">
              لا توجد تعليقات بعد
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="mb-4">
                <div className="flex items-start space-x-3">
                  <img
                    src={comment.userImage}
                    alt={comment.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="font-semibold text-sm">{comment.userName}</p>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {comment.createdAt?.toDate().toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmitComment} className="p-4 border-t">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="اكتب تعليقاً..."
              className="flex-1 p-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className="p-2 text-primary hover:text-primary-dark disabled:opacity-50"
            >
              <Send className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 