import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaImage } from 'react-icons/fa';
import { newsAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import { getImageUrl } from '../../utils/formatDate';

const EditNews = () => {
  const { id } = useParams();
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
  const [currentImage, setCurrentImage] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'general', label: 'عام' },
    { value: 'football', label: 'كرة القدم' },
    { value: 'club', label: 'أخبار النادي' },
    { value: 'academy', label: 'الأكاديمية' },
    { value: 'elections', label: 'الانتخابات' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await newsAPI.getById(id);
        setFormData({
          title: data.title,
          content: data.content,
          excerpt: data.excerpt || '',
          category: data.category,
          isFeatured: data.isFeatured || false,
        });
        setCurrentImage(data.imageUrl);
      } catch (err) {
        setError('الخبر غير موجود');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

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

          resolve(canvas.toDataURL('image/jpeg', quality));
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

    try {
      const compressed = await compressImage(file);
      setImageBase64(compressed);
      setPreview(compressed);
    } catch (err) {
      toast.error('فشل معالجة الصورة');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = {
        title: formData.title,
        content: formData.content,
        excerpt: formData.excerpt,
        category: formData.category,
        isFeatured: formData.isFeatured,
      };

      if (imageBase64) {
        data.imageUrl = imageBase64;
      }

      await newsAPI.update(id, data);
      toast.success('تم حفظ التعديلات');
      navigate('/admin/news');
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-primary mb-6">تعديل الخبر</h1>

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
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <label className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2">
                <FaImage /> تغيير الصورة
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {(preview || currentImage) && (
                <img
                  src={preview || getImageUrl(currentImage)}
                  alt="preview"
                  className="w-40 h-32 object-cover rounded-lg shadow-md"
                />
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
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

export default EditNews;