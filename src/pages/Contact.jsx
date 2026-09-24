import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane,
  FaUser, FaLock, FaWhatsapp,
} from 'react-icons/fa';
import { messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const subjects = [
  { value: 'inquiry', label: 'استفسار', emoji: '❓' },
  { value: 'complaint', label: 'شكوى', emoji: '⚠️' },
  { value: 'suggestion', label: 'اقتراح', emoji: '💡' },
  { value: 'membership', label: 'انضمام للنادي', emoji: '🎫' },
  { value: 'sponsorship', label: 'رعاية', emoji: '🤝' },
  { value: 'other', label: 'أخرى', emoji: '📝' },
];

const Contact = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    subject: 'inquiry',
    subjectText: '',
    content: '',
    phone: user?.phone || '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.subject) errs.subject = 'الموضوع مطلوب';
    if (!formData.content) errs.content = 'الرسالة مطلوبة';
    else if (formData.content.length < 10) errs.content = 'الرسالة قصيرة جداً (10 أحرف على الأقل)';
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
      await messageAPI.create(formData);
      toast.success('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 5000);
      setFormData({ subject: 'inquiry', subjectText: '', content: '', phone: user?.phone || '' });
      setTimeout(() => navigate('/my-messages'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
        </div>
        <div className="container-custom text-center relative z-10">
          <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary text-4xl shadow-2xl">
            <FaEnvelope />
          </div>
          <h1 className="text-4xl md:text-6xl font-black mb-4">
            اتصل <span className="text-secondary">بنا</span>
          </h1>
          <p className="text-gray-200 text-lg">نحن هنا للإجابة على استفساراتك</p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            {[
              { icon: <FaMapMarkerAlt />, title: 'العنوان', value: 'مدينة نصر، القاهرة، مصر' },
              { icon: <FaPhone />, title: 'الهاتف', value: '+01025713589' },
              { icon: <FaEnvelope />, title: 'البريد', value: 'info@teclub.com' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md flex gap-4 items-start hover:shadow-xl transition">
                <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center text-xl flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-primary mb-1">{item.title}</h3>
                  <p className="text-gray-600">{item.value}</p>
                </div>
              </div>
            ))}

            {/* WhatsApp Note */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <FaWhatsapp className="text-green-600 text-3xl" />
                <h3 className="font-black text-green-800">التواصل عبر واتساب</h3>
              </div>
              <p className="text-sm text-green-700">
                بعد إرسال رسالتك، سيتواصل معك فريق الإدارة عبر رقم الواتساب الذي سجلت به أو ترسله.
              </p>
            </div>
          </div>

          {/* Form or Login Prompt */}
          <div className="lg:col-span-2">
            {user ? (
              <div className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-secondary">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-black">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-primary">أرسل رسالة</h2>
                    <p className="text-sm text-gray-500">مرحباً {user.name}، نحن هنا لخدمتك</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Subject */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">الموضوع *</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {subjects.map((sub) => (
                        <button
                          key={sub.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, subject: sub.value })}
                          className={`p-3 rounded-lg border-2 font-bold text-sm transition ${
                            formData.subject === sub.value
                              ? 'border-primary bg-primary/5 text-primary scale-105'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          <span className="block text-xl mb-1">{sub.emoji}</span>
                          {sub.label}
                        </button>
                      ))}
                    </div>
                    {errors.subject && <p className="text-red-500 text-xs mt-1">⚠️ {errors.subject}</p>}
                  </div>

                  {/* Subject Text */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">
                      عنوان مختصر <span className="text-gray-400 font-normal">(اختياري)</span>
                    </label>
                    <input
                      type="text"
                      name="subjectText"
                      value={formData.subjectText}
                      onChange={handleChange}
                      placeholder="مثال: استفسار عن العضوية"
                      className="input-field"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">
                      رقم الواتساب <span className="text-gray-400 font-normal">(للرد عليك)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute top-0 right-0 h-full w-12 flex items-center justify-center text-primary pointer-events-none">
                        <FaWhatsapp />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+20 123 456 7890"
                        dir="ltr"
                        className="w-full h-12 pr-12 pl-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-left font-medium focus:outline-none focus:bg-white focus:border-primary"
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block font-bold text-gray-700 mb-2">الرسالة *</label>
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="اكتب رسالتك هنا..."
                      className={`input-field resize-none ${errors.content ? 'border-red-400' : ''}`}
                    ></textarea>
                    <div className="flex justify-between mt-1">
                      {errors.content && <p className="text-red-500 text-xs">⚠️ {errors.content}</p>}
                      <p className="text-xs text-gray-400 mr-auto">
                        {formData.content.length} / 2000
                      </p>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane /> إرسال الرسالة
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              // Login Prompt
              <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaLock className="text-primary text-4xl" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-primary mb-3">
                  يجب تسجيل الدخول أولاً
                </h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  لتتمكن من إرسال رسالة إلى الإدارة، يجب إنشاء حساب أولاً. هذا يساعدنا على التواصل معك بسهولة.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/register" className="btn-primary">
                    إنشاء حساب جديد
                  </Link>
                  <Link to="/login" className="bg-gray-100 text-primary px-6 py-3 rounded-lg font-bold hover:bg-gray-200 transition">
                    تسجيل الدخول
                  </Link>
                </div>

                <div className="mt-8 pt-6 border-t">
                  <p className="text-sm text-gray-500">
                    💡 هل لديك حساب؟ سجل دخولك الآن وسيتم ملء بياناتك تلقائياً.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;