'use client';

import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Building2,
  Edit,
  Save,
  X,
  KeyRound,
  CheckCircle,
  XCircle,
  ExternalLink,
  UserCheck,
  GraduationCap,
  Briefcase,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/lib/firebase/auth-provider';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  accountType: 'player' | 'club' | 'agent' | 'academy' | 'trainer' | 'admin';
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
  location?: {
    countryId: string;
    countryName: string;
    cityId: string;
    cityName: string;
  };
  // Player specific
  position?: string;
  dateOfBirth?: Date;
  nationality?: string;
  height?: number;
  weight?: number;
  preferredFoot?: string;
  marketValue?: number;
  // Entity specific
  clubName?: string;
  clubType?: string;
  license?: {
    number: string;
    expiryDate: Date;
    isVerified: boolean;
  };
  description?: string;
  website?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  subscription?: {
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    plan: string;
    expiresAt: Date;
  };
  parentAccountId?: string;
  parentAccountType?: string;
  rating?: number;
}

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated?: () => void;
}

export default function UserDetailsModal({ userId, isOpen, onClose, onUserUpdated }: UserDetailsModalProps) {
  const { userData } = useAuth();
  
  // Add detailed logging
  console.log('👤 UserDetailsModal - Component loaded:', {
    userId: userId,
    isOpen: isOpen,
    hasUserData: !!userData,
    timestamp: new Date().toISOString()
  });
  
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserData>>({});
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (userId && isOpen) {
      loadUserData();
    }
  }, [userId, isOpen]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      
      // Try to get from users collection first
      const userDocRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userDocRef);
      
      let foundUserData = null;
      
      if (userDoc.exists()) {
        foundUserData = { id: userDoc.id, ...userDoc.data() };
      } else {
        // Search in all collections
        const collections = ['players', 'clubs', 'agents', 'academies', 'trainers'];
        
        for (const collectionName of collections) {
          try {
            const docRef = doc(db, collectionName, userId);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              foundUserData = { id: docSnap.id, ...docSnap.data() };
              break;
            }
          } catch (error) {
            console.warn(`Failed to check ${collectionName} collection:`, error);
          }
        }
      }

      if (foundUserData) {
        // Convert dates safely
        const convertToDate = (dateField: any) => {
          if (!dateField) return null;
          if (dateField instanceof Date) return dateField;
          if (dateField && typeof dateField.toDate === 'function') {
            return dateField.toDate();
          }
          if (typeof dateField === 'string' || typeof dateField === 'number') {
            const date = new Date(dateField);
            return isNaN(date.getTime()) ? null : date;
          }
          if (dateField && typeof dateField.seconds === 'number') {
            return new Date(dateField.seconds * 1000);
          }
          return null;
        };

        const processedUser: UserData = {
          ...foundUserData,
          createdAt: convertToDate(foundUserData.createdAt),
          lastLogin: convertToDate(foundUserData.lastLogin),
          dateOfBirth: convertToDate(foundUserData.dateOfBirth),
        } as UserData;

        setUser(processedUser);
        setEditForm(processedUser);
      } else {
        toast.error('لم يتم العثور على بيانات المستخدم');
        onClose();
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات المستخدم');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async () => {
    if (!user || !userId) return;

    try {
      setSaving(true);
      const newStatus = !user.isActive;
      
      // Update in users collection
      await updateDoc(doc(db, 'users', userId), {
        isActive: newStatus,
        updatedAt: new Date(),
        statusChangedBy: userData?.uid,
        statusChangedAt: new Date()
      });

      // Update in role-specific collection if exists
      if (user.accountType !== 'admin') {
        const roleCollection = user.accountType === 'player' ? 'players' : 
                              user.accountType === 'club' ? 'clubs' :
                              user.accountType === 'agent' ? 'agents' :
                              user.accountType === 'academy' ? 'academies' :
                              user.accountType === 'trainer' ? 'trainers' : null;

        if (roleCollection) {
          try {
            const roleDocRef = doc(db, roleCollection, userId);
            const roleDoc = await getDoc(roleDocRef);
            
            if (roleDoc.exists()) {
              await updateDoc(roleDocRef, {
                isActive: newStatus,
                updatedAt: new Date()
              });
            }
          } catch (roleError) {
            console.warn('Failed to update role-specific collection:', roleError);
          }
        }
      }

      setUser(prev => prev ? { ...prev, isActive: newStatus } : null);
      toast.success(`تم ${newStatus ? 'تفعيل' : 'إلغاء تفعيل'} الحساب بنجاح`);
      onUserUpdated?.();
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الحساب');
    } finally {
      setSaving(false);
    }
  };

  const resetPassword = async () => {
    if (!user) return;

    try {
      setSaving(true);
      const { sendPasswordResetEmail } = await import('firebase/auth');
      const { auth } = await import('@/lib/firebase/config');
      
      await sendPasswordResetEmail(auth, user.email);
      toast.success(`تم إرسال رابط إعادة تعيين كلمة المرور إلى ${user.email}`);
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast.error('حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور');
    } finally {
      setSaving(false);
    }
  };

  const saveChanges = async () => {
    if (!user || !editForm || !userId) return;

    try {
      setSaving(true);
      const updateData = {
        ...editForm,
        updatedAt: new Date(),
        updatedBy: userData?.uid
      };

      // Update in users collection
      await updateDoc(doc(db, 'users', userId), updateData);

      // Update in role-specific collection if exists
      if (user.accountType !== 'admin') {
        const roleCollection = user.accountType === 'player' ? 'players' : 
                              user.accountType === 'club' ? 'clubs' :
                              user.accountType === 'agent' ? 'agents' :
                              user.accountType === 'academy' ? 'academies' :
                              user.accountType === 'trainer' ? 'trainers' : null;

        if (roleCollection) {
          try {
            const roleDocRef = doc(db, roleCollection, userId);
            const roleDoc = await getDoc(roleDocRef);
            
            if (roleDoc.exists()) {
              await updateDoc(roleDocRef, updateData);
            }
          } catch (roleError) {
            console.warn('Failed to update role-specific collection:', roleError);
          }
        }
      }

      setUser(prev => prev ? { ...prev, ...editForm } : null);
      setEditing(false);
      toast.success('تم حفظ التغييرات بنجاح');
      onUserUpdated?.();
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('حدث خطأ أثناء حفظ التغييرات');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUser = async () => {
    // منع الإرسال المتكرر
    if (updating) {
      console.log('🛑 User update blocked - already updating');
      return;
    }

    setUpdating(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/admin/users/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          updates: updates
        })
      });

      const result = await response.json();

      if (result.success) {
        setMessage('تم تحديث بيانات المستخدم بنجاح!');
        onUpdate?.(result.user);
      } else {
        setError(result.error || 'فشل في تحديث بيانات المستخدم');
      }
    } catch (error: any) {
      setError('حدث خطأ في تحديث بيانات المستخدم');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-50 text-green-600">
        <CheckCircle className="w-3 h-3 ml-1" />
        نشط
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-red-50 text-red-600">
        <XCircle className="w-3 h-3 ml-1" />
        معطل
      </Badge>
    );
  };

  const getAccountTypeBadge = (type: string) => {
    const badges = {
      player: { icon: User, text: 'لاعب', color: 'bg-blue-50 text-blue-600' },
      club: { icon: Building2, text: 'نادي', color: 'bg-indigo-50 text-indigo-600' },
      academy: { icon: GraduationCap, text: 'أكاديمية', color: 'bg-amber-50 text-amber-600' },
      agent: { icon: Briefcase, text: 'وكيل', color: 'bg-green-50 text-green-600' },
      trainer: { icon: UserCheck, text: 'مدرب', color: 'bg-purple-50 text-purple-600' },
      admin: { icon: Shield, text: 'مدير', color: 'bg-red-50 text-red-600' }
    };

    const badge = badges[type as keyof typeof badges];
    if (!badge) return <Badge variant="outline">غير محدد</Badge>;

    const Icon = badge.icon;
    return (
      <Badge className={badge.color}>
        <Icon className="w-3 h-3 ml-1" />
        {badge.text}
      </Badge>
    );
  };

  const getVerificationBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-50 text-green-600">موثق</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-50 text-yellow-600">قيد المراجعة</Badge>;
      case 'rejected':
        return <Badge className="bg-red-50 text-red-600">مرفوض</Badge>;
      default:
        return <Badge variant="outline">غير موثق</Badge>;
    }
  };

  const openUserProfile = () => {
    if (!user) return;
    const profileUrl = `/dashboard/${user.accountType}/profile`;
    if (typeof window !== 'undefined') {
      window.open(profileUrl, '_blank');
    }
  };

  const handleClose = () => {
    setEditing(false);
    setUser(null);
    setEditForm({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5" />
              <span>تفاصيل المستخدم</span>
              {user && <span className="text-sm text-gray-500">({user.name})</span>}
            </div>
            {user && (
              <div className="flex items-center gap-2">
                {getStatusBadge(user.isActive)}
                {getAccountTypeBadge(user.accountType)}
                {user.verificationStatus && getVerificationBadge(user.verificationStatus)}
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">جاري تحميل بيانات المستخدم...</p>
            </div>
          </div>
        ) : user ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-4">
              {/* Basic Information */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-lg">المعلومات الأساسية</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openUserProfile}
                      disabled={saving}
                    >
                      <ExternalLink className="w-4 h-4 ml-1" />
                      فتح البروفيل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => editing ? setEditing(false) : setEditing(true)}
                      disabled={saving}
                    >
                      {editing ? (
                        <>
                          <X className="w-4 h-4 ml-1" />
                          إلغاء
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4 ml-1" />
                          تعديل
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>الاسم</Label>
                      {editing ? (
                        <Input
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          disabled={saving}
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{user.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>البريد الإلكتروني</Label>
                      {editing ? (
                        <Input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                          disabled={saving}
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>رقم الهاتف</Label>
                      {editing ? (
                        <Input
                          value={editForm.phone || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={saving}
                        />
                      ) : (
                        <p className="text-sm text-gray-900 mt-1">{user.phone || 'غير محدد'}</p>
                      )}
                    </div>
                    
                    <div>
                      <Label>نوع الحساب</Label>
                      <div className="mt-1">
                        {getAccountTypeBadge(user.accountType)}
                      </div>
                    </div>
                  </div>

                  {/* Player specific fields */}
                  {user.accountType === 'player' && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">معلومات اللاعب</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.position && (
                          <div>
                            <Label>المركز</Label>
                            <p className="text-sm text-gray-900 mt-1">{user.position}</p>
                          </div>
                        )}
                        {user.dateOfBirth && (
                          <div>
                            <Label>تاريخ الميلاد</Label>
                            <p className="text-sm text-gray-900 mt-1">
                              {user.dateOfBirth.toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        )}
                        {user.nationality && (
                          <div>
                            <Label>الجنسية</Label>
                            <p className="text-sm text-gray-900 mt-1">{user.nationality}</p>
                          </div>
                        )}
                        {user.preferredFoot && (
                          <div>
                            <Label>القدم المفضلة</Label>
                            <p className="text-sm text-gray-900 mt-1">{user.preferredFoot}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Entity specific fields */}
                  {(['club', 'academy', 'agent', 'trainer'].includes(user.accountType)) && (
                    <div className="pt-4 border-t">
                      <h4 className="font-medium mb-3">معلومات إضافية</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {user.website && (
                          <div>
                            <Label>الموقع الإلكتروني</Label>
                            <p className="text-sm text-gray-900 mt-1">{user.website}</p>
                          </div>
                        )}
                        {user.rating && (
                          <div>
                            <Label>التقييم</Label>
                            <p className="text-sm text-gray-900 mt-1">{user.rating}/5</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {editing && (
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button 
                        variant="outline" 
                        onClick={() => setEditing(false)}
                        disabled={saving}
                      >
                        إلغاء
                      </Button>
                      <Button 
                        onClick={saveChanges}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="w-4 h-4 ml-1 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 ml-1" />
                        )}
                        حفظ التغييرات
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location Information */}
              {user.location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      معلومات الموقع
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>الدولة</Label>
                        <p className="text-sm text-gray-900 mt-1">{user.location.countryName}</p>
                      </div>
                      <div>
                        <Label>المدينة</Label>
                        <p className="text-sm text-gray-900 mt-1">{user.location.cityName}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Actions Sidebar */}
            <div className="space-y-4">
              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">حالة الحساب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>تفعيل الحساب</Label>
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={toggleUserStatus}
                      disabled={saving}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={resetPassword}
                      disabled={saving}
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      ) : (
                        <KeyRound className="w-4 h-4 ml-2" />
                      )}
                      إعادة تعيين كلمة المرور
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    تفاصيل الحساب
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-500">تاريخ التسجيل</Label>
                    <p className="text-sm text-gray-900">
                      {user.createdAt ? 
                        user.createdAt.toLocaleDateString('ar-SA') : 
                        'غير محدد'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">آخر دخول</Label>
                    <p className="text-sm text-gray-900">
                      {user.lastLogin ? 
                        user.lastLogin.toLocaleDateString('ar-SA') : 
                        'لم يسجل دخول'
                      }
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-xs text-gray-500">معرف المستخدم</Label>
                    <p className="text-xs text-gray-600 font-mono break-all">{user.id}</p>
                  </div>

                  {user.parentAccountId && (
                    <div>
                      <Label className="text-xs text-gray-500">تابع لـ</Label>
                      <p className="text-sm text-gray-900">{user.parentAccountType}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Subscription Info */}
              {user.subscription && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">معلومات الاشتراك</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Label className="text-xs text-gray-500">حالة الاشتراك</Label>
                      <div className="mt-1">
                        {user.subscription.status === 'active' && (
                          <Badge className="bg-green-50 text-green-600">نشط</Badge>
                        )}
                        {user.subscription.status === 'expired' && (
                          <Badge className="bg-red-50 text-red-600">منتهي</Badge>
                        )}
                        {user.subscription.status === 'cancelled' && (
                          <Badge className="bg-gray-50 text-gray-600">ملغي</Badge>
                        )}
                        {user.subscription.status === 'trial' && (
                          <Badge className="bg-blue-50 text-blue-600">تجريبي</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">الخطة</Label>
                      <p className="text-sm text-gray-900">{user.subscription.plan}</p>
                    </div>
                    
                    <div>
                      <Label className="text-xs text-gray-500">تاريخ انتهاء الاشتراك</Label>
                      <p className="text-sm text-gray-900">
                        {user.subscription.expiresAt ? 
                          new Date(user.subscription.expiresAt).toLocaleDateString('ar-SA') : 
                          'غير محدد'
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لم يتم العثور على المستخدم</h3>
            <p className="text-gray-500">المعرف المطلوب غير موجود أو تم حذفه</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
} 