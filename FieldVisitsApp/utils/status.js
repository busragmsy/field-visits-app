export const STATUS_CONFIG = {
  Pending: {
    label: 'Bekliyor',
    badgeBg: '#FEF3C7',
    badgeText: '#D97706',
    circle: '#3B82F6',
    bannerBg: '#DBEAFE',
    bannerText: '#1D4ED8',
    approvalLabel: 'Onay bekliyor',
    bannerMessage: 'Bu ziyaret henüz onaylanmadı. Düzenleyebilirsiniz.',
  },
  Approved: {
    label: 'Onaylandı',
    badgeBg: '#D1FAE5',
    badgeText: '#059669',
    circle: '#10B981',
    bannerBg: '#D1FAE5',
    bannerText: '#059669',
    approvalLabel: 'Onaylandı',
    bannerMessage: 'Bu ziyaret onaylandı. Düzenlenemez.',
  },
  Rejected: {
    label: 'Reddedildi',
    badgeBg: '#FEE2E2',
    badgeText: '#DC2626',
    circle: '#EF4444',
    bannerBg: '#FEE2E2',
    bannerText: '#DC2626',
    approvalLabel: 'Reddedildi',
    bannerMessage: 'Bu ziyaret reddedildi. Düzenlenemez.',
  },
};

export function getStatusConfig(status) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
}
