'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Heart, MessageCircle, Share2, Music } from 'lucide-react';
import Comments from '@/components/video/Comments';
import ReactPlayer from 'react-player/lazy';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import 'dayjs/locale/ar';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Video {
  id: string;
  url: string;
  playerName: string;
  playerImage: string;
  playerPosition?: string;
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

function getYoutubeThumbnail(url: string) {
  const match = url.match(/(?:youtube\.com.*[?&]v=|youtu\.be\/)([\w-]{11})/);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return undefined;
}

export default function ClubPlayerVideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [followedPlayers, setFollowedPlayers] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [viewCounts, setViewCounts] = useState<{[id: string]: number}>({});
  const [progress, setProgress] = useState<{[id: string]: number}>({});
  const [videoRatios, setVideoRatios] = useState<{[id: string]: number}>({});
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const { user } = useAuth();
  const [following, setFollowing] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    const fetchClubData = async () => {
      if (!user?.uid) return;
      const clubRef = doc(db, 'clubs', user.uid);
      const clubDoc = await getDoc(clubRef);
      if (clubDoc.exists()) {
        const data = clubDoc.data();
        setFollowing(data.following || []);
        setFavorites(data.favorites || []);
      }
    };
    fetchClubData();
  }, [user]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const playersRef = collection(db, 'players');
      const playersSnapshot = await getDocs(playersRef);
      const allVideos: Video[] = [];
      for (const playerDoc of playersSnapshot.docs) {
        const playerData = playerDoc.data();
        const playerVideos = playerData.videos || [];
        const formattedVideos = playerVideos.map((video: any, index: number) => {
          let videoDate = video.createdAt || video.updated_at || new Date();
          if (videoDate && typeof videoDate.toDate === 'function') videoDate = videoDate.toDate();
          if (typeof videoDate === 'string') videoDate = new Date(videoDate);
          const mainPosition = playerData.primary_position || playerData.position || playerData.center || playerData.secondary_position || '';
          let playerImage = '/default-avatar.png';
          if (typeof playerData.profile_image === 'string') {
            playerImage = playerData.profile_image;
          } else if (playerData.profile_image && typeof playerData.profile_image.url === 'string') {
            playerImage = playerData.profile_image.url;
          } else if (playerData.profile_image) {
            console.error('Invalid player profile_image:', playerData.profile_image);
          }
          return {
            id: `${playerDoc.id}_${index}`,
            url: video.url,
            playerName: playerData.full_name || playerData.name || 'لاعب',
            playerImage,
            playerPosition: mainPosition,
            description: video.description || video.desc || '',
            likes: video.likes || 0,
            comments: video.comments || 0,
            shares: video.shares || 0,
            music: video.music || 'بدون موسيقى',
            playerId: playerDoc.id,
            createdAt: videoDate
          };
        });
        allVideos.push(...formattedVideos);
      }
      const sortedVideos = allVideos.sort((a, b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
        return bTime - aTime;
      });
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
      if (videoRefs.current[newIndex]) {
        videoRefs.current[newIndex]?.play();
      }
    }
  };

  const handleLike = async (videoId: string) => {
    if (!user) return;
    try {
      const [playerId, videoIndex] = videoId.split('_');
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        if (videos[videoIndexNum]) {
          videos[videoIndexNum].likes = (videos[videoIndexNum].likes || 0) + 1;
          await updateDoc(playerRef, { videos });
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
      const [playerId, videoIndex] = videoId.split('_');
      const playerRef = doc(db, 'players', playerId);
      const playerDoc = await getDoc(playerRef);
      if (playerDoc.exists()) {
        const playerData = playerDoc.data();
        const videos = playerData.videos || [];
        const videoIndexNum = parseInt(videoIndex);
        if (videos[videoIndexNum]) {
          videos[videoIndexNum].shares = (videos[videoIndexNum].shares || 0) + 1;
          await updateDoc(playerRef, { videos });
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

  const handleFollow = async (playerId: string) => {
    if (!user?.uid) return;
    const clubRef = doc(db, 'clubs', user.uid);
    let newFollowing = following.includes(playerId)
      ? following.filter(id => id !== playerId)
      : [...following, playerId];
    setFollowing(newFollowing);
    await updateDoc(clubRef, { following: newFollowing });
  };

  const handleFavorite = async (playerId: string) => {
    if (!user?.uid) return;
    const clubRef = doc(db, 'clubs', user.uid);
    let newFavorites = favorites.includes(playerId)
      ? favorites.filter(id => id !== playerId)
      : [...favorites, playerId];
    setFavorites(newFavorites);
    await updateDoc(clubRef, { favorites: newFavorites });
  };

  const filteredVideos = useMemo(() => {
    if (!filter) return videos;
    return videos.filter(v =>
      v.playerName.includes(filter) ||
      v.description.includes(filter)
    );
  }, [videos, filter]);

  useEffect(() => {
    const video = filteredVideos[currentVideoIndex];
    if (video) {
      setViewCounts(prev => ({ ...prev, [video.id]: (prev[video.id] || 0) + 1 }));
    }
  }, [currentVideoIndex, filteredVideos]);

  useEffect(() => {
    videoRefs.current.forEach((ref, idx) => {
      if (ref) {
        if (idx === currentVideoIndex) {
          ref.play();
        } else {
          ref.pause();
          ref.currentTime = 0;
        }
      }
    });
  }, [currentVideoIndex, filteredVideos]);

  const handleTimeUpdate = (videoId: string, e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    setProgress(prev => ({ ...prev, [videoId]: (video.currentTime / video.duration) || 0 }));
  };

  const handleSeek = (videoId: string, index: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const video = videoRefs.current[index];
    if (video && video.duration) {
      video.currentTime = percent * video.duration;
      setProgress(prev => ({ ...prev, [videoId]: percent }));
    }
  };

  const handleLoadedMetadata = (videoId: string, e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget;
    if (video.videoWidth && video.videoHeight) {
      setVideoRatios(prev => ({ ...prev, [videoId]: video.videoWidth / video.videoHeight }));
    }
  };

  const videoContainerClass =
    "flex items-center justify-center w-full h-full min-h-screen min-w-0 max-w-full max-h-screen mx-auto relative rounded-2xl border border-gray-300 shadow-lg bg-transparent";
  const videoStyle = {
    width: '100%',
    height: '100%',
    maxWidth: '350px',
    maxHeight: 'calc(100vh - 80px)',
    aspectRatio: '9/16',
    borderRadius: '16px',
    background: '#000',
    objectFit: 'cover' as const,
    display: 'block',
    margin: '0 auto',
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
      <div className="flex flex-col gap-4 p-4 bg-white dark:bg-gray-900">
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="ابحث باسم اللاعب أو الوصف..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="w-full h-screen overflow-y-scroll transition-all duration-500 bg-white snap-y snap-mandatory dark:bg-gray-900" onScroll={handleScroll}>
          <AnimatePresence initial={false}>
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.id}
                className="flex items-center justify-center w-full h-screen transition-all duration-500"
                style={{ transition: 'opacity 0.5s' }}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex flex-col items-center justify-center gap-8 md:flex-row" style={{width: '100%', maxWidth: '900px', position: 'relative'}}>
                  <div
                    className="md:absolute md:right-[-170px] md:top-1/2 md:-translate-y-1/2 z-10 flex items-center gap-3 bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-lg px-5 py-3 border border-gray-200 dark:border-gray-700 w-full max-w-xs md:max-w-[260px] mx-auto md:mx-0 mb-4 md:mb-0"
                    style={{ direction: 'rtl' }}
                  >
                    <img src={video.playerImage} alt={video.playerName} className="object-cover border-2 border-gray-300 rounded-full w-14 h-14" />
                    <div className="flex flex-col items-end flex-1">
                      <span className="text-lg font-bold text-gray-900 md:text-lg dark:text-white">{video.playerName}</span>
                      <span className="text-sm font-semibold text-blue-700 md:text-base dark:text-blue-300">{video.playerPosition || '—'}</span>
                      <span className="mt-1 text-xs text-gray-500 md:text-sm">{dayjs(video.createdAt).locale('ar').fromNow()}</span>
                    </div>
                  </div>
                  <div
                    className="w-full max-w-full md:max-w-[350px] aspect-[9/16] rounded-2xl bg-black flex items-center justify-center"
                    style={{
                      maxHeight: 'calc(100vh - 80px)',
                      margin: '0 auto',
                      boxShadow: '0 4px 24px 0 rgba(0,0,0,0.10)',
                      overflow: 'hidden',
                      position: 'relative',
                      background: '#000',
                    }}
                  >
                    {isDirectVideo(video.url) ? (
                      <video
                        ref={el => { videoRefs.current[index] = el; }}
                        src={video.url}
                        className="object-contain w-full h-full rounded-2xl"
                        loop
                        playsInline
                        autoPlay={index === currentVideoIndex}
                        muted={muted}
                        controls={false}
                        onClick={() => setMuted(m => !m)}
                        onTimeUpdate={e => handleTimeUpdate(video.id, e)}
                        onLoadedMetadata={e => handleLoadedMetadata(video.id, e)}
                      />
                    ) : (
                      <ReactPlayer
                        url={video.url}
                        width="100%"
                        height="100%"
                        style={{ aspectRatio: '9/16', borderRadius: 24, background: '#000', margin: '0 auto' }}
                        playing={index === currentVideoIndex}
                        muted={muted}
                        controls
                        light={getYoutubeThumbnail(video.url) || true}
                        onClickPreview={() => setCurrentVideoIndex(index)}
                      />
                    )}
                  </div>
                  <div className="flex flex-col items-center justify-center gap-4">
                    <button
                      onClick={() => handleFollow(video.playerId)}
                      className={
                        "px-4 py-2 rounded-full font-bold transition " +
                        (following.includes(video.playerId) ? "bg-green-600 text-white" : "bg-white text-green-600 border border-green-600")
                      }
                    >
                      {following.includes(video.playerId) ? 'متابع' : 'متابعة'}
                    </button>
                    <button
                      onClick={() => handleFavorite(video.playerId)}
                      className={
                        "p-2 rounded-full font-bold transition border-2 " +
                        (favorites.includes(video.playerId) ? "bg-yellow-400 text-white border-yellow-400" : "bg-white text-yellow-400 border-yellow-400")
                      }
                      title={favorites.includes(video.playerId) ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                    >
                      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/club/players/${video.playerId}`)}
                      className="px-4 py-2 font-bold text-white transition bg-blue-600 rounded-full hover:bg-blue-700"
                      title="الذهاب لملف اللاعب"
                    >
                      ملف اللاعب
                    </button>
                  </div>
                </div>
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
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <Comments
          videoId={selectedVideoId || ''}
          isOpen={!!selectedVideoId}
          onClose={() => setSelectedVideoId(null)}
        />
      </div>
    </>
  );
} 