// src/types/index.ts

export interface Player {
    id: string;
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
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Club {
    id: string;
    name: string;
    country: string;
    city: string;
    league: string;
    contactPerson: string;
    email: string;
    phone: string;
    requirements?: string[];
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface Agent {
    id: string;
    name: string;
    email: string;
    phone: string;
    licenseNumber?: string;
    experience: number;
    representedPlayers?: string[];
    successfulDeals?: number;
    createdAt: Date;
    updatedAt: Date;
  }

  export interface Admin {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'superadmin' | 'admin' | 'moderator';
    permissions: string[];
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
    createdBy?: string;
  }
  
  export interface UserProfile {
    uid: string;
    type: 'player' | 'club' | 'agent' | 'academy' | 'trainer' | 'admin';
    email: string;
    phone: string;
    verified: boolean;
    profileCompleted: boolean;
    createdAt: Date;
    updatedAt: Date;
  }

export type UserRole = 'player' | 'club' | 'agent' | 'academy' | 'trainer' | 'admin' | 'marketer' | 'parent';
