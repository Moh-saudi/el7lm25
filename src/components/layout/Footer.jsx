'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/lib/translations/simple-context';

export default function Footer() {
  const { t, language } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [user] = useAuthState(auth);
  const [userProfileImage, setUserProfileImage] = useState('/default-avatar.png');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'players', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData?.profile_image) {
              if (typeof userData.profile_image === 'object' && userData.profile_image.url) {
                setUserProfileImage(userData.profile_image.url);
              } else if (typeof userData.profile_image === 'string') {
                setUserProfileImage(userData.profile_image);
              }
            } else {
              setUserProfileImage('/default-avatar.png');
            }
            let displayName = '';
            if (userData?.full_name && userData.full_name !== 'undefined undefined') {
              displayName = userData.full_name;
            } else if (userData?.firstName && userData?.lastName) {
              displayName = `${userData.firstName} ${userData.lastName}`.trim();
            } else if (userData?.name) {
              displayName = userData.name;
            }
            setUserName(displayName || t('footer.defaultPlayerName'));
          }
        } catch (error) {
          setUserProfileImage('/default-avatar.png');
        }
      };
      fetchUserData();
    }
  }, [user, t]);

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <footer className="bg-white border-t border-gray-200 py-4" style={{ direction: dir }}>
      <div className="flex items-center justify-between px-4 mx-auto max-w-7xl">
        <div className="flex items-center space-x-2 space-x-reverse">
          <Image 
            src="/el7hm-logo.png" 
            alt={t('footer.logoAlt')} 
            width={32} 
            height={32} 
            className="h-8" 
            priority={true}
            loading="eager"
          />
          <span className="font-bold text-gray-800">{t('footer.companyName')}</span>
          <span className="text-sm text-gray-600">{t('footer.copyright', { year: currentYear })}</span>
        </div>

        <div className="flex items-center space-x-6 space-x-reverse">
          <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            {t('footer.about')}
          </Link>
          <Link href="/contact" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            {t('footer.contact')}
          </Link>
          <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            {t('footer.privacy')}
          </Link>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          <a 
            href="https://www.facebook.com/profile.php?id=61577797509887" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-600 transition-colors"
            title={t('footer.facebook')}
          >
            <img src="/images/medialogo/facebook.svg" alt={t('footer.facebook')} width={20} height={20} />
          </a>
          <a 
            href="https://www.instagram.com/hagzzel7lm?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-600 transition-colors"
            title={t('footer.instagram')}
          >
            <img src="/images/medialogo/instagram.svg" alt={t('footer.instagram')} width={20} height={20} />
          </a>
          <a 
            href="https://www.linkedin.com/company/hagzz" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-700 transition-colors"
            title={t('footer.linkedin')}
          >
            <img src="/images/medialogo/linkedin.svg" alt={t('footer.linkedin')} width={20} height={20} />
          </a>
          <a 
            href="https://www.tiktok.com/@hagzz25?is_from_webapp=1&sender_device=pc" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-black transition-colors"
            title={t('footer.tiktok')}
          >
            <img src="/images/medialogo/tiktok.svg" alt={t('footer.tiktok')} width={20} height={20} />
          </a>
        </div>
      </div>
    </footer>
  );
} 
