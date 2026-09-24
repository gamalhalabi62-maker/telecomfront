import { useEffect, useState } from 'react';
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes,
  FaTrophy, FaUsers, FaFutbol, FaNewspaper, FaStar,
  FaCalendar, FaEye, FaMedal, FaBullseye, FaAward,
  FaArrowUp, FaArrowDown,
} from 'react-icons/fa';
import { statisticAPI } from '../../services/api';
import Loading from '../../components/Loading';

const iconOptions = [
  { value: 'trophy', label: 'كأس', icon: <FaTrophy /> },
  { value: 'users', label: 'أعضاء', icon: <FaUsers /> },
  { value: 'football', label: 'كرة', icon: <FaFutbol /> },
  { value: 'newspaper', label: 'صحيفة', icon: <FaNewspaper /> },
  { value: 'star', label: 'نجمة', icon: <FaStar /> },
  { value: 'calendar', label: 'تقويم', icon: <FaCalendar /> },
  { value: 'eye', label: 'عين', icon: <FaEye /> },
  { value: 'medal', label: 'ميدالية', icon: <FaMedal /> },
  { value: 'target', label: 'هدف', icon: <FaBullseye /> },
  { value: 'award', label: 'جائزة', icon: <FaAward /> },
];

const colorOptions = [
  { value: 'primary', label: 'بنفسجي', class: 'bg-primary' },
  { value: 'secondary', label: 'ذهبي', class: 'bg-secondary' },
  { value: 'blue', label: 'أزرق', class: 'bg-blue-500' },
  { value: 'green', label: 'أخضر', class: 'bg-green-500' },
  { value: 'red', label: 'أحمر', class: 'bg-red-500' },
  { value: 'orange', label: 'برتقالي', class: 'bg-orange-500' },
  { value: 'purple', label: 'بنفسجي فاتح', class: 'bg-purple-500' },
  { value: 'indigo', label: 'نيلي', class: 'bg-indigo-500' },
];

const ManageStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    label: '',
    value: '',
    suffix: '',
    icon: 'trophy',
    color: 'primary',
    order: 0,
    isActive: true,
    category: 'general',
  });

  const fetchStats = async () => {
    try {
      const { data } = await statisticAPI.getAll();
      setStats(data.statistics);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const resetForm = () => {
    setFormData({
      label: '',
      value: '',
      suffix: '',
      icon: 'trophy',
      color: 'primary',
      order: 0,
      isActive: true,
      category: 'general',
    });
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const handleEdit = (stat) => {
    setFormData({
      label: stat.label,
      value: stat.value,
      suffix: stat.suffix || '',
      icon: stat.icon || 'trophy',
      color: stat.color || 'primary',
      order: stat.order || 0,
      isActive: stat.isActive,
      category: stat.category || 'general',
    });
    setEditingId(stat._id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      if (editingId) {
        await statisticAPI.update(editingId, formData);
      } else {
        await statisticAPI.create(formData);
      }
      await fetchStats();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`هل أنت متأكد من حذف "${label}"؟`)) return;
    try {
      await statisticAPI.delete(id);
      setStats(stats.filter(s => s._id !== id));
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleToggleActive = async (stat) => {
    try {
      await statisticAPI.update(stat._id, { isActive: !stat.isActive });
      setStats(stats.map(s => s._id === stat._id ? { ...s, isActive: !s.isActive } : s));
    } catch (error) {
      alert('حدث خطأ');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-6 md:p-8 rounded-2xl mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl">
              <FaTrophy />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">إدارة الأرقام</h1>
              <p className="text-gray-200 text-sm">
                إجمالي {stats.length} إحصائية
              </p>
            </div>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2 shadow-lg"
            >
              <FaPlus /> إضافة إحصائية
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8 border-2 border-primary">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black text-primary">
              {editingId ? '✏️ تعديل إحصائية' : '➕ إضافة إحصائية جديدة'}
            </h2>
            <button onClick={resetForm} className="text-gray-500 hover:text-primary transition">
              <FaTimes size={20} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2">الاسم *</label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  required
                  className="input-field"
                  placeholder="مثال: بطولة، عضو، هدف"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">القيمة *</label>
                <input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  required
                  className="input-field"
                  placeholder="مثال: 45"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">الرمز (اختياري)</label>
                <input
                  type="text"
                  value={formData.suffix}
                  onChange={(e) => setFormData({ ...formData, suffix: e.target.value })}
                  className="input-field"
                  placeholder="مثال: + أو %"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">الترتيب</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                  className="input-field"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">الأيقونة</label>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {iconOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: opt.value })}
                    className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                      formData.icon === opt.value
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-gray-200 hover:border-gray-300 text-gray-500'
                    }`}
                    title={opt.label}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <label className="block font-bold text-gray-700 mb-2">اللون</label>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, color: opt.value })}
                    className={`px-4 py-2 rounded-lg font-bold text-white ${opt.class} ${
                      formData.color === opt.value ? 'ring-4 ring-primary scale-110' : 'opacity-70 hover:opacity-100'
                    } transition`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active */}
            <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 accent-primary"
              />
              <span className="font-bold text-gray-700">✅ نشطة (تظهر في الموقع)</span>
            </label>

            {/* Preview */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-bold text-gray-600 mb-3">👁️ معاينة:</p>
              <div className="w-48 bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-center">
                <div className={`w-16 h-16 mx-auto mb-3 ${colorOptions.find(c => c.value === formData.color)?.class} rounded-full flex items-center justify-center text-white text-2xl`}>
                  {iconOptions.find(i => i.value === formData.icon)?.icon}
                </div>
                <div className="text-4xl font-black text-white">
                  {formData.value || 0}{formData.suffix}
                </div>
                <div className="text-gray-200 font-bold text-sm">{formData.label || 'الاسم'}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {saving ? 'جاري الحفظ...' : (editingId ? 'حفظ التعديلات' : 'إضافة')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats List */}
      {stats.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
          <FaTrophy className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-bold mb-4">لا توجد إحصائيات بعد</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary inline-flex items-center gap-2"
          >
            <FaPlus /> أضف أول إحصائية
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <div
              key={stat._id}
              className={`bg-white rounded-xl shadow-md p-6 border-2 transition ${
                stat.isActive ? 'border-primary/20' : 'border-gray-200 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 ${colorOptions.find(c => c.value === stat.color)?.class} rounded-xl flex items-center justify-center text-white text-2xl`}>
                  {iconOptions.find(i => i.value === stat.icon)?.icon || <FaTrophy />}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(stat)}
                    className="text-primary hover:text-primary-light p-2 rounded hover:bg-primary/10 transition"
                    title="تعديل"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(stat._id, stat.label)}
                    className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                    title="حذف"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>

              <div className="text-4xl font-black text-primary mb-1">
                {stat.value.toLocaleString('ar-EG')}{stat.suffix}
              </div>
              <p className="text-gray-600 font-bold">{stat.label}</p>

              <div className="flex items-center justify-between mt-4 pt-4 border-t text-xs">
                <span className="text-gray-500">ترتيب: {stat.order}</span>
                <button
                  onClick={() => handleToggleActive(stat)}
                  className={`px-3 py-1 rounded-full font-bold ${
                    stat.isActive
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {stat.isActive ? '✅ نشطة' : '⬜ معطلة'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageStats;