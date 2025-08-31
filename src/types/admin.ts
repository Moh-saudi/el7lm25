// Admin User Management Types
import { 
  BaseEntity, 
  AccountType, 
  SubscriptionStatus, 
  ContentStatus, 
  ProfileStatus,
  DateOrTimestamp,
  Currency,
  PaginationParams,
  BaseFilter
} from './common';

export interface User extends BaseEntity {
  email: string;
  displayName?: string;
  full_name?: string;
  phone?: string;
  country?: string;
  city?: string;
  accountType: AccountType;
  isAdmin?: boolean;
  isModerator?: boolean;
  canPublishContent?: boolean;
  lastLoginAt?: DateOrTimestamp;
  isActive: boolean;
  subscription?: SubscriptionInfo;
  playerCount?: number; // للمؤسسات
  publishedContent?: number;
  pendingApproval?: number;
}

export interface SubscriptionInfo {
  id: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: DateOrTimestamp;
  endDate: DateOrTimestamp;
  amount: number;
  currency: Currency;
  autoRenew: boolean;
  paymentMethod: string;
  discountAmount?: number;
  promoCode?: string;
}

export interface Player extends BaseEntity {
  full_name: string;
  email?: string;
  phone?: string;
  organizationId?: string;
  organizationType?: AccountType;
  organizationName?: string;
  profileStatus: ProfileStatus;
  addedBy?: {
    accountType: AccountType;
    accountId: string;
    accountName: string;
    dateAdded: DateOrTimestamp;
  };
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

export interface FilterState extends BaseFilter {
  accountType: string;
  subscriptionStatus: string;
  contentStatus: string;
  country?: string;
  city?: string;
}

// Admin specific types
export interface AdminUser extends User {
  role: 'superadmin' | 'admin' | 'moderator';
  permissions: string[];
  createdBy?: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'suspend';
  targetType: 'user' | 'player' | 'content' | 'payment' | 'subscription';
  targetId: string;
  details?: Record<string, unknown>;
  timestamp: DateOrTimestamp;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  resource: string;
  resourceId: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: DateOrTimestamp;
}

export interface AdminNotification {
  id: string;
  adminId: string;
  type: 'system' | 'user' | 'payment' | 'subscription' | 'content';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: DateOrTimestamp;
  actionUrl?: string;
}

export interface AdminDashboard {
  stats: DashboardStats;
  recentUsers: User[];
  recentPayments: PaymentRecord[];
  pendingApprovals: ApprovalRequest[];
  systemAlerts: SystemAlert[];
}

export interface PaymentRecord {
  id: string;
  userId: string;
  amount: number;
  currency: Currency;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  timestamp: DateOrTimestamp;
  description?: string;
}

export interface ApprovalRequest {
  id: string;
  userId: string;
  userType: AccountType;
  requestType: 'profile' | 'content' | 'subscription' | 'payment';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: DateOrTimestamp;
  reviewedAt?: DateOrTimestamp;
  reviewedBy?: string;
  notes?: string;
}

export interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: DateOrTimestamp;
  isResolved: boolean;
  resolvedAt?: DateOrTimestamp;
  resolvedBy?: string;
} 
