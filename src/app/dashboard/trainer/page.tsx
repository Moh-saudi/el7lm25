'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Trophy,
  Calendar,
  Star,
  TrendingUp,
  Plus,
  Search,
  Filter,
  UserPlus,
  Settings,
  BarChart3,
  Award,
  Target,
  Clock,
  MapPin,
  Mail,
  Phone,
  Edit,
  Eye,
  Activity,
  Clipboard,
  Video,
  PlayCircle
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// دالة حساب العمر
const calculateAge = (birthDate: any) => {
  if (!birthDate) return null;
  try {
    let d: Date;
    if (typeof birthDate === 'object' && birthDate.toDate && typeof birthDate.toDate === 'function') {
      d = birthDate.toDate();
    } else if (birthDate instanceof Date) {
      d = birthDate;
    } else {
      d = new Date(birthDate);
    }
    
    if (isNaN(d.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return null;
  }
};

interface PlayerData {
  id: string;
  name: string;
  age: number;
  birth_date?: any; // إضافة تاريخ الميلاد للبيانات الحقيقية
  position: string;
  fitnessLevel: number;
  skillLevel: number;
  lastTraining: string;
  status: 'active' | 'injured' | 'resting';
  team: string;
}

interface TrainerStats {
  totalPlayers: number;
  activeTeams: number;
  weeklyTrainings: number;
  upcomingMatches: number;
  injuredPlayers: number;
  averageFitness: number;
}

export default function TrainerDashboard() {
  const router = useRouter();
  const { logoutUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // بيانات تجريبية - يجب ربطها بـ Firebase
  const [trainerStats, setTrainerStats] = useState<TrainerStats>({
    totalPlayers: 25,
    activeTeams: 3,
    weeklyTrainings: 12,
    upcomingMatches: 4,
    injuredPlayers: 2,
    averageFitness: 78
  });

  const [players, setPlayers] = useState<PlayerData[]>([
    {
      id: '1',
      name: 'أحمد الفيصل',
      age: 22,
      position: 'مهاجم',
      fitnessLevel: 85,
      skillLevel: 88,
      lastTraining: '2024-01-20',
      status: 'active',
      team: 'الفريق الأول'
    },
    {
      id: '2',
      name: 'محمد العتيبي',
      age: 24,
      position: 'وسط',
      fitnessLevel: 82,
      skillLevel: 90,
      lastTraining: '2024-01-19',
      status: 'active',
      team: 'الفريق الأول'
    },
    {
      id: '3',
      name: 'عبدالله سالم',
      age: 26,
      position: 'مدافع',
      fitnessLevel: 65,
      skillLevel: 75,
      lastTraining: '2024-01-15',
      status: 'injured',
      team: 'الفريق الثاني'
    }
  ]);

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterTeam || player.team === filterTeam;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'injured': return 'text-red-600 bg-red-50';
      case 'resting': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'injured': return 'مصاب';
      case 'resting': return 'راحة';
      default: return status;
    }
  };

  const getFitnessColor = (level: number) => {
    if (level >= 80) return 'text-green-600 bg-green-50';
    if (level >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم المدرب...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-[Cairo] bg-gradient-to-br from-gray-50 to-gray-200">
      {/* محتوى الصفحة الرئيسية */}
      <main className="flex flex-col flex-1 min-h-screen p-8">
        <h1 className="mb-8 text-3xl font-bold text-blue-700">لوحة تحكم المدرب</h1>
        
        {/* إحصائيات المدرب */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clipboard className="w-6 h-6 text-blue-600" />
              إحصائيات التدريب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 mb-2 text-blue-500" />
                <span className="text-lg font-bold">{trainerStats.totalPlayers}</span>
                <span className="text-sm text-gray-500">إجمالي اللاعبين</span>
              </div>
              <div className="flex flex-col items-center">
                <Target className="w-8 h-8 mb-2 text-green-500" />
                <span className="text-lg font-bold">{trainerStats.activeTeams}</span>
                <span className="text-sm text-gray-500">الفرق النشطة</span>
              </div>
              <div className="flex flex-col items-center">
                <Activity className="w-8 h-8 mb-2 text-purple-500" />
                <span className="text-lg font-bold">{trainerStats.weeklyTrainings}</span>
                <span className="text-sm text-gray-500">تدريبات أسبوعية</span>
              </div>
              <div className="flex flex-col items-center">
                <Trophy className="w-8 h-8 mb-2 text-yellow-500" />
                <span className="text-lg font-bold">{trainerStats.upcomingMatches}</span>
                <span className="text-sm text-gray-500">مباريات قادمة</span>
              </div>
              <div className="flex flex-col items-center">
                <Clock className="w-8 h-8 mb-2 text-red-500" />
                <span className="text-lg font-bold">{trainerStats.injuredPlayers}</span>
                <span className="text-sm text-gray-500">لاعبين مصابين</span>
              </div>
              <div className="flex flex-col items-center">
                <BarChart3 className="w-8 h-8 mb-2 text-teal-500" />
                <span className="text-lg font-bold">{trainerStats.averageFitness}%</span>
                <span className="text-sm text-gray-500">متوسط اللياقة</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول اللاعبين */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                إدارة اللاعبين
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="البحث عن لاعب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <select
                  value={filterTeam}
                  onChange={(e) => setFilterTeam(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="">جميع الفرق</option>
                  <option value="الفريق الأول">الفريق الأول</option>
                  <option value="الفريق الثاني">الفريق الثاني</option>
                  <option value="فريق الناشئين">فريق الناشئين</option>
                </select>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  خطة تدريبية
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">اللاعب</th>
                    <th className="text-right p-2">العمر</th>
                    <th className="text-right p-2">المركز</th>
                    <th className="text-right p-2">الفريق</th>
                    <th className="text-right p-2">مستوى اللياقة</th>
                    <th className="text-right p-2">مستوى المهارة</th>
                    <th className="text-right p-2">آخر تدريب</th>
                    <th className="text-right p-2">الحالة</th>
                    <th className="text-right p-2">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{player.name}</div>
                      </td>
                      <td className="p-3">{player.age} سنة</td>
                      <td className="p-3">{player.position}</td>
                      <td className="p-3 text-sm">{player.team}</td>
                      <td className="p-3">
                        <Badge className={getFitnessColor(player.fitnessLevel)}>
                          {player.fitnessLevel}%
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span>{player.skillLevel}%</span>
                        </div>
                      </td>
                      <td className="p-3">{player.lastTraining}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(player.status)}>
                          {getStatusText(player.status)}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Video className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 