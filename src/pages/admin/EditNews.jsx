import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaVideo, FaFileAlt, FaLayerGroup } from 'react-icons/fa';
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
    mediaType: 'none',
  });

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [currentVideo, setCurrentVideo] = useState('');
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

  const mediaTypes = [
    { value: 'none', label: 'نصي', icon: <FaFileAlt />, desc: 'بدون وسائط' },
    { value: 'image', label: 'صورة', icon: <FaImage />, desc: 'صورة فقط' },
    { value: 'video', label: 'فيديو', icon: <FaVideo />, desc: 'فيديو فقط' },
    { value: 'both', label: 'صورة + فيديو', icon: <FaLayerGroup />, desc: 'كلاهما' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await newsAPI.getById(id);
        setFormData({
          title: data.title || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          category: data.category || 'general',
          isFeatured: data.isFeatured || false,
          mediaType: data.mediaType || 'none',
        });
        setCurrentImage(data.imageUrl || '');
        setCurrentVideo(data.videoUrl || '');
      } catch (err) {
        setError('الخبر غير موجود');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
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
    setImagePreview(URL.createObjectURL(file));
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('يرجى اختيار فيديو صحيح');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      toast.error('حجم الفيديو كبير جداً (الحد الأقصى 100MB)');
      return;
    }

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const hasImage = image || currentImage;
    const hasVideo = video || currentVideo;

    if (formData.mediaType === 'image' && !hasImage) {
      return setError('يجب اختيار صورة');
    }
    if (formData.mediaType === 'video' && !hasVideo) {
      return setError('يجب اختيار فيديو');
    }
    if (formData.mediaType === 'both' && (!hasImage || !hasVideo)) {
      return setError('يجب اختيار صورة وفيديو معاً');
    }

    setSaving(true);

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      if (formData.excerpt) data.append('excerpt', formData.excerpt);
      data.append('category', formData.category);
      data.append('isFeatured', formData.isFeatured);
      data.append('mediaType', formData.mediaType);
      if (image) data.append('image', image);
      if (video) data.append('video', video);

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

  const displayImage = imagePreview || (currentImage ? getImageUrl(currentImage) : '');
  const displayVideo = videoPreview || currentVideo;

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
            <label className="block font-bold text-gray-700 mb-3">نوع المحتوى *</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {mediaTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, mediaType: type.value })}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    formData.mediaType === type.value
                      ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-bold text-sm">{type.label}</span>
                  <span className="text-xs opacity-70">{type.desc}</span>
                </button>
              ))}
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

          {(formData.mediaType === 'image' || formData.mediaType === 'both') && (
            <div className="bg-gray-50 rounded-xl p-5">
              <label className="block font-bold text-gray-700 mb-3">
                {formData.mediaType === 'both' ? 'صورة الغلاف' : 'الصورة'}
              </label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <label className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2">
                  <FaImage /> {displayImage ? 'تغيير الصورة' : 'اختر صورة'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {displayImage && (
                  <div className="relative">
                    <img
                      src={displayImage}
                      alt="preview"
                      className="w-40 h-32 object-cover rounded-lg shadow-md"
                    />
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setImage(null); }}
                        className="absolute -top-2 -left-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {(formData.mediaType === 'video' || formData.mediaType === 'both') && (
            <div className="bg-gray-50 rounded-xl p-5">
              <label className="block font-bold text-gray-700 mb-3">
                {formData.mediaType === 'both' ? 'الفيديو' : 'ملف الفيديو'}
              </label>
              <div className="flex flex-col md:flex-row gap-4 items-start">
                <label className="cursor-pointer bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2">
                  <FaVideo /> {displayVideo ? 'تغيير الفيديو' : 'اختر فيديو'}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
                {displayVideo && (
                  <div className="relative flex-1 max-w-md">
                    <video
                      src={displayVideo}
                      controls
                      className="w-full rounded-lg shadow-md"
                      style={{ maxHeight: '220px' }}
                    />
                    {videoPreview && (
                      <button
                        type="button"
                        onClick={() => { setVideoPreview(null); setVideo(null); }}
                        className="absolute -top-2 -left-2 bg-red-500 text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600"
                      >
                        <FaTimes size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              {video && (
                <p className="text-xs text-green-600 font-bold mt-3">
                  ✅ {video.name} ({(video.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>
          )}

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