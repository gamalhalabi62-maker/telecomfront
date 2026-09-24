import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaVideo, FaImage, FaTrash } from 'react-icons/fa';
import { videoAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { getImageUrl } from '../../utils/formatDate';

const EditVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'highlights',
    duration: '',
    isFeatured: false,
    video: null,
    thumbnail: null,
  });

  const [currentVideo, setCurrentVideo] = useState('');
  const [currentThumbnail, setCurrentThumbnail] = useState('');
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'highlights', label: 'ملخصات المباريات' },
    { value: 'interviews', label: 'مقابلات' },
    { value: 'training', label: 'تدريبات' },
    { value: 'events', label: 'فعاليات' },
    { value: 'general', label: 'عام' },
  ];

  // جلب بيانات الفيديو
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const { data } = await videoAPI.getById(id);
        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'highlights',
          duration: data.duration || '',
          isFeatured: data.isFeatured || false,
          video: null,
          thumbnail: null,
        });
        setCurrentVideo(data.videoUrl);
        setCurrentThumbnail(data.thumbnailUrl);
      } catch (err) {
        setError('الفيديو غير موجود');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 200 * 1024 * 1024) {
        setError('حجم الفيديو كبير جداً (الحد 200MB)');
        return;
      }
      setFormData({ ...formData, video: file });
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, thumbnail: file });
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      if (formData.duration) data.append('duration', formData.duration);
      data.append('isFeatured', formData.isFeatured);

      // رفع الفيديو فقط إذا تم تغييره
      if (formData.video) data.append('video', formData.video);
      if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

      await videoAPI.update(id, data);
      navigate('/admin/videos');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التعديل');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black text-primary">تعديل الفيديو</h1>
          <button
            onClick={() => navigate('/admin/videos')}
            className="text-gray-500 hover:text-primary transition flex items-center gap-2 font-bold"
          >
            <FaTimes /> إغلاق
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">عنوان الفيديو *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="input-field"
              placeholder="عنوان الفيديو..."
            />
          </div>

          {/* Category + Duration */}
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

            <div>
              <label className="block font-bold text-gray-700 mb-2">المدة (بالثواني)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input-field"
                placeholder="مثال: 180"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="input-field resize-none"
              placeholder="وصف الفيديو..."
            ></textarea>
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="isFeatured" className="font-bold text-gray-700 cursor-pointer">
              ⭐ فيديو مميز (يظهر في الرئيسية)
            </label>
          </div>

          {/* Current Video */}
          <div className="border-t pt-6">
            <label className="block font-bold text-gray-700 mb-3">الفيديو الحالي</label>
            {currentVideo && !videoPreview && (
              <div className="bg-black rounded-lg overflow-hidden max-w-2xl">
                <video
                  src={getImageUrl(currentVideo)}
                  controls
                  className="w-full"
                  style={{ maxHeight: '400px' }}
                >
                  متصفحك لا يدعم عرض الفيديو
                </video>
              </div>
            )}
            {videoPreview && (
              <div className="bg-black rounded-lg overflow-hidden max-w-2xl">
                <video
                  src={videoPreview}
                  controls
                  className="w-full"
                  style={{ maxHeight: '400px' }}
                >
                  متصفحك لا يدعم عرض الفيديو
                </video>
              </div>
            )}
          </div>

          {/* Change Video */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              تغيير الفيديو (اتركه فارغاً للإبقاء على الحالي)
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <label className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2">
                <FaVideo /> اختر فيديو جديد
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
              {formData.video && (
                <div className="flex-1">
                  <p className="text-sm text-green-600 font-bold">
                    ✅ {formData.video.name} ({(formData.video.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Current Thumbnail */}
          {currentThumbnail && (
            <div className="border-t pt-6">
              <label className="block font-bold text-gray-700 mb-3">الصورة المصغرة الحالية</label>
              <img
                src={getImageUrl(currentThumbnail)}
                alt="current thumbnail"
                className="w-48 h-28 object-cover rounded-lg shadow-md"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Change Thumbnail */}
          <div>
            <label className="block font-bold text-gray-700 mb-2">
              تغيير الصورة المصغرة (اختياري)
            </label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <label className="cursor-pointer bg-primary-light text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition flex items-center gap-2">
                <FaImage /> اختر صورة جديدة
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbChange}
                  className="hidden"
                />
              </label>
              {thumbPreview && (
                <img
                  src={thumbPreview}
                  alt="preview"
                  className="w-40 h-24 object-cover rounded-lg shadow-md"
                />
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/videos')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition flex items-center gap-2"
            >
              <FaTimes /> إلغاء
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('هل أنت متأكد من حذف هذا الفيديو نهائياً؟')) return;
                try {
                  await videoAPI.delete(id);
                  navigate('/admin/videos');
                } catch (err) {
                  alert('حدث خطأ أثناء الحذف');
                }
              }}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition flex items-center gap-2 mr-auto"
            >
              <FaTrash /> حذف الفيديو
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVideo;