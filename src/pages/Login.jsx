import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaLock, FaEnvelope, FaSignInAlt, FaEye, FaEyeSlash, FaTrophy, FaUsers, FaFutbol } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [email, setEmail] = useState(location.state?.email || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) errs.email = 'البريد الإلكتروني مطلوب';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'البريد غير صحيح';
    if (!password) errs.password = 'كلمة المرور مطلوبة';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      toast.success(`مرحباً بك، ${user.name} 🎉`, 2500);

      setTimeout(() => {
        if (user.role === 'admin' || user.role === 'editor') navigate('/admin');
        else navigate('/');
      }, 700);
    } catch (err) {
      const errData = err.response?.data;

      // ⚠️ فقط إذا كان غير مُفعّل (لكن مسجل بالفعل وتم تفعيله سابقاً لن يحدث هذا)
      if (errData?.requiresVerification) {
        toast.warning('حسابك غير مُفعّل. جاري تحويلك للتحقق...', 2500);
        setTimeout(() => navigate('/verify-otp', { state: { email: errData.email || email } }), 1200);
        return;
      }

      toast.error(errData?.message || 'بيانات الدخول غير صحيحة');
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
            نادي <span className="text-secondary">المصرية للاتصالات</span>
          </h1>
          <p className="text-xl text-gray-200 mb-12">
            TELECOM EGYPT CLUB
          </p>

          <div className="space-y-4 w-full max-w-sm">
            {[
              { icon: <FaTrophy />, text: 'تابع آخر الأخبار والبطولات' },
              { icon: <FaFutbol />, text: 'مباريات مباشرة ونتائج لحظية' },
              { icon: <FaUsers />, text: 'تعرف على نجوم الفريق' },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 text-right"
              >
                <div className="w-10 h-10 bg-secondary text-primary-dark rounded-lg flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <p className="font-bold text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-dark to-transparent"></div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <img
              src="/logo.png"
              alt="نادي المصرية للاتصالات"
              className="w-24 h-24 object-contain drop-shadow-xl mx-auto mb-4 animate-float"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <h1 className="text-2xl font-black text-primary">نادي المصرية للاتصالات</h1>
            <p className="text-gray-500 text-sm">TELECOM EGYPT CLUB</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-black text-primary mb-2">تسجيل الدخول</h1>
              <p className="text-gray-500 text-sm">أدخل بياناتك للمتابعة</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="absolute top-0 right-0 h-14 w-14 flex items-center justify-center text-primary pointer-events-none">
                    <FaEnvelope />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({ ...errors, email: '' }); }}
                    placeholder="you@example.com"
                    dir="ltr"
                    className={`w-full h-14 pr-14 pl-4 bg-gray-50 border-2 rounded-xl text-left font-medium transition-all focus:outline-none focus:bg-white ${
                      errors.email ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠️ {errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <div className="relative">
                  <div className="absolute top-0 right-0 h-14 w-14 flex items-center justify-center text-primary pointer-events-none">
                    <FaLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: '' }); }}
                    placeholder="••••••••"
                    dir="ltr"
                    className={`w-full h-14 pr-14 pl-14 bg-gray-50 border-2 rounded-xl text-left font-medium transition-all focus:outline-none focus:bg-white ${
                      errors.password ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-primary'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-0 left-0 h-14 w-14 flex items-center justify-center text-gray-400 hover:text-primary transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠️ {errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-14 bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الدخول...
                  </>
                ) : (
                  <>
                    <FaSignInAlt /> تسجيل الدخول
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-xs">أو</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <Link
              to="/register"
              className="block w-full h-14 border-2 border-primary text-primary rounded-xl font-black text-lg hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
            >
              إنشاء حساب جديد
            </Link>

            <div className="text-center mt-6">
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

export default Login;