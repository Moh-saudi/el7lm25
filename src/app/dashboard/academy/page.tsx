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
  BookOpen,
  GraduationCap,
  Activity
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface StudentData {
  id: string;
  name: string;
  age: number;
  position: string;
  level: string;
  joinDate: string;
  parentPhone: string;
  status: 'active' | 'inactive' | 'graduated';
  program: string;
}

interface AcademyStats {
  totalStudents: number;
  activePrograms: number;
  graduatedPlayers: number;
  upcomingMatches: number;
  coachesCount: number;
  monthlyRevenue: string;
}

export default function AcademyDashboard() {
  const router = useRouter();
  const { logoutUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // بيانات تجريبية - يجب ربطها بـ Firebase
  const [academyStats, setAcademyStats] = useState<AcademyStats>({
    totalStudents: 120,
    activePrograms: 8,
    graduatedPlayers: 35,
    upcomingMatches: 6,
    coachesCount: 12,
    monthlyRevenue: '45,000 SAR'
  });

  const [students, setStudents] = useState<StudentData[]>([
    {
      id: '1',
      name: 'أحمد محمد الفيصل',
      age: 14,
      position: 'مهاجم',
      level: 'متقدم',
      joinDate: '2023-09-01',
      parentPhone: '+966501234567',
      status: 'active',
      program: 'تطوير المهارات'
    },
    {
      id: '2',
      name: 'سارة عبدالله',
      age: 12,
      position: 'وسط',
      level: 'مبتدئ',
      joinDate: '2024-01-15',
      parentPhone: '+966507654321',
      status: 'active',
      program: 'براعم كرة القدم'
    },
    {
      id: '3',
      name: 'خالد أحمد',
      age: 16,
      position: 'مدافع',
      level: 'محترف',
      joinDate: '2022-08-20',
      parentPhone: '+966509876543',
      status: 'graduated',
      program: 'إعداد المحترفين'
    }
  ]);

  useEffect(() => {
    // محاكاة تحميل البيانات
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterProgram || student.program === filterProgram;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'inactive': return 'text-gray-600 bg-gray-50';
      case 'graduated': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'نشط';
      case 'inactive': return 'غير نشط';
      case 'graduated': return 'متخرج';
      default: return status;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'مبتدئ': return 'text-orange-600 bg-orange-50';
      case 'متقدم': return 'text-blue-600 bg-blue-50';
      case 'محترف': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-200 rounded-full border-t-orange-600 animate-spin"></div>
          <p className="text-gray-600">جاري تحميل لوحة تحكم الأكاديمية...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-[Cairo] bg-gradient-to-br from-gray-50 to-gray-200">
      {/* محتوى الصفحة الرئيسية */}
      <main className="flex flex-col flex-1 min-h-screen p-8">
        <h1 className="mb-8 text-3xl font-bold text-orange-700">لوحة تحكم الأكاديمية</h1>
        
        {/* إحصائيات الأكاديمية */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-orange-600" />
              إحصائيات الأكاديمية
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center">
                <Users className="w-8 h-8 mb-2 text-orange-500" />
                <span className="text-lg font-bold">{academyStats.totalStudents}</span>
                <span className="text-sm text-gray-500">إجمالي الطلاب</span>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="w-8 h-8 mb-2 text-blue-500" />
                <span className="text-lg font-bold">{academyStats.activePrograms}</span>
                <span className="text-sm text-gray-500">البرامج النشطة</span>
              </div>
              <div className="flex flex-col items-center">
                <GraduationCap className="w-8 h-8 mb-2 text-green-500" />
                <span className="text-lg font-bold">{academyStats.graduatedPlayers}</span>
                <span className="text-sm text-gray-500">خريجين محترفين</span>
              </div>
              <div className="flex flex-col items-center">
                <Calendar className="w-8 h-8 mb-2 text-purple-500" />
                <span className="text-lg font-bold">{academyStats.upcomingMatches}</span>
                <span className="text-sm text-gray-500">مباريات قادمة</span>
              </div>
              <div className="flex flex-col items-center">
                <Target className="w-8 h-8 mb-2 text-red-500" />
                <span className="text-lg font-bold">{academyStats.coachesCount}</span>
                <span className="text-sm text-gray-500">عدد المدربين</span>
              </div>
              <div className="flex flex-col items-center">
                <Activity className="w-8 h-8 mb-2 text-teal-500" />
                <span className="text-lg font-bold">{academyStats.monthlyRevenue}</span>
                <span className="text-sm text-gray-500">إيرادات الشهر</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول الطلاب */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-orange-600" />
                إدارة الطلاب
              </CardTitle>
              <div className="flex gap-2">
                <Input
                  placeholder="البحث عن طالب..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <select
                  value={filterProgram}
                  onChange={(e) => setFilterProgram(e.target.value)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="">جميع البرامج</option>
                  <option value="براعم كرة القدم">براعم كرة القدم</option>
                  <option value="تطوير المهارات">تطوير المهارات</option>
                  <option value="إعداد المحترفين">إعداد المحترفين</option>
                </select>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  طالب جديد
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">الطالب</th>
                    <th className="text-right p-2">العمر</th>
                    <th className="text-right p-2">المركز</th>
                    <th className="text-right p-2">المستوى</th>
                    <th className="text-right p-2">البرنامج</th>
                    <th className="text-right p-2">تاريخ الانضمام</th>
                    <th className="text-right p-2">هاتف ولي الأمر</th>
                    <th className="text-right p-2">الحالة</th>
                    <th className="text-right p-2">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="font-medium">{student.name}</div>
                      </td>
                      <td className="p-3">{student.age} سنة</td>
                      <td className="p-3">{student.position}</td>
                      <td className="p-3">
                        <Badge className={getLevelColor(student.level)}>
                          {student.level}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{student.program}</td>
                      <td className="p-3">{student.joinDate}</td>
                      <td className="p-3 text-sm">{student.parentPhone}</td>
                      <td className="p-3">
                        <Badge className={getStatusColor(student.status)}>
                          {getStatusText(student.status)}
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