export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

export const formatRelativeTime = (dateString) => {
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
  if (!imageUrl) return 'https://via.placeholder.com/800x600/4A148C/FFFFFF?text=Telecom+Egypt';
  if (imageUrl.startsWith('http')) return imageUrl;
  return `http://localhost:3000${imageUrl}`;
};

export const getCategoryName = (category) => {
  const categories = {
    football: 'كرة القدم',
    club: 'أخبار النادي',
    academy: 'الأكاديمية',
    general: 'عام',
    elections: 'الانتخابات',
  };
  return categories[category] || category;
};