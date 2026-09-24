import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaImage } from 'react-icons/fa';
import { newsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const CreateNews = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'general',
    isFeatured: false,
  });
  const [imageBase64, setImageBase64] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: 'عام' },
    { value: 'football', label: 'كرة القدم' },
    { value: 'club', label: 'أخبار النادي' },
    { value: 'academy', label: 'الأكاديمية' },
    { value: 'elections', label: 'الانتخابات' },
  ];

  const compressImage = (file, maxWidth = 800, maxHeight = 600, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صحيحة');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 10MB)');
      return;
    }

    try {
      const compressed = await compressImage(file);
      const sizeKB = Math.round((compressed.length * 3) / 4 / 1024);

      if (sizeKB > 900) {
        toast.warning(`الصورة كبيرة (${sizeKB}KB)`);
      }

      setImageBase64(compressed);
      setPreview(compressed);
    } catch (err) {
      toast.error('فشل معالجة الصورة');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        isFeatured: formData.isFeatured,
        imageUrl: imageBase64,
      };

      await newsAPI.create(data);
      toast.success('تم إضافة الخبر بنجاح');
      navigate('/admin/news');
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء إضافة الخبر';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-primary mb-6">إضافة خبر جديد</h1>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
          <div>
            <label className="block font-bold text-gray-700 mb-2">عنوان الخبر *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="input-field"
              placeholder="اكتب عنوان الخبر..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-bold text-gray-700 mb-2">التصنيف *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-bold text-gray-700">خبر مميز (يظهر في الرئيسية)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">مقتطف (اختياري)</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows="2"
              className="input-field resize-none"
              placeholder="ملخص قصير للخبر..."
            ></textarea>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">محتوى الخبر *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows="10"
              className="input-field resize-none"
              placeholder="اكتب محتوى الخبر كاملاً..."
            ></textarea>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">صورة الخبر</label>
            <p className="text-xs text-gray-500 mb-2">
              💡 سيتم ضغط الصورة تلقائياً إلى 800×600 بكسل
            </p>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <label className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2">
                <FaImage /> اختر صورة
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {preview && (
                <div className="relative">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-40 h-32 object-cover rounded-lg shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => { setPreview(null); setImageBase64(''); }}
                    className="absolute -top-2 -left-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                  >
                    <FaTimes size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {loading ? 'جاري الحفظ...' : 'نشر الخبر'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/news')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition flex items-center gap-2"
            >
              <FaTimes /> إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNews;