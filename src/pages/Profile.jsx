import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaPhone, FaSave, FaTimes,
  FaCheckCircle, FaEnvelopeOpen, FaBell, FaBellSlash,
  FaSignOutAlt, FaShieldAlt, FaCalendar, FaIdCard,
  FaWhatsapp, FaEdit, FaTrophy, FaNewspaper,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { messageAPI, notificationAPI } from '../services/api';
import { formatDate } from '../utils/formatDate';
import Loading from '../components/Loading';

const Profile = () => {
  const { user, updateProfile, logout, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [stats, setStats] = useState({
    messagesCount: 0,
    unreadNotifications: 0,
    joinedAt: user?.createdAt || null,
  });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    receiveNotifications: user?.receiveNotifications !== false,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesRes, notifRes] = await Promise.allSettled([
          messageAPI.getMy(),
          notificationAPI.getUnreadCount(),
        ]);

        setStats({
          messagesCount: messagesRes.status === 'fulfilled' ? messagesRes.value.data.messages?.length || 0 : 0,
          unreadNotifications: notifRes.status === 'fulfilled' ? notifRes.value.data.unreadCount || 0 : 0,
          joinedAt: user?.createdAt || null,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
    refreshUser();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'الاسم مطلوب';
    else if (formData.name.trim().length < 3) errs.name = 'الاسم قصير جداً';

    if (formData.phone && !/^[+\d\s\-()]*$/.test(formData.phone)) {
      errs.phone = 'رقم الهاتف غير صحيح';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('يرجى تصحيح الأخطاء');
      return;
    }

    setLoading(true);
    try {
      await updateProfile(formData);
      toast.success('تم تحديث الملف الشخصي بنجاح ✅');
      setIsEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      receiveNotifications: user?.receiveNotifications !== false,
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    if (!window.confirm('هل أنت متأكد من تسجيل الخروج؟')) return;
    logout();
    toast.success('تم تسجيل الخروج بنجاح');
    navigate('/');
  };

  const getRoleBadge = () => {
    const roles = {
      admin: { text: 'مدير النظام', emoji: '👑', color: 'bg-secondary text-primary-dark' },
      editor: { text: 'محرر', emoji: '✏️', color: 'bg-primary-light text-white' },
      user: { text: 'عضو', emoji: '👤', color: 'bg-primary text-white' },
    };
    return roles[user?.role] || roles.user;
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  const roleBadge = getRoleBadge();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom max-w-5xl">
        {/* ============ Header Card ============ */}
        <div className="bg-gradient-to-br from-primary via-primary-light to-primary-dark rounded-3xl shadow-2xl overflow-hidden mb-6 relative">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
          </div>

          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
              backgroundSize: '30px 30px',
            }}
          ></div>

          <div className="relative z-10 p-6 md:p-10">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-secondary to-yellow-400 flex items-center justify-center text-primary-dark font-black text-5xl md:text-6xl shadow-2xl border-4 border-white/30">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-white shadow-lg">
                  <span className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></span>
                </span>
              </div>

              <div className="flex-1 text-center md:text-right">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-3">
                  <h1 className="text-2xl md:text-4xl font-black text-white">
                    {user.name}
                  </h1>
                  <span className={`${roleBadge.color} px-3 py-1 rounded-full text-xs font-black flex items-center gap-1`}>
                    {roleBadge.emoji} {roleBadge.text}
                  </span>
                </div>

                <p className="text-gray-200 flex items-center justify-center md:justify-start gap-2 mb-2 text-sm">
                  <FaEnvelope className="text-secondary" />
                  <span dir="ltr">{user.email}</span>
                  {user.isVerified && (
                    <FaCheckCircle className="text-green-400" title="بريد مُفعّل" />
                  )}
                </p>

                {user.phone && (
                  <p className="text-gray-200 flex items-center justify-center md:justify-start gap-2 text-sm">
                    <FaWhatsapp className="text-green-400" />
                    <span dir="ltr">{user.phone}</span>
                  </p>
                )}

                {stats.joinedAt && (
                  <p className="text-gray-300 flex items-center justify-center md:justify-start gap-2 text-xs mt-3">
                    <FaCalendar />
                    عضو منذ {formatDate(stats.joinedAt)}
                  </p>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl font-bold transition flex items-center gap-2 shadow-lg flex-shrink-0"
              >
                <FaSignOutAlt /> تسجيل خروج
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Link
            to="/my-messages"
            className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-xl transition group"
          >
            <div className="w-14 h-14 bg-primary text-white rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
              <FaEnvelopeOpen />
            </div>
            <div>
              <p className="text-3xl font-black text-primary">{stats.messagesCount}</p>
              <p className="text-gray-500 text-sm font-bold">رسائلي</p>
            </div>
          </Link>

          <Link
            to="/notifications"
            className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-xl transition group relative"
          >
            <div className="w-14 h-14 bg-secondary text-primary-dark rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
              <FaBell />
            </div>
            <div>
              <p className="text-3xl font-black text-primary">{stats.unreadNotifications}</p>
              <p className="text-gray-500 text-sm font-bold">إشعارات جديدة</p>
            </div>
            {stats.unreadNotifications > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 w-3 h-3 rounded-full animate-pulse"></span>
            )}
          </Link>

          <Link
            to="/admin"
            className="bg-white rounded-2xl shadow-md p-6 flex items-center gap-4 hover:shadow-xl transition group"
          >
            <div className="w-14 h-14 bg-primary-dark text-white rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
              <FaTrophy />
            </div>
            <div>
              <p className="text-3xl font-black text-primary">
                {user.role === 'admin' || user.role === 'editor' ? '✓' : '—'}
              </p>
              <p className="text-gray-500 text-sm font-bold">
                {user.role === 'admin' || user.role === 'editor' ? 'لوحة التحكم' : 'عضو'}
              </p>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-l from-primary/5 to-secondary/5 px-6 md:px-8 py-5 border-b-2 border-secondary/30 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
                <FaIdCard />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary">معلومات الحساب</h2>
                <p className="text-xs text-gray-500">بياناتك الشخصية</p>
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-primary text-white px-5 py-2 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2 text-sm shadow-md"
              >
                <FaEdit /> تعديل
              </button>
            )}
          </div>

          <div className="p-6 md:p-8">
            {loadingData ? (
              <Loading />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaUser className="text-primary" />
                    الاسم الكامل
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                    />
                  ) : (
                    <p className="text-gray-800 font-bold text-lg py-3 px-4 bg-gray-50 rounded-xl">
                      {user.name}
                    </p>
                  )}
                  {errors.name && <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaEnvelope className="text-primary" />
                    البريد الإلكتروني
                    <span className="text-xs font-normal text-gray-400">(غير قابل للتعديل)</span>
                  </label>
                  <div className="flex items-center gap-2 py-3 px-4 bg-gray-100 rounded-xl">
                    <span className="text-gray-600 font-medium" dir="ltr">{user.email}</span>
                    {user.isVerified && (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <FaCheckCircle /> مُفعّل
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    <FaWhatsapp className="text-green-600" />
                    رقم الواتساب
                    <span className="text-xs font-normal text-gray-400">(اختياري)</span>
                  </label>
                  {isEditing ? (
                    <>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+20 123 456 7890"
                        dir="ltr"
                        className={`input-field text-left ${errors.phone ? 'border-red-400' : ''}`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">⚠️ {errors.phone}</p>}
                    </>
                  ) : (
                    <p className="text-gray-800 font-bold py-3 px-4 bg-gray-50 rounded-xl" dir="ltr">
                      {user.phone || <span className="text-gray-400 font-normal">لم يتم الإضافة</span>}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                    {formData.receiveNotifications ? (
                      <FaBell className="text-secondary" />
                    ) : (
                      <FaBellSlash className="text-gray-400" />
                    )}
                    إشعارات البريد الإلكتروني
                  </label>

                  {isEditing ? (
                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition border-2 border-transparent hover:border-primary/20">
                      <div>
                        <p className="font-bold text-gray-800">استقبال إشعارات الأخبار</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          سيتم إرسال إيميل عند نشر خبر جديد
                        </p>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="receiveNotifications"
                          checked={formData.receiveNotifications}
                          onChange={handleChange}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-8 bg-gray-300 rounded-full peer-checked:bg-primary transition-colors"></div>
                        <div className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-[-24px] shadow-md"></div>
                      </div>
                    </label>
                  ) : (
                    <div className={`py-3 px-4 rounded-xl flex items-center justify-between ${
                      user.receiveNotifications ? 'bg-green-50' : 'bg-gray-100'
                    }`}>
                      <span className={`font-bold ${
                        user.receiveNotifications ? 'text-green-700' : 'text-gray-500'
                      }`}>
                        {user.receiveNotifications ? '✅ مفعّل' : '⬜ معطّل'}
                      </span>
                      <Link
                        to="/notifications"
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        عرض الإشعارات ←
                      </Link>
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      <FaSave /> {loading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition flex items-center gap-2"
                    >
                      <FaTimes /> إلغاء
                    </button>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mt-6 border-2 border-red-100">
        

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <p className="font-bold text-gray-800">تسجيل الخروج من الحساب</p>
                <p className="text-sm text-gray-500 mt-1">
                  ستخرج من حسابك على هذا الجهاز
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-bold transition flex items-center gap-2"
              >
                <FaSignOutAlt /> تسجيل الخروج
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link to="/" className="text-primary hover:text-secondary font-bold transition inline-flex items-center gap-2">
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;