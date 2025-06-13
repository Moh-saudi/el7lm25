'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Users,
  Handshake,
  DollarSign,
  Star,
  TrendingUp,
  Plus,
  Search,
  Filter,
  UserPlus,
  Settings,
  BarChart3,
  UserCheck,
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
  Calendar,
  Briefcase,
  PieChart,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';

interface PlayerClient {
  id: string;
  name: string;
  position: string;
  age: number;
  nationality: string;
  rating: number;
  currentClub: string;
  contractEnd: string;
  status: 'available' | 'under_negotiation' | 'contracted';
  marketValue: string;
  lastOffer: string;
}

interface Deal {
  id: string;
  player: string;
  fromClub: string;
  toClub: string;
  amount: string;
  commission: string;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}

interface AgentStats {
  totalClients: number;
  activeDeals: number;
  completedDeals: number;
  totalCommission: string;
  avgDealValue: string;
  successRate: number;
}

export default function AgentDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // بيانات تجريبية - يجب ربطها بـ Firebase
  const [agentStats, setAgentStats] = useState<AgentStats>({
    totalClients: 15,
    activeDeals: 3,
    completedDeals: 28,
    totalCommission: '1.2M SAR',
    avgDealValue: '850K SAR',
    successRate: 85
  });

  const [players, setPlayers] = useState<PlayerClient[]>([
    {
      id: '1',
      name: 'سالم أحمد',
      position: 'مهاجم',
      age: 25,
      nationality: 'السعودية',
      rating: 8.8,
      currentClub: 'النصر',
      contractEnd: '2024-12-31',
      status: 'under_negotiation',
      marketValue: '2.5M SAR',
      lastOffer: '3M SAR'
    },
    {
      id: '2',
      name: 'يوسف محمد',
      position: 'وسط',
      age: 23,
      nationality: 'السعودية',
      rating: 8.2,
      currentClub: 'الاتحاد',
      contractEnd: '2025-06-30',
      status: 'available',
      marketValue: '1.8M SAR',
      lastOffer: '2.1M SAR'
    },
    {
      id: '3',
      name: 'خالد عبدالله',
      position: 'مدافع',
      age: 28,
      nationality: 'الإمارات',
      rating: 7.9,
      currentClub: 'الشباب',
      contractEnd: '2026-01-15',
      status: 'contracted',
      marketValue: '1.2M SAR',
      lastOffer: 'غير متاح'
    }
  ]);

  const [deals, setDeals] = useState<Deal[]>([
    {
      id: '1',
      player: 'سالم أحمد',
      fromClub: 'النصر',
      toClub: 'الهلال',
      amount: '3M SAR',
      commission: '150K SAR',
      status: 'pending',
      date: '2024-01-10'
    },
    {
      id: '2',
      player: 'أحمد سعد',
      fromClub: 'الشباب',
      toClub: 'الاتحاد',
      amount: '1.5M SAR',
      commission: '75K SAR',
      status: 'completed',
      date: '2023-12-28'
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
      case 'available': return 'text-green-600 bg-green-50';
      case 'under_negotiation': return 'text-yellow-600 bg-yellow-50';
      case 'contracted': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'متاح';
      case 'under_negotiation': return 'تحت التفاوض';
      case 'contracted': return 'متعاقد';
      default: return status;
    }
  };

  const getDealStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-50';
      case 'completed': return 'text-green-600 bg-green-50';
      case 'cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getDealStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد المراجعة';
      case 'completed': return 'مكتملة';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم وكيل اللاعبين...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">لوحة تحكم وكيل اللاعبين</h1>
              <p className="text-gray-600 mt-1">إدارة شاملة لمحفظة اللاعبين والصفقات</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus className="w-4 h-4" />
                إضافة لاعب جديد
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Handshake className="w-4 h-4" />
                صفقة جديدة
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Settings className="w-4 h-4" />
                الإعدادات
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8">
        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-gray-900">{agentStats.totalClients}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الصفقات النشطة</p>
                <p className="text-2xl font-bold text-gray-900">{agentStats.activeDeals}</p>
              </div>
              <Timer className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">الصفقات المكتملة</p>
                <p className="text-2xl font-bold text-gray-900">{agentStats.completedDeals}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">إجمالي العمولات</p>
                <p className="text-2xl font-bold text-gray-900">{agentStats.totalCommission}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">متوسط قيمة الصفقة</p>
                <p className="text-2xl font-bold text-gray-900">{agentStats.avgDealValue}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-indigo-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">معدل النجاح</p>
                <p className="text-2xl font-bold text-gray-900">{agentStats.successRate}%</p>
              </div>
              <Award className="w-8 h-8 text-yellow-600" />
            </div>
          </motion.div>
        </div>

        {/* علامات التبويب */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" dir="ltr">
              {[
                { id: 'overview', label: 'نظرة عامة', icon: BarChart3 },
                { id: 'players', label: 'محفظة اللاعبين', icon: Users },
                { id: 'deals', label: 'الصفقات', icon: Handshake },
                { id: 'reports', label: 'التقارير المالية', icon: FileText }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* محتوى التبويبات */}
          <div className="p-6">
            {activeTab === 'players' && (
              <div>
                {/* أدوات البحث والفلترة */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="البحث عن لاعب أو نادي..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">جميع الحالات</option>
                    <option value="available">متاح</option>
                    <option value="under_negotiation">تحت التفاوض</option>
                    <option value="contracted">متعاقد</option>
                  </select>
                </div>

                {/* جدول اللاعبين */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">اللاعب</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">المركز</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">النادي الحالي</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">التقييم</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">انتهاء العقد</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">الحالة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">القيمة السوقية</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">آخر عرض</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredPlayers.map((player) => (
                        <motion.tr
                          key={player.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                {player.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="mr-3">
                                <p className="font-medium text-gray-900">{player.name}</p>
                                <p className="text-sm text-gray-500">{player.nationality} • {player.age} سنة</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">{player.position}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{player.currentClub}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 ml-1" />
                              <span className="text-sm font-medium">{player.rating}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">{player.contractEnd}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(player.status)}`}>
                              {getStatusText(player.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{player.marketValue}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{player.lastOffer}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-blue-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-green-600">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-purple-600">
                                <Handshake className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'deals' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">الصفقات الحالية والمكتملة</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">اللاعب</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">من</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">إلى</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">قيمة الصفقة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">العمولة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">الحالة</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">التاريخ</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {deals.map((deal) => (
                        <motion.tr
                          key={deal.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-4 py-4 font-medium text-gray-900">{deal.player}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{deal.fromClub}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{deal.toClub}</td>
                          <td className="px-4 py-4 text-sm font-medium text-gray-900">{deal.amount}</td>
                          <td className="px-4 py-4 text-sm font-bold text-green-600">{deal.commission}</td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDealStatusColor(deal.status)}`}>
                              {getDealStatusText(deal.status)}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900">{deal.date}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button className="p-1 text-gray-400 hover:text-blue-600">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-green-600">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* إحصائيات الأداء */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    إحصائيات الأداء الشهرية
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الصفقات المكتملة</span>
                      <span className="font-bold text-green-600">5 صفقات</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">إجمالي العمولات</span>
                      <span className="font-bold">250K SAR</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">عملاء جدد</span>
                      <span className="font-bold">3 لاعبين</span>
                    </div>
                  </div>
                </div>

                {/* الصفقات المعلقة */}
                <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-orange-600" />
                    الصفقات المعلقة
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium">سالم أحمد → الهلال</p>
                        <p className="text-sm text-gray-500">مهاجم • عمولة 150K</p>
                      </div>
                      <div className="text-left">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-600">
                          تحت المراجعة
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                      <div>
                        <p className="font-medium">يوسف محمد → النصر</p>
                        <p className="text-sm text-gray-500">وسط • عمولة 105K</p>
                      </div>
                      <div className="text-left">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                          مراجعة نهائية
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="text-center py-12">
                <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">التقارير المالية</h3>
                <p className="text-gray-600 mb-4">تقارير مفصلة عن العمولات والإيرادات</p>
                <div className="flex gap-4 justify-center">
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تقرير العمولات
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    تقرير الأداء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 