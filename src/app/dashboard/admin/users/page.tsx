'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, getDoc, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Search,
  Filter,
  UserCheck,
  Building2,
  Briefcase,
  GraduationCap,
  Shield,
  User,
  UserPlus,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Download,
  KeyRound,
  Trash2,
  Eye,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminFooter from '@/components/layout/AdminFooter';
import { useAuth } from '@/lib/firebase/auth-provider';
import { COUNTRIES_DATA } from '@/lib/cities-data';
import UserDetailsModal from '@/components/admin/UserDetailsModal';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail } from 'firebase/auth';

// Types
interface UserBase {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'player' | 'academy' | 'agent' | 'trainer' | 'club';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  parentAccountId?: string;
  parentAccountType?: string;
  subscription?: {
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    plan: string;
    expiresAt: Date;
  };
  location?: {
    countryId: string;
    countryName: string;
    cityId: string;
    cityName: string;
  };
  managedBy?: {
    employeeId: string;
    employeeName: string;
  };
}

interface Player extends UserBase {
  accountType: 'player';
  position?: string;
  dateOfBirth?: Date;
  nationality?: string;
  height?: number;
  weight?: number;
  preferredFoot?: 'right' | 'left' | 'both';
  marketValue?: number;
}

interface Entity extends UserBase {
  accountType: 'academy' | 'agent' | 'trainer' | 'club';
  location?: {
    country: string;
    city: string;
  };
  license?: {
    number: string;
    expiryDate: Date;
    isVerified: boolean;
  };
  rating?: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export default function UsersManagement() {
  const router = useRouter();
  const { user, userData } = useAuth();
  
  // Add detailed logging
  console.log('👥 Users Management Page - Component loaded:', {
    hasUser: !!user,
    hasUserData: !!userData,
    userEmail: user?.email,
    accountType: userData?.accountType,
    timestamp: new Date().toISOString()
  });
  
  // States
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<(Player | Entity)[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [parentFilter, setParentFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<{
    countryId: string;
    cityId: string;
  }>({ countryId: '', cityId: '' });
  const [availableRegions, setAvailableRegions] = useState<{
    countries: typeof COUNTRIES_DATA;
    userRegions: { countryId: string; cityId: string; }[];
  }>({
    countries: COUNTRIES_DATA || [],
    userRegions: []
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    players: 0,
    academies: 0,
    agents: 0,
    trainers: 0,
    clubs: 0,
    independent: 0,
    affiliated: 0
  });

  // Add new filter states
  const [subscriptionFilter, setSubscriptionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Bulk actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      console.log('📊 Loading users - Start:', {
        currentUser: user?.email,
        userRole: userData?.accountType,
        timestamp: new Date().toISOString()
      });
      
      setLoading(true);
      
      // Get user's allowed regions if they are a sales employee
      let userRegions: { countryId: string; cityId: string; }[] = [];
      if (userData?.role === 'sales' && userData.permissions?.allowedRegions) {
        userRegions = userData.permissions.allowedRegions;
        setAvailableRegions({
          countries: COUNTRIES_DATA.filter(country => 
            userRegions.some(region => region.countryId === country.id)
          ),
          userRegions
        });
      } else {
        setAvailableRegions({
          countries: COUNTRIES_DATA,
          userRegions: []
        });
      }

      // Build base query
      let baseQuery = collection(db, 'users');
      let queryConstraints: any[] = [orderBy(sortBy, sortOrder)];

      // Add filters based on user role and permissions
      if (userData?.role === 'sales' && userRegions.length > 0) {
        queryConstraints.push(
          where('location.countryId', 'in', [...new Set(userRegions.map(r => r.countryId))])
        );
      }

      // Apply date filter if selected
      if (dateFilter !== 'all') {
        const date = new Date();
        switch (dateFilter) {
          case 'today':
            date.setHours(0, 0, 0, 0);
            queryConstraints.push(where('createdAt', '>=', date));
            break;
          case 'week':
            date.setDate(date.getDate() - 7);
            queryConstraints.push(where('createdAt', '>=', date));
            break;
          case 'month':
            date.setMonth(date.getMonth() - 1);
            queryConstraints.push(where('createdAt', '>=', date));
            break;
        }
      }

      // Execute query
      const usersQuery = query(baseQuery, ...queryConstraints);
      const snapshot = await getDocs(usersQuery);
      
      const usersData = snapshot.docs
        .map(doc => {
          const data = doc.data();
          
          // Safe date conversion function
          const convertToDate = (dateField: any) => {
            if (!dateField) return null;
            
            // If it's already a Date object
            if (dateField instanceof Date) return dateField;
            
            // If it's a Firestore Timestamp
            if (dateField && typeof dateField.toDate === 'function') {
              return dateField.toDate();
            }
            
            // If it's a string or number, try to convert
            if (typeof dateField === 'string' || typeof dateField === 'number') {
              const date = new Date(dateField);
              return isNaN(date.getTime()) ? null : date;
            }
            
            // If it has seconds property (Firestore Timestamp-like object)
            if (dateField && typeof dateField.seconds === 'number') {
              return new Date(dateField.seconds * 1000);
            }
            
            return null;
          };

          return {
            id: doc.id,
            ...data,
            createdAt: convertToDate(data.createdAt),
            lastLogin: convertToDate(data.lastLogin),
          };
        })
        .filter(user => {
          // Exclude deleted users
          if (user.isDeleted === true) {
            return false;
          }
          
          // Additional filtering for sales employees by city
          if (userData?.role === 'sales' && user.location) {
            return userRegions.some(
              region => 
                region.countryId === user.location.countryId &&
                region.cityId === user.location.cityId
            );
          }
          return true;
        }) as (Player | Entity)[];

      setUsers(usersData);
      updateStats(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات المستخدمين');
    } finally {
      setLoading(false);
    }
  };

  // Add function to update stats
  const updateStats = (usersData: (Player | Entity)[]) => {
    const stats = {
      total: usersData.length,
      active: usersData.filter(u => u.isActive).length,
      players: usersData.filter(u => u.accountType === 'player').length,
      academies: usersData.filter(u => u.accountType === 'academy').length,
      agents: usersData.filter(u => u.accountType === 'agent').length,
      trainers: usersData.filter(u => u.accountType === 'trainer').length,
      clubs: usersData.filter(u => u.accountType === 'club').length,
      independent: usersData.filter(u => !u.parentAccountId).length,
      affiliated: usersData.filter(u => u.parentAccountId).length
    };
    setStats(stats);
  };

  // Update filteredUsers to include new filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = accountTypeFilter === 'all' || user.accountType === accountTypeFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive);

    const matchesParent = parentFilter === 'all' ||
      (parentFilter === 'independent' && !user.parentAccountId) ||
      (parentFilter === 'affiliated' && user.parentAccountId);

    const matchesRegion = 
      (!regionFilter.countryId || regionFilter.countryId === 'all' || user.location?.countryId === regionFilter.countryId) &&
      (!regionFilter.cityId || regionFilter.cityId === 'all' || user.location?.cityId === regionFilter.cityId);

    const matchesSubscription = subscriptionFilter === 'all' ||
      user.subscription?.status === subscriptionFilter;

    return matchesSearch && 
           matchesType && 
           matchesStatus && 
           matchesParent && 
           matchesRegion && 
           matchesSubscription;
  });

  // Toggle user status
  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      // Update in main users collection
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus,
        updatedAt: new Date(),
        statusChangedBy: userData?.uid,
        statusChangedAt: new Date()
      });
      
      // Also update in role-specific collection if document exists
      const user = users.find(u => u.id === userId);
      if (user && user.accountType !== 'admin') {
        const roleCollection = user.accountType + 's';
        try {
          // Check if document exists first
          const roleDocRef = doc(db, roleCollection, userId);
          const roleDoc = await getDoc(roleDocRef);
          
          if (roleDoc.exists()) {
            await updateDoc(roleDocRef, {
              isActive: !currentStatus,
              updatedAt: new Date()
            });
          } else {
            console.log(`Document not found in ${roleCollection} collection for user ${userId}`);
          }
        } catch (roleError) {
          console.warn(`Failed to update role-specific document: ${roleError}`);
          // Continue anyway since main users collection was updated successfully
        }
      }
      
      toast.success(`تم ${!currentStatus ? 'تفعيل' : 'إلغاء تفعيل'} المستخدم بنجاح`);
      loadUsers(); // Reload users to reflect changes
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المستخدم');
    }
  };

  // Reset user password
  const resetUserPassword = async (userEmail: string, userName: string) => {
    try {
      // Import Firebase Auth functions
      const { auth } = await import('@/lib/firebase/config');
      
      await sendPasswordResetEmail(auth, userEmail);
      
      toast.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${userName}`);
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور');
    }
  };

  // Delete user account
  const deleteUserAccount = async (userId: string, userName: string) => {
    if (!confirm(`هل أنت متأكد من حذف حساب ${userName}؟ هذا الإجراء لا يمكن التراجع عنه.`)) {
      return;
    }

    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      // Delete from main users collection
      await updateDoc(doc(db, 'users', userId), {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userData?.uid,
        isActive: false
      });

      // Also mark as deleted in role-specific collection if document exists
      if (user.accountType !== 'admin') {
        const roleCollection = user.accountType + 's';
        try {
          // Check if document exists first
          const roleDocRef = doc(db, roleCollection, userId);
          const roleDoc = await getDoc(roleDocRef);
          
          if (roleDoc.exists()) {
            await updateDoc(roleDocRef, {
              isDeleted: true,
              deletedAt: new Date(),
              isActive: false
            });
          } else {
            console.log(`Document not found in ${roleCollection} collection for user ${userId}`);
          }
        } catch (roleError) {
          console.warn(`Failed to update role-specific document during deletion: ${roleError}`);
          // Continue anyway since main users collection was updated successfully
        }
      }

      toast.success(`تم حذف حساب ${userName} بنجاح`);
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('حدث خطأ أثناء حذف المستخدم');
    }
  };

  // Bulk actions
  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUsers(filteredUsers.map(user => user.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const bulkActivateUsers = async () => {
    try {
      const promises = selectedUsers.map(userId => 
        updateDoc(doc(db, 'users', userId), {
          isActive: true,
          updatedAt: new Date(),
          statusChangedBy: userData?.uid,
          statusChangedAt: new Date()
        })
      );
      
      await Promise.all(promises);
      toast.success(`تم تفعيل ${selectedUsers.length} مستخدم بنجاح`);
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error bulk activating users:', error);
      toast.error('حدث خطأ أثناء تفعيل المستخدمين');
    }
  };

  const bulkDeactivateUsers = async () => {
    try {
      const promises = selectedUsers.map(userId => 
        updateDoc(doc(db, 'users', userId), {
          isActive: false,
          updatedAt: new Date(),
          statusChangedBy: userData?.uid,
          statusChangedAt: new Date()
        })
      );
      
      await Promise.all(promises);
      toast.success(`تم إلغاء تفعيل ${selectedUsers.length} مستخدم بنجاح`);
      setSelectedUsers([]);
      loadUsers();
    } catch (error) {
      console.error('Error bulk deactivating users:', error);
      toast.error('حدث خطأ أثناء إلغاء تفعيل المستخدمين');
    }
  };

  // Update useEffect to show bulk actions when users are selected
  useEffect(() => {
    setShowBulkActions(selectedUsers.length > 0);
  }, [selectedUsers]);

  // Handle user details modal
  const handleViewUser = (userId: string) => {
    setSelectedUserId(userId);
    setShowUserModal(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUserId(null);
    setShowUserModal(false);
  };

  const handleUserUpdated = () => {
    loadUsers(); // Refresh the users list
  };

  // Get account type badge
  const getAccountTypeBadge = (type: string) => {
    switch (type) {
      case 'player':
        return <Badge variant="outline" className="bg-blue-50 text-blue-600">لاعب</Badge>;
      case 'academy':
        return <Badge variant="outline" className="bg-purple-50 text-purple-600">أكاديمية</Badge>;
      case 'agent':
        return <Badge variant="outline" className="bg-amber-50 text-amber-600">وكيل</Badge>;
      case 'trainer':
        return <Badge variant="outline" className="bg-green-50 text-green-600">مدرب</Badge>;
      case 'club':
        return <Badge variant="outline" className="bg-indigo-50 text-indigo-600">نادي</Badge>;
      default:
        return <Badge variant="outline">غير محدد</Badge>;
    }
  };

  // Get subscription status badge
  const getSubscriptionBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-50 text-green-600">نشط</Badge>;
      case 'expired':
        return <Badge className="bg-red-50 text-red-600">منتهي</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-50 text-gray-600">ملغي</Badge>;
      case 'trial':
        return <Badge className="bg-blue-50 text-blue-600">تجريبي</Badge>;
      default:
        return <Badge variant="outline">غير مشترك</Badge>;
    }
  };

  // Add function to check if user has access to region
  const hasRegionAccess = (userLocation?: { countryId: string; cityId: string }) => {
    if (!userLocation) return true; // If no location specified, allow access
    if (userData?.role === 'admin') return true; // Admin has access to all regions
    
    // For sales employees, check if they have access to this region
    if (userData?.role === 'sales') {
      return userData.permissions?.allowedRegions?.some(
        region => region.countryId === userLocation.countryId && 
                 region.cityId === userLocation.cityId
      );
    }
    
    return true; // Other roles have full access for now
  };

  // Add RegionFilter component
  const RegionFilter = () => {
    // Add safety checks to prevent undefined errors
    const countries = availableRegions?.countries || [];
    const selectedCountry = countries.find(c => c.id === regionFilter.countryId);
    
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>الدولة</Label>
          <Select 
            value={regionFilter.countryId || 'all'} 
            onValueChange={(value) => setRegionFilter(prev => ({ 
              ...prev, 
              countryId: value === 'all' ? '' : value, 
              cityId: '' 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="جميع الدول" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الدول</SelectItem>
              {countries.map(country => (
                <SelectItem key={country.id} value={country.id}>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{country.flag}</span>
                    <span>{country.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>المدينة</Label>
          <Select 
            value={regionFilter.cityId || 'all'}
            onValueChange={(value) => setRegionFilter(prev => ({ 
              ...prev, 
              cityId: value === 'all' ? '' : value 
            }))}
            disabled={!regionFilter.countryId}
          >
            <SelectTrigger>
              <SelectValue placeholder="جميع المدن" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المدن</SelectItem>
              {selectedCountry?.cities?.map(city => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              )) || []}
            </SelectContent>
          </Select>
        </div>
      </div>
    );
  };

  // Add sorting function
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    loadUsers();
  };

  // Add export function
  const exportUsers = () => {
    const data = filteredUsers.map(user => ({
      'الاسم': user.name,
      'البريد الإلكتروني': user.email,
      'الهاتف': user.phone || '',
      'نوع الحساب': getAccountTypeText(user.accountType),
      'الحالة': user.isActive ? 'نشط' : 'غير نشط',
      'تاريخ التسجيل': (user.createdAt && user.createdAt instanceof Date) 
        ? user.createdAt.toLocaleDateString('ar-SA') 
        : 'غير محدد',
      'آخر دخول': (user.lastLogin && user.lastLogin instanceof Date) 
        ? user.lastLogin.toLocaleDateString('ar-SA') 
        : 'لم يسجل دخول',
      'الدولة': user.location?.countryName || '',
      'المدينة': user.location?.cityName || '',
      'حالة الاشتراك': user.subscription?.status || 'غير مشترك'
    }));

    const csv = convertToCSV(data);
    downloadCSV(csv, 'users-export.csv');
  };

  // Helper function to get account type text
  const getAccountTypeText = (type: string) => {
    switch (type) {
      case 'player': return 'لاعب';
      case 'academy': return 'أكاديمية';
      case 'agent': return 'وكيل';
      case 'trainer': return 'مدرب';
      case 'club': return 'نادي';
      default: return 'غير محدد';
    }
  };

  // Helper function to convert data to CSV
  const convertToCSV = (data: any[]) => {
    const headers = Object.keys(data[0]);
    const rows = data.map(obj => headers.map(header => obj[header]));
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Helper function to download CSV
  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات المستخدمين...</p>
          </div>
        </div>
        <AdminFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AdminHeader />
      
      <main className="flex-1 container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
            <p className="text-gray-600">إدارة جميع أنواع الحسابات في النظام</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadUsers}>
              <RefreshCcw className="w-4 h-4 ml-2" />
              تحديث
            </Button>
            <Button variant="outline" onClick={exportUsers}>
              <Download className="w-4 h-4 ml-2" />
              تصدير النتائج
            </Button>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('📧 Email Migration Button Clicked:', {
                  userEmail: user?.email,
                  accountType: userData?.accountType,
                  redirectingTo: '/dashboard/admin/email-migration',
                  timestamp: new Date().toISOString()
                });
                router.push('/dashboard/admin/email-migration');
              }}
              className="bg-orange-50 text-orange-600 hover:bg-orange-100"
            >
              <Mail className="w-4 h-4 ml-2" />
              تحديث الإيميلات
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard/admin/test-access')}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              <Shield className="w-4 h-4 ml-2" />
              اختبار الصلاحيات
            </Button>
            <Button>
              <UserPlus className="w-4 h-4 ml-2" />
              إضافة مستخدم
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  {stats.active} نشط
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-600">
                  {stats.total - stats.active} غير نشط
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">اللاعبين</p>
                  <p className="text-2xl font-bold">{stats.players}</p>
                </div>
                <User className="w-8 h-8 text-indigo-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-blue-50 text-blue-600">
                  {stats.independent} مستقل
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-600">
                  {stats.affiliated} تابع
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المؤسسات</p>
                  <p className="text-2xl font-bold">
                    {stats.academies + stats.clubs}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-amber-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-amber-50 text-amber-600">
                  {stats.academies} أكاديمية
                </Badge>
                <Badge variant="outline" className="bg-indigo-50 text-indigo-600">
                  {stats.clubs} نادي
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الوكلاء والمدربين</p>
                  <p className="text-2xl font-bold">
                    {stats.agents + stats.trainers}
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-green-500" />
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Badge variant="outline" className="bg-green-50 text-green-600">
                  {stats.agents} وكيل
                </Badge>
                <Badge variant="outline" className="bg-purple-50 text-purple-600">
                  {stats.trainers} مدرب
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div>
              <Label>البحث</Label>
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="بحث بالاسم، البريد، الهاتف..."
                  className="pr-10"
                />
              </div>
            </div>

            <div>
              <Label>نوع الحساب</Label>
              <Select value={accountTypeFilter} onValueChange={setAccountTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الأنواع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="player">لاعب</SelectItem>
                  <SelectItem value="academy">أكاديمية</SelectItem>
                  <SelectItem value="agent">وكيل</SelectItem>
                  <SelectItem value="trainer">مدرب</SelectItem>
                  <SelectItem value="club">نادي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>الحالة</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحالات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>التبعية</Label>
              <Select value={parentFilter} onValueChange={setParentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الحسابات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحسابات</SelectItem>
                  <SelectItem value="independent">مستقل</SelectItem>
                  <SelectItem value="affiliated">تابع</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>حالة الاشتراك</Label>
              <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الاشتراكات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الاشتراكات</SelectItem>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                  <SelectItem value="trial">تجريبي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>تاريخ التسجيل</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الفترات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الفترات</SelectItem>
                  <SelectItem value="today">اليوم</SelectItem>
                  <SelectItem value="week">آخر أسبوع</SelectItem>
                  <SelectItem value="month">آخر شهر</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="xl:col-span-2">
              <Label>المنطقة</Label>
              <RegionFilter />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                {filteredUsers.length} من {users.length} مستخدم
              </p>
              {userData?.role === 'sales' && (
                <Badge variant="outline" className="bg-blue-50 text-blue-600">
                  {availableRegions?.userRegions?.length || 0} منطقة مخصصة
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                setSearchTerm('');
                setAccountTypeFilter('all');
                setStatusFilter('all');
                setParentFilter('all');
                setSubscriptionFilter('all');
                setDateFilter('all');
                setRegionFilter({ countryId: '', cityId: '' });
              }}>
                <Filter className="w-4 h-4 ml-2" />
                إعادة تعيين الفلاتر
              </Button>
              <Button variant="outline" size="sm" onClick={exportUsers}>
                <Download className="w-4 h-4 ml-2" />
                تصدير النتائج
              </Button>
            </div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-blue-900">
                  تم تحديد {selectedUsers.length} مستخدم
                </p>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={bulkActivateUsers} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="w-4 h-4 ml-1" />
                    تفعيل الكل
                  </Button>
                  <Button size="sm" variant="outline" onClick={bulkDeactivateUsers}>
                    <XCircle className="w-4 h-4 ml-1" />
                    إلغاء تفعيل الكل
                  </Button>
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedUsers([])}>
                إلغاء التحديد
              </Button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </TableHead>
                <TableHead>المستخدم</TableHead>
                <TableHead>نوع الحساب</TableHead>
                <TableHead>التبعية</TableHead>
                <TableHead>الاشتراك</TableHead>
                <TableHead>آخر دخول</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone && (
                          <div className="text-xs text-gray-400">{user.phone}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAccountTypeBadge(user.accountType)}
                  </TableCell>
                  <TableCell>
                    {user.parentAccountId ? (
                      <div className="flex items-center gap-1 text-sm">
                        <Shield className="w-4 h-4 text-purple-500" />
                        <span>تابع لـ {user.parentAccountType}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-sm">
                        <UserCheck className="w-4 h-4 text-green-500" />
                        <span>مستقل</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getSubscriptionBadge(user.subscription?.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      {user.lastLogin && user.lastLogin instanceof Date ? (
                        user.lastLogin.toLocaleDateString('ar-SA')
                      ) : (
                        'لم يسجل دخول'
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => toggleUserStatus(user.id, user.isActive)}
                        disabled={loading}
                      />
                      <span className="text-xs text-gray-500">
                        {user.isActive ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-700"
                        onClick={() => handleViewUser(user.id)}
                      >
                        عرض التفاصيل
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-orange-600 hover:text-orange-700"
                        onClick={() => resetUserPassword(user.email, user.name)}
                      >
                        إعادة تعيين
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteUserAccount(user.id, user.name)}
                      >
                        حذف
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد نتائج</h3>
              <p className="text-gray-500">لم يتم العثور على مستخدمين مطابقين للفلاتر المحددة</p>
            </div>
          )}
        </div>
      </main>

      <AdminFooter />
      
      {/* User Details Modal */}
      <UserDetailsModal
        userId={selectedUserId}
        isOpen={showUserModal}
        onClose={handleCloseUserModal}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
} 