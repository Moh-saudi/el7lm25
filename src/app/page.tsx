'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronRight, Star, MapPin, Mail, Phone, ChevronLeft, Brain, Trophy, Network, Globe, FileText, Truck, Heart } from 'lucide-react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/translations/simple-context';
import LanguageSwitcher from '@/components/shared/LanguageSwitcher';
import TranslationWrapper from '@/components/shared/TranslationWrapper';

export default function Page() {
  const router = useRouter();
  const { t, direction } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [stats, setStats] = useState({
    players: 1500,
    clubs: 250,
    countries: 15,
    success: 800
  });
  const [activePartner, setActivePartner] = useState(0);
  const [activeClub, setActiveClub] = useState(0);
  const [activeSection, setActiveSection] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  const slides = [
    {
      title: t('home.sections.hero.slide1.title'),
      subtitle: t('home.sections.hero.slide1.subtitle'),
      image: "/slider/1.png",
      gradient: "from-blue-900/90 to-blue-600/90"
    },
    {
      title: t('home.sections.hero.slide2.title'),
      subtitle: t('home.sections.hero.slide2.subtitle'),
      image: "/slider/2.png",
      gradient: "from-green-900/90 to-green-600/90"
    }
  ];

  // Subscription Packages
  const packages = [
    {
      title: t('home.packages.package1.title'),
      price: "2",
      originalPrice: "3",
      discount: "33%",
      features: [
        t('home.packages.package1.features.analysis'),
                  t('home.packages.package1.features.exposure'),
                  t('home.packages.package1.features.tests'),
        t('home.packages.package1.features.support')
      ]
    },
    {
      title: t('home.packages.package2.title'),
      price: "6",
      originalPrice: "10",
      discount: "40%",
      isPopular: true,
      features: [
        t('home.packages.package2.features.analysis'),
        t('home.packages.package2.features.exposure'),
        t('home.packages.package2.features.tests'),
        t('home.packages.package2.features.support')
      ]
    },
    {
      title: t('home.packages.package3.title'),
      price: "10",
      originalPrice: "20",
      discount: "50%",
      features: [
        t('home.packages.package3.features.analysis'),
        t('home.packages.package3.features.exposure'),
        t('home.packages.package3.features.tests'),
        t('home.packages.package3.features.support')
      ]
    }
  ];

  // Auto slide for partners
  useEffect(() => {
    const partnerInterval = setInterval(() => {
      setActivePartner(prev => (prev >= 2 ? 0 : prev + 1));
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(partnerInterval);
  }, []);

  // Auto slide for clubs
  useEffect(() => {
    const clubInterval = setInterval(() => {
      setActiveClub(prev => (prev >= 2 ? 0 : prev + 1));
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(clubInterval);
  }, []);

  // Stats counter effect
  useEffect(() => {
    const statsInterval = setInterval(() => {
      setStats(prev => ({
        players: Math.min(prev.players + Math.floor(Math.random() * 3), 2000),
        clubs: Math.min(prev.clubs + Math.floor(Math.random() * 2), 300),
        countries: Math.min(prev.countries + (Math.random() > 0.8 ? 1 : 0), 20),
        success: Math.min(prev.success + Math.floor(Math.random() * 4), 1200)
      }));
    }, 3000);

    return () => clearInterval(statsInterval);
  }, []);

  useEffect(() => {
    const sectionIds = ['services', 'clubs', 'team', 'branches', 'contact'];
    const handleScroll = () => {
      if (typeof window === 'undefined') return;
      const scrollPosition = window.scrollY + 120; // تعويض الهيدر الثابت
      let currentSection = '';
      for (const id of sectionIds) {
        const section = document.getElementById(id);
        if (section && section.offsetTop <= scrollPosition) {
          currentSection = id;
        }
      }
      setActiveSection(currentSection);
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      setIsMobile(window.innerWidth < 768);
    };
    
    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <TranslationWrapper>
      <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 ${direction === 'rtl' ? 'dir-rtl' : 'dir-ltr'}`}>
        {/* Header */}
        <header className="fixed z-50 w-full shadow-lg bg-white/90 backdrop-blur-sm">
        <nav className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/el7hm-logo.png" alt="Logo" className="w-auto h-10" />
              <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text">
                El7hm
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="items-center hidden space-x-8 space-x-reverse md:flex">
              <a href="#services" className={`transition-colors font-semibold ${activeSection === 'services' ? 'text-blue-400 underline underline-offset-8' : 'hover:text-blue-600'}`}>{t('home.navigation.services')}</a>
              <a href="#clubs" className={`transition-colors font-semibold ${activeSection === 'clubs' ? 'text-blue-400 underline underline-offset-8' : 'hover:text-blue-600'}`}>{t('home.navigation.clubs')}</a>
              <a href="#team" className={`transition-colors font-semibold ${activeSection === 'team' ? 'text-blue-400 underline underline-offset-8' : 'hover:text-blue-600'}`}>{t('home.navigation.team')}</a>
              <a href="#branches" className={`transition-colors font-semibold ${activeSection === 'branches' ? 'text-blue-400 underline underline-offset-8' : 'hover:text-blue-600'}`}>{t('home.navigation.branches')}</a>
              <a href="#contact" className={`transition-colors font-semibold ${activeSection === 'contact' ? 'text-blue-400 underline underline-offset-8' : 'hover:text-blue-600'}`}>{t('home.navigation.contact')}</a>
              
              {/* Language Switcher */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher variant="simple" />
              </div>
              
              <div className="flex gap-2 ml-6">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="px-6 py-2 text-white transition-all bg-blue-500 rounded-lg hover:bg-blue-700"
                >
                  {t('home.navigation.login')}
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="px-8 py-2 text-xl font-bold text-white transition-all bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  {t('home.navigation.startJourney')}
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="pt-4 pb-2 md:hidden">
              <a href="#services" className={`block py-2 font-semibold ${activeSection === 'services' ? 'text-blue-400 underline underline-offset-8' : ''}`}>{t('home.navigation.services')}</a>
              <a href="#clubs" className={`block py-2 font-semibold ${activeSection === 'clubs' ? 'text-blue-400 underline underline-offset-8' : ''}`}>{t('home.navigation.clubs')}</a>
              <a href="#team" className={`block py-2 font-semibold ${activeSection === 'team' ? 'text-blue-400 underline underline-offset-8' : ''}`}>{t('home.navigation.team')}</a>
              <a href="#branches" className={`block py-2 font-semibold ${activeSection === 'branches' ? 'text-blue-400 underline underline-offset-8' : ''}`}>{t('home.navigation.branches')}</a>
              <a href="#contact" className={`block py-2 font-semibold ${activeSection === 'contact' ? 'text-blue-400 underline underline-offset-8' : ''}`}>{t('home.navigation.contact')}</a>
              
              {/* Mobile Language Switcher */}
              <div className="py-2">
                <LanguageSwitcher variant="simple" />
              </div>
              
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="w-1/2 px-4 py-2 text-white bg-blue-500 rounded-lg"
                >
                  {t('home.navigation.login')}
                </button>
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-1/2 px-4 py-2 text-white bg-blue-600 rounded-lg"
                >
                  {t('home.navigation.startJourney')}
                </button>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white">
        <div className="container px-4 mx-auto">
          <div className="relative z-10 py-20">
            <div className="hero-slider rounded-[2rem] overflow-hidden shadow-2xl">
              <Swiper
                modules={[Autoplay, Pagination, Navigation]}
                spaceBetween={0}
                slidesPerView={1}
                navigation={{
                  enabled: true,
                  hideOnClick: true,
                }}
                pagination={{ 
                  clickable: true,
                  dynamicBullets: true,
                }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                breakpoints={{
                  320: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                  },
                  640: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                  },
                  768: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                  },
                  1024: {
                    slidesPerView: 1,
                    spaceBetween: 0,
                  },
                }}
                className="w-full aspect-square sm:h-[400px] md:h-[500px] lg:h-[600px]"
              >
                {[
                  { desktop: '/slider/1.png', mobile: '/slider/slider mobil/1.png', title: t('home.sections.hero.slide1.title') },
                  { desktop: '/slider/2.png', mobile: '/slider/slider mobil/2.png', title: t('home.sections.hero.slide2.title') },
                  { desktop: '/slider/3.png', mobile: '/slider/slider mobil/3.png', title: t('home.sections.hero.slide3.title') },
                  { desktop: '/slider/4.png', mobile: '/slider/slider mobil/4.png', title: t('home.sections.hero.slide4.title') },
                  { desktop: '/slider/5.png', mobile: '/slider/slider mobil/5.png', title: t('home.sections.hero.slide5.title') },
                  { desktop: '/slider/6.png', mobile: '/slider/slider mobil/6.png', title: t('home.sections.hero.slide6.title') },
                  { desktop: '/slider/7.png', mobile: '/slider/slider mobil/7.png', title: t('home.sections.hero.slide7.title') },
                ].map((slide, index) => (
                  <SwiperSlide key={index}>
                    <div className={`relative w-full ${isMobile ? 'aspect-square' : 'aspect-[16/9]'} bg-gray-100`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30" />
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Image
                          src={isMobile ? slide.mobile : slide.desktop}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 767px) 100vw, 100vw"
                          priority={index <= 2}
                        />
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container px-4 mx-auto">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl">
              <div className="mb-2 text-4xl font-bold text-blue-600">
                {stats.players.toLocaleString()}+
              </div>
              <div className="text-gray-600">{t('home.sections.stats.players')}</div>
            </div>
            <div className="p-6 text-center bg-gradient-to-br from-green-50 to-green-100 rounded-2xl">
              <div className="mb-2 text-4xl font-bold text-green-600">
                {stats.clubs.toLocaleString()}+
              </div>
              <div className="text-gray-600">{t('home.sections.stats.clubs')}</div>
            </div>
            <div className="p-6 text-center bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl">
              <div className="mb-2 text-4xl font-bold text-amber-600">
                {stats.countries.toLocaleString()}+
              </div>
              <div className="text-gray-600">{t('home.sections.stats.countries')}</div>
            </div>
            <div className="p-6 text-center bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl">
              <div className="mb-2 text-4xl font-bold text-purple-600">
                {stats.success.toLocaleString()}+
              </div>
              <div className="text-gray-600">{t('home.sections.stats.success')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-white to-blue-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <span className="text-4xl mb-2 animate-bounce">🛡️</span>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
              <span>{t('home.sections.services.title')}</span>
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* بطاقة: تحليل الأداء */}
            <div className="group p-8 transition-all duration-300 transform bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-teal-400 rounded-t-2xl animate-slide-in" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500 flex items-center gap-2">
                  <span className="animate-rotate">🧠</span>
                  {t('home.sections.services.performanceAnalysis.title')}
                </h3>
                <div className="p-3 text-blue-500 bg-blue-100 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                  <Brain className="w-7 h-7" />
                </div>
              </div>
                              <p className="mb-6 text-gray-600">{t('home.sections.services.performanceAnalysis.description')}</p>
              <button className="w-full py-3 text-white transition-all transform bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl hover:shadow-lg hover:scale-[1.04] font-bold tracking-wide">
                                  {t('home.sections.services.performanceAnalysis.button')}
              </button>
            </div>

            <div className="group p-8 transition-all duration-300 transform bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                  {t('home.sections.services.professionalOffers.title')}
                </h3>
                <div className="p-3 text-green-500 bg-green-50 rounded-xl group-hover:scale-110 transition-transform">
                  <Trophy className="w-6 h-6" />
                </div>
              </div>
                              <p className="mb-6 text-gray-600">{t('home.sections.services.professionalOffers.description')}</p>
              <button className="w-full py-3 text-white transition-all transform bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl hover:shadow-lg hover:scale-[1.02]">
                                  {t('home.sections.services.professionalOffers.button')}
              </button>
            </div>

            <div className="group p-8 transition-all duration-300 transform bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                  {t('home.sections.services.internationalTrials.title')}
                </h3>
                <div className="p-3 text-purple-500 bg-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6" />
                </div>
              </div>
                              <p className="mb-6 text-gray-600">{t('home.sections.services.internationalTrials.description')}</p>
              <button className="w-full py-3 text-white transition-all transform bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl hover:shadow-lg hover:scale-[1.02]">
                                  {t('home.sections.services.internationalTrials.button')}
              </button>
            </div>

            <div className="group p-8 transition-all duration-300 transform bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-2">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-teal-500">
                  {t('home.sections.services.negotiationAgency.title')}
                </h3>
                <div className="p-3 text-yellow-500 bg-yellow-50 rounded-xl group-hover:scale-110 transition-transform">
                  <Network className="w-6 h-6" />
                </div>
              </div>
                              <p className="mb-6 text-gray-600">{t('home.sections.services.negotiationAgency.description')}</p>
              <button className="w-full py-3 text-white transition-all transform bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl hover:shadow-lg hover:scale-[1.02]">
                                  {t('home.sections.services.negotiationAgency.button')}
              </button>
            </div>

            {/* بطاقة: صياغة العقود القانونية */}
            <div className="group p-8 transition-all duration-300 transform bg-gradient-to-br from-red-50 to-pink-100 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-pink-400 rounded-t-2xl animate-slide-in" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-500 flex items-center gap-2">
                  <span className="animate-rotate">📄</span>
                  {t('home.sections.services.legalContracts.title')}
                </h3>
                <div className="p-3 text-red-500 bg-red-100 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                  <FileText className="w-7 h-7" />
                </div>
              </div>
                              <p className="mb-6 text-gray-600">{t('home.sections.services.legalContracts.description')}</p>
              <button className="w-full py-3 text-white transition-all transform bg-gradient-to-r from-red-600 to-pink-500 rounded-xl hover:shadow-lg hover:scale-[1.04] font-bold tracking-wide">
                                  {t('home.sections.services.legalContracts.button')}
              </button>
            </div>

            {/* بطاقة: الخدمات اللوجستية للأندية */}
            <div className="group p-8 transition-all duration-300 transform bg-gradient-to-br from-indigo-50 to-blue-100 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-t-2xl animate-slide-in" />
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center gap-2">
                  <span className="animate-rotate">🚚</span>
                  {t('home.sections.services.logisticsServices.title')}
                </h3>
                <div className="p-3 text-indigo-500 bg-indigo-100 rounded-xl group-hover:scale-110 transition-transform shadow-md">
                  <Truck className="w-7 h-7" />
                </div>
              </div>
                              <p className="mb-6 text-gray-600">{t('home.sections.services.logisticsServices.description')}</p>
              <button className="w-full py-3 text-white transition-all transform bg-gradient-to-r from-indigo-600 to-blue-500 rounded-xl hover:shadow-lg hover:scale-[1.04] font-bold tracking-wide">
                                  {t('home.sections.services.logisticsServices.button')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-16">
            <h2 className="mb-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              {t('home.sections.partners.title')}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t('home.sections.partners.subtitle')}
            </p>
          </div>
          
          <div className="partners-slider">
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 20,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 30,
                },
                1024: {
                  slidesPerView: 4,
                  spaceBetween: 30,
                },
              }}
            >
              {[
                { name: t('home.sections.partners.fifa'), src: '/images/supports/fifa.png' },
                { name: t('home.sections.partners.qfa'), src: '/images/supports/qfa.png' },
                { name: t('home.sections.partners.qfc'), src: '/images/supports/qfc.png' },
                { name: t('home.sections.partners.microsoft'), src: '/images/supports/microsoft.png' },
                { name: t('home.sections.partners.peachscore'), src: '/images/supports/peachscore-dealum-logo-new.png' },
                { name: t('home.sections.partners.yjppg'), src: '/images/supports/YJPPG.jpg' }
              ].map((partner, index) => (
                <SwiperSlide key={index}>
                  <div className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                    <div className="relative mb-6 overflow-hidden rounded-xl aspect-[4/3]">
                      <Image 
                        src={partner.src}
                        alt={`شعار ${partner.name}`}
                        width={300}
                        height={200}
                        className="object-contain w-full h-full p-4 transition-transform duration-300 hover:scale-110"
                        onError={(e) => {
                          console.error(`Error loading image: ${partner.name}`);
                          e.currentTarget.src = '/images/default-avatar.png';
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-center text-gray-800">{partner.name}</h3>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section id="clubs" className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <span className="text-4xl mb-2 animate-bounce">🏟️</span>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
              <span>{t('home.sections.clubs.title')}</span>
            </h2>
          </div>
          
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 3000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              768: {
                slidesPerView: 3,
                spaceBetween: 30,
              },
              1024: {
                slidesPerView: 4,
                spaceBetween: 30,
              },
            }}
            className="clubs-swiper"
          >
            {[
              { name: t('home.sections.clubs.alain'), logo: 'al-ain-fc-logo.png' },
              { name: t('home.sections.clubs.alshamal'), logo: 'al-shamal-sc-logo-png_seeklogo-487123.png' },
              { name: t('home.sections.clubs.alshahania'), logo: '1503438199al-shahania-sc-football-logo-png.png' },
              { name: t('home.sections.clubs.alhilal'), logo: 'al_hilal_sfc-logo_brandlogos.net_3tkg2-512x512.png' },
              { name: t('home.sections.clubs.alnasr'), logo: 'elnasr saudi.png' },
              { name: t('home.sections.clubs.zamalek'), logo: 'zamalk.png' },
              { name: t('home.sections.clubs.alnasruae'), logo: 'elnaser uha.jpg' },
              { name: t('home.sections.clubs.almukalla'), logo: 'elmkolon.jpg' },
              { name: t('home.sections.clubs.aldohail'), logo: 'eldohel.jpg' },
              { name: t('home.sections.clubs.ajman'), logo: 'agman.png' }
            ].map((club, index) => (
              <SwiperSlide key={index}>
                <div className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                  <div className="relative mb-6 overflow-hidden rounded-xl aspect-[4/3]">
                    <img 
                      src={`/images/logoclublandingpage/${club.logo}`}
                      alt={`شعار ${club.name}`}
                      className="object-contain w-full h-full p-4 transition-transform duration-300 hover:scale-110"
                      onError={(e) => {
                        console.error(`Error loading image: ${club.logo}`);
                        e.currentTarget.src = '/images/club-avatar.png';
                      }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-center text-gray-800">{club.name}</h3>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* Team Section */}
      <section id="team" className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <span className="text-4xl mb-2 animate-bounce">👨‍💼</span>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
              <span>{t('home.sections.team.title')}</span>
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: t('home.sections.team.members.ceo.name'),
                role: t('home.sections.team.members.ceo.role'),
                image: '/images/team/ceo .jpg',
                description: t('home.sections.team.members.ceo.description')
              },
              {
                name: t('home.sections.team.members.cto.name'),
                role: t('home.sections.team.members.cto.role'),
                image: '/images/team/opertionegypt.jpg',
                description: t('home.sections.team.members.cto.description')
              },
              {
                name: t('home.sections.team.members.cfo.name'),
                role: t('home.sections.team.members.cfo.role'),
                image: '/images/team/opetion qatar.jpg',
                description: t('home.sections.team.members.cfo.description')
              },
              {
                name: t('home.sections.team.members.legal.name'),
                role: t('home.sections.team.members.legal.role'),
                image: '/images/team/law.jpg',
                description: t('home.sections.team.members.legal.description')
              }
            ].map((member, index) => (
              <div key={index} className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                <div className="relative mb-6 overflow-hidden rounded-xl aspect-[4/3]">
                  <img 
                    src={member.image}
                    alt={member.name}
                    className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/images/default-avatar.png';
                    }}
                  />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-800">{member.name}</h3>
                <p className="mb-4 text-blue-600">{member.role}</p>
                <p className="text-gray-600">{member.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Branches Section */}
      <section id="branches" className="py-20 bg-white">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12 flex flex-col items-center">
            <span className="text-4xl mb-2 animate-bounce">📍</span>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 inline-flex items-center gap-2">
              <span>{t('home.sections.branches.title')}</span>
            </h2>
          </div>
          
          <div className="grid gap-8 md:grid-cols-4">
                          {[
                { city: t('home.sections.branches.cities.riyadh'), country: t('home.sections.branches.locations.saudiArabia'), address: t('home.sections.branches.addresses.riyadh'), flag: 'saudi-arabia' },
                { city: t('home.sections.branches.cities.dubai'), country: t('home.sections.branches.locations.uae'), address: t('home.sections.branches.addresses.dubai'), flag: 'uae' },
                { city: t('home.sections.branches.cities.doha'), country: t('home.sections.branches.locations.qatar'), address: t('home.sections.branches.addresses.doha'), flag: 'qatar' },
                { city: t('home.sections.branches.cities.cairo'), country: t('home.sections.branches.locations.egypt'), address: t('home.sections.branches.addresses.cairo'), flag: 'egypt' }
              ].map((branch, index) => (
              <div key={index} className="p-6 transition-all duration-300 transform bg-white rounded-2xl hover:shadow-lg hover:-translate-y-2">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{branch.city}</h3>
                    <div className="flex items-center gap-2">
                      <img 
                        src={`/images/flags/${branch.flag}.png`}
                        alt={`علم ${branch.country}`}
                        className="w-6 h-4 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = '/images/default-avatar.png';
                        }}
                      />
                      <p className="text-gray-600">{branch.country}</p>
                    </div>
                  </div>
                  <MapPin className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-600">{branch.address}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container px-4 mx-auto">
          {/* أيقونات حماسية */}
          <div className="flex justify-center gap-6 mb-8 animate-fade-in-up">
            <span className="text-5xl">⚽</span>
            <span className="text-5xl">🏆</span>
            <span className="text-5xl">⭐</span>
            <span className="text-5xl">🔥</span>
          </div>
          <div className="text-center mb-16">
            <h2 className="mb-4 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800">
              {t('home.sections.contact.joinUs.title')}
            </h2>
            <p className="text-2xl text-gray-600 max-w-2xl mx-auto">
              {t('home.sections.contact.joinUs.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Egypt Contact */}
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <h3 className="mb-6 text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  <img src="/images/flags/egypt.png" alt="علم مصر" className="w-8 h-8 inline-block" />
                  {t('home.sections.contact.countries.egypt')}
                </h3>
                <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold text-gray-700">+20</span>
                  <span className="text-3xl">|</span>
                  <a 
                    href="tel:+201017799580" 
                    className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition-colors ltr:ml-2 rtl:mr-2"
                  >
                    010 1779 9580
                  </a>
                </div>
                <a 
                  href="https://wa.me/201017799580" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 text-xl font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  <svg className="w-7 h-7 ml-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t('home.sections.contact.whatsapp')}
                </a>
              </div>
            </div>

            {/* Qatar Contact */}
            <div className="p-8 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="text-center">
                <h3 className="mb-6 text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
                  <img src="/images/flags/qatar.png" alt="علم قطر" className="w-8 h-8 inline-block" />
                  {t('home.sections.contact.countries.qatar')}
                </h3>
                <div className="mb-6 p-4 bg-blue-50 rounded-xl flex items-center justify-center gap-3">
                  <span className="text-2xl font-bold text-gray-700">+974</span>
                  <span className="text-3xl">|</span>
                  <a 
                    href="tel:+97472053188" 
                    className="text-4xl font-bold text-blue-600 hover:text-blue-700 transition-colors ltr:ml-2 rtl:mr-2"
                  >
                    72 053 188
                  </a>
                </div>
                <a 
                  href="https://wa.me/97472053188" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-8 py-4 text-xl font-semibold text-white bg-green-500 rounded-full hover:bg-green-600 transition-all duration-300 transform hover:scale-105 shadow-md"
                >
                  <svg className="w-7 h-7 ml-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  {t('home.sections.contact.whatsapp')}
                </a>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-2xl font-semibold text-gray-700 mb-4">
              {t('home.sections.contact.joinUs.callToAction')}
            </p>
            <p className="text-xl text-gray-600">
              {t('home.sections.contact.joinUs.description')}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#2d1857] to-[#0a2342] text-white py-14 mt-20 relative">
        <div className="container px-4 mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <img src="/el7hm-logo.png" alt="Logo" className="w-auto h-14 mb-4" />
              <p className="text-gray-100 text-lg">
                {t('home.sections.footer.description')}
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">{t('home.sections.footer.quickLinks')}</h3>
              <ul className="space-y-2">
                <li><a href="#services" className="text-gray-200 hover:text-white">{t('home.sections.footer.services')}</a></li>
                <li><a href="#clubs" className="text-gray-200 hover:text-white">{t('home.sections.footer.clubs')}</a></li>
                <li><a href="#team" className="text-gray-200 hover:text-white">{t('home.sections.footer.team')}</a></li>
                <li><a href="#branches" className="text-gray-200 hover:text-white">{t('home.sections.footer.branches')}</a></li>
                <li><a href="#contact" className="text-gray-200 hover:text-white">{t('home.sections.footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">{t('home.sections.footer.contactUs')}</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-gray-100">
                  <Phone className="w-5 h-5 ml-2 text-violet-300" />
                  +20 10 1779 9580
                </li>
                <li className="flex items-center text-gray-100">
                  <Mail className="w-5 h-5 ml-2 text-violet-300" />
                  info@el7hm.com
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-bold text-white">{t('home.sections.footer.followUs')}</h3>
              <div className="flex gap-4 mt-2">
                <a 
                  href="https://www.facebook.com/hagzz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#3b2667] to-[#bc78ec] shadow-lg hover:scale-110 transition-transform duration-300"
                >
                  <img src="/images/medialogo/facebook.svg" alt="فيسبوك" width={28} height={28} />
                </a>
                <a 
                  href="https://www.instagram.com/hagzzel7lm?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#bc2a8d] to-[#e94057] shadow-lg hover:scale-110 transition-transform duration-300"
                >
                  <img src="/images/medialogo/instagram.svg" alt="إنستجرام" width={28} height={28} />
                </a>
                <a 
                  href="https://www.linkedin.com/company/hagzz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#0077b5] to-[#0a2342] shadow-lg hover:scale-110 transition-transform duration-300"
                >
                  <img src="/images/medialogo/linkedin.svg" alt="لينكدإن" width={28} height={28} />
                </a>
                <a 
                  href="https://www.tiktok.com/@hagzz25?is_from_webapp=1&sender_device=pc" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-[#000000] to-[#636363] shadow-lg hover:scale-110 transition-transform duration-300"
                >
                  <img src="/images/medialogo/tiktok.svg" alt="تيك توك" width={28} height={28} />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 mt-8 text-center text-gray-200 border-t border-violet-900">
            <p>© {new Date().getFullYear()} El7hm. {t('home.sections.footer.copyright')}</p>
          </div>
        </div>
        {/* جزء محفور في أسفل الصفحة */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-gray-100 py-2 z-50">
          <div className="container mx-auto">
            <p className="text-center text-sm text-gray-500 font-arabic flex items-center justify-center gap-1.5">
              <span>{t('home.sections.footer.madeWithLove')}</span>
              <span className="text-red-500 font-medium">{t('home.sections.footer.egypt')}</span>
              <Heart className="w-3.5 h-3.5 text-red-500" />
            </p>
          </div>
        </div>
      </footer>
      </div>
    </TranslationWrapper>
  );
}


