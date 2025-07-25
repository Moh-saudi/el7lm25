'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  MapPin, 
  Star, 
  MessageSquare, 
  UserPlus, 
  UserCheck,
  Building,
  Briefcase,
  Eye,
  Mail,
  Phone,
  Globe,
  Award,
  Target,
  Trophy,
  CheckCircle,
  Loader2,
  Sparkles,
  User,
  Users,
  Calendar,
  Languages
} from 'lucide-react';

interface EntityProfile {
  id: string;
  name: string;
  type: 'club' | 'agent' | 'scout' | 'academy' | 'sponsor' | 'trainer';
  email: string;
  phone?: string;
  website?: string;
  profileImage?: string;
  coverImage?: string;
  location: {
    country: string;
    city: string;
    address?: string;
  };
  description: string;
  specialization?: string;
  verified: boolean;
  rating: number;
  reviewsCount: number;
  followersCount: number;
  connectionsCount: number;
  achievements?: string[];
  services?: string[];
  established?: string;
  languages?: string[];
  contactInfo: {
    email: string;
    phone: string;
    whatsapp?: string;
  };
  stats?: {
    successfulDeals: number;
    playersRepresented: number;
    activeContracts: number;
  };
  isFollowing?: boolean;
}

const ENTITY_TYPES = {
  club: { label: 'نادي', icon: Building, color: 'bg-blue-500' },
  agent: { label: 'وكيل لاعبين', icon: Briefcase, color: 'bg-purple-500' },
  scout: { label: 'سكاوت', icon: Eye, color: 'bg-green-500' },
  academy: { label: 'أكاديمية', icon: Trophy, color: 'bg-orange-500' },
  sponsor: { label: 'راعي', icon: Award, color: 'bg-red-500' },
  trainer: { label: 'مدرب', icon: User, color: 'bg-cyan-500' }
};

export default function EntityProfilePage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [entity, setEntity] = useState<EntityProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const entityType = searchParams.get('type');
  const entityId = searchParams.get('id');

  useEffect(() => {
    const fetchEntity = async () => {
      if (!entityType || !entityId) {
        setError('معرف الكيان أو نوعه غير صحيح');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        let collectionName = '';
        switch (entityType) {
          case 'club':
            collectionName = 'clubs';
            break;
          case 'agent':
            collectionName = 'agents';
            break;
          case 'academy':
            collectionName = 'academies';
            break;
          case 'trainer':
            collectionName = 'trainers';
            break;
          default:
            setError('نوع الكيان غير مدعوم');
            return;
        }

        const docRef = doc(db, collectionName, entityId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          const profile: EntityProfile = {
            id: docSnap.id,
            name: data.name || data.full_name || 'غير محدد',
            type: entityType as any,
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            profileImage: data.logo || data.profile_photo || '/images/default-avatar.png',
            coverImage: data.coverImage || '/images/hero-1.jpg',
            location: {
              country: data.country || data.nationality || '',
              city: data.city || data.current_location?.split(' - ')[1] || data.current_location || '',
              address: data.address || data.office_address || ''
            },
            description: data.description || 'لا يوجد وصف متاح',
            specialization: data.specialization || data.type || '',
            verified: data.is_fifa_licensed || data.is_certified || true,
            rating: 4.5,
            reviewsCount: Math.floor(Math.random() * 500) + 100,
            followersCount: (data.stats?.players || data.stats?.students || data.stats?.active_players || 0) * 10,
            connectionsCount: data.stats?.contracts || data.stats?.completed_deals || 0,
            achievements: data.trophies?.map((t: any) => `${t.name} (${t.year})`) || 
                          (data.is_fifa_licensed ? ['وكيل معتمد FIFA'] : []) ||
                          (data.is_certified ? ['مدرب معتمد'] : []) ||
                          ['خبرة متميزة'],
            services: data.programs || ['خدمات متنوعة'],
            established: data.founded || data.established || 
                        (data.createdAt ? new Date(data.createdAt.seconds * 1000).getFullYear().toString() : ''),
            languages: data.spoken_languages || ['العربية'],
            contactInfo: {
              email: data.email || '',
              phone: data.phone || '',
              whatsapp: data.phone || ''
            },
            stats: {
              successfulDeals: data.stats?.completed_deals || data.stats?.contracts || 0,
              playersRepresented: data.stats?.active_players || data.stats?.players || data.stats?.students || 0,
              activeContracts: data.stats?.success_rate || data.stats?.training_sessions || 0
            },
            isFollowing: false
          };

          setEntity(profile);
        } else {
          setError('لم يتم العثور على الملف المطلوب');
        }
      } catch (error) {
        console.error('خطأ في جلب بيانات الكيان:', error);
        setError('حدث خطأ في تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntity();
  }, [entityType, entityId]);

  const handleFollow = async () => {
    if (!user || !entity) return;
    setActionLoading('follow');
    
    try {
      setEntity(prev => prev ? {
        ...prev,
        isFollowing: !prev.isFollowing,
        followersCount: !prev.isFollowing ? prev.followersCount + 1 : prev.followersCount - 1
      } : null);
    } catch (error) {
      console.error('خطأ في المتابعة:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMessage = () => {
    if (!user || !entity) return;
    router.push(`/dashboard/messages?recipient=${entity.id}`);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    router.push('/auth/login');
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطأ</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للخلف
          </Button>
        </Card>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">لم يتم العثور على الملف</h2>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة للخلف
          </Button>
        </Card>
      </div>
    );
  }

  const entityTypeInfo = ENTITY_TYPES[entity.type];
  const EntityIcon = entityTypeInfo.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* زر العودة */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            العودة للبحث
          </Button>
        </div>

        {/* بطاقة الملف الرئيسية */}
        <Card className="overflow-hidden mb-8">
          <div className="h-64 bg-gradient-to-r from-blue-400 to-purple-500 relative">
            {entity.coverImage && (
              <img 
                src={entity.coverImage} 
                alt={entity.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            
            <div className="absolute top-4 right-4 flex gap-2">
              {entity.verified && (
                <Badge className="bg-blue-500 text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  محقق
                </Badge>
              )}
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Sparkles className="w-4 h-4 mr-1" />
                مميز
              </Badge>
            </div>
          </div>

          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <div className="relative -mt-20 mb-4">
                  {entity.profileImage ? (
                    <img 
                      src={entity.profileImage} 
                      alt={entity.name}
                      className="w-32 h-32 rounded-full object-cover border-8 border-white shadow-2xl"
                    />
                  ) : (
                    <div className={`w-32 h-32 rounded-full ${entityTypeInfo.color} flex items-center justify-center border-8 border-white shadow-2xl`}>
                      <EntityIcon className="w-16 h-16 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col w-full md:w-auto gap-2">
                  <Button
                    onClick={handleFollow}
                    disabled={actionLoading === 'follow'}
                    variant={entity.isFollowing ? "default" : "outline"}
                    className="w-full md:w-48"
                  >
                    {actionLoading === 'follow' ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : entity.isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        متابَع
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        متابعة
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleMessage}
                    variant="outline"
                    className="w-full md:w-48"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    إرسال رسالة
                  </Button>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">{entity.name}</h1>
                  <Badge variant="secondary" className={`${entityTypeInfo.color} text-white`}>
                    {entityTypeInfo.label}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-5 h-5" />
                    <span>{entity.location.city}, {entity.location.country}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span>{entity.rating.toFixed(1)} ({formatNumber(entity.reviewsCount)} تقييم)</span>
                  </div>

                  {entity.specialization && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Target className="w-5 h-5" />
                      <span>{entity.specialization}</span>
                    </div>
                  )}

                  {entity.established && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-5 h-5" />
                      <span>تأسس عام {entity.established}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatNumber(entity.followersCount)}
                    </div>
                    <div className="text-sm text-gray-500">متابع</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {formatNumber(entity.connectionsCount)}
                    </div>
                    <div className="text-sm text-gray-500">اتصال</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {entity.stats?.successfulDeals || 0}
                    </div>
                    <div className="text-sm text-gray-500">صفقة ناجحة</div>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed">{entity.description}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {entity.achievements && entity.achievements.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  الإنجازات والجوائز
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entity.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                      <Award className="w-4 h-4 text-yellow-500" />
                      <span>{achievement}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {entity.services && entity.services.length > 0 && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  {entity.type === 'academy' ? 'البرامج المتاحة' : 'الخدمات المقدمة'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {entity.services.map((service, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-blue-500" />
                      <span>{service}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {entity.stats && (
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-500" />
                  إحصائيات الأداء
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">
                      {entity.stats.successfulDeals}
                    </div>
                    <div className="text-sm text-gray-600">صفقة ناجحة</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">
                      {entity.stats.playersRepresented}
                    </div>
                    <div className="text-sm text-gray-600">
                      {entity.type === 'club' ? 'لاعب' : 
                       entity.type === 'academy' ? 'طالب' : 
                       entity.type === 'agent' ? 'لاعب ممثل' : 'متدرب'}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">
                      {entity.stats.activeContracts}
                    </div>
                    <div className="text-sm text-gray-600">
                      {entity.type === 'trainer' ? 'جلسة تدريب' : 'عقد نشط'}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-4">معلومات الاتصال</h3>
              <div className="space-y-3">
                {entity.contactInfo.email && (
                  <a
                    href={`mailto:${entity.contactInfo.email}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium">البريد الإلكتروني</div>
                      <div className="text-sm text-gray-600">{entity.contactInfo.email}</div>
                    </div>
                  </a>
                )}

                {entity.contactInfo.phone && (
                  <a
                    href={`tel:${entity.contactInfo.phone}`}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Phone className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">رقم الهاتف</div>
                      <div className="text-sm text-gray-600">{entity.contactInfo.phone}</div>
                    </div>
                  </a>
                )}

                {entity.website && (
                  <a
                    href={`https://${entity.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium">الموقع الإلكتروني</div>
                      <div className="text-sm text-gray-600">{entity.website}</div>
                    </div>
                  </a>
                )}
              </div>
            </Card>

            {entity.languages && entity.languages.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  اللغات
                </h3>
                <div className="flex flex-wrap gap-2">
                  {entity.languages.map((language, index) => (
                    <Badge key={index} variant="outline">
                      {language}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
