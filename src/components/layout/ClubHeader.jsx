import Link from 'next/link';
import { Bell, User, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/lib/firebase/auth-provider';
import { db } from '@/lib/firebase/config';

export default function ClubHeader() {
  const [lang, setLang] = useState('ar');
  const [darkMode, setDarkMode] = useState(false);
  const [logo, setLogo] = useState('/club-avatar.png');
  const { user } = useAuth();

  useEffect(() => {
    const htmlLang = document.documentElement.lang;
    setLang(htmlLang || 'ar');
    const savedMode = localStorage.getItem('club-dark-mode');
    if (savedMode === 'true') setDarkMode(true);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('club-dark-mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('club-dark-mode', 'false');
    }
  }, [darkMode]);

  // جلب شعار النادي من Firestore
  useEffect(() => {
    const fetchLogo = async () => {
      if (!user?.uid) return;
      try {
        const clubRef = doc(db, 'clubs', user.uid);
        const clubDoc = await getDoc(clubRef);
        if (clubDoc.exists()) {
          const data = clubDoc.data();
          if (data.logo && data.logo.startsWith('http')) {
            setLogo(data.logo);
          }
        }
      } catch (error) {
        // fallback to default
      }
    };
    fetchLogo();
  }, [user]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow flex items-center h-16 px-6 justify-between" style={{ direction: dir }}>
      <div className="flex items-center gap-3">
        <img src={logo} alt="شعار النادي" className="w-10 h-10 rounded-full border-2 border-green-400 shadow" />
        <span className="text-xl font-bold tracking-tight text-green-700 dark:text-green-300">منصة النادي</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition">
          {darkMode ? <Sun className="w-6 h-6 text-yellow-400" /> : <Moon className="w-6 h-6 text-gray-600" />}
        </button>
        <Link href="/dashboard/club/notifications" className="relative hover:text-green-600 dark:hover:text-green-300">
          <Bell className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        </Link>
        <Link href="/dashboard/club/profile" className="hover:text-green-600 dark:hover:text-green-300">
          <User className="w-7 h-7" />
        </Link>
      </div>
    </header>
  );
} 