'use client';

import React, { useState, useEffect } from 'react';
import { Video, Trash2, MessageSquare, Eye, User, Clock, Star, Flag, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import { db } from '@/lib/firebase/config';
import { collection, getDocs, doc, updateDoc, getDoc, addDoc } from 'firebase/firestore';

interface VideoData {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number;
  uploadDate: any;
  userId: string;
  userEmail: string;
  userName: string;
  accountType: string;
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  views: number;
  likes: number;
  comments: number;
}

export default function VideosAdminPage() {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAccountType, setFilterAccountType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // تحميل الفيديوهات
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setLoading(true);
        const allVideos: VideoData[] = [];

        const collections = ['players', 'clubs', 'agents', 'parents', 'marketers'];
        
        for (const collectionName of collections) {
          try {
            const collectionRef = collection(db, collectionName);
            const snapshot = await getDocs(collectionRef);
            
          snapshot.forEach((doc) => {
              const userData = doc.data();
              const userVideos = userData.videos || [];
              
              userVideos.forEach((video: any, index: number) => {
                if (video && video.url) {
                  const videoData: VideoData = {
                    id: `${doc.id}_${index}`,
                    title: video.title || video.desc || `فيديو ${index + 1}`,
                    description: video.description || video.desc || '',
                    url: video.url,
                    thumbnailUrl: video.thumbnail || video.thumbnailUrl,
                    duration: video.duration || 0,
                    uploadDate: video.uploadDate || video.createdAt || video.updated_at || new Date(),
                    userId: doc.id,
                    userEmail: userData.email || userData.userEmail || '',
                    userName: userData.full_name || userData.name || userData.userName || 'مستخدم',
                    accountType: collectionName.slice(0, -1),
                    status: video.status || 'pending',
                    views: video.views || 0,
                    likes: video.likes || 0,
                    comments: video.comments || 0
                  };
                  
                  allVideos.push(videoData);
                }
              });
            });
          } catch (error) {
            console.error(`خطأ في جلب البيانات من مجموعة ${collectionName}:`, error);
          }
        }

        allVideos.sort((a, b) => {
          const dateA = a.uploadDate?.toDate ? a.uploadDate.toDate() : new Date(a.uploadDate);
          const dateB = b.uploadDate?.toDate ? b.uploadDate.toDate() : new Date(b.uploadDate);
          return dateB.getTime() - dateA.getTime();
        });

        setVideos(allVideos);
        setLoading(false);
      } catch (error) {
        console.error('Error loading videos:', error);
        setLoading(false);
      }
    };

    loadVideos();
  }, []);

  // تحديث حالة الفيديو
  const updateVideoStatus = async (videoId: string, status: string) => {
    try {
      const video = videos.find(v => v.id === videoId);
      if (!video) {
        throw new Error('الفيديو غير موجود');
      }
      
      const [userIdFromId, videoIndex] = videoId.split('_');
      const userId = userIdFromId;
      
      let collectionName = 'players';
      switch (video.accountType) {
        case 'player': collectionName = 'players'; break;
        case 'club': collectionName = 'clubs'; break;
        case 'agent': collectionName = 'agents'; break;
        case 'parent': collectionName = 'parents'; break;
        case 'marketer': collectionName = 'marketers'; break;
      }
      
      const userRef = doc(db, collectionName, userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        throw new Error('المستخدم غير موجود');
      }
      
      const userData = userDoc.data();
      const userVideos = userData.videos || [];
      
      const videoToUpdateIndex = userVideos.findIndex((v: any) => {
        const [userIdFromId, videoIndex] = videoId.split('_');
        return parseInt(videoIndex) === userVideos.indexOf(v);
      });
      
      if (videoToUpdateIndex !== -1) {
        userVideos[videoToUpdateIndex] = {
          ...userVideos[videoToUpdateIndex],
        status,
        reviewDate: new Date(),
        reviewedBy: 'admin'
        };
        
        await updateDoc(userRef, { videos: userVideos });
        
        setVideos(prevVideos => 
          prevVideos.map(v => 
            v.id === videoId 
              ? { ...v, status, reviewDate: new Date(), reviewedBy: 'admin' }
              : v
          )
        );

      toast.success(`تم تحديث حالة الفيديو بنجاح`);
      } else {
        throw new Error('الفيديو غير موجود في قاعدة البيانات');
      }
    } catch (error) {
      console.error('Error updating video status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الفيديو');
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'flagged': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      case 'flagged': return <Flag className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // تصفية الفيديوهات
  const filteredVideos = videos.filter(video => {
    const matchesStatus = filterStatus === 'all' || video.status === filterStatus;
    const matchesAccountType = filterAccountType === 'all' || video.accountType === filterAccountType;
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesAccountType && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل الفيديوهات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">إدارة الفيديوهات</h1>
          <Button 
            onClick={() => window.location.reload()}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Video className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">إجمالي الفيديوهات</p>
                  <p className="text-2xl font-bold">{videos.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">في انتظار المراجعة</p>
                  <p className="text-2xl font-bold">{videos.filter(v => v.status === 'pending').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">مُوافق عليه</p>
                  <p className="text-2xl font-bold">{videos.filter(v => v.status === 'approved').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <User className="w-8 h-8 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">مستخدمين نشطين</p>
                  <p className="text-2xl font-bold">{new Set(videos.map(v => v.userId)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">البحث</Label>
              <Input
                id="search"
                placeholder="البحث في العنوان أو اسم المستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status-filter">حالة الفيديو</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="pending">في انتظار المراجعة</SelectItem>
                  <SelectItem value="approved">مُوافق عليه</SelectItem>
                  <SelectItem value="rejected">مرفوض</SelectItem>
                  <SelectItem value="flagged">مُعلَّم للمراجعة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="account-filter">نوع الحساب</Label>
              <Select value={filterAccountType} onValueChange={setFilterAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الحساب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحسابات</SelectItem>
                  <SelectItem value="player">لاعب</SelectItem>
                  <SelectItem value="parent">ولي أمر</SelectItem>
                  <SelectItem value="club">نادي</SelectItem>
                  <SelectItem value="agent">وكيل</SelectItem>
                  <SelectItem value="marketer">مسوق</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterAccountType('all');
                }}
                variant="outline"
                className="w-full"
              >
                إعادة تعيين الفلاتر
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(video.status)}>
                    {getStatusIcon(video.status)}
                    <span className="mr-1">
                      {video.status === 'pending' && 'في الانتظار'}
                      {video.status === 'approved' && 'مُوافق عليه'}
                      {video.status === 'rejected' && 'مرفوض'}
                      {video.status === 'flagged' && 'مُعلَّم'}
                    </span>
                  </Badge>
                </div>
              </div>
              
              <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
                {video.thumbnailUrl ? (
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 flex items-center justify-center">
                    <Video className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>
                
                <div className="flex items-center text-sm text-gray-500">
                  <User className="w-4 h-4 mr-1" />
                  <span className="truncate">{video.userName}</span>
                  <Badge variant="outline" className="mr-2 text-xs flex-shrink-0">
                    {video.accountType === 'player' ? 'لاعب' :
                     video.accountType === 'club' ? 'نادي' :
                     video.accountType === 'agent' ? 'وكيل' :
                     video.accountType === 'parent' ? 'ولي أمر' :
                     video.accountType === 'marketer' ? 'مسوق' :
                     video.accountType}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1" />
                    <span className="truncate">{video.views}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    <span className="truncate">{video.likes}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={() => updateVideoStatus(video.id, 'approved')}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={video.status === 'approved'}
                >
                  {video.status === 'approved' ? 'مُوافق عليه' : 'موافقة'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateVideoStatus(video.id, 'rejected')}
                  disabled={video.status === 'rejected'}
                >
                  {video.status === 'rejected' ? 'مرفوض' : 'رفض'}
                </Button>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateVideoStatus(video.id, 'flagged')}
                  disabled={video.status === 'flagged'}
                >
                  {video.status === 'flagged' ? 'مُعلَّم' : 'تعليم'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVideos.length === 0 && !loading && (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">
              {videos.length === 0 ? 'لا توجد فيديوهات في النظام' : 'لا توجد فيديوهات تطابق معايير البحث'}
            </h3>
            <p className="text-gray-600">
              {videos.length === 0 
                ? 'لم يتم رفع أي فيديوهات من المستخدمين بعد. ستظهر الفيديوهات هنا عند رفعها.'
                : 'جرب تغيير معايير البحث أو إعادة تعيين الفلاتر'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
