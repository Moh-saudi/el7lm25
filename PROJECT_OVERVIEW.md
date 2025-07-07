# 🌟 El7hm - Project Overview
## دليل المشروع - منصة كرة القدم الاحترافية

---

## 📋 Project Summary / ملخص المشروع

### English:
El7hm is a comprehensive football platform built with Next.js 15 that connects players, clubs, academies, agents, and trainers globally. The platform features a sophisticated multi-currency system supporting 60+ currencies with real-time exchange rates, an advanced admin panel, and integrated payment solutions.

### العربية:
منصة El7hm هي منصة كرة قدم شاملة مبنية بـ Next.js 15 تربط اللاعبين والأندية والأكاديميات والوكلاء والمدربين عالمياً. تتميز المنصة بنظام عملات متطور يدعم 60+ عملة مع أسعار صرف فورية، ولوحة تحكم إدارية متقدمة، وحلول دفع متكاملة.

---

## 🏗️ Technical Stack / المكدس التقني

### Frontend:
- **Framework**: Next.js 15.3.4 with App Router
- **UI Library**: React 18 with TypeScript
- **Styling**: Tailwind CSS + Radix UI Components
- **Icons**: Lucide React
- **State Management**: React Context + useState/useEffect

### Backend & Database:
- **Authentication**: Firebase Auth with custom claims
- **Database**: Firebase Firestore (NoSQL)
- **Storage**: Supabase Storage + Firebase Storage
- **Real-time**: Firebase real-time listeners

### Payment Systems:
- **Primary**: Geidea Payment Gateway
- **Secondary**: Apple Pay Integration
- **Alternative**: SkipCash
- **Currency**: ExchangeRate-API (60+ currencies)

### Deployment & Hosting:
- **Platform**: Vercel (Production)
- **CDN**: Automatic through Vercel
- **SSL**: Automatic HTTPS
- **Environment**: .env.local (Development)

---

## 👥 User Types / أنواع المستخدمين

1. **Players (اللاعبين)** - Football players looking for opportunities
2. **Clubs (الأندية)** - Football clubs seeking players
3. **Academies (الأكاديميات)** - Training academies
4. **Agents (الوكلاء)** - Player representatives
5. **Trainers (المدربين)** - Individual trainers
6. **Admins (الإداريين)** - Platform administrators

---

## 🌍 Multi-Currency System / نظام العملات المتعدد

### Key Features:
- **Base Currency**: Egyptian Pound (EGP)
- **Supported Currencies**: 60+ international currencies
- **Real-time Rates**: ExchangeRate-API integration
- **Auto-conversion**: All payments convert to EGP
- **Country Detection**: Automatic currency selection based on location

### Supported Countries & Currencies:
```
Egypt (EGP) - الجنيه المصري
Saudi Arabia (SAR) - الريال السعودي  
UAE (AED) - الدرهم الإماراتي
USA (USD) - الدولار الأمريكي
Europe (EUR) - اليورو
UK (GBP) - الجنيه الإسترليني
... and 54 more currencies
```

---

## 🔐 Admin Panel Features / ميزات لوحة التحكم الإدارية

### Dashboard Features:
- **Multi-Currency Statistics** - إحصائيات العملات المتعددة
- **Real-time User Analytics** - تحليلات المستخدمين الفورية
- **Payment Monitoring** - مراقبة المدفوعات
- **System Health Check** - فحص صحة النظام
- **Security Logs** - سجلات الأمان
- **Media Management** - إدارة الوسائط

### Admin Authentication:
```
Email: admin@el7hm.com
Password: Admin123!@#
UID: hWAd3JRCJnXAowZKJ5W9qSJlA7i1
```

### Login Options:
- `/admin/login` - Standard login
- `/admin/login-advanced` - Advanced diagnostics
- `/admin/login-new` - Enhanced interface

---

## 💳 Payment Integration / تكامل المدفوعات

### Payment Methods:
1. **Geidea Gateway** - Primary payment processor
2. **Apple Pay** - iOS device payments
3. **SkipCash** - Alternative payment method

### Payment Features:
- **Bulk Payment System** - نظام الدفع الجماعي
- **Multi-Currency Support** - دعم العملات المتعددة
- **Receipt Upload** - رفع الإيصالات
- **Payment History** - تاريخ المدفوعات
- **Automatic Conversion** - تحويل تلقائي للعملة الأساسية

---

## 🗂️ Project Structure / هيكل المشروع

```
go-main/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin authentication pages
│   │   ├── auth/              # User authentication
│   │   ├── dashboard/         # Main dashboard
│   │   │   ├── admin/         # Admin panel pages
│   │   │   ├── player/        # Player dashboard
│   │   │   ├── club/          # Club dashboard
│   │   │   ├── academy/       # Academy dashboard
│   │   │   ├── agent/         # Agent dashboard
│   │   │   └── trainer/       # Trainer dashboard
│   │   └── api/               # API routes
│   ├── components/            # Reusable components
│   │   ├── layout/           # Layout components
│   │   ├── shared/           # Shared components
│   │   ├── ui/               # UI primitives (Radix UI)
│   │   └── player/           # Player-specific components
│   ├── lib/                  # Utilities and configurations
│   │   ├── firebase/         # Firebase setup
│   │   ├── supabase/         # Supabase setup
│   │   ├── utils/            # Utility functions
│   │   └── currency-converter.ts # Multi-currency logic
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript definitions
│   └── middleware.js         # Next.js middleware
├── public/                   # Static assets
├── scripts/                  # Development scripts
└── docs/                     # Documentation files
```

---

## 🚀 Getting Started / البدء

### Prerequisites:
```bash
Node.js >= 18.0.0
npm >= 8.0.0
Git
```

### Installation:
```bash
# Clone repository
git clone <repository-url>
cd go-main

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local

# Run development server
npm run dev
```

### Access Points:
- **Main App**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
- **Player Dashboard**: http://localhost:3000/dashboard/player
- **Club Dashboard**: http://localhost:3000/dashboard/club

---

## 📞 Support Information / معلومات الدعم

### Contact:
- **Development Team**: dev@el7hm.com
- **System Admin**: admin@el7hm.com
- **Technical Support**: support@el7hm.com

### Emergency Scripts:
```bash
# Create admin user
node scripts/create-admin-complete.js

# Emergency admin access
node scripts/emergency-admin-session.js

# Check admin authentication
node scripts/check-admin-auth.js
```

---

**Version**: 3.1.0  
**Last Updated**: December 2024  
**Next Documentation**: See TECHNICAL_ARCHITECTURE.md for detailed technical information 
