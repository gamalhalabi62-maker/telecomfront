import { useState, useEffect } from 'react';
import {
  FaVoteYea, FaSearch, FaCheckCircle, FaTimesCircle,
  FaUser, FaPhone, FaMapMarkerAlt, FaHashtag, FaSpinner,
  FaInfoCircle, FaUsers,
} from 'react-icons/fa';
import { electionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const Election = () => {
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [step, setStep] = useState('search');
  const [membershipType, setMembershipType] = useState('');
  const [input, setInput] = useState('');
  const [member, setMember] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [previousChoice, setPreviousChoice] = useState(null);
  const [willAttend, setWillAttend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await electionAPI.getPublicStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setMember(null);
    setAlreadyRegistered(false);
    setPreviousChoice(null);
    setWillAttend(null);

    if (!membershipType) {
      setError('يرجى اختيار نوع العضوية');
      return;
    }

    const cleaned = input.replace(/\D/g, '');
    if (cleaned.length !== 6) {
      setError('يجب إدخال 6 أرقام بالضبط — مثال: 000029');
      return;
    }

    setLoading(true);
    try {
      const { data } = await electionAPI.searchMember({
        membershipType,
        input: cleaned,
      });
      setMember(data.member);
      setAlreadyRegistered(data.alreadyRegistered);
      setPreviousChoice(data.previousChoice);
      setStep('confirm');
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (willAttend === null) {
      setError('يرجى اختيار: سأحضر أم لن أحضر');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { data } = await electionAPI.register({
        memberId: member._id,
        willAttend,
      });
      toast.success(data.message);
      setStep('success');
      fetchStats();
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('search');
    setMembershipType('');
    setInput('');
    setMember(null);
    setWillAttend(null);
    setError('');
    setAlreadyRegistered(false);
    setPreviousChoice(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 py-8 md:py-12">
      <div className="container-custom max-w-4xl mx-auto">
        <div className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white rounded-3xl shadow-2xl p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-2xl mb-4 shadow-2xl">
              <FaVoteYea className="text-primary text-4xl" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">
              تأكيد حضور انتخابات الجمعية العمومية
            </h1>
            <p className="text-gray-200 text-base md:text-lg max-w-2xl mx-auto">
              يرجى تسجيل مشاركتكم في انتخابات الجمعية العمومية لنادي المصرية للاتصالات
            </p>
          </div>

          {stats && (
            <div className="grid grid-cols-3 gap-3 md:gap-4 mt-8 relative z-10">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-black text-secondary">{stats.attending}</p>
                <p className="text-xs md:text-sm text-gray-200">سيحضر</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-black text-gray-200">{stats.notAttending}</p>
                <p className="text-xs md:text-sm text-gray-200">لن يحضر</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 md:p-4 text-center">
                <p className="text-2xl md:text-3xl font-black text-white">{stats.totalMembers}</p>
                <p className="text-xs md:text-sm text-gray-200">إجمالي الأعضاء</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
          {step === 'search' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-xl">
                  <FaSearch />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-primary">ابحث عن بياناتك</h2>
                  <p className="text-sm text-gray-500">أدخل بياناتك للتحقق من عضويتك</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
                  <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSearch} className="space-y-6">
                <div>
                  <label className="block font-bold text-gray-700 mb-3">
                    نوع العضوية *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMembershipType('working')}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        membershipType === 'working'
                          ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <FaUsers className="text-3xl" />
                      <span className="font-black text-lg">عضو عامل</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMembershipType('retired')}
                      className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        membershipType === 'retired'
                          ? 'border-primary bg-primary/10 text-primary shadow-lg scale-105'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <FaUsers className="text-3xl" />
                      <span className="font-black text-lg">عضو بالمعاش</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-2">
                    رقم الشركة *
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    أدخل 6 أرقام بالضبط — مثال: 000029
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={input}
                    onChange={(e) => setInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000029"
                    dir="ltr"
                    className="input-field text-center text-2xl font-black tracking-widest"
                    maxLength={6}
                  />
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-gray-500">{input.length} / 6</span>
                    {input.length === 6 && (
                      <span className="text-green-600 font-bold">✅ جاهز للبحث</span>
                    )}
                    {input.length > 0 && input.length < 6 && (
                      <span className="text-yellow-600 font-bold">⚠️ يجب إدخال 6 أرقام</span>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || input.length !== 6 || !membershipType}
                  className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 py-4 text-lg"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin" /> جاري البحث...
                    </>
                  ) : (
                    <>
                      <FaSearch /> بحث
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'confirm' && member && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 text-xl">
                  <FaCheckCircle />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-primary">تأكيد البيانات</h2>
                  <p className="text-sm text-gray-500">تحقق من صحة بياناتك قبل التسجيل</p>
                </div>
              </div>

              {alreadyRegistered && (
                <div className="bg-yellow-50 border-r-4 border-yellow-500 text-yellow-800 p-4 rounded-lg mb-6">
                  <p className="font-bold mb-1">⚠️ لقد قمت بالتسجيل مسبقاً</p>
                  <p className="text-sm">
                    اختيارك السابق: <strong>{previousChoice ? 'سأحضر' : 'لن أحضر'}</strong>
                  </p>
                  <p className="text-sm mt-1">لا يمكن التعديل بعد التسجيل.</p>
                </div>
              )}

              <div className="bg-gray-50 rounded-2xl p-6 mb-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow icon={<FaUser />} label="الاسم" value={member.name} />
                  <InfoRow icon={<FaHashtag />} label="رقم الشركة" value={member.companyNumber} ltr />
                  <InfoRow icon={<FaUsers />} label="نوع العضوية" value={member.membershipType === 'working' ? 'عامل' : 'بالمعاش'} />
                  <InfoRow icon={<FaPhone />} label="الهاتف" value={member.phone || 'غير مسجل'} ltr />
                  <InfoRow icon={<FaMapMarkerAlt />} label="مكان اللجنة" value={member.committeeName || 'لم يُحدد بعد'} />
                  <InfoRow icon={<FaHashtag />} label="رقم اللجنة" value={member.committeeNumber || 'لم يُحدد بعد'} />
                </div>
              </div>

              {!alreadyRegistered && (
                <>
                  <div className="mb-6">
                    <label className="block font-bold text-gray-700 mb-3 text-center text-lg">
                      هل ستتمكن من حضور الانتخابات؟ *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setWillAttend(true)}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                          willAttend === true
                            ? 'border-green-500 bg-green-50 text-green-700 shadow-lg scale-105'
                            : 'border-gray-200 text-gray-500 hover:border-green-300'
                        }`}
                      >
                        <FaCheckCircle className="text-4xl" />
                        <span className="font-black text-lg">نعم، سأحضر</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setWillAttend(false)}
                        className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                          willAttend === false
                            ? 'border-red-500 bg-red-50 text-red-700 shadow-lg scale-105'
                            : 'border-gray-200 text-gray-500 hover:border-red-300'
                        }`}
                      >
                        <FaTimesCircle className="text-4xl" />
                        <span className="font-black text-lg">لا، لن أحضر</span>
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-lg mb-4">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                      رجوع
                    </button>
                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={submitting || willAttend === null}
                      className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <FaSpinner className="animate-spin" /> جاري الحفظ...
                        </>
                      ) : (
                        'تأكيد التسجيل'
                      )}
                    </button>
                  </div>
                </>
              )}

              {alreadyRegistered && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                  رجوع
                </button>
              )}
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <FaCheckCircle className="text-green-600 text-5xl" />
              </div>
              <h2 className="text-3xl font-black text-primary mb-3">
                تم التسجيل بنجاح!
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {willAttend
                  ? 'شكراً لك. نتشرف بحضوركم في انتخابات الجمعية العمومية.'
                  : 'شكراً لك على إبلاغنا. نتفهم عدم تمكنك من الحضور.'}
              </p>
              <button
                onClick={resetForm}
                className="btn-primary inline-flex items-center gap-2"
              >
                تسجيل عضو آخر
              </button>
            </div>
          )}
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} نادي المصرية للاتصالات - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value, ltr }) => (
  <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100">
    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary flex-shrink-0">
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-gray-500 font-medium">{label}</p>
      <p
        className="font-bold text-primary truncate"
        dir={ltr ? 'ltr' : 'rtl'}
        style={ltr ? { textAlign: 'right' } : {}}
      >
        {value}
      </p>
    </div>
  </div>
);

export default Election;