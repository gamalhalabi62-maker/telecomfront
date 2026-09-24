import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaCheckCircle, FaRedo } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();
  const toast = useToast();

  const email = location.state?.email || '';
  const name = location.state?.name || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) navigate('/register');
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  }, []);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every((d) => d) && index === 5) handleVerify(newOtp.join(''));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim().slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;

    const newOtp = pasted.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);

    if (pasted.length === 6) handleVerify(pasted);
  };

  const handleVerify = async (code) => {
    setError('');
    setLoading(true);

    try {
      await verifyOTP(email, code);
      toast.success('🎉 تم تفعيل حسابك بنجاح!');
      setTimeout(() => navigate('/login', { state: { email } }), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'الرمز غير صحيح';
      setError(msg);
      toast.error(msg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      toast.warning('يرجى إدخال الرمز كاملاً');
      return;
    }
    handleVerify(code);
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await resendOTP(email);
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      toast.success('تم إرسال رمز جديد إلى بريدك');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
      {/* ============ Left - Branding ============ */}
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
            خطوة <span className="text-secondary">واحدة</span> فقط
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            تحقق من بريدك لتفعيل حسابك
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-dark to-transparent"></div>
      </div>

      {/* ============ Right - Form ============ */}
      <div className="flex items-center justify-center p-6 md:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <img
              src="/logo.png"
              alt="نادي المصرية للاتصالات"
              className="w-20 h-20 object-contain drop-shadow-xl mx-auto mb-3 animate-float"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center shadow-2xl">
                  <FaEnvelope className="text-white text-3xl" />
                </div>
                <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-primary-dark text-xs font-black shadow-lg">
                  ✉️
                </div>
              </div>
              <h1 className="text-2xl font-black text-primary mb-2">تحقق من بريدك</h1>
              <p className="text-gray-500 text-sm">أرسلنا رمزاً مكوّناً من 6 أرقام إلى</p>
              <p className="font-bold text-primary mt-1 text-sm bg-primary/5 rounded-lg py-1.5 px-3 inline-block" dir="ltr">
                {email}
              </p>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm">✓</div>
                <span className="text-xs font-bold text-green-600 hidden sm:inline">البيانات</span>
              </div>
              <div className="w-12 h-1 bg-primary rounded"></div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-black text-sm animate-pulse">2</div>
                <span className="text-xs font-black text-primary hidden sm:inline">التحقق</span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3 rounded-xl mb-5 text-sm text-center font-bold">
                ⚠️ {error}
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit}>
              <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                أدخل الرمز
              </label>

              <div className="flex justify-center gap-2 mb-5" dir="ltr">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={loading}
                    autoComplete="one-time-code"
                    className={`w-11 h-13 md:w-12 md:h-14 text-center text-xl md:text-2xl font-black rounded-xl border-2 transition-all focus:outline-none disabled:opacity-50 ${
                      digit
                        ? 'border-primary bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg scale-105'
                        : 'border-gray-200 bg-gray-50 text-primary focus:border-primary focus:bg-white focus:scale-105'
                    }`}
                    style={{ height: '3.5rem' }}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.some((d) => !d)}
                className="w-full h-14 bg-gradient-to-l from-primary to-primary-dark text-white rounded-xl font-black text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري التحقق...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> تأكيد الرمز
                  </>
                )}
              </button>
            </form>

            {/* Resend */}
            <div className="text-center mt-5 pt-5 border-t">
              <p className="text-gray-600 text-sm mb-2">لم تستلم الرمز؟</p>
              {countdown > 0 ? (
                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
                  <span className="text-sm text-gray-500">⏱️ بعد</span>
                  <span className="font-black text-primary">{countdown}</span>
                  <span className="text-sm text-gray-500">ثانية</span>
                </div>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-primary font-black hover:text-secondary transition inline-flex items-center gap-2 disabled:opacity-50 bg-primary/5 hover:bg-primary/10 px-5 py-2 rounded-full"
                >
                  <FaRedo className={resending ? 'animate-spin' : ''} />
                  {resending ? 'جاري الإرسال...' : 'إعادة إرسال الرمز'}
                </button>
              )}
            </div>

            <div className="text-center mt-4">
              <Link to="/register" className="text-gray-500 text-xs hover:text-primary transition">
                ← العودة للتسجيل
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;