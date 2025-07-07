'use client';

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc } from 'firebase/firestore';
import { db, retryOperation, checkFirestoreConnection } from '@/lib/firebase/config';
import AdminHeader from '@/components/layout/AdminHeader';
import AdminFooter from '@/components/layout/AdminFooter';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, Search, RefreshCcw, Download, DollarSign, TrendingUp, Calendar, Eye, CheckCircle, XCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Payment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
  paymentMethod: string;
  transactionId?: string;
  description: string;
  createdAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
  metadata?: any;
  // إضافة حقول المحفظة
  receiptUrl?: string;
  senderName?: string;
  senderAccount?: string;
  playerCount?: number;
  players?: Array<{id: string, name: string}>;
}

// Helper function to safely format dates in Gregorian calendar
const formatDate = (date: any): string => {
  if (!date) return 'غير محدد';
  try {
    if (typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    if (date instanceof Date) {
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
    }
    return 'غير محدد';
  } catch (error) {
    return 'غير محدد';
  }
};

// Helper function to format date and time
const formatDateTime = (date: any): string => {
  if (!date) return 'غير محدد';
  try {
    if (typeof date === 'object' && date.toDate && typeof date.toDate === 'function') {
      return date.toDate().toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    if (date instanceof Date) {
      return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return 'غير محدد';
  } catch (error) {
    return 'غير محدد';
  }
};

// Helper function to format currency
const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

// Helper function to export data to CSV
const exportToCSV = (payments: Payment[]) => {
  const headers = [
    'ID',
    'اسم المستخدم',
    'البريد الإلكتروني',
    'المبلغ',
    'العملة',
    'الحالة',
    'طريقة الدفع',
    'رقم المعاملة',
    'الوصف',
    'تاريخ الإنشاء',
    'تاريخ الإكمال',
    'تاريخ الاسترداد'
  ];

  const csvContent = [
    headers.join(','),
    ...payments.map(payment => [
      payment.id,
      `"${payment.userName}"`,
      `"${payment.userEmail}"`,
      payment.amount,
      payment.currency,
      payment.status,
      `"${payment.paymentMethod}"`,
      payment.transactionId || '',
      `"${payment.description}"`,
      formatDate(payment.createdAt),
      payment.completedAt ? formatDate(payment.completedAt) : '',
      payment.refundedAt ? formatDate(payment.refundedAt) : ''
    ].join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `payments_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  toast.success('تم تصدير البيانات بنجاح');
};

export default function PaymentsManagement() {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showAddPaymentDialog, setShowAddPaymentDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    refunded: 0,
    todayAmount: 0,
    monthlyAmount: 0
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      
      // Check Firestore connection first
      const isConnected = await checkFirestoreConnection();
      if (!isConnected) {
        setConnectionError(true);
        throw new Error('Unable to connect to Firestore');
      }
      
      setConnectionError(false);
      
      const paymentsData: Payment[] = [];
      
      // Only try to load from collections that actually exist
      const collections = ['payments', 'subscriptionPayments', 'bulkPayments'];
      
      for (const collectionName of collections) {
        try {
          // First check if collection exists by trying to get a single document
          const testSnapshot = await retryOperation(async () => {
            const testQuery = query(collection(db, collectionName), limit(1));
            return await getDocs(testQuery);
          });
          
          if (testSnapshot.empty) {
            console.log(`Collection ${collectionName} is empty or doesn't exist`);
            continue;
          }

          // If collection exists, load all documents
          const snapshot = await retryOperation(async () => {
            return await getDocs(query(
              collection(db, collectionName),
              orderBy('createdAt', 'desc'),
              limit(100)
            ));
          });

          for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            
            // Skip if essential fields are missing
            if (!data.amount && !data.totalAmount) {
              continue;
            }

            // Get user details only if userId exists
            let userName = 'غير محدد';
            let userEmail = 'غير محدد';
            
            if (data.userId) {
              try {
                const userSnapshot = await retryOperation(async () => {
                  const userQuery = query(
                    collection(db, 'users'),
                    where('__name__', '==', data.userId)
                  );
                  return await getDocs(userQuery);
                });
                
                if (!userSnapshot.empty) {
                  const userData = userSnapshot.docs[0].data();
                  userName = userData.name || 
                           `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 
                           'غير محدد';
                  userEmail = userData.email || 'غير محدد';
                }
              } catch (error) {
                console.error('Error fetching user data:', error);
              }
            }

            paymentsData.push({
              id: docSnap.id,
              userId: data.userId || '',
              userName,
              userEmail,
              amount: data.amount || data.totalAmount || 0,
              currency: data.currency || 'USD',
              status: data.status || 'pending',
              paymentMethod: data.paymentMethod || 'غير محدد',
              transactionId: data.transactionId || undefined,
              description: data.description || 
                          (collectionName === 'subscriptionPayments' ? `اشتراك ${data.planType || 'غير محدد'}` : 
                           collectionName === 'bulkPayments' ? `دفعة مجمعة (${data.playersCount || data.playerCount || 0} لاعب)` : 
                           'دفعة عامة'),
              createdAt: data.createdAt?.toDate?.() || data.createdAt || new Date(),
              completedAt: data.completedAt?.toDate?.() || data.completedAt || undefined,
              refundedAt: data.refundedAt?.toDate?.() || data.refundedAt || undefined,
              metadata: data.metadata || data,
              // إضافة حقول المحفظة
              receiptUrl: data.receiptUrl,
              senderName: data.senderName,
              senderAccount: data.senderAccount,
              playerCount: data.playerCount || data.playersCount,
              players: data.players
            });
          }
        } catch (error) {
          console.error(`Error loading from ${collectionName}:`, error);
          // Continue with other collections even if one fails
        }
      }

      // Sort by creation date (newest first)
      paymentsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setPayments(paymentsData);
      updateStats(paymentsData);
      
      if (paymentsData.length > 0) {
        toast.success(`تم تحميل ${paymentsData.length} مدفوعة بنجاح`);
      } else {
        toast.info('لا توجد مدفوعات في النظام حالياً');
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        setConnectionError(true);
        toast.error('مشكلة في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.');
      } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        toast.error('ليس لديك صلاحية للوصول إلى هذه البيانات.');
      } else {
        setConnectionError(true);
        toast.error('حدث خطأ أثناء تحميل بيانات المدفوعات. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (paymentsData: Payment[]) => {
    const total = paymentsData.length;
    const totalAmount = paymentsData.filter(p => p.status === 'completed').reduce((sum, payment) => sum + payment.amount, 0);
    const completed = paymentsData.filter(p => p.status === 'completed').length;
    const pending = paymentsData.filter(p => p.status === 'pending').length;
    const failed = paymentsData.filter(p => p.status === 'failed').length;
    const refunded = paymentsData.filter(p => p.status === 'refunded').length;

    // Calculate today's amount
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayAmount = paymentsData
      .filter(p => p.status === 'completed' && new Date(p.createdAt) >= todayStart)
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate monthly amount
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthlyAmount = paymentsData
      .filter(p => p.status === 'completed' && new Date(p.createdAt) >= monthStart)
      .reduce((sum, payment) => sum + payment.amount, 0);

    setStats({
      total,
      totalAmount,
      completed,
      pending,
      failed,
      refunded,
      todayAmount,
      monthlyAmount
    });
  };

  const updatePaymentStatus = async (paymentId: string, newStatus: string) => {
    try {
      setActionLoading(paymentId);
      
      // Try to update in each collection
      const collections = ['payments', 'subscriptionPayments', 'bulkPayments'];
      let updateSuccessful = false;
      
      for (const collectionName of collections) {
        try {
          await retryOperation(async () => {
            return await updateDoc(doc(db, collectionName, paymentId), {
              status: newStatus,
              updatedAt: new Date(),
              ...(newStatus === 'completed' && { completedAt: new Date() }),
              ...(newStatus === 'refunded' && { refundedAt: new Date() })
            });
          });
          updateSuccessful = true;
          break; // If successful, break the loop
        } catch (error) {
          // Continue to next collection if document not found
          continue;
        }
      }
      
      if (!updateSuccessful) {
        throw new Error('Payment not found in any collection');
      }
      
      // Update local state
      const updatedPayments = payments.map(payment => 
        payment.id === paymentId 
          ? { 
              ...payment, 
              status: newStatus as any,
              ...(newStatus === 'completed' && { completedAt: new Date() }),
              ...(newStatus === 'refunded' && { refundedAt: new Date() })
            }
          : payment
      );
      
      setPayments(updatedPayments);
      updateStats(updatedPayments);
      
      toast.success('تم تحديث حالة الدفعة بنجاح');
    } catch (error) {
      console.error('Error updating payment status:', error);
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      
      if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        toast.error('مشكلة في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.');
      } else if (errorMessage.includes('not found')) {
        toast.error('المدفوعة غير موجودة أو تم حذفها.');
      } else if (errorMessage.includes('permission')) {
        toast.error('ليس لديك صلاحية لتحديث هذه المدفوعة.');
      } else {
        toast.error('حدث خطأ أثناء تحديث حالة الدفعة. يرجى المحاولة مرة أخرى.');
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewPayment = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDetailsDialog(true);
  };

  const handleCloseDetailsDialog = () => {
    setShowDetailsDialog(false);
    setSelectedPayment(null);
  };

  const handleAddPayment = () => {
    setShowAddPaymentDialog(true);
  };

  const handleCloseAddPaymentDialog = () => {
    setShowAddPaymentDialog(false);
  };

  const handleExportData = () => {
    if (filteredPayments.length === 0) {
      toast.error('لا توجد بيانات للتصدير');
      return;
    }
    exportToCSV(filteredPayments);
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          matchesDate = paymentDate >= todayStart;
          break;
        case 'week':
          const weekStart = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = paymentDate >= weekStart;
          break;
        case 'month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          matchesDate = paymentDate >= monthStart;
          break;
      }
    }

    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل بيانات المدفوعات...</p>
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
        {/* Connection Error Alert */}
        {connectionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <span className="text-red-600">⚠️</span>
              <span className="font-medium">مشكلة في الاتصال</span>
            </div>
            <p className="text-red-700 text-sm mt-1">
              لا يمكن الاتصال بقاعدة البيانات. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadPayments}
              disabled={loading}
              className="mt-2 border-red-300 text-red-700 hover:bg-red-100"
            >
              <RefreshCcw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              إعادة المحاولة
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المدفوعات</h1>
            <p className="text-gray-600">إدارة ومراقبة جميع المعاملات المالية</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={loadPayments}
              disabled={loading}
            >
              <RefreshCcw className={`w-4 h-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
            <Button 
              variant="outline" 
              onClick={handleExportData}
              disabled={filteredPayments.length === 0}
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير البيانات
            </Button>
            <Button onClick={handleAddPayment}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة مدفوعة
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المدفوعات</p>
                <h3 className="text-2xl font-bold text-gray-900">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600">مكتملة</p>
                <p className="font-medium text-green-600">{stats.completed}</p>
              </div>
              <div>
                <p className="text-gray-600">معلقة</p>
                <p className="font-medium text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">إجمالي المبلغ</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalAmount)}
                </h3>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p className="text-gray-600">المدفوعات المكتملة فقط</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">اليوم</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.todayAmount)}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm">
              <p className="text-gray-600">مدفوعات اليوم</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">هذا الشهر</p>
                <h3 className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.monthlyAmount)}
                </h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-600">فاشلة</p>
                <p className="font-medium text-red-600">{stats.failed}</p>
              </div>
              <div>
                <p className="text-gray-600">مستردة</p>
                <p className="font-medium text-gray-600">{stats.refunded}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="البحث في المدفوعات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="حالة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="completed">مكتملة</SelectItem>
                <SelectItem value="pending">معلقة</SelectItem>
                <SelectItem value="failed">فاشلة</SelectItem>
                <SelectItem value="refunded">مستردة</SelectItem>
                <SelectItem value="cancelled">ملغاة</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="طريقة الدفع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الطرق</SelectItem>
                <SelectItem value="card">بطاقة ائتمان</SelectItem>
                <SelectItem value="bank_transfer">تحويل بنكي</SelectItem>
                <SelectItem value="wallet">محفظة إلكترونية</SelectItem>
                <SelectItem value="cash">نقداً</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="الفترة الزمنية" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفترات</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">آخر أسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            عرض {filteredPayments.length} من أصل {payments.length} مدفوعة
          </p>
        </div>

        {/* Payments Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">المستخدم</th>
                  <th className="px-4 py-3 font-medium">المبلغ</th>
                  <th className="px-4 py-3 font-medium">الوصف</th>
                  <th className="px-4 py-3 font-medium">طريقة الدفع</th>
                  <th className="px-4 py-3 font-medium">الحالة</th>
                  <th className="px-4 py-3 font-medium">الإيصال</th>
                  <th className="px-4 py-3 font-medium">التاريخ</th>
                  <th className="px-4 py-3 font-medium">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm || statusFilter !== 'all' || methodFilter !== 'all' || dateFilter !== 'all'
                        ? 'لا توجد نتائج تطابق البحث'
                        : 'لا توجد مدفوعات في النظام حالياً'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900">{payment.userName}</div>
                          <div className="text-sm text-gray-600 truncate max-w-[150px]">{payment.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="truncate max-w-[200px]" title={payment.description}>
                          {payment.description}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-gray-600">{payment.paymentMethod}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={
                          payment.status === 'completed' ? 'default' :
                          payment.status === 'pending' ? 'secondary' :
                          payment.status === 'failed' ? 'destructive' :
                          payment.status === 'refunded' ? 'outline' :
                          'secondary'
                        }>
                          {payment.status === 'completed' ? 'مكتملة' :
                           payment.status === 'pending' ? 'معلقة' :
                           payment.status === 'failed' ? 'فاشلة' :
                           payment.status === 'refunded' ? 'مستردة' :
                           'ملغاة'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {payment.receiptUrl ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(payment.receiptUrl, '_blank')}
                            className="hover:bg-blue-50"
                            title="عرض الإيصال"
                          >
                            📄 إيصال
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">لا يوجد</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{formatDate(payment.createdAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewPayment(payment)}
                            className="hover:bg-blue-50"
                            title="عرض التفاصيل"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {payment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updatePaymentStatus(payment.id, 'completed')}
                              disabled={actionLoading === payment.id}
                              className="hover:bg-green-50"
                              title="تأكيد الدفعة"
                            >
                              {actionLoading === payment.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          {payment.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updatePaymentStatus(payment.id, 'refunded')}
                              disabled={actionLoading === payment.id}
                              className="hover:bg-yellow-50"
                              title="استرداد الدفعة"
                            >
                              {actionLoading === payment.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Payment Details Dialog */}
        {selectedPayment && (
          <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  تفاصيل المدفوعة
                </DialogTitle>
                <DialogDescription>
                  معلومات المدفوعة التفصيلية
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Payment Information */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">معلومات الدفعة</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">المبلغ</span>
                      <span className="font-medium text-lg">
                        {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">الحالة</span>
                      <Badge variant={
                        selectedPayment.status === 'completed' ? 'default' :
                        selectedPayment.status === 'pending' ? 'secondary' :
                        selectedPayment.status === 'failed' ? 'destructive' :
                        selectedPayment.status === 'refunded' ? 'outline' :
                        'secondary'
                      }>
                        {selectedPayment.status === 'completed' ? 'مكتملة' :
                         selectedPayment.status === 'pending' ? 'معلقة' :
                         selectedPayment.status === 'failed' ? 'فاشلة' :
                         selectedPayment.status === 'refunded' ? 'مستردة' :
                         'ملغاة'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">طريقة الدفع</span>
                      <span className="font-medium">{selectedPayment.paymentMethod}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-gray-600">الوصف</span>
                      <span className="font-medium text-right max-w-[200px]">
                        {selectedPayment.description}
                      </span>
                    </div>
                    {selectedPayment.transactionId && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">رقم المعاملة</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {selectedPayment.transactionId}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* User Information */}
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">معلومات المستخدم</h3>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-gray-600">الاسم</span>
                      <span className="font-medium">{selectedPayment.userName}</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-sm text-gray-600">البريد الإلكتروني</span>
                      <span className="font-medium text-right max-w-[200px]">
                        {selectedPayment.userEmail}
                      </span>
                    </div>
                    {selectedPayment.userId && (
                      <div className="flex items-start justify-between">
                        <span className="text-sm text-gray-600">معرف المستخدم</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {selectedPayment.userId}
                        </span>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Wallet Payment Details */}
                {selectedPayment.paymentMethod === 'wallet' && (selectedPayment.senderName || selectedPayment.senderAccount || selectedPayment.receiptUrl) && (
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">تفاصيل دفع المحفظة</h3>
                    <div className="space-y-3">
                      {selectedPayment.senderName && (
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-gray-600">اسم المرسل</span>
                          <span className="font-medium">{selectedPayment.senderName}</span>
                        </div>
                      )}
                      {selectedPayment.senderAccount && (
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-gray-600">حساب المرسل</span>
                          <span className="font-medium">{selectedPayment.senderAccount}</span>
                        </div>
                      )}
                      {selectedPayment.playerCount && (
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-gray-600">عدد اللاعبين</span>
                          <span className="font-medium">{selectedPayment.playerCount}</span>
                        </div>
                      )}
                      {selectedPayment.receiptUrl && (
                        <div className="flex items-start justify-between">
                          <span className="text-sm text-gray-600">إيصال الدفع</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(selectedPayment.receiptUrl, '_blank')}
                            className="hover:bg-blue-50"
                          >
                            📄 عرض الإيصال
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                {/* Players List for Bulk Payments */}
                {selectedPayment.players && selectedPayment.players.length > 0 && (
                  <Card className="p-6">
                    <h3 className="font-semibold mb-4">قائمة اللاعبين ({selectedPayment.players.length})</h3>
                    <div className="max-h-32 overflow-y-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedPayment.players.map((player, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                            {player.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>
                )}

                {/* Timeline */}
                <Card className="p-6 md:col-span-2">
                  <h3 className="font-semibold mb-4">الجدول الزمني</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-600">تاريخ الإنشاء</span>
                      <span className="font-medium">{formatDateTime(selectedPayment.createdAt)}</span>
                    </div>
                    {selectedPayment.completedAt && (
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">تاريخ الإكمال</span>
                        <span className="font-medium">{formatDateTime(selectedPayment.completedAt)}</span>
                      </div>
                    )}
                    {selectedPayment.refundedAt && (
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-600">تاريخ الاسترداد</span>
                        <span className="font-medium">{formatDateTime(selectedPayment.refundedAt)}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6 pt-4 border-t">
                {selectedPayment.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => updatePaymentStatus(selectedPayment.id, 'completed')}
                    disabled={actionLoading === selectedPayment.id}
                    className="hover:bg-green-50"
                  >
                    {actionLoading === selectedPayment.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 ml-2"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4 ml-2" />
                    )}
                    تأكيد الدفعة
                  </Button>
                )}
                {selectedPayment.status === 'completed' && (
                  <Button
                    variant="outline"
                    onClick={() => updatePaymentStatus(selectedPayment.id, 'refunded')}
                    disabled={actionLoading === selectedPayment.id}
                    className="hover:bg-yellow-50"
                  >
                    {actionLoading === selectedPayment.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 ml-2"></div>
                    ) : (
                      <XCircle className="w-4 h-4 ml-2" />
                    )}
                    استرداد الدفعة
                  </Button>
                )}
                <Button
                  variant="default"
                  onClick={handleCloseDetailsDialog}
                  className="mr-auto"
                >
                  إغلاق
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Payment Dialog */}
        <Dialog open={showAddPaymentDialog} onOpenChange={setShowAddPaymentDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <Plus className="w-6 h-6 text-green-600" />
                إضافة مدفوعة جديدة
              </DialogTitle>
              <DialogDescription>
                إضافة مدفوعة جديدة إلى النظام
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6">
              <Card className="p-6">
                <div className="text-center text-gray-500">
                  <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">قريباً</p>
                  <p className="text-sm">سيتم إضافة نموذج إضافة المدفوعات قريباً</p>
                </div>
              </Card>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                variant="default"
                onClick={handleCloseAddPaymentDialog}
                className="mr-auto"
              >
                إغلاق
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <AdminFooter />
    </div>
  );
} 