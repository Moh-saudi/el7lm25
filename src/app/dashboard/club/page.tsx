'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  Megaphone,
  Brain,
  Handshake,
  Bell,
  MessageSquare,
  Home,
  Menu,
  X,
  DollarSign,
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
  rating: number;
  contractEnd: string;
  status: 'active' | 'injured' | 'suspended';
  marketValue: string;
}

interface ClubStats {
  totalPlayers: number;
  activeContracts: number;
  upcomingMatches: number;
  monthlyBudget: string;
  leaguePosition: number;
  totalWins: number;
}

export default function ClubDashboard() {
  const router = useRouter();
  const { logoutUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPosition, setFilterPosition] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // بيانات تجريبية - يجب ربطها بـ Firebase
  const [clubStats, setClubStats] = useState<ClubStats>({
    totalPlayers: 28,
    activeContracts: 24,
    upcomingMatches: 5,
    monthlyBudget: '2.5M SAR',
    leaguePosition: 3,
    totalWins: 18
  });

  const [players, setPlayers] = useState<PlayerData[]>([
    {
      id: '1',
      name: 'أحمد محمد',
      position: 'مهاجم',
      age: 24,
      nationality: 'السعودية',
      rating: 8.5,
      contractEnd: '2025-06-30',
      status: 'active',
      marketValue: '500K SAR'
    },
    {
      id: '2',
      name: 'عبدالله سالم',
      position: 'حارس مرمى',
      age: 28,
      nationality: 'السعودية',
      rating: 9.0,
      contractEnd: '2024-12-31',
      status: 'active',
      marketValue: '800K SAR'
    },
    {
      id: '3',
      name: 'محمد علي',
      position: 'مدافع',
      age: 26,
      nationality: 'مصر',
      rating: 7.8,
      contractEnd: '2026-01-15',
      status: 'injured',
      marketValue: '350K SAR'
    }
  ]);

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         player.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterPosition || player.position === filterPosition;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'injured': return 'text-red-600 bg-red-50';
      case 'suspended': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'injured': return 'مصاب';
      case 'suspended': return 'موقوف';
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
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم النادي...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-[Cairo] bg-gradient-to-br from-gray-50 to-gray-200">
      {/* محتوى الصفحة الرئيسية */}
      <main className="flex flex-col flex-1 min-h-screen p-8">
        <h1 className="mb-8 text-3xl font-bold text-primary">لوحة تحكم النادي</h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>إحصائيات النادي</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 mb-2 text-blue-500" />
                <span className="text-lg font-bold">{clubStats.totalPlayers}</span>
                <span className="text-sm text-gray-500">عدد اللاعبين</span>
              </div>
              <div className="flex flex-col items-center">
                <FileText className="w-8 h-8 mb-2 text-green-500" />
                <span className="text-lg font-bold">{clubStats.activeContracts}</span>
                <span className="text-sm text-gray-500">العقود الفعالة</span>
              </div>
              <div className="flex flex-col items-center">
                <Calendar className="w-8 h-8 mb-2 text-purple-500" />
                <span className="text-lg font-bold">{clubStats.upcomingMatches}</span>
                <span className="text-sm text-gray-500">المباريات القادمة</span>
              </div>
              <div className="flex flex-col items-center">
                <DollarSign className="w-8 h-8 mb-2 text-yellow-500" />
                <span className="text-lg font-bold">{clubStats.monthlyBudget}</span>
                <span className="text-sm text-gray-500">ميزانية الشهر</span>
              </div>
              <div className="flex flex-col items-center">
                <Trophy className="w-8 h-8 mb-2 text-orange-500" />
                <span className="text-lg font-bold">{clubStats.leaguePosition}</span>
                <span className="text-sm text-gray-500">ترتيب الدوري</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 mb-2 text-pink-500" />
                <span className="text-lg font-bold">{clubStats.totalWins}</span>
                <span className="text-sm text-gray-500">عدد الانتصارات</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
} 