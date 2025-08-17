// ترجمات الهيدر المحسنة
export const headerTranslations = {
  ar: {
    'header.notifications': 'الإشعارات',
    'header.settings': 'الإعدادات',
    'header.signOut': 'تسجيل الخروج',
    'header.searchPlaceholder': 'بحث...',
    'header.user': 'مستخدم',
    'header.role.player': 'لاعب',
    'header.role.club': 'نادي',
    'header.role.agent': 'وكيل',
    'header.role.academy': 'أكاديمية',
    'header.role.trainer': 'مدرب',
    'header.role.admin': 'مدير',
    'header.role.marketer': 'مسوق',
    'header.role.parent': 'ولي أمر'
  },
  en: {
    'header.notifications': 'Notifications',
    'header.settings': 'Settings',
    'header.signOut': 'Sign Out',
    'header.searchPlaceholder': 'Search...',
    'header.user': 'User',
    'header.role.player': 'Player',
    'header.role.club': 'Club',
    'header.role.agent': 'Agent',
    'header.role.academy': 'Academy',
    'header.role.trainer': 'Trainer',
    'header.role.admin': 'Admin',
    'header.role.marketer': 'Marketer',
    'header.role.parent': 'Parent'
  }
};

// دالة الترجمة للهيدر
export const getHeaderTranslation = (key: string, language: 'ar' | 'en' = 'ar'): string => {
  return headerTranslations[language][key] || key;
}; 