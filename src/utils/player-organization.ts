// utils/player-organization.ts - دوال مساعدة لتحديد انتماء اللاعبين
import { AccountType } from '../types/common';
import { Player } from '../types/player';

export interface PlayerOrganizationInfo {
  type: 'club' | 'academy' | 'trainer' | 'agent' | 'independent';
  id: string | null;
  typeArabic: string;
  emoji: string;
}

// Type for player data that might have organization fields
export interface PlayerWithOrganization extends Partial<Player> {
  club_id?: string;
  clubId?: string;
  academy_id?: string;
  academyId?: string;
  trainer_id?: string;
  trainerId?: string;
  agent_id?: string;
  agentId?: string;
  organizationId?: string;
  organizationType?: string;
  organizationName?: string;
}

/**
 * تحديد الجهة التابع لها اللاعب مع دعم كلا التنسيقين (club_id و clubId)
 */
export function getPlayerOrganization(playerData: PlayerWithOrganization): PlayerOrganizationInfo {
  console.log('🔍 تحديد انتماء اللاعب:', {
    club_id: playerData?.club_id,
    clubId: playerData?.clubId,
    academy_id: playerData?.academy_id,
    academyId: playerData?.academyId,
    trainer_id: playerData?.trainer_id,
    trainerId: playerData?.trainerId,
    agent_id: playerData?.agent_id,
    agentId: playerData?.agentId,
  });

  // البحث عن النادي
  const clubId = playerData?.club_id || playerData?.clubId;
  if (clubId) {
    console.log('✅ اللاعب تابع لنادي:', clubId);
    return {
      type: 'club',
      id: clubId,
      typeArabic: 'نادي',
      emoji: '🏢'
    };
  }

  // البحث عن الأكاديمية
  const academyId = playerData?.academy_id || playerData?.academyId;
  if (academyId) {
    console.log('✅ اللاعب تابع لأكاديمية:', academyId);
    return {
      type: 'academy',
      id: academyId,
      typeArabic: 'أكاديمية',
      emoji: '🏆'
    };
  }

  // البحث عن المدرب
  const trainerId = playerData?.trainer_id || playerData?.trainerId;
  if (trainerId) {
    console.log('✅ اللاعب تابع لمدرب:', trainerId);
    return {
      type: 'trainer',
      id: trainerId,
      typeArabic: 'مدرب',
      emoji: '👨‍🏫'
    };
  }

  // البحث عن الوكيل
  const agentId = playerData?.agent_id || playerData?.agentId;
  if (agentId) {
    console.log('✅ اللاعب تابع لوكيل:', agentId);
    return {
      type: 'agent',
      id: agentId,
      typeArabic: 'وكيل لاعبين',
      emoji: '💼'
    };
  }

  console.log('⚠️ اللاعب مستقل - لا يتبع لأي جهة');
  return {
    type: 'independent',
    id: null,
    typeArabic: 'مستقل',
    emoji: '🔥'
  };
}

/**
 * تحويل نوع الحساب إلى AccountType للمكتبات
 */
export function getAccountTypeFromPlayer(playerData: PlayerWithOrganization): AccountType {
  const org = getPlayerOrganization(playerData);
  
  switch (org.type) {
    case 'club':
      return 'club';
    case 'academy':
      return 'academy';
    case 'trainer':
      return 'trainer';
    case 'agent':
      return 'agent';
    default:
      return 'trainer'; // افتراضي
  }
}

/**
 * فحص شامل لبيانات اللاعب لأغراض التشخيص
 */
export function debugPlayerOrganization(playerData: PlayerWithOrganization): PlayerOrganizationInfo {
  console.group('🔍 تشخيص شامل لانتماء اللاعب');
  console.log('📋 بيانات اللاعب الكاملة:', playerData);
  
  const organization = getPlayerOrganization(playerData);
  console.log('🎯 النتيجة النهائية:', organization);
  
  console.log('📊 فحص مفصل للحقول:');
  const fields: Array<{ name: string; value?: string }> = [
    { name: 'club_id', value: playerData?.club_id },
    { name: 'clubId', value: playerData?.clubId },
    { name: 'academy_id', value: playerData?.academy_id },
    { name: 'academyId', value: playerData?.academyId },
    { name: 'trainer_id', value: playerData?.trainer_id },
    { name: 'trainerId', value: playerData?.trainerId },
    { name: 'agent_id', value: playerData?.agent_id },
    { name: 'agentId', value: playerData?.agentId },
  ];

  fields.forEach(field => {
    if (field.value) {
      console.log(`✅ ${field.name}:`, field.value);
    } else {
      console.log(`⚪ ${field.name}: غير موجود`);
    }
  });

  console.groupEnd();
  return organization;
}

/**
 * تحديث بيانات اللاعب لتوحيد تنسيق الحقول
 */
export function normalizePlayerData(playerData: PlayerWithOrganization): PlayerWithOrganization {
  const normalized: PlayerWithOrganization = { ...playerData };

  // توحيد حقل النادي
  if (normalized.clubId && !normalized.club_id) {
    normalized.club_id = normalized.clubId;
  }

  // توحيد حقل الأكاديمية
  if (normalized.academyId && !normalized.academy_id) {
    normalized.academy_id = normalized.academyId;
  }

  // توحيد حقل المدرب
  if (normalized.trainerId && !normalized.trainer_id) {
    normalized.trainer_id = normalized.trainerId;
  }

  // توحيد حقل الوكيل
  if (normalized.agentId && !normalized.agent_id) {
    normalized.agent_id = normalized.agentId;
  }

  console.log('🔄 تم توحيد بيانات اللاعب:', {
    original: playerData,
    normalized: normalized
  });

  return normalized;
} 
