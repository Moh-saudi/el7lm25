'use client';

import React from 'react';
import { useTranslation } from '@/lib/translations/simple-context';
import { Users, CreditCard, BarChart3, Settings, Shield, Globe } from 'lucide-react';

export default function TranslatedCards() {
  const { t, formatNumber, formatCurrency } = useTranslation();

  const cards = [
    {
      icon: Users,
      title: t('users.title'),
      subtitle: t('users.subtitle'),
      stats: {
        total: formatNumber(15420),
        active: formatNumber(12350),
        new: formatNumber(156)
      },
      color: 'blue'
    },
    {
      icon: CreditCard,
      title: t('payments.title'),
      subtitle: t('payments.subtitle'),
      stats: {
        total: formatCurrency(1250000, 'EGP'),
        successful: formatNumber(98.5) + '%',
        pending: formatNumber(23)
      },
      color: 'green'
    },
    {
      icon: BarChart3,
      title: t('reports.title'),
      subtitle: t('reports.subtitle'),
      stats: {
        generated: formatNumber(456),
        types: '5',
        period: t('reports.periods.month')
      },
      color: 'purple'
    },
    {
      icon: Settings,
      title: t('settings.title'),
      subtitle: t('settings.subtitle'),
      stats: {
        categories: '6',
        active: '4',
        pending: '2'
      },
      color: 'orange'
    },
    {
      icon: Shield,
      title: t('system.title'),
      subtitle: t('system.subtitle'),
      stats: {
        status: t('system.health.excellent'),
        uptime: '99.9%',
        services: '8'
      },
      color: 'red'
    },
    {
      icon: Globe,
      title: t('media.title'),
      subtitle: t('media.subtitle'),
      stats: {
        files: formatNumber(15420),
        storage: '2.5 GB',
        types: '4'
      },
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-600 border-blue-200',
      green: 'bg-green-50 text-green-600 border-green-200',
      purple: 'bg-purple-50 text-purple-600 border-purple-200',
      orange: 'bg-orange-50 text-orange-600 border-orange-200',
      red: 'bg-red-50 text-red-600 border-red-200',
      indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${getColorClasses(card.color)}`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">{t('ui.status')}</div>
                <div className="text-xs text-green-600 font-medium">{t('system.health.excellent')}</div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{card.subtitle}</p>
              
              {/* Stats */}
              <div className="grid grid-cols-1 gap-2 pt-4">
                {Object.entries(card.stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 capitalize">{key}:</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                  {t('actions.view')}
                </button>
                <button className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
                  {t('actions.edit')}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 