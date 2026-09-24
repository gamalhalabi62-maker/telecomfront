import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaTimes, FaImage, FaEdit, FaTrash } from 'react-icons/fa';
import { playerAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { getImageUrl } from '../../utils/formatDate';

const EditPlayer = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    number: '',
    position: 'forward',
    nationality: 'مصري',
    birthDate: '',
    height: '',
    weight: '',
    bio: '',
    isCaptain: false,
    isActive: true,
    order: 0,
    appearances: 0,
    goals: 0,
    assists: 0,
    yellowCards: 0,
    redCards: 0,
    image: null,
  });

  const [currentImage, setCurrentImage] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const positions = [
    { value: 'goalkeeper', label: 'حارس مرمى', emoji: '🧤' },
    { value: 'defender', label: 'مدافع', emoji: '🛡️' },
    { value: 'midfielder', label: 'لاعب وسط', emoji: '⚡' },
    { value: 'forward', label: 'مهاجم', emoji: '⚽' },
  ];

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const { data } = await playerAPI.getById(id);
        setFormData({
          name: data.name || '',
          number: data.number || '',
          position: data.position || 'forward',
          nationality: data.nationality || 'مصري',
          birthDate: data.birthDate ? data.birthDate.split('T')[0] : '',
          height: data.height || '',
          weight: data.weight || '',
          bio: data.bio || '',
          isCaptain: data.isCaptain || false,
          isActive: data.isActive !== false,
          order: data.order || 0,
          appearances: data.stats?.appearances || 0,
          goals: data.stats?.goals || 0,
          assists: data.stats?.assists || 0,
          yellowCards: data.stats?.yellowCards || 0,
          redCards: data.stats?.redCards || 0,
          image: null,
        });
        setCurrentImage(data.imageUrl);
      } catch (err) {
        setError('اللاعب غير موجود');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('number', formData.number);
      data.append('position', formData.position);
      data.append('nationality', formData.nationality);
      if (formData.birthDate) data.append('birthDate', formData.birthDate);
      if (formData.height) data.append('height', formData.height);
      if (formData.weight) data.append('weight', formData.weight);
      if (formData.bio) data.append('bio', formData.bio);
      data.append('isCaptain', formData.isCaptain);
      data.append('isActive', formData.isActive);
      data.append('order', formData.order);

      data.append('stats', JSON.stringify({
        appearances: Number(formData.appearances) || 0,
        goals: Number(formData.goals) || 0,
        assists: Number(formData.assists) || 0,
        yellowCards: Number(formData.yellowCards) || 0,
        redCards: Number(formData.redCards) || 0,
      }));

      if (formData.image) data.append('image', formData.image);

      await playerAPI.update(id, data);
      navigate('/admin/players');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء التعديل');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`هل أنت متأكد من حذف اللاعب "${formData.name}"؟`)) return;
    try {
      await playerAPI.delete(id);
      navigate('/admin/players');
    } catch (err) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white text-xl">
              <FaEdit />
            </div>
            <h1 className="text-3xl font-black text-primary">تعديل اللاعب</h1>
          </div>
          <button
            onClick={() => navigate('/admin/players')}
            className="text-gray-500 hover:text-primary transition font-bold flex items-center gap-2"
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
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-gray-700 mb-2">اسم اللاعب *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">رقم القميص *</label>
                <input
                  type="number"
                  min="1"
                  max="99"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">المركز *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="input-field"
                >
                  {positions.map((pos) => (
                    <option key={pos.value} value={pos.value}>
                      {pos.emoji} {pos.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">الجنسية</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              البيانات الشخصية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-bold text-gray-700 mb-2">تاريخ الميلاد</label>
                <input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">الطول (سم)</label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">الوزن (كجم)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-bold text-gray-700 mb-2">نبذة عن اللاعب</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows="3"
                className="input-field resize-none"
              ></textarea>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              إحصائيات اللاعب
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { key: 'appearances', label: 'المشاركات', emoji: '🏟️' },
                { key: 'goals', label: 'الأهداف', emoji: '⚽' },
                { key: 'assists', label: 'صناعة', emoji: '🎯' },
                { key: 'yellowCards', label: 'بطاقات صفراء', emoji: '🟨' },
                { key: 'redCards', label: 'بطاقات حمراء', emoji: '🟥' },
              ].map((stat) => (
                <div key={stat.key}>
                  <label className="block font-bold text-gray-700 mb-2 text-sm">
                    {stat.emoji} {stat.label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData[stat.key]}
                    onChange={(e) => setFormData({ ...formData, [stat.key]: e.target.value })}
                    className="input-field text-center"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              إعدادات إضافية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={formData.isCaptain}
                  onChange={(e) => setFormData({ ...formData, isCaptain: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-bold text-gray-700">👑 قائد الفريق</span>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-bold text-gray-700">✅ لاعب نشط</span>
              </label>

              <div>
                <label className="block font-bold text-gray-700 mb-2 text-sm">الترتيب في العرض</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              صورة اللاعب
            </h2>

            <div className="flex flex-col md:flex-row gap-6 items-start">
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
                <div className="relative">
                  <img
                    src={preview || getImageUrl(currentImage)}
                    alt="preview"
                    className="w-32 h-32 object-cover rounded-full border-4 border-secondary shadow-lg"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              )}
            </div>
          </div>

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
              onClick={() => navigate('/admin/players')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition flex items-center gap-2"
            >
              <FaTimes /> إلغاء
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition flex items-center gap-2 mr-auto"
            >
              <FaTrash /> حذف اللاعب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPlayer;