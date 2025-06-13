'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { collection, query, orderBy, getDocs, limit, doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { Heart, MessageCircle, Share2, Music } from 'lucide-react';
import Comments from '@/components/video/Comments';
import ReactPlayer from 'react-player/lazy';

interface Video {
  id: string;
  url: string;
  playerName: string;
  playerImage: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  music: string;
  playerId: string;
  createdAt: any;
}

function isDirectVideo(url: string) {
  return url.match(/\.(mp4|webm|ogg)$/i);
}

export default function PlayerVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      // جلب جميع اللاعبين
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      
      const allVideos: Video[] = [];
      
      // لكل لاعب، جلب فيديوهاته
      for (const playerDoc of playersSnapshot.docs) {
        const playerData = playerDoc.data();
        const playerVideos = playerData.videos || [];
        
        // تحويل فيديوهات اللاعب إلى الشكل المطلوب
        const formattedVideos = playerVideos.map((video: any, index: number) => ({
          id: `${playerDoc.id}_${index}`,
          url: video.url,
          playerName: playerData.name || 'لاعب',
          playerImage: playerData.profile_image?.url || '/default-avatar.png',
          description: video.description || '',
          likes: video.likes || 0,
          comments: video.comments || 0,
          shares: video.shares || 0,
          music: video.music || 'بدون موسيقى',
          playerId: playerDoc.id,
          createdAt: video.createdAt || new Date()
        }));
        
        allVideos.push(...formattedVideos);
      }
      
      // ترتيب الفيديوهات حسب تاريخ النشر
      const sortedVideos = allVideos.sort((a, b) => 
        b.createdAt.toDate() - a.createdAt.toDate()
      );
      
      setVideos(sortedVideos);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching videos:', error);
      setLoading(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollTop;
    const videoHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / videoHeight);
    
    if (newIndex !== currentVideoIndex) {
      setCurrentVideoIndex(newIndex);
      if (videoRef.current) {
        videoRef.current.play();
      }
    }
  };

  const handleLike = async (videoId: string) => {
    if (!user) return;

    try {
      // استخراج معرف اللاعب من معرف الفيديو
      const [playerId, videoIndex] = videoId.split('_');
      
      // تحديث عدد الإعجابات في قاعدة البيانات
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        
        if (videos[videoIndexNum]) {
          videos[videoIndexNum].likes = (videos[videoIndexNum].likes || 0) + 1;
          await updateDoc(playerRef, { videos });
          
          // تحديث حالة الفيديوهات محلياً
          setVideos(prevVideos => 
            prevVideos.map(video => 
              video.id === videoId 
                ? { ...video, likes: video.likes + 1 }
                : video
            )
          );
        }
      }
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleComment = (videoId: string) => {
    setSelectedVideoId(videoId);
  };

  const handleShare = async (videoId: string) => {
    try {
      const videoUrl = `${window.location.origin}/videos/${videoId}`;
      await navigator.clipboard.writeText(videoUrl);
      
      // استخراج معرف اللاعب من معرف الفيديو
      const [playerId, videoIndex] = videoId.split('_');
      
      // تحديث عدد المشاركات في قاعدة البيانات
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        
        if (videos[videoIndexNum]) {
          videos[videoIndexNum].shares = (videos[videoIndexNum].shares || 0) + 1;
          await updateDoc(playerRef, { videos });
          
          // تحديث حالة الفيديوهات محلياً
          setVideos(prevVideos => 
            prevVideos.map(video => 
              video.id === videoId 
                ? { ...video, shares: video.shares + 1 }
                : video
            )
          );
        }
      }

      alert('تم نسخ رابط الفيديو إلى الحافظة');
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-t-2 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen overflow-y-scroll bg-black snap-y snap-mandatory" onScroll={handleScroll}>
        {videos.map((video, index) => (
          <div
            key={video.id}
            className="relative flex items-center justify-center w-full h-screen snap-start"
          >
            {isDirectVideo(video.url) ? (
              <video
                ref={index === currentVideoIndex ? videoRef : null}
                src={video.url}
                className="object-cover w-full h-full"
                loop
                playsInline
                autoPlay={index === currentVideoIndex}
                muted={index !== currentVideoIndex}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-black">
                <ReactPlayer
                  url={video.url}
                  width="100%"
                  height="100%"
                  playing={index === currentVideoIndex}
                  controls
                  style={{ maxHeight: '100vh', maxWidth: '100vw' }}
                />
              </div>
            )}
            
            {/* Video Info Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center mb-2 space-x-3">
                <img
                  src={video.playerImage}
                  alt={video.playerName}
                  className="w-12 h-12 border-2 border-white rounded-full"
                />
                <span className="font-bold">{video.playerName}</span>
              </div>
              <p className="mb-2">{video.description}</p>
              <div className="flex items-center space-x-2 text-sm">
                <Music className="w-4 h-4" />
                <span>{video.music}</span>
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="absolute flex flex-col items-center space-y-6 right-4 bottom-20">
              <button
                onClick={() => handleLike(video.id)}
                className="flex flex-col items-center text-white"
              >
                <Heart className="w-8 h-8" />
                <span className="text-sm">{video.likes}</span>
              </button>
              
              <button
                onClick={() => handleComment(video.id)}
                className="flex flex-col items-center text-white"
              >
                <MessageCircle className="w-8 h-8" />
                <span className="text-sm">{video.comments}</span>
              </button>
              
              <button
                onClick={() => handleShare(video.id)}
                className="flex flex-col items-center text-white"
              >
                <Share2 className="w-8 h-8" />
                <span className="text-sm">{video.shares}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comments Component */}
      <Comments
        videoId={selectedVideoId || ''}
        isOpen={!!selectedVideoId}
        onClose={() => setSelectedVideoId(null)}
      />
    </>
  );
} 