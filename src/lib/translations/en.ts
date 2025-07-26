// English Translation File - El7hm
// ملف الترجمة الإنجليزية

const en = {
  // ============================================
  // Navigation and Main Interface
  // ============================================
  nav: {
    dashboard: 'Dashboard',
    users: 'User Management',
    payments: 'Payments & Subscriptions',
    reports: 'Reports',
    settings: 'Settings',
    system: 'System Monitoring',
    media: 'Media & Storage',
    locations: 'Geographic Locations',
    profiles: 'User Profiles',
    messages: 'Interactions & Messages',
    logout: 'Logout',
    home: 'Home',
    about: 'About',
    contact: 'Contact Us',
    login: 'Login',
    register: 'Create Account'
  },

  // ============================================
  // Common Actions
  // ============================================
  actions: {
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    view: 'View',
    add: 'Add',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    refresh: 'Refresh',
    download: 'Download',
    upload: 'Upload',
    approve: 'Approve',
    reject: 'Reject',
    activate: 'Activate',
    deactivate: 'Deactivate',
    loading: 'Loading...',
    processing: 'Processing...',
    success: 'Success',
    error: 'Error',
    warning: 'Warning',
    info: 'Information',
    confirm: 'Confirm',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    first: 'First',
    last: 'Last'
  },

  // ============================================
  // Dashboard
  // ============================================
  dashboard: {
    title: 'Multi-Currency Administrative Dashboard',
    welcome: 'Welcome to the Global Platform Management System',
    baseCurrency: 'Base Currency: Egyptian Pound (EGP)',
    lastUpdate: 'Last Update',
    loading: 'Loading multi-currency dashboard...',
    
    // ============================================
    // Parent Dashboard
    // ============================================
    parent: {
      welcome: {
        title: 'Welcome to Parent Dashboard',
        subtitle: 'Comprehensive platform for managing your child\'s sports career'
      },
      features: {
        childProfile: 'Manage your child\'s sports profile',
        progress: 'Track training progress and achievements',
        payments: 'Manage subscriptions and payments',
        communication: 'Communicate with coaches and academies'
      },
      cta: {
        title: '🚀 Ready to launch?',
        description: 'Use the sidebar to access all available features'
      }
    },

    // ============================================
    // Marketer Dashboard
    // ============================================
    marketer: {
      welcome: {
        title: 'Welcome to Marketer Dashboard',
        subtitle: 'Comprehensive platform for sports marketing management'
      },
      features: {
        campaigns: 'Manage marketing campaigns',
        analytics: 'Track performance and analytics',
        clients: 'Manage client relationships',
        reports: 'Generate marketing reports'
      },
      cta: {
        title: '🚀 Ready to launch?',
        description: 'Use the sidebar to access all available features'
      }
    },

    // ============================================
    // Club Dashboard
    // ============================================
    club: {
      welcome: {
        title: 'Welcome to Club Platform',
        subtitle: 'Comprehensive platform for managing sports club'
      },
      features: {
        players: 'Manage players and teams',
        performance: 'Track performance and analysis',
        contracts: 'Manage contracts and negotiations',
        communication: 'Communicate with agents and academies'
      },
      cta: {
        title: '🚀 Ready to launch?',
        description: 'Use the sidebar to access all available features'
      }
    },

    // ============================================
    // Academy Dashboard
    // ============================================
    academy: {
      welcome: {
        title: 'Welcome to Academy Platform',
        subtitle: 'Comprehensive platform for managing football academy'
      },
      features: {
        students: 'Manage players and training programs',
        progress: 'Track player progress',
        payments: 'Manage payments and subscriptions',
        communication: 'Effective communication with parents'
      },
      cta: {
        title: '🚀 Ready to launch?',
        description: 'Use the sidebar to access all available features'
      }
    },

    // ============================================
    // Trainer Dashboard
    // ============================================
    trainer: {
      welcome: {
        title: 'Welcome to Trainer Platform',
        subtitle: 'Comprehensive platform for managing sports training'
      },
      features: {
        programs: 'Manage training programs',
        progress: 'Track player progress',
        schedules: 'Manage schedules and sessions',
        communication: 'Communicate with academies and clubs'
      },
      cta: {
        title: '🚀 Ready to launch?',
        description: 'Use the sidebar to access all available features'
      }
    },

    // ============================================
    // Agent Dashboard
    // ============================================
    agent: {
      welcome: {
        title: 'Welcome to Agent Platform',
        subtitle: 'Comprehensive platform for managing sports agent business'
      },
      features: {
        players: 'Manage players and contracts',
        negotiations: 'Track negotiations and deals',
        commissions: 'Manage commissions and payments',
        communication: 'Communicate with clubs and academies'
      },
      cta: {
        title: '🚀 Ready to launch?',
        description: 'Use the sidebar to access all available features'
      }
    },

    stats: {
      totalUsers: 'Total Users',
      players: 'Players',
      organizations: 'Organizations & Clubs',
      supportedCurrencies: 'Supported Currencies',
      bulkPayments: 'Bulk Payments',
      totalRevenue: 'Total Revenue (Egyptian Pound)',
      inUse: 'In Use',
      fromLastMonth: 'From Last Month'
    },

    currency: {
      title: 'Multi-Currency System',
      description: 'Supported Currency • Automatic Conversion',
      lastUpdateTime: 'Last Update',
      refreshTooltip: 'Update live exchange rates from ExchangeRate-API',
      loadingStats: 'Loading currency statistics...',
      users: 'Users',
      payments: 'Payments',
      originalAmount: 'Original Amount',
      convertedToEGP: 'Converted to Egyptian Pound',
      egpCurrency: 'Pound'
    },

    activity: {
      title: 'Recent Activity',
      description: 'Latest system events',
      newBulkPayment: 'New bulk payment in Saudi Riyal (SAR)',
      ratesUpdated: 'Exchange rates updated - over 60 currencies updated',
      newPlayers: 'New players joined from different countries',
      usdPayment: 'Payment in US Dollar (automatically converted to Egyptian Pound)'
    },

    system: {
      title: 'System Status',
      description: 'All systems are running normally',
      currencyApi: 'Currency API',
      firebase: 'Firebase',
      paymentSystem: 'Payment System',
      performance: 'Performance',
      online: 'Online',
      connected: 'Connected',
      active: 'Active',
      excellent: 'Excellent'
    },

    // ============================================
    // Player Search
    // ============================================
    player: {
      search: {
        title: 'Search for Clubs, Agents, and Academies',
        subtitle: 'Search for sports entities and contact them directly',
        searchButton: 'Search',
        searchPlaceholder: 'Search by name, specialization, or country...',
        resultsCount: '{{count}} results',
        advancedFilters: 'Advanced Options',
        entityTypes: {
          club: 'Club',
          agent: 'Agent',
          scout: 'Scout',
          academy: 'Academy',
          sponsor: 'Sponsor',
          trainer: 'Trainer'
        },
        countries: {
          egypt: 'Egypt',
          saudiArabia: 'Saudi Arabia',
          uae: 'UAE',
          qatar: 'Qatar',
          kuwait: 'Kuwait',
          bahrain: 'Bahrain',
          oman: 'Oman',
          jordan: 'Jordan',
          lebanon: 'Lebanon',
          iraq: 'Iraq',
          morocco: 'Morocco',
          algeria: 'Algeria',
          tunisia: 'Tunisia',
          libya: 'Libya'
        },
        defaultNames: {
          club: 'Club Name',
          agent: 'Agent Name',
          academy: 'Academy Name',
          trainer: 'Trainer Name'
        },
        defaultDescriptions: {
          club: 'Club Description',
          agent: 'Agent Description',
          academy: 'Academy Description',
          trainer: 'Trainer Description'
        },
        defaultSpecializations: {
          football: 'Football',
          playerAgent: 'Player Agent',
          academy: 'Sports Academy',
          physicalTraining: 'Physical Training'
        },
        filters: {
          entityType: 'Entity Type',
          allTypes: 'All Types',
          country: 'Country',
          allCountries: 'All Countries',
          minRating: 'Minimum Rating',
          all: 'All'
        },
        services: {
          playerTraining: 'Player Training',
          youthPrograms: 'Youth Programs',
          officialCompetitions: 'Official Competitions',
          playerRepresentation: 'Player Representation',
          contractNegotiation: 'Contract Negotiation',
          advancedPrograms: 'Advanced Programs',
          talentDevelopment: 'Talent Development',
          personalTraining: 'Personal Training',
          preparationPrograms: 'Preparation Programs',
          sportsConsultations: 'Sports Consultations',
          legalConsultation: 'Legal Consultation',
          trainingCamps: 'Training Camps'
        },
        achievements: {
          fifaLicensed: 'FIFA Licensed',
          certified: 'Certified',
          advancedPrograms: 'Advanced Programs',
          advancedExperience: 'Advanced Experience',
          local: 'Local',
          bestAcademy: 'Best Academy',
          afcon: 'AFCON',
          egyptianLeague: 'Egyptian League',
          internationalCertification: 'International Certification'
        },
        languages: {
          arabic: 'Arabic',
          english: 'English'
        },
        stats: {
          followers: 'Followers',
          connections: 'Connections',
          deals: 'Deals'
        },
        actions: {
          viewProfile: 'View Detailed Profile',
          follow: 'Follow',
          following: 'Following',
          message: 'Message'
        },
        contact: {
          email: 'Email',
          phone: 'Phone',
          website: 'Website'
        },
        mockEntities: {
          alahly: {
            name: 'Al Ahly',
            location: { country: 'Egypt', city: 'Cairo' },
            description: 'Al Ahly Egyptian Sports Club',
            achievements: { afcon: 'AFCON', egyptianLeague: 'Egyptian League' }
          },
          starsAgency: {
            name: 'Stars Agency',
            location: { country: 'Egypt', city: 'Cairo' },
            description: 'Professional player representation agency',
            specialization: 'Player Agent',
            achievements: 'FIFA Licensed',
            services: { contractNegotiation: 'Contract Negotiation', legalConsultation: 'Legal Consultation' }
          },
          faisalAcademy: {
            name: 'Faisal Academy',
            location: { country: 'Egypt', city: 'Giza' },
            description: 'Sports academy specialized in talent development',
            specialization: 'Sports Academy',
            achievements: { bestAcademy: 'Best Academy', certified: 'Certified' },
            services: { youthPrograms: 'Youth Programs', talentDevelopment: 'Talent Development', trainingCamps: 'Training Camps' }
          },
          ahmedExpert: {
            name: 'Ahmed Expert',
            location: { country: 'Egypt', city: 'Alexandria' },
            description: 'Certified trainer with international experience',
            specialization: 'Physical Training',
            achievements: { certified: 'Certified', internationalCertification: 'International Certification' },
            services: { personalTraining: 'Personal Training', preparationPrograms: 'Preparation Programs', sportsConsultations: 'Sports Consultations' }
          },
          zamalek: {
            name: 'Zamalek',
            location: { country: 'Egypt', city: 'Giza' },
            description: 'Zamalek Egyptian Sports Club',
            achievements: { afcon: 'AFCON', egyptianLeague: 'Egyptian League' }
          }
        }
      },
      messages: {
        title: 'Message Center',
        subtitle: 'Communicate with clubs, agents, and academies'
      }
    },
    player: {
      welcome: {
        title: "Welcome to your dashboard",
        subtitle: "Manage your football career and connect with clubs, agents, and more."
      },
      features: {
        profile: "Complete your profile",
        progress: "Track your progress",
        subscriptions: "Manage your subscriptions",
        communication: "Communicate with clubs and agents"
      },
      cta: {
        title: "Ready to get started?",
        description: "Explore all features and take your career to the next level."
      }
    },
    videos: {
      loading: "Loading videos...",
      uploadedCount: "You have uploaded {{count}} out of {{max}} videos.",
      maxUpload: "Maximum videos allowed: {{max}}",
      notes: {
        maxVideos: "You can upload up to {{max}} videos.",
        formats: "Supported formats: MP4, MOV, AVI, etc.",
        quality: "Recommended quality: HD (720p) or higher.",
        description: "Please upload clear and recent videos showcasing your skills."
      },
      howToUpload: {
        title: "How to Upload Videos",
        youtube: {
          title: "Upload from YouTube",
          step1: "Go to YouTube and upload your video.",
          step2: "Copy the video link.",
          step3: "Paste the link in the field above.",
          step4: "Click 'Add Video'.",
          step5: "Wait for the video to be processed.",
          step6: "Your video will appear in the list below.",
          step7: "Make sure your video is public or unlisted."
        },
        tiktok: {
          title: "Upload from TikTok",
          step1: "Open TikTok and upload your video.",
          step2: "Copy the video link.",
          step3: "Paste the link in the field above.",
          step4: "Click 'Add Video'.",
          step5: "Wait for the video to be processed.",
          step6: "Your video will appear in the list below."
        },
        platform: {
          title: "Upload from Device",
          step1: "Click 'Upload Video'.",
          step2: "Select a video file from your device.",
          step3: "Wait for the upload to complete.",
          step4: "Your video will appear in the list below."
        }
      }
    }
  },

  // ============================================
  // User Management
  // ============================================
  users: {
    title: 'User Management',
    subtitle: 'Comprehensive management of all user types on the platform',
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    newUsersToday: 'New Users Today',
    verifiedUsers: 'Verified Users',
    
    types: {
      all: 'All Users',
      players: 'Players',
      clubs: 'Clubs',
      academies: 'Academies',
      trainers: 'Trainers',
      agents: 'Player Agents',
      scouts: 'Scouts',
      independent: 'Independent'
    },

    status: {
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      verified: 'Verified',
      unverified: 'Unverified',
      suspended: 'Suspended'
    },

    actions: {
      viewProfile: 'View Profile',
      editUser: 'Edit User',
      verifyUser: 'Verify User',
      suspendUser: 'Suspend User',
      deleteUser: 'Delete User',
      sendMessage: 'Send Message',
      viewPayments: 'View Payments'
    }
  },

  // ============================================
  // Payments
  // ============================================
  payments: {
    title: 'Payment & Subscription Management',
    subtitle: 'Integrated system for managing all financial transactions',
    
    stats: {
      totalPayments: 'Total Payments',
      successfulPayments: 'Successful Payments',
      failedPayments: 'Failed Payments',
      pendingPayments: 'Pending Payments',
      totalRevenue: 'Total Revenue',
      monthlyRevenue: 'Monthly Revenue'
    },

    status: {
      success: 'Success',
      failed: 'Failed',
      pending: 'Pending',
      refunded: 'Refunded',
      cancelled: 'Cancelled'
    },

    types: {
      subscription: 'Subscription',
      bulkPayment: 'Bulk Payment',
      individual: 'Individual Payment',
      premium: 'Premium Package'
    }
  },

  // ============================================
  // Reports
  // ============================================
  reports: {
    title: 'Reports & Statistics',
    subtitle: 'Comprehensive reports and advanced statistics',
    
    types: {
      financial: 'Financial Reports',
      users: 'User Reports',
      activity: 'Activity Reports',
      performance: 'Performance Reports',
      security: 'Security Reports'
    },

    periods: {
      today: 'Today',
      week: 'This Week',
      month: 'This Month',
      quarter: 'This Quarter',
      year: 'This Year',
      custom: 'Custom Period'
    }
  },

  // ============================================
  // Settings
  // ============================================
  settings: {
    title: 'System Settings',
    subtitle: 'Manage platform settings and permissions',
    
    categories: {
      general: 'General Settings',
      security: 'Security & Protection',
      notifications: 'Notifications',
      payments: 'Payment Settings',
      currencies: 'Currency Settings',
      permissions: 'Permissions & Roles'
    }
  },

  // ============================================
  // System Monitoring
  // ============================================
  system: {
    title: 'System Monitoring',
    subtitle: 'Comprehensive monitoring of system performance and health',
    
    health: {
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      critical: 'Critical'
    },

    metrics: {
      uptime: 'Uptime',
      responseTime: 'Response Time',
      throughput: 'Throughput',
      errorRate: 'Error Rate',
      activeConnections: 'Active Connections',
      cpuUsage: 'CPU Usage',
      memoryUsage: 'Memory Usage',
      diskUsage: 'Disk Usage'
    },

    services: {
      firebase: 'Firebase',
      supabase: 'Supabase',
      paymentGateway: 'Payment Gateway',
      emailService: 'Email Service',
      smsService: 'SMS Service',
      fileStorage: 'File Storage',
      cdn: 'Content Delivery Network'
    }
  },

  // ============================================
  // Media Management
  // ============================================
  media: {
    title: 'Media & Storage Management',
    subtitle: 'Comprehensive management of all files and media',
    
    types: {
      images: 'Images',
      videos: 'Videos',
      documents: 'Documents',
      audio: 'Audio Files',
      other: 'Other Files'
    },

    storage: {
      totalUsed: 'Total Used',
      totalAvailable: 'Total Available',
      buckets: 'Buckets',
      files: 'Files'
    }
  },

  // ============================================
  // UI Elements
  // ============================================
  ui: {
    search: 'Search...',
    filter: 'Filter',
    sort: 'Sort',
    noData: 'No data available',
    loading: 'Loading...',
    error: 'Error occurred',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    first: 'First',
    last: 'Last',
    page: 'Page',
    of: 'of',
    showing: 'Showing',
    to: 'to',
    entries: 'entries',
    perPage: 'per page'
  },

  // ============================================
  // Time & Date
  // ============================================
  time: {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    daysAgo: 'days ago',
    weeksAgo: 'weeks ago',
    monthsAgo: 'months ago',
    yearsAgo: 'years ago'
  },

  // ============================================
  // Notifications
  // ============================================
  notifications: {
    title: 'Notifications',
    new: 'New',
    read: 'Read',
    unread: 'Unread',
    markAsRead: 'Mark as Read',
    markAsUnread: 'Mark as Unread',
    deleteNotification: 'Delete Notification',
    clearAll: 'Clear All',
    noNotifications: 'No notifications'
  },

  // ============================================
  // User Profile
  // ============================================
  profile: {
    personalInfo: 'Personal Information',
    contactInfo: 'Contact Information',
    securitySettings: 'Security Settings',
    preferences: 'Preferences',
    activity: 'Activity',
    statistics: 'Statistics'
  },

  // ============================================
  // Account Types
  // ============================================
  accountTypes: {
    player: 'Player',
    club: 'Club',
    agent: 'Agent',
    academy: 'Academy',
    trainer: 'Trainer',
    admin: 'Administrator',
    marketer: 'Marketer',
    parent: 'Parent'
  },

  // ============================================
  // Authentication
  // ============================================
  auth: {
    login: 'Login',
    register: 'Create Account',
    logout: 'Logout',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    phone: 'Phone Number',
    fullName: 'Full Name',
    country: 'Country',
    accountType: 'Account Type',
    terms: 'I agree to the Terms and Conditions',
    privacy: 'Privacy Policy',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    signIn: 'Sign In',
    signUp: 'Sign Up',
    verifyOTP: 'Verify OTP Code',
    resendOTP: 'Resend OTP',
    otpSent: 'Verification code sent',
    invalidOTP: 'Invalid verification code',
    loginSuccess: 'Login successful',
    registerSuccess: 'Account created successfully',
    loginError: 'Login failed',
    registerError: 'Account creation failed'
  },

  // ============================================
  // Login Page
  // ============================================
  login: {
    title: 'Login',
    subtitle: 'Welcome back to the Dream Platform',
    form: {
      email: 'Email',
      phone: 'Phone Number',
      password: 'Password',
      rememberMe: 'Remember Me',
      login: 'Login',
      loginWithPhone: 'Login with Phone Number',
      loginWithEmail: 'Login with Email',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      register: 'Register Now',
      loading: 'Logging in...',
      success: 'Login successful',
      error: 'Login failed',
      country: 'Country',
      digits: 'digits',
      enterEmail: 'Enter email',
      enterPhone: 'Enter phone number',
      enterPassword: 'Enter password',
      invalidEmail: 'Invalid email',
      invalidPhone: 'Invalid phone number',
      invalidPassword: 'Invalid password',
      phoneRequired: 'Phone number is required',
      passwordRequired: 'Password is required',
      emailRequired: 'Email is required'
    },
    messages: {
      loginSuccess: 'Login successful! Welcome back.',
      loginError: 'Login failed. Please check your credentials.',
      invalidCredentials: 'Invalid email or password.',
      accountNotFound: 'Account not found.',
      networkError: 'Network error. Please try again.',
      serverError: 'Server error. Please try again later.',
      tooManyAttempts: 'Too many login attempts. Please try again later.',
      accountLocked: 'Account is locked. Please contact support.',
      verificationRequired: 'Please verify your account first.',
      passwordResetRequired: 'Please reset your password.'
    },
    social: {
      loginWithGoogle: 'Login with Google',
      loginWithFacebook: 'Login with Facebook',
      loginWithApple: 'Login with Apple',
      or: 'or'
    },
    help: {
      forgotPassword: 'Forgot your password?',
      resetPassword: 'Reset Password',
      contactSupport: 'Contact Support',
      createAccount: 'Create New Account'
    }
  },

  // ============================================
  // Errors and Messages
  // ============================================
  errors: {
    general: 'An unexpected error occurred',
    network: 'Network connection error',
    server: 'Server error',
    validation: 'Invalid data',
    notFound: 'Page not found',
    unauthorized: 'Access denied',
    forbidden: 'Access forbidden',
    timeout: 'Request timeout',
    tooManyRequests: 'Too many requests',
    maintenance: 'Site under maintenance'
  },

  messages: {
    success: 'Operation completed successfully',
    error: 'An error occurred',
    warning: 'Warning',
    info: 'Information',
    confirm: 'Are you sure?',
    deleteConfirm: 'Are you sure you want to delete?',
    unsavedChanges: 'You have unsaved changes',
    saveChanges: 'Save Changes',
    discardChanges: 'Discard Changes'
  },

  // ============================================
  // Football
  // ============================================
  football: {
    positions: {
      goalkeeper: 'Goalkeeper',
      defender: 'Defender',
      midfielder: 'Midfielder',
      forward: 'Forward',
      striker: 'Striker',
      winger: 'Winger'
    },
    
    skills: {
      technical: 'Technical Skills',
      physical: 'Physical Skills',
      mental: 'Mental Skills',
      tactical: 'Tactical Skills'
    },

    levels: {
      beginner: 'Beginner',
      intermediate: 'Intermediate',
      advanced: 'Advanced',
      professional: 'Professional',
      elite: 'Elite'
    }
  },

  // ============================================
  // Home Page
  // ============================================
  home: {
    navigation: {
      services: "Services",
      clubs: "Clubs",
      team: "Team",
      branches: "Branches",
      contact: "Contact",
      login: "Login",
      startJourney: "Start Journey"
    },
    sections: {
    hero: {
      slide1: {
          title: "El7hm Sports Platform",
          subtitle: "Connecting Players to Global Opportunities"
      },
      slide2: {
          title: "Club & Player Management",
          subtitle: "Comprehensive Sports Platform"
      },
      slide3: {
          title: "Player Agencies",
          subtitle: "Professional Representation Services"
      },
      slide4: {
          title: "Sports Academies",
          subtitle: "Talent Development & Training"
      },
      slide5: {
          title: "Professional Trainers",
          subtitle: "Specialized & Advanced Training"
      },
      slide6: {
          title: "Scouts & Talents",
          subtitle: "Talent Discovery & Development"
      },
      slide7: {
          title: "Sponsors & Partners",
          subtitle: "Strategic Partnerships"
      }
    },
      partners: {
        title: "Our Partners",
        subtitle: "Strategic partnerships with leading organizations",
        fifa: "FIFA",
        qfa: "QFA",
        qfc: "QFC",
        microsoft: "Microsoft",
        peachscore: "PeachScore",
        yjppg: "YJPPG"
      },
      stats: {
        players: "Players",
        clubs: "Clubs",
        countries: "Countries",
        success: "Success Stories"
    },
    services: {
      performanceAnalysis: {
        title: "Performance Analysis",
          description: "Comprehensive player performance evaluation and analytics",
        button: "Learn More"
      },
      professionalOffers: {
        title: "Professional Offers",
          description: "Connect with top clubs and professional opportunities",
        button: "Learn More"
      },
      internationalTrials: {
        title: "International Trials",
          description: "Access to international trials and scouting events",
        button: "Learn More"
      },
      negotiationAgency: {
        title: "Negotiation Agency",
          description: "Professional contract negotiation and representation",
        button: "Learn More"
      },
      legalContracts: {
          title: "Legal Contracts",
          description: "Legal contract review and compliance services",
        button: "Learn More"
      },
      logisticsServices: {
          title: "Logistics Services",
          description: "Complete logistics support for player transfers",
        button: "Learn More"
      }
    },
      clubs: {
        title: "Our Partner Clubs",
        alain: "Al Ain",
        alshamal: "Al Shamal",
        alshahania: "Al Shahania",
        alhilal: "Al Hilal",
        alnasr: "Al Nasr",
        zamalek: "Zamalek",
        alnasruae: "Al Nasr UAE",
        almukalla: "Al Mukalla",
        aldohail: "Al Dohail",
        ajman: "Ajman"
      },
    team: {
      title: "Our Team",
      members: {
        ceo: {
            name: "CEO Name",
          role: "Chief Executive Officer",
            description: "Leading the company's strategic vision and operations"
        },
        cto: {
            name: "CTO Name",
            role: "Chief Technology Officer",
            description: "Overseeing all technological aspects of the platform"
        },
        cfo: {
            name: "CFO Name",
            role: "Chief Financial Officer",
            description: "Managing financial operations and strategic planning"
        },
        legal: {
            name: "Legal Name",
          role: "Legal Advisor",
            description: "Ensuring compliance and legal matters"
        }
      }
    },
    footer: {
      team: "Team"
    },
    branches: {
      title: "Our Branches",
      cities: {
        riyadh: "Riyadh",
        dubai: "Dubai",
        doha: "Doha",
        cairo: "Cairo"
      },
      locations: {
        saudiArabia: "Saudi Arabia",
          uae: "UAE",
          qatar: "Qatar",
        egypt: "Egypt"
      },
      addresses: {
          riyadh: "Riyadh Address",
          dubai: "Dubai Address",
          doha: "Doha Address",
          cairo: "Cairo Address"
      }
    },
    contact: {
      joinUs: {
          title: "Join Us",
          subtitle: "Connect with our team",
          callToAction: "Get Started"
        },
      countries: {
        egypt: "Egypt",
        qatar: "Qatar"
        },
        whatsapp: "WhatsApp"
      }
    },
    packages: {
      package1: {
          title: "Basic Package",
        features: {
            analysis: "Performance Analysis",
            exposure: "Player Exposure",
            tests: "Evaluation Tests",
            support: "Basic Support"
        }
      },
      package2: {
          title: "Advanced Package",
        features: {
            analysis: "Advanced Performance Analysis",
            exposure: "Enhanced Player Exposure",
            tests: "Comprehensive Tests",
            support: "Advanced Support"
        }
      },
      package3: {
          title: "Professional Package",
        features: {
            analysis: "Comprehensive Professional Analysis",
            exposure: "Global Professional Exposure",
            tests: "Professional Tests",
            support: "24/7 Professional Support"
          }
        }
      }
    },
  header: {
    logoAlt: "El7hm Logo",
    searchPlaceholder: "Search...",
    loginButton: "Login",
    menuToggle: "Toggle Menu",
    defaultPlayerName: "Player",
    nav: {
      home: "Home",
      about: "About Us",
      services: "Services",
      contact: "Contact Us"
    },
    languageToggle: 'Switch language'
  },
  footer: {
    logoAlt: "El7hm",
    companyName: "El7hm (el7lm) under Misk Holding",
    copyright: "© {{year}} All rights reserved",
    about: "About Platform",
    contact: "Contact Us",
    privacy: "Privacy Policy",
    defaultPlayerName: "Player",
    facebook: "Facebook",
    instagram: "Instagram",
    linkedin: "LinkedIn",
    tiktok: "TikTok"
  },
  register: {
    title: "Create New Account",
    subtitle: "Join our sports community through phone verification",
    form: {
      fullName: "Full Name",
      enterFullName: "Enter your full name",
      country: "Country",
      selectCountry: "Select Country",
      phone: "Phone Number",
      password: "Password",
      confirmPassword: "Confirm Password",
      enterPassword: "Enter password",
      reEnterPassword: "Re-enter password",
      min8Chars: "At least 8 characters",
      agreeToTerms: "I agree to the",
      termsAndConditions: "Terms and Conditions",
      verifyPhone: "Verify Phone Number",
      checkingData: "Checking data...",
      phoneAvailable: "Phone number available",
      checkingPhone: "Checking phone number...",
      phoneExists: "Phone number already exists",
      phoneInvalid: "Invalid phone number",
      phoneExample: "Example",
      digits: "digits",
      whatsapp: "WhatsApp",
      sms: "SMS"
    },
    validation: {
      fullNameRequired: "Full name is required",
      countryRequired: "Country is required",
      phoneRequired: "Phone number is required",
      phoneInvalid: "Invalid phone number",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 8 characters",
      passwordMismatch: "Passwords do not match",
      accountTypeRequired: "Account type is required",
      termsRequired: "You must agree to the terms and conditions"
    },
    messages: {
      alreadyHaveAccount: "Already have an account?",
      login: "Login",
      forgotPassword: "Forgot Password?",
      verificationCancelled: "Phone verification cancelled."
    },
    accountTypes: {
      player: "Player",
      club: "Club",
      agent: "Agent",
      academy: "Academy",
      trainer: "Trainer",
      admin: "Administrator",
      marketer: "Marketer",
      parent: "Parent"
    },
    terms: {
      title: "Terms and Conditions and Privacy Policy",
      introduction: {
        title: "1. Introduction",
        content: "Welcome to El7hm platform. We provide specialized sports services aimed at connecting players with suitable opportunities."
      },
      registration: {
        title: "2. Registration Terms",
        items: [
          "You must be over 16 years old to register on the platform",
          "You must provide accurate and correct information when registering",
          "You must keep your account information confidential",
          "We have the right to suspend any account that violates the terms of use"
        ]
      },
      privacy: {
        title: "3. Privacy Policy",
        items: [
          "We protect your personal information and respect your privacy",
          "We will not share your information with any third party without your consent",
          "You can request deletion of your account and data at any time",
          "We use advanced encryption technologies to protect your data"
        ]
      }
    }
  },
  sidebar: {
    player: {
      title: 'Player Platform',
      home: 'Home',
      profile: 'Profile',
      reports: 'Reports',
      videos: 'Video Management',
      playerVideos: 'Player Videos',
      search: 'Search Opportunities & Clubs',
      stats: 'Statistics',
      subscriptions: 'Subscription Management',
      subscriptionStatus: 'Subscription Status'
    },
    club: {
      title: 'Club Platform',
      home: 'Home',
      profile: 'Profile',
      players: 'Player Search',
      playerVideos: 'Player Videos',
      contracts: 'Contract Management',
      marketing: 'Player Marketing',
      analysis: 'Performance Analysis',
      marketValues: 'Player Market Values',
      negotiations: 'Negotiation Services',
      evaluation: 'Player Evaluation',
      bulkPayment: 'Bulk Player Payment',
      billing: 'Billing'
    },
    agent: {
      title: 'Agent Platform',
      home: 'Home',
      profile: 'Profile',
      players: 'Player Management',
      negotiations: 'Negotiations',
      reports: 'Reports'
    },
    academy: {
      title: 'Academy Platform',
      home: 'Home',
      profile: 'Profile',
      players: 'Player Management',
      training: 'Training Programs',
      evaluation: 'Player Evaluation',
      reports: 'Reports'
    },
    trainer: {
      title: 'Trainer Platform',
      home: 'Home',
      profile: 'Profile',
      players: 'Player Management',
      training: 'Training Programs',
      evaluation: 'Player Evaluation',
      reports: 'Reports'
    },
    admin: {
      title: 'Admin Platform',
      home: 'Home',
      profile: 'Profile',
      users: 'User Management',
      reports: 'Reports',
      settings: 'Settings'
    },
    marketer: {
      title: 'Marketer Platform',
      home: 'Home',
      profile: 'Profile',
      campaigns: 'Campaigns',
      reports: 'Reports'
    },
    parent: {
      title: 'Parent Platform',
      home: 'Home',
      profile: 'Profile',
      children: 'Children Management',
      reports: 'Reports'
    },
    common: {
      messages: 'Messages',
      notifications: 'Notifications',
      changePassword: 'Change Password',
      logout: 'Logout'
    }
  },

  // ============================================
  // OTP Verification
  // ============================================
  otp: {
    title: "Phone Number Verification",
    subtitle_sms: "Verification code sent to your phone",
    subtitle_whatsapp: "Verification code sent via WhatsApp",
    resend: "Resend Code",
    sending: "Sending...",
    cancel: "Cancel",
    inputLabel: "Enter the 6-digit verification code",
    timeLeft: "Time Remaining",
    expired: "Code Expired",
    attemptsLeft: "Attempts Remaining",
    helpText: "Make sure your phone is connected to the internet to receive the message"
  }
};

export default en; 