'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { t as adminT, tWithVars as adminTWithVars } from './admin';
import { trainerTranslations } from './trainer';
import { t as generalT } from './simple';
import ar from './ar';
import en from './en';

type Language = 'ar' | 'en';

interface TranslationContextType {
	language: Language;
	setLanguage: (lang: Language) => void;
	t: (key: string, vars?: Record<string, unknown>) => string;
	direction: 'rtl' | 'ltr';
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const useTranslation = () => {
	const context = useContext(TranslationContext);
	if (!context) {
		throw new Error('useTranslation must be used within a TranslationProvider');
	}
	return context;
};

interface TranslationProviderProps {
	children: ReactNode;
}

export const TranslationProvider = ({ children }: TranslationProviderProps) => {
	const [language, setLanguageState] = useState<Language>('ar');
	const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');

	// تحديث الاتجاه عند تغيير اللغة
	useEffect(() => {
		const newDirection = language === 'ar' ? 'rtl' : 'ltr';
		setDirection(newDirection);
		
		// تحديث اتجاه الصفحة
		if (typeof document !== 'undefined') {
			document.documentElement.dir = newDirection;
			document.documentElement.lang = language;
		}
	}, [language]);

	// تحميل اللغة المحفوظة عند بدء التطبيق
	useEffect(() => {
		if (typeof window !== 'undefined') {
			const savedLang = localStorage.getItem('el7hm-language') as Language;
			if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
				setLanguageState(savedLang);
			}
		}
	}, []);

	const handleSetLanguage = (lang: Language) => {
		setLanguageState(lang);
		if (typeof window !== 'undefined') {
			localStorage.setItem('el7hm-language', lang);
		}
	};

	const getNested = (obj: unknown, dottedKey: string): string | undefined => {
		if (!obj || typeof obj !== 'object') return undefined;
		const parts = dottedKey.split('.');
		let current: unknown = obj;
		for (const part of parts) {
			if (current && typeof current === 'object' && part in (current as Record<string, unknown>)) {
				current = (current as Record<string, unknown>)[part];
			} else {
				return undefined;
			}
		}
		return typeof current === 'string' ? current : undefined;
	};

	const translate = (key: string, vars?: Record<string, unknown>): string => {
		try {
			// ترجمات الأدمن (مفاتيح متداخلة بدون بادئة admin.)
			if (key.startsWith('admin.')) {
				const nestedKey = key.replace(/^admin\./, '');
				const value = vars ? adminTWithVars(nestedKey, vars) : adminT(nestedKey);
				if (value && value !== nestedKey) return value;
			}

			// ترجمات المدرب (مفاتيح متداخلة)
			{
				const lang = (language === 'en' || language === 'ar') ? language : 'ar';
				const nestedTrainer = getNested(trainerTranslations[lang], key);
				if (nestedTrainer) return nestedTrainer;
			}

			// ترجمات عامة من simple.ts (كمسار احتياطي آمن)
			{
				const lang = (language === 'en' || language === 'ar') ? language : 'ar';
				const general = generalT(key, lang);
				if (general && general !== key) return general as string;
			}

			// fallback إلى ملفات اللغة الكاملة (ar/en)
			{
				const langMap = language === 'en' ? en : ar;
				const nested = getNested(langMap, key);
				if (nested) return nested;
			}

			// إذا لم يتم العثور على الترجمة، أرجع المفتاح نفسه
			console.warn(`Translation missing for key: ${key} in language: ${language}`);
			return key;
		} catch (error) {
			console.error('Translation error:', error);
			return key;
		}
	};

	const value: TranslationContextType = {
		language,
		setLanguage: handleSetLanguage,
		t: translate,
		direction
	};

	return (
		<TranslationContext.Provider value={value}>
			{children}
		</TranslationContext.Provider>
	);
};