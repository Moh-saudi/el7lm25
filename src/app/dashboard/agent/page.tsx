'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Trophy,
  DollarSign,
  Star,
  TrendingUp,
  Plus,
  Search,
  Filter,
  UserPlus,
  Settings,
  BarChart3,
  Shield,
  Award,
  Target,
  Clock,
  MapPin,
  Mail,
  Phone,
  Edit,
  Eye,
  MoreVertical,
  FileText,
  Download,
  Briefcase,
  Handshake,
  Bell,
  MessageSquare,
  Home,
  Menu,
  X,
  LogOut,
  KeyRound,
  UserCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PlayerData {
  id: string;
  name: string;
  position: string;
  age: number;
  nationality: string;
  currentClub: string;
  contractEnd: string;
  marketValue: string;
  status: 'active' | 'negotiating' | 'transfer';
}

interface AgentStats {
  totalPlayers: number;
  activeNegotiations: number;
  successfulDeals: number;
  monthlyCommission: string;
  clientSatisfaction: number;
  averageDealValue: string;
}

export default function AgentDashboard() {
  const router = useRouter();
  const { logoutUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [settingsOpen, setSettingsOpen] = useState(false);

  // بيانات تجريبية - يجب ربطها بـ Firebase
  const [agentStats, setAgentStats] = useState<AgentStats>({
    totalPlayers: 15,
    activeNegotiations: 4,
    successfulDeals: 28,
    monthlyCommission: '85,000 SAR',
    clientSatisfaction: 4.8,
    averageDealValue: '450K SAR'
  });

  const [players, setPlayers] = useState<PlayerData[]>([
    {
      id: '1',
      name: 'أحمد الفيصل',
      position: 'مهاجم',
      age: 23,
      nationality: 'السعودية',
      currentClub: 'النصر',
      contractEnd: '2025-06-30',
      marketValue: '800K SAR',
      status: 'active'
    },
    {
      id: '2',
      name: 'محمد العتيبي',
      position: 'وسط',
      age: 26,
      nationality: 'السعودية',
      currentClub: 'الهلال',
      contractEnd: '2024-12-31',
      marketValue: '1.2M SAR',
      status: 'negotiating'
    },
    {
      id: '3',
      name: 'عبدالله خالد',
      position: 'مدافع',
      age: 28,
      nationality: 'الإمارات',
      currentClub: 'العين',
      contractEnd: '2026-01-15',
      marketValue: '600K SAR',
      status: 'transfer'
    }
  ]);

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.currentClub.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterStatus || player.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'negotiating': return 'text-blue-600 bg-blue-50';
      case 'transfer': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'negotiating': return 'قيد التفاوض';
      case 'transfer': return 'انتقال';
      default: return status;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-purple-200 rounded-full border-t-purple-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم الوكيل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-[Cairo] bg-gradient-to-br from-gray-50 to-gray-200">
      {/* محتوى الصفحة الرئيسية */}
      <main className="flex flex-col flex-1 min-h-screen p-8">
        <h1 className="mb-8 text-3xl font-bold text-purple-700">لوحة تحكم الوكيل</h1>
        
        {/* إحصائيات الوكيل */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-purple-600" />
              إحصائيات الأعمال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 mb-2 text-purple-500" />
                <span className="text-lg font-bold">{agentStats.totalPlayers}</span>
                <span className="text-sm text-gray-500">اللاعبين المُمثلين</span>
              </div>
              <div className="flex flex-col items-center">
                <Handshake className="w-8 h-8 mb-2 text-blue-500" />
                <span className="text-lg font-bold">{agentStats.activeNegotiations}</span>
                <span className="text-sm text-gray-500">مفاوضات نشطة</span>
              </div>
              <div className="flex flex-col items-center">
                <Trophy className="w-8 h-8 mb-2 text-green-500" />
                <span className="text-lg font-bold">{agentStats.successfulDeals}</span>
                <span className="text-sm text-gray-500">صفقات ناجحة</span>
              </div>
              <div className="flex flex-col items-center">
                <DollarSign className="w-8 h-8 mb-2 text-yellow-500" />
                <span className="text-lg font-bold">{agentStats.monthlyCommission}</span>
                <span className="text-sm text-gray-500">عمولة الشهر</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 mb-2 text-orange-500" />
                <span className="text-lg font-bold">{agentStats.clientSatisfaction}</span>
                <span className="text-sm text-gray-500">تقييم العملاء</span>
              </div>
              <div className="flex flex-col items-center">
                <TrendingUp className="w-8 h-8 mb-2 text-pink-500" />
                <span className="text-lg font-bold">{agentStats.averageDealValue}</span>
                <span className="text-sm text-gray-500">متوسط قيمة الصفقة</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول اللاعبين المُمثلين */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-purple-600" />
                اللاعبين المُمثلين
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="البحث عن لاعب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="">جميع الحالات</option>
                  <option value="active">نشط</option>
                  <option value="negotiating">قيد التفاوض</option>
                  <option value="transfer">انتقال</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">اللاعب</th>
                    <th className="text-right p-2">المركز</th>
                    <th className="text-right p-2">العمر</th>
                    <th className="text-right p-2">النادي الحالي</th>
                    <th className="text-right p-2">انتهاء العقد</th>
                    <th className="text-right p-2">القيمة السوقية</th>
                    <th className="text-right p-2">الحالة</th>
                    <th className="text-right p-2">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPlayers.map((player) => (
                    <tr key={player.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-500">{player.nationality}</div>
                        </div>
                      </td>
                      <td className="p-3">{player.position}</td>
                      <td className="p-3">{player.age}</td>
                      <td className="p-3">{player.currentClub}</td>
                      <td className="p-3">{player.contractEnd}</td>
                      <td className="p-3 font-medium">{player.marketValue}</td>
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