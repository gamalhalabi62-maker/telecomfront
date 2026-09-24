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

  // ✅ state منفصل للملف
  const [image, setImage] = useState(null);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('🖼️ File selected:', file);
    console.log('   - name:', file?.name);
    console.log('   - size:', file?.size);
    console.log('   - type:', file?.type);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار صورة صحيحة');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة كبير جداً (الحد الأقصى 5MB)');
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    console.log('✅ Image state set');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      if (formData.excerpt) data.append('excerpt', formData.excerpt);
      data.append('category', formData.category);
      data.append('isFeatured', formData.isFeatured);

      // ✅ إرسال الملف نفسه
      if (image) {
        data.append('image', image);
        console.log('📤 Appending image file:', image.name);
      } else {
        console.log('⚠️ No image to append');
      }

      // عرض محتويات FormData
      console.log('📋 FormData contents:');
      for (let pair of data.entries()) {
        console.log('   ', pair[0], '=', pair[1] instanceof File ? `File(${pair[1].name})` : pair[1]);
      }

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
                <span className="font-bold text-gray-700">خبر مميز</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">مقتطف</label>
            <textarea
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows="2"
              className="input-field resize-none"
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
            ></textarea>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">صورة الخبر</label>
            <p className="text-xs text-gray-500 mb-2">💡 الحد الأقصى 5MB</p>
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
                    onClick={() => { setPreview(null); setImage(null); }}
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