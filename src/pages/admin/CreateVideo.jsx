import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSave, FaTimes, FaVideo, FaImage } from 'react-icons/fa';
import { videoAPI } from '../../services/api';

const CreateVideo = () => {
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
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    { value: 'highlights', label: 'ملخصات المباريات' },
    { value: 'interviews', label: 'مقابلات' },
    { value: 'training', label: 'تدريبات' },
    { value: 'events', label: 'فعاليات' },
    { value: 'general', label: 'عام' },
  ];

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

    if (!formData.video) {
      setError('يرجى اختيار فيديو');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('category', formData.category);
      if (formData.duration) data.append('duration', formData.duration);
      data.append('isFeatured', formData.isFeatured);
      data.append('video', formData.video);
      if (formData.thumbnail) data.append('thumbnail', formData.thumbnail);

      await videoAPI.create(data);
      navigate('/admin/videos');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء رفع الفيديو');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-primary mb-6">إضافة فيديو جديد</h1>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 md:p-8 space-y-6">
          <div>
            <label className="block font-bold text-gray-700 mb-2">عنوان الفيديو *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="input-field"
              placeholder="مثال: ملخص مباراة الفريق الأول"
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

          <div>
            <label className="block font-bold text-gray-700 mb-2">الوصف</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              className="input-field resize-none"
              placeholder="وصف مختصر للفيديو..."
            ></textarea>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-5 h-5 accent-primary"
            />
            <label htmlFor="isFeatured" className="font-bold text-gray-700 cursor-pointer">
              فيديو مميز (يظهر في الرئيسية)
            </label>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">ملف الفيديو * (MP4, WebM, OGG - حد أقصى 200MB)</label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <label className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2">
                <FaVideo /> اختر فيديو
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
              {formData.video && (
                <div className="flex-1">
                  <p className="text-sm text-green-600 font-bold mb-2">
                    ✅ {formData.video.name} ({(formData.video.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                  {videoPreview && (
                    <video
                      src={videoPreview}
                      controls
                      className="w-full max-w-md rounded-lg"
                      style={{ maxHeight: '200px' }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-700 mb-2">صورة مصغرة (اختياري)</label>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <label className="cursor-pointer bg-primary-light text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition flex items-center gap-2">
                <FaImage /> اختر صورة
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
                  className="w-40 h-24 object-cover rounded-lg"
                />
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {loading ? 'جاري الرفع...' : 'رفع الفيديو'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/videos')}
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

export default CreateVideo;