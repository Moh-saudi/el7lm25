// src/types/index.ts
import { 
  BaseEntity, 
  AccountType, 
  DateOrTimestamp,
  Currency,
  ContactInfo,
  Address,
  MediaFile
} from './common';

export interface Player extends BaseEntity {
  name: string;
  phone: string;
  email?: string;
  dateOfBirth: string;
  position: string;
  height?: number;
  weight?: number;
  nationality: string;
  currentClub?: string;
  previousClubs?: string[];
  achievements?: string[];
  videoUrls?: string[];
  photoUrls?: string[];
  documents?: string[];
}

export interface Club extends BaseEntity {
  name: string;
  country: string;
  city: string;
  league: string;
  contactPerson: string;
  email: string;
  phone: string;
  requirements?: string[];
}

export interface Agent extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  experience: number;
  representedPlayers?: string[];
  successfulDeals?: number;
}

export interface Admin extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  role: 'superadmin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin?: DateOrTimestamp;
  createdBy?: string;
}

export interface UserProfile extends BaseEntity {
  uid: string;
  type: AccountType;
  email: string;
  phone: string;
  verified: boolean;
  profileCompleted: boolean;
}

export type UserRole = AccountType;

// Re-export all types from common
export * from './common';
export * from './admin';
export * from './employees';
export * from './player';
