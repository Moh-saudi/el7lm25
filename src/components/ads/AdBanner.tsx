'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Play, ExternalLink } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/auth-provider';

interface Ad {
  id: string;
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
  views: number;
  clicks: number;
}

interface AdBannerProps {
  className?: string;
  maxAds?: number;
}

export default function AdBanner({ className = '', maxAds = 3 }: AdBannerProps) {
  const [ads, setAds] = useState<Ad[]>([]);
  const [visibleAds, setVisibleAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userData } = useAuth();

  useEffect(() => {
    fetchAds();
  }, []);

  useEffect(() => {
    if (ads.length > 0) {
      // Filter ads based on target audience and date
      const now = new Date();
      const filteredAds = ads.filter(ad => {
        if (!ad.isActive) return false;
        
        // Check date range if specified
        if (ad.startDate && new Date(ad.startDate) > now) return false;
        if (ad.endDate && new Date(ad.endDate) < now) return false;
        
        // Check target audience
        if (ad.targetAudience === 'all') return true;
        if (ad.targetAudience === 'new_users' && !userData) return true;
        if (ad.targetAudience === 'returning_users' && userData) return true;
        
        return false;
      });

      // Sort by priority and take top ads
      const sortedAds = filteredAds
        .sort((a, b) => b.priority - a.priority)
        .slice(0, maxAds);

      setVisibleAds(sortedAds);
    }
  }, [ads, userData, maxAds]);

  const fetchAds = async () => {
    try {
      const q = query(
        collection(db, 'ads'),
        where('isActive', '==', true),
        orderBy('priority', 'desc'),
        limit(maxAds * 2) // Fetch more to account for filtering
      );
      const snapshot = await getDocs(q);
      const adsData: Ad[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
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

  const handleAdView = async (adId: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), {
        views: increment(1)
      });
    } catch (error) {
      console.error('Error updating ad view:', error);
    }
  };

  const handleAdClick = async (adId: string, url?: string) => {
    try {
      await updateDoc(doc(db, 'ads', adId), {
        clicks: increment(1)
      });
      
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error updating ad click:', error);
    }
  };

  const dismissAd = (adId: string) => {
    setVisibleAds(prev => prev.filter(ad => ad.id !== adId));
  };

  if (loading) {
    return null;
  }

  if (visibleAds.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {visibleAds.map((ad) => (
        <Card 
          key={ad.id} 
          className="relative overflow-hidden border-2 border-gradient-to-r from-blue-500 to-purple-600 bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-lg transition-all duration-300"
          onMouseEnter={() => handleAdView(ad.id)}
        >
          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 left-2 z-10 h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white"
            onClick={() => dismissAd(ad.id)}
          >
            <X className="h-4 w-4" />
          </Button>

          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Media Section */}
              {(ad.type === 'image' || ad.type === 'video') && ad.mediaUrl && (
                <div className="flex-shrink-0 w-full md:w-48 h-32 md:h-32">
                  {ad.type === 'image' ? (
                    <img
                      src={ad.mediaUrl}
                      alt={ad.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-black/20 rounded-lg"></div>
                      <Play className="h-12 w-12 text-white relative z-10" />
                    </div>
                  )}
                </div>
              )}

              {/* Content Section */}
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {ad.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {ad.description}
                  </p>
                </div>

                {/* CTA Button */}
                {ad.ctaText && ad.ctaUrl && (
                  <Button
                    onClick={() => handleAdClick(ad.id, ad.ctaUrl)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                  >
                    {ad.ctaText}
                    <ExternalLink className="h-4 w-4 mr-2" />
                  </Button>
                )}

                {/* Ad Type Badge */}
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    ad.type === 'video' 
                      ? 'bg-purple-100 text-purple-700' 
                      : ad.type === 'image' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {ad.type === 'video' ? 'فيديو' : ad.type === 'image' ? 'صورة' : 'إعلان'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {ad.targetAudience === 'new_users' ? 'للمستخدمين الجدد' : 
                     ad.targetAudience === 'returning_users' ? 'للمستخدمين العائدين' : 'للجميع'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
