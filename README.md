# El7hm - Football Player Management Platform

A comprehensive platform for managing football players, clubs, and agents with features including player profiles, contract management, payment processing, and more.

## Features

- 🏃‍♂️ **Player Management**: Complete player profiles with skills assessment
- 🏟️ **Club Dashboard**: Club management tools and player search
- 🤝 **Agent Portal**: Agent tools for player representation
- 💳 **Payment Processing**: Integrated payment system with Geidea
- 📊 **Analytics**: Performance tracking and reporting
- 🌍 **Multi-language Support**: Arabic and English support
- 📱 **Responsive Design**: Mobile-first responsive interface

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- Supabase account (optional)
- Geidea payment gateway account (for payments)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/hagzz-go.git
cd hagzz-go
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# Copy the example environment file
cp .env.local.example .env.local
```

4. **Configure Firebase**
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Create a new project or use existing one
   - Get your configuration values from Project Settings
   - Update `.env.local` with your Firebase credentials

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
   - Navigate to `http://localhost:3000`

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Firebase Configuration (Required)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Geidea Payment Gateway (Optional - for payments)
GEIDEA_MERCHANT_PUBLIC_KEY=your_merchant_key
GEIDEA_API_PASSWORD=your_api_password
GEIDEA_WEBHOOK_SECRET=your_webhook_secret
```

## Troubleshooting

### Common Console Errors (Fixed)

The following console errors have been addressed and should no longer appear:

1. **Firebase Environment Variables Warning**
   - ✅ Fixed: Now only shows warnings in development mode
   - ✅ Uses fallback configuration automatically

2. **Multiple Supabase Client Instances**
   - ✅ Fixed: Implemented singleton pattern for Supabase client
   - ✅ Centralized client management

3. **SVG Path Errors**
   - ✅ Fixed: Added path validation and fallback icons
   - ✅ CSS rules to hide invalid SVG paths

4. **Console Noise**
   - ✅ Fixed: Implemented smart console filtering
   - ✅ Hides repetitive and non-critical errors

### Development Tips

1. **Console is too noisy?**
   - The app includes automatic console filtering
   - Only important errors will be shown
   - Set `NODE_ENV=production` to reduce logging

2. **Firebase connection issues?**
   - Check your `.env.local` file
   - Verify Firebase project settings
   - Ensure all required environment variables are set

3. **Payment testing?**
   - The app automatically uses test mode in development
   - Real payments require production Geidea credentials

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Firebase Functions
- **Database**: Firebase Firestore, Supabase (optional)
- **Authentication**: Firebase Auth
- **Storage**: Firebase Storage, Supabase Storage
- **Payments**: Geidea Payment Gateway
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts, Chart.js

## Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── layout/           # Layout components
│   └── icons/            # Icon components
├── lib/                  # Utility libraries
│   ├── firebase/         # Firebase configuration
│   ├── supabase/         # Supabase configuration
│   └── utils/            # Utility functions
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── utils/                # Helper utilities
```

## Key Features

### Player Management
- Complete player profiles with personal, educational, and sports information
- Skill assessment with radar charts
- Medical records and injury tracking
- Achievement and contract history
- Media gallery (photos and videos)

### Club Dashboard
- Player search and discovery
- Contract management
- Marketing tools
- Performance analytics
- Billing and subscription management

### Payment System
- Multiple payment methods (Credit cards, Apple Pay, Bank transfers)
- Multi-currency support
- Subscription management
- Invoice generation

### User Roles
- **Players**: Manage profiles, view opportunities
- **Clubs**: Search players, manage contracts
- **Agents**: Represent players, manage negotiations

## API Documentation

### Authentication
- Firebase Authentication is used for user management
- JWT tokens for API authentication
- Role-based access control

### Payment Endpoints
- `/api/geidea/create-session` - Create payment session
- `/api/geidea/webhook` - Handle payment callbacks
- `/api/geidea/apple-pay-session` - Apple Pay support

### Data Endpoints
- `/api/player/profile` - Player profile management
- `/api/messages` - Messaging system
- `/api/analytics` - Analytics data

## Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Other Platforms
- Firebase Hosting
- Netlify
- Traditional hosting with Node.js support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- 📧 Email: info@el7hm.com
- 📱 Phone: +20 10 1779 9580
- 🌐 Website: [el7hm.com](https://el7hm.com)

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Real-time chat system
- [ ] Advanced analytics dashboard
- [ ] Multi-language expansion
- [ ] AI-powered player recommendations
- [ ] Video analysis tools

---

Made with ❤️ by the El7hm team

#   U p d a t e d   f o r   d e p l o y m e n t 
 
 
