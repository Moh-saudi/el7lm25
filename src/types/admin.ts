// Admin User Management Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  full_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  accountType: 'player' | 'club' | 'academy' | 'trainer' | 'agent';
  isAdmin?: boolean;
  isModerator?: boolean;
  canPublishContent?: boolean;
  createdAt: any;
  lastLoginAt?: any;
  isActive: boolean;
  subscription?: SubscriptionInfo;
  playerCount?: number; // للمؤسسات
  publishedContent?: number;
  pendingApproval?: number;
}

export interface SubscriptionInfo {
  id: string;
  planName: string;
  status: 'active' | 'pending' | 'expired' | 'cancelled';
  startDate: any;
  endDate: any;
  amount: number;
  currency: string;
  autoRenew: boolean;
  paymentMethod: string;
  discountAmount?: number;
  promoCode?: string;
}

export interface Player {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  organizationId?: string;
  organizationType?: 'club' | 'academy' | 'trainer' | 'agent';
  organizationName?: string;
  profileStatus: 'published' | 'pending' | 'rejected' | 'draft';
  addedBy?: {
    accountType: string;
    accountId: string;
    accountName: string;
    dateAdded: any;
  };
  createdAt: any;
}

export interface DashboardStats {
  totalUsers: number;
  independentUsers: number;
  organizations: number;
  managedPlayers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  publishedContent: number;
  pendingApproval: number;
  rejectedContent: number;
}

export interface OrganizationWithPlayers extends User {
  players: Player[];
  maxPlayers: number;
  usedSlots: number;
}

export interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export interface FilterState {
  searchTerm: string;
  accountType: string;
  subscriptionStatus: string;
  contentStatus: string;
  dateRange?: { start: Date; end: Date };
  country?: string;
  city?: string;
} 