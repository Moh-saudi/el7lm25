import { PlayerFormData, Achievement } from '@/types/player';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import React, { useState } from 'react';

dayjs.locale('ar');

// دالة حساب العمر
const calculateAge = (birthDate: any) => {
  if (!birthDate) return null;
  try {
    let d: Date;
    if (typeof birthDate === 'object' && birthDate.toDate && typeof birthDate.toDate === 'function') {
      d = birthDate.toDate();
    } else if (birthDate instanceof Date) {
      d = birthDate;
    } else {
      d = new Date(birthDate);
    }
    
    if (isNaN(d.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    return null;
  }
};

interface PlayerReportViewProps {
  player: PlayerFormData;
}

const TABS = [
  { key: 'personal', label: 'البيانات الشخصية' },
  { key: 'education', label: 'التعليم' },
  { key: 'medical', label: 'السجل الطبي' },
  { key: 'sports', label: 'المعلومات الرياضية' },
  { key: 'skills', label: 'المهارات' },
  { key: 'objectives', label: 'الأهداف' },
  { key: 'media', label: 'الوسائط' },
  { key: 'contracts', label: 'العقود' },
];

const OBJECTIVES_LABELS: Record<string, string> = {
  european_leagues: "الدوريات الأوروبية",
  arab_leagues: "الدوريات العربية",
  local_leagues: "الدوريات المحلية",
  professional: "الاحتراف",
  training: "التدريب",
  trials: "التجارب",
};

const PlayerReportView: React.FC<PlayerReportViewProps> = ({ player }) => {
  const [activeTab, setActiveTab] = useState('personal');

  // تحويل بيانات المهارات لمخططات الرادار (يمكنك نقلها لمكون منفصل إذا أردت)
  const technicalSkillsData = player?.technical_skills
    ? Object.entries(player.technical_skills).map(([key, value]) => ({
        skill: key === 'ball_control' ? 'التحكم بالكرة'
              : key === 'passing' ? 'التمرير'
              : key === 'shooting' ? 'التسديد'
              : key === 'dribbling' ? 'المراوغة'
              : key,
        value: Number(value)
      }))
    : [];

  // ... يمكنك إضافة باقي المهارات إذا أردت

  // عرض البيانات الشخصية
  const renderPersonalInfo = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">الاسم الكامل</div>
        <div className="text-lg font-bold text-blue-900">{player?.full_name || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">تاريخ الميلاد</div>
        <div className="text-lg font-bold text-green-900">
          {player?.birth_date ? dayjs(player.birth_date).format('DD/MM/YYYY') : '--'}
        </div>
      </div>
      <div className="p-4 rounded-lg bg-orange-50">
        <div className="mb-1 font-semibold text-orange-700">العمر</div>
        <div className="text-lg font-bold text-orange-900">
          {(() => {
            const age = calculateAge(player?.birth_date);
            return age ? `${age} سنة` : '--';
          })()}
        </div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">الجنسية</div>
        <div className="text-lg font-bold text-purple-900">{player?.nationality || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">المدينة</div>
        <div className="text-lg font-bold text-yellow-900">{player?.city || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-red-50">
        <div className="mb-1 font-semibold text-red-700">الدولة</div>
        <div className="text-lg font-bold text-red-900">{player?.country || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-indigo-50">
        <div className="mb-1 font-semibold text-indigo-700">رقم الهاتف</div>
        <div className="text-lg font-bold text-indigo-900">{player?.phone || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-pink-50">
        <div className="mb-1 font-semibold text-pink-700">واتساب</div>
        <div className="text-lg font-bold text-pink-900">{player?.whatsapp || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-orange-50">
        <div className="mb-1 font-semibold text-orange-700">البريد الإلكتروني</div>
        <div className="text-lg font-bold text-orange-900">{player?.email || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-teal-50">
        <div className="mb-1 font-semibold text-teal-700">نبذة مختصرة</div>
        <div className="text-lg font-bold text-teal-900">{player?.brief || '--'}</div>
      </div>
    </div>
  );

  // --- Education ---
  const renderEducation = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">المستوى التعليمي</div>
        <div className="text-lg font-bold text-blue-900">{player?.education_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">سنة التخرج</div>
        <div className="text-lg font-bold text-green-900">{player?.graduation_year || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">التخصص</div>
        <div className="text-lg font-bold text-purple-900">{player?.degree || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">مستوى الإنجليزية</div>
        <div className="text-lg font-bold text-yellow-900">{player?.english_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-red-50">
        <div className="mb-1 font-semibold text-red-700">مستوى العربية</div>
        <div className="text-lg font-bold text-red-900">{player?.arabic_level || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-indigo-50">
        <div className="mb-1 font-semibold text-indigo-700">مستوى الإسبانية</div>
        <div className="text-lg font-bold text-indigo-900">{player?.spanish_level || '--'}</div>
      </div>
    </div>
  );

  // --- Medical ---
  const renderMedical = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">فصيلة الدم</div>
        <div className="text-lg font-bold text-blue-900">{player?.blood_type || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">الطول</div>
        <div className="text-lg font-bold text-green-900">{player?.height ? `${player.height} سم` : '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">الوزن</div>
        <div className="text-lg font-bold text-purple-900">{player?.weight ? `${player.weight} كجم` : '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">أمراض مزمنة</div>
        <div className="text-lg font-bold text-yellow-900">{player?.chronic_conditions ? 'نعم' : 'لا'}</div>
      </div>
      {player?.chronic_conditions && (
        <div className="col-span-2 p-4 rounded-lg bg-red-50">
          <div className="mb-1 font-semibold text-red-700">تفاصيل الأمراض المزمنة</div>
          <div className="text-lg font-bold text-red-900">{player?.chronic_details || '--'}</div>
        </div>
      )}
      <div className="col-span-2 p-4 rounded-lg bg-indigo-50">
        <div className="mb-1 font-semibold text-indigo-700">الحساسية</div>
        <div className="text-lg font-bold text-indigo-900">{player?.allergies || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-pink-50">
        <div className="mb-1 font-semibold text-pink-700">ملاحظات طبية</div>
        <div className="text-lg font-bold text-pink-900">{player?.medical_notes || '--'}</div>
      </div>
    </div>
  );

  // --- Sports ---
  const renderSports = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="p-4 rounded-lg bg-blue-50">
        <div className="mb-1 font-semibold text-blue-700">المركز الأساسي</div>
        <div className="text-lg font-bold text-blue-900">{player?.primary_position || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-green-50">
        <div className="mb-1 font-semibold text-green-700">المركز الثانوي</div>
        <div className="text-lg font-bold text-green-900">{player?.secondary_position || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-purple-50">
        <div className="mb-1 font-semibold text-purple-700">القدم المفضلة</div>
        <div className="text-lg font-bold text-purple-900">{player?.preferred_foot || '--'}</div>
      </div>
      <div className="p-4 rounded-lg bg-yellow-50">
        <div className="mb-1 font-semibold text-yellow-700">سنوات الخبرة</div>
        <div className="text-lg font-bold text-yellow-900">{player?.experience_years || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-pink-50">
        <div className="mb-1 font-semibold text-pink-700">ملاحظات رياضية</div>
        <div className="text-lg font-bold text-pink-900">{player?.sports_notes || '--'}</div>
      </div>
      <div className="col-span-2 p-4 rounded-lg bg-orange-50">
        <div className="mb-1 font-semibold text-orange-700">الأندية السابقة</div>
        <div className="space-y-2">
          {player?.club_history && player.club_history.length > 0 ? (
            player.club_history.map((club: any, index: number) => (
              <div key={index} className="p-2 bg-white rounded">
                {typeof club === 'string' ? club : club.name}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500 bg-white rounded">لا توجد أندية سابقة مسجلة</div>
          )}
        </div>
      </div>
    </div>
  );

  // --- Skills ---
  const renderSkills = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <div>
        <h3 className="mb-4 text-lg font-medium">المهارات الفنية</h3>
        {Object.entries(player?.technical_skills || {}).map(([skill, value]) => (
          <div key={skill} className="mb-4">
            <div className="mb-1 font-semibold">{skill}</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(Number(value) / 5) * 100}%` }} />
            </div>
            <span className="text-sm">{value} / 5</span>
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-4 text-lg font-medium">المهارات البدنية</h3>
        {Object.entries(player?.physical_skills || {}).map(([skill, value]) => (
          <div key={skill} className="mb-4">
            <div className="mb-1 font-semibold">{skill}</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${(Number(value) / 5) * 100}%` }} />
            </div>
            <span className="text-sm">{value} / 5</span>
          </div>
        ))}
      </div>
      <div>
        <h3 className="mb-4 text-lg font-medium">المهارات الاجتماعية</h3>
        {Object.entries(player?.social_skills || {}).map(([skill, value]) => (
          <div key={skill} className="mb-4">
            <div className="mb-1 font-semibold">{skill}</div>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div className="bg-yellow-600 h-2.5 rounded-full" style={{ width: `${(Number(value) / 5) * 100}%` }} />
            </div>
            <span className="text-sm">{value} / 5</span>
          </div>
        ))}
      </div>
    </div>
  );

  // --- Objectives ---
  const renderObjectives = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Object.entries(player?.objectives || {}).map(([objective, value]) => (
        <div key={objective} className="flex items-center gap-2 p-2 bg-gray-100 rounded">
          <input type="checkbox" checked={!!value} readOnly />
          <span className="font-semibold">{OBJECTIVES_LABELS[objective] || objective}</span>
        </div>
      ))}
    </div>
  );

  // --- Media ---
  const renderMedia = () => (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {player?.profile_image && (
          <img 
            src={typeof player.profile_image === 'string' 
              ? player.profile_image 
              : (player.profile_image as { url: string })?.url} 
            alt="الصورة الشخصية" 
            className="object-cover w-32 h-32 border-2 border-blue-400 rounded-full" 
          />
        )}
        {player?.additional_images && player.additional_images.length > 0 && player.additional_images.map((img, idx) => (
          <img key={idx} src={typeof img === 'string' ? img : img.url} alt={`صورة إضافية ${idx + 1}`} className="object-cover w-24 h-24 border rounded" />
        ))}
      </div>
      <div className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">الفيديوهات</h3>
        <div className="flex flex-wrap gap-4">
          {player?.videos && player.videos.length > 0 ? (
            player.videos.map((video, idx) => (
              <video key={idx} src={video.url} controls className="w-64 h-40 border rounded-lg" />
            ))
          ) : (
            <div className="text-gray-500">لا توجد فيديوهات</div>
          )}
        </div>
      </div>
    </div>
  );

  // --- Contracts ---
  const renderContracts = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="p-4 rounded-lg bg-blue-50">
          <div className="mb-1 font-semibold text-blue-700">هل لديك جواز سفر؟</div>
          <div className="text-lg font-bold text-blue-900">{player?.has_passport === 'yes' ? 'نعم' : 'لا'}</div>
        </div>
        <div className="p-4 rounded-lg bg-green-50">
          <div className="mb-1 font-semibold text-green-700">هل لديك عقد حالياً؟</div>
          <div className="text-lg font-bold text-green-900">{player?.currently_contracted === 'yes' ? 'نعم' : 'لا'}</div>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="mb-2 text-lg font-semibold">تاريخ العقود</h3>
        <div className="space-y-2">
          {player?.contract_history && player.contract_history.length > 0 ? (
            player.contract_history.map((contract: any, idx: number) => (
              <div key={idx} className="p-2 bg-gray-100 rounded">
                {typeof contract === 'string' ? contract : `${contract.club} (${contract.from} - ${contract.to})`}
              </div>
            ))
          ) : (
            <div className="text-gray-500">لا يوجد عقود سابقة</div>
          )}
        </div>
      </div>
      <div className="mt-4">
        <h3 className="mb-2 text-lg font-semibold">تاريخ الوكلاء</h3>
        <div className="space-y-2">
          {player?.agent_history && player.agent_history.length > 0 ? (
            player.agent_history.map((agent: any, idx: number) => (
              <div key={idx} className="p-2 bg-gray-100 rounded">
                {typeof agent === 'string' ? agent : `${agent.agent} (${agent.from} - ${agent.to})`}
              </div>
            ))
          ) : (
            <div className="text-gray-500">لا يوجد وكلاء سابقون</div>
          )}
        </div>
      </div>
    </div>
  );

  // --- Tracking Info ---
  const renderTrackingInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="p-4 rounded-lg bg-blue-50">
          <div className="mb-1 font-semibold text-blue-700">تاريخ الإضافة</div>
          <div className="text-lg font-bold text-blue-900">
            {player?.created_at ? dayjs(player.created_at).format('DD/MM/YYYY HH:mm') : '--'}
          </div>
        </div>
        <div className="p-4 rounded-lg bg-green-50">
          <div className="mb-1 font-semibold text-green-700">آخر تحديث</div>
          <div className="text-lg font-bold text-green-900">
            {player?.updated_at ? dayjs(player.updated_at).format('DD/MM/YYYY HH:mm') : '--'}
          </div>
        </div>
      </div>
      
      {(player as any)?.addedBy && (
        <div className="p-4 rounded-lg bg-purple-50">
          <div className="mb-2 font-semibold text-purple-700">معلومات الإضافة</div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <div>
              <span className="text-sm text-purple-600">نوع الحساب:</span>
              <div className="font-bold text-purple-900">
                {(player as any).addedBy.accountType === 'club' ? 'نادي' :
                 (player as any).addedBy.accountType === 'academy' ? 'أكاديمية' :
                 (player as any).addedBy.accountType === 'trainer' ? 'مدرب' :
                 (player as any).addedBy.accountType === 'agent' ? 'وكيل' : 'غير محدد'}
              </div>
            </div>
            <div>
              <span className="text-sm text-purple-600">اسم الحساب:</span>
              <div className="font-bold text-purple-900">{(player as any).addedBy.accountName || '--'}</div>
            </div>
            <div>
              <span className="text-sm text-purple-600">تاريخ الإضافة:</span>
              <div className="font-bold text-purple-900">
                {(player as any).addedBy.dateAdded ? dayjs((player as any).addedBy.dateAdded).format('DD/MM/YYYY HH:mm') : '--'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- Tab Content Switcher ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return renderPersonalInfo();
      case 'education':
        return renderEducation();
      case 'medical':
        return renderMedical();
      case 'sports':
        return renderSports();
      case 'skills':
        return renderSkills();
      case 'objectives':
        return renderObjectives();
      case 'media':
        return renderMedia();
      case 'contracts':
        return renderContracts();
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 border ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105'
                : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50 hover:scale-105'
            }`}
            style={{ minWidth: 120 }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {renderTabContent()}
      </div>
      
      {/* معلومات التتبع - تظهر دائماً */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="mb-4 text-lg font-semibold text-gray-800">معلومات التتبع</h3>
        {renderTrackingInfo()}
      </div>
    </div>
  );
};

export default PlayerReportView; 
