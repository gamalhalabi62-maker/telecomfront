export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'الآن';
  if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
  if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
  if (diffInSeconds < 604800) return `منذ ${Math.floor(diffInSeconds / 86400)} يوم`;

  return formatDate(dateString);
};

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) {
    return 'https://placehold.co/800x600/4A148C/FFFFFF?text=Telecom+Egypt';
  }
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  if (imageUrl.startsWith('/')) {
    const API_BASE = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
      : 'http://localhost:3000';
    return `${API_BASE}${imageUrl}`;
  }
  return imageUrl;
};

export const getCategoryName = (category) => {
  const categories = {
    football: 'كرة القدم',
    club: 'أخبار النادي',
    academy: 'الأكاديمية',
    general: 'عام',
    elections: 'الانتخابات',
    highlights: 'ملخصات المباريات',
    interviews: 'مقابلات',
    training: 'تدريبات',
    events: 'فعاليات',
  };
  return categories[category] || category;
};