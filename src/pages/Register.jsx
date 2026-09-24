import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser, FaEnvelope, FaLock, FaPhone, FaEye, FaEyeSlash,
  FaUserPlus, FaCheckCircle, FaTimesCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, text: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { level: 1, text: 'ضعيفة', color: 'bg-red-500' };
    if (score === 3) return { level: 2, text: 'متوسطة', color: 'bg-yellow-500' };
    if (score === 4) return { level: 3, text: 'قوية', color: 'bg-green-500' };
    return { level: 4, text: 'قوية جداً', color: 'bg-green-600' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'الاسم مطلوب';
    else if (formData.name.trim().length < 3) errs.name = 'الاسم قصير جداً';

    if (!formData.email) errs.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'البريد غير صحيح';

    if (!formData.password) errs.password = 'كلمة المرور مطلوبة';
    else if (formData.password.length < 6) errs.password = 'كلمة المرور 6 أحرف على الأقل';

    if (formData.password !== formData.confirmPassword) errs.confirmPassword = 'كلمتا المرور غير متطابقتين';

    if (!formData.agreeTerms) errs.agreeTerms = 'يجب الموافقة على الشروط';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('يرجى تصحيح الأخطاء قبل المتابعة');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      toast.success('تم التسجيل! تحقق من بريدك الإلكتروني', 4000);

      setTimeout(() => {
        navigate('/verify-otp', {
          state: { email: formData.email, name: formData.name },
        });
      }, 800);
    } catch (err) {
      const errData = err.response?.data;

      if (errData?.field === 'email') {
        setErrors({ ...errors, email: errData.message });
        toast.error(errData.message, 5000);
      } else {
        toast.error(errData?.message || 'حدث خطأ أثناء التسجيل');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex relative bg-gradient-to-br from-primary via-primary-light to-primary-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
        </div>

        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        ></div>

        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white text-center">
          <img
            src="/logo.png"
            alt="نادي المصرية للاتصالات"
            className="w-40 h-40 object-contain drop-shadow-2xl mb-8 animate-float"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <h1 className="text-4xl xl:text-5xl font-black mb-4 leading-tight">
            انضم إلى <span className="text-secondary">عائلتنا</span>
          </h1>
          <p className="text-xl text-gray-200 mb-12">
            كن جزءاً من نادي المصرية للاتصالات
          </p>

          <div className="space-y-4 w-full max-w-sm">
            {[
              { num: '1', text: 'املأ بياناتك' },
              { num: '2', text: 'تحقق من بريدك الإلكتروني' },
              { num: '3', text: 'ابدأ رحلتك معنا' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 text-right"
              >
                <div className="w-10 h-10 bg-secondary text-primary-dark rounded-full flex items-center justify-center font-black flex-shrink-0">
                  {item.num}
                </div>
                <p className="font-bold">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-dark to-transparent"></div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <img
              src="/logo.png"
              alt="نادي المصرية للاتصالات"
              className="w-20 h-20 object-contain drop-shadow-xl mx-auto mb-3 animate-float"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-2xl font-black text-primary">إنشاء حساب</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-black text-sm">1</div>
                <span className="text-xs font-bold text-primary hidden sm:inline">البيانات</span>
              </div>
              <div className="w-12 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-black text-sm">2</div>
                <span className="text-xs text-gray-400 hidden sm:inline">التحقق</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">الاسم الكامل *</label>
                <div className="relative">
                  <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-primary pointer-events-none">
                    <FaUser />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="محمد أحمد"
                    className={`w-full h-12 pr-12 pl-4 bg-gray-50 border-2 rounded-xl font-medium transition focus:outline-none focus:bg-white ${
                      errors.name ? 'border-red-400' : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">⚠️ {errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني *</label>
                <div className="relative">
                  <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-primary pointer-events-none">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    dir="ltr"
                    className={`w-full h-12 pr-12 pl-4 bg-gray-50 border-2 rounded-xl text-left font-medium transition focus:outline-none focus:bg-white ${
                      errors.email ? 'border-red-400' : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                </div>
                {errors.email ? (
                  <p className="text-red-500 text-xs mt-1">⚠️ {errors.email}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">✉️ سيصلك رمز التحقق على هذا البريد</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">
                  رقم الواتساب <span className="text-gray-400 font-normal">(اختياري)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-primary pointer-events-none">
                    <FaPhone />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+20 123 456 7890"
                    dir="ltr"
                    className="w-full h-12 pr-12 pl-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-left font-medium transition focus:outline-none focus:bg-white focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">كلمة المرور *</label>
                <div className="relative">
                  <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-primary pointer-events-none">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`w-full h-12 pr-12 pl-12 bg-gray-50 border-2 rounded-xl text-left font-medium transition focus:outline-none focus:bg-white ${
                      errors.password ? 'border-red-400' : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-0 left-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-primary transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>

                {formData.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 h-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`flex-1 rounded-full transition-all ${
                            i <= strength.level ? strength.color : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                    <p className="text-xs mt-1 text-gray-500">
                      قوة كلمة المرور: <span className="font-bold">{strength.text}</span>
                    </p>
                  </div>
                )}
                {errors.password && <p className="text-red-500 text-xs mt-1">⚠️ {errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">تأكيد كلمة المرور *</label>
                <div className="relative">
                  <div className="absolute top-0 right-0 h-12 w-12 flex items-center justify-center text-primary pointer-events-none">
                    <FaLock />
                  </div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`w-full h-12 pr-12 pl-12 bg-gray-50 border-2 rounded-xl text-left font-medium transition focus:outline-none focus:bg-white ${
                      errors.confirmPassword ? 'border-red-400' : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-0 left-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-primary transition"
                    tabIndex={-1}
                  >
                    {showConfirm ? <FaEyeSlash /> : <FaEye />}
                  </button>

                  {formData.confirmPassword && (
                    <div className="absolute top-0 left-12 h-12 flex items-center pr-2 pointer-events-none">
                      {formData.password === formData.confirmPassword ? (
                        <FaCheckCircle className="text-green-500" />
                      ) : (
                        <FaTimesCircle className="text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">⚠️ {errors.confirmPassword}</p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 bg-gradient-to-l from-primary/5 to-secondary/5 rounded-xl hover:from-primary/10 hover:to-secondary/10 transition border border-primary/10">
                <input
                  type="checkbox"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary mt-0.5"
                />
                <span className="text-xs text-gray-700 leading-relaxed">
                  أوافق على{' '}
                  <a href="#" className="text-primary font-bold hover:underline">الشروط</a>{' '}
                  و{' '}
                  <a href="#" className="text-primary font-bold hover:underline">سياسة الخصوصية</a>
                </span>
              </label>
              {errors.agreeTerms && <p className="text-red-500 text-xs">⚠️ {errors.agreeTerms}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التسجيل...
                  </>
                ) : (
                  <>
                    <FaUserPlus /> إنشاء الحساب
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-xs">لديك حساب؟</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <Link
              to="/login"
              className="block w-full h-12 border-2 border-primary text-primary rounded-xl font-black hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center"
            >
              تسجيل الدخول
            </Link>

            <div className="text-center mt-5">
              <Link to="/" className="text-gray-500 text-sm hover:text-primary transition">
                ← العودة للصفحة الرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;