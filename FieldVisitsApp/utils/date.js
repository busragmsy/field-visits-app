export const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

export function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatIsoToTurkish(isoDate) {
  if (!isoDate) {
    return '';
  }

  const [year, month, day] = isoDate.split('-').map(Number);
  return `${day} ${TURKISH_MONTHS[month - 1]} ${year}`;
}

export function formatDateTimeToTurkish(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = date.getDate();
  const month = TURKISH_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

export function parseIsoDate(value) {
  if (!value) {
    return getTodayStart();
  }

  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayStart() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}
