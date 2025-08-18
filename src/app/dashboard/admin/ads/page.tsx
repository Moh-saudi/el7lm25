'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image, 
  Video, 
  FileText,
  Calendar,
  Users,
  Target,
  BarChart3,
  Save,
  X
} from 'lucide-react';
import { AccountTypeProtection } from '@/hooks/useAccountTypeAuth';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Ad {
  id?: string;
  title: string;
  description: string;
  type: 'video' | 'image' | 'text';
  mediaUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  isActive: boolean;
  priority: number;
  targetAudience: 'all' | 'new_users' | 'returning_users';
  startDate?: string;
  endDate?: string;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  clicks: number;
}

export default function AdminAdsPage() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingAd, setEditingAd] = useState<Ad | null>(null);
  const [previewAd, setPreviewAd] = useState<Ad | null>(null);
  
  const [formData, setFormData] = useState<Partial<Ad>>({
    title: '',
    description: '',
    type: 'text',
    mediaUrl: '',
    ctaText: '',
    ctaUrl: '',
    isActive: true,
    priority: 1,
    targetAudience: 'new_users',
    startDate: '',
    endDate: ''
  });

  const stats = [
    {
      title: "إجمالي الإعلانات",
      value: ads.length.toString(),
      icon: BarChart3,
      color: "text-blue-600"
    },
    {
      title: "الإعلانات النشطة",
      value: ads.filter(ad => ad.isActive).length.toString(),
      icon: Eye,
      color: "text-green-600"
    },
    {
      title: "إجمالي المشاهدات",
      value: ads.reduce((sum, ad) => sum + ad.views, 0).toString(),
      icon: Users,
      color: "text-purple-600"
    },
    {
      title: "إجمالي النقرات",
      value: ads.reduce((sum, ad) => sum + ad.clicks, 0).toString(),
      icon: Target,
      color: "text-orange-600"
    }
  ];

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    try {
      const q = query(collection(db, 'ads'), orderBy('priority', 'asc'));
      const snapshot = await getDocs(q);
      const adsData: Ad[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        views: doc.data().views || 0,
        clicks: doc.data().clicks || 0
      })) as Ad[];
      setAds(adsData);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const adData: Partial<Ad> = {
        ...formData,
        createdAt: editingAd ? editingAd.createdAt : new Date(),
        updatedAt: new Date(),
        views: editingAd?.views || 0,
        clicks: editingAd?.clicks || 0
      };

      if (editingAd?.id) {
        await updateDoc(doc(db, 'ads', editingAd.id), adData);
      } else {
        await addDoc(collection(db, 'ads'), adData);
      }

      setShowAddDialog(false);
      setEditingAd(null);
      resetForm();
      await fetchAds();
    } catch (error) {
      console.error('Error saving ad:', error);
    }
  };

  const handleEdit = (ad: Ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      type: ad.type,
      mediaUrl: ad.mediaUrl || '',
      ctaText: ad.ctaText || '',
      ctaUrl: ad.ctaUrl || '',
      isActive: ad.isActive,
      priority: ad.priority,
      targetAudience: ad.targetAudience,
      startDate: ad.startDate || '',
      endDate: ad.endDate || ''
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      try {
        await deleteDoc(doc(db, 'ads', id));
        await fetchAds();
      } catch (error) {
        console.error('Error deleting ad:', error);
      }
    }
  };

  const toggleActive = async (ad: Ad) => {
    try {
      await updateDoc(doc(db, 'ads', ad.id!), { 
        isActive: !ad.isActive,
        updatedAt: new Date()
      });
      await fetchAds();
    } catch (error) {
      console.error('Error toggling ad status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'text',
      mediaUrl: '',
      ctaText: '',
      ctaUrl: '',
      isActive: true,
      priority: 1,
      targetAudience: 'new_users',
      startDate: '',
      endDate: ''
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-purple-100 text-purple-700';
      case 'image': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAudienceColor = (audience: string) => {
    switch (audience) {
      case 'new_users': return 'bg-green-100 text-green-700';
      case 'returning_users': return 'bg-orange-100 text-orange-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <AccountTypeProtection allowedTypes={['admin']}>
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">إدارة الإعلانات</h1>
                <p className="text-gray-600 mt-1">إدارة الإعلانات المعروضة على صفحة الترحيب</p>
              </div>
              <Button 
                onClick={() => {
                  setEditingAd(null);
                  resetForm();
                  setShowAddDialog(true);
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                إضافة إعلان جديد
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-100">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Ads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-200 rounded-full border-t-blue-600 animate-spin"></div>
                <p className="text-gray-600">جاري تحميل الإعلانات...</p>
              </div>
            ) : ads.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد إعلانات</h3>
                <p className="text-gray-600 mb-4">ابدأ بإضافة إعلان جديد لعرضه على العملاء</p>
                <Button 
                  onClick={() => {
                    setEditingAd(null);
                    resetForm();
                    setShowAddDialog(true);
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة إعلان
                </Button>
              </div>
            ) : (
              ads.map((ad) => (
                <Card key={ad.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(ad.type)}
                        <Badge className={getTypeColor(ad.type)}>
                          {ad.type === 'video' ? 'فيديو' : ad.type === 'image' ? 'صورة' : 'نص'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getAudienceColor(ad.targetAudience)}>
                          {ad.targetAudience === 'new_users' ? 'مستخدمين جدد' : 
                           ad.targetAudience === 'returning_users' ? 'مستخدمين عائدين' : 'الجميع'}
                        </Badge>
                        <Switch
                          checked={ad.isActive}
                          onCheckedChange={() => toggleActive(ad)}
                        />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{ad.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {ad.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {ad.mediaUrl && (
                      <div className="mb-4">
                        {ad.type === 'image' ? (
                          <img 
                            src={ad.mediaUrl} 
                            alt={ad.title}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ) : ad.type === 'video' ? (
                          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>الأولوية: {ad.priority}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>المشاهدات: {ad.views}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <span>النقرات: {ad.clicks}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setPreviewAd(ad)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        معاينة
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(ad)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        تعديل
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDelete(ad.id!)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        حذف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAd ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}
              </DialogTitle>
              <DialogDescription>
                قم بإضافة إعلان جديد ليظهر على صفحة الترحيب للعملاء
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">عنوان الإعلان *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="أدخل عنوان الإعلان"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">نوع الإعلان *</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({...formData, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الإعلان" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">نص</SelectItem>
                      <SelectItem value="image">صورة</SelectItem>
                      <SelectItem value="video">فيديو</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">وصف الإعلان *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="أدخل وصف الإعلان"
                  rows={3}
                  required
                />
              </div>

              {(formData.type === 'image' || formData.type === 'video') && (
                <div>
                  <Label htmlFor="mediaUrl">رابط الوسائط</Label>
                  <Input
                    id="mediaUrl"
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({...formData, mediaUrl: e.target.value})}
                    placeholder={`أدخل رابط ${formData.type === 'image' ? 'الصورة' : 'الفيديو'}`}
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ctaText">نص زر الدعوة للعمل</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                    placeholder="مثال: اشترك الآن"
                  />
                </div>
                
                <div>
                  <Label htmlFor="ctaUrl">رابط زر الدعوة للعمل</Label>
                  <Input
                    id="ctaUrl"
                    value={formData.ctaUrl}
                    onChange={(e) => setFormData({...formData, ctaUrl: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="priority">الأولوية</Label>
                  <Input
                    id="priority"
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                    min="1"
                    max="10"
                  />
                </div>
                
                <div>
                  <Label htmlFor="targetAudience">الجمهور المستهدف</Label>
                  <Select 
                    value={formData.targetAudience} 
                    onValueChange={(value) => setFormData({...formData, targetAudience: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الجميع</SelectItem>
                      <SelectItem value="new_users">مستخدمين جدد</SelectItem>
                      <SelectItem value="returning_users">مستخدمين عائدين</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
                  />
                  <Label htmlFor="isActive">نشط</Label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">تاريخ البداية</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">تاريخ النهاية</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  إلغاء
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingAd ? 'تحديث' : 'إضافة'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Preview Dialog */}
        <Dialog open={!!previewAd} onOpenChange={() => setPreviewAd(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>معاينة الإعلان</DialogTitle>
            </DialogHeader>
            
            {previewAd && (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-bold mb-2">{previewAd.title}</h3>
                  <p className="text-gray-600 mb-4">{previewAd.description}</p>
                </div>

                {previewAd.mediaUrl && (
                  <div className="text-center">
                    {previewAd.type === 'image' ? (
                      <img 
                        src={previewAd.mediaUrl} 
                        alt={previewAd.title}
                        className="w-full max-h-64 object-cover rounded-lg mx-auto"
                      />
                    ) : previewAd.type === 'video' ? (
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Video className="h-16 w-16 text-gray-400" />
                        <span className="text-gray-600 mr-2">معاينة الفيديو</span>
                      </div>
                    ) : null}
                  </div>
                )}

                {previewAd.ctaText && previewAd.ctaUrl && (
                  <div className="text-center">
                    <Button 
                      className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                      onClick={() => window.open(previewAd.ctaUrl, '_blank')}
                    >
                      {previewAd.ctaText}
                    </Button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <strong>النوع:</strong> {previewAd.type === 'video' ? 'فيديو' : previewAd.type === 'image' ? 'صورة' : 'نص'}
                  </div>
                  <div>
                    <strong>الجمهور:</strong> {previewAd.targetAudience === 'new_users' ? 'مستخدمين جدد' : 
                     previewAd.targetAudience === 'returning_users' ? 'مستخدمين عائدين' : 'الجميع'}
                  </div>
                  <div>
                    <strong>الأولوية:</strong> {previewAd.priority}
                  </div>
                  <div>
                    <strong>الحالة:</strong> {previewAd.isActive ? 'نشط' : 'غير نشط'}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AccountTypeProtection>
  );
}
