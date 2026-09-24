// ========== تنسيق التاريخ ==========
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// ========== التنسيق النسبي (منذ...) ==========
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

// ========== رابط الصورة (يدعم Cloudinary + الإنتاج) ==========
export const getImageUrl = (imageUrl) => {
  // صورة افتراضية إذا لم توجد
  if (!imageUrl) {
    return 'https://via.placeholder.com/800x600/4A148C/FFFFFF?text=Telecom+Egypt';
  }

  // ✅ Cloudinary أو أي رابط كامل → أرجعه كما هو
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // ✅ رابط نسبي قديم → استخدم رابط الباك إند
  const API_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') // إزالة /api من النهاية
    : 'http://localhost:3000';

  return `${API_BASE}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`;
};

// ========== اسم التصنيف بالعربية ==========
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