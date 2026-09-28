import { useState, useEffect, useRef } from 'react';
import {
  FaVoteYea, FaSearch, FaCheckCircle, FaTimesCircle,
  FaUser, FaHashtag, FaSpinner, FaClock, FaMapMarkerAlt,
  FaInfoCircle, FaUsers, FaExclamationTriangle, FaMapPin,
} from 'react-icons/fa';
import { electionAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import BusGatheringPoints from '../components/BusGatheringPoints';

const MAPS_URL = 'https://maps.app.goo.gl/sooKnHng1tPsGam68?g_st=iwb';

const Election = () => {
  const toast = useToast();

  const [step, setStep] = useState('search');
  const [input, setInput] = useState('');
  const [member, setMember] = useState(null);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [previousChoice, setPreviousChoice] = useState(null);
  const [willAttend, setWillAttend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const autoResetTimer = useRef(null);

  const trimmedInput = input.trim();
  const isNumericInput = /^\d+$/.test(trimmedInput);
  const isMembershipNumber = isNumericInput && trimmedInput.length >= 3;
  const nameWords = trimmedInput.split(/\s+/).filter(Boolean);
  const isNameSearch = !isNumericInput && nameWords.length >= 3;
  const isReady = isMembershipNumber || isNameSearch;

  useEffect(() => {
    if (step === 'success') {
      autoResetTimer.current = setTimeout(() => {
        resetForm();
      }, 10000);
    }
    return () => {
      if (autoResetTimer.current) {
        clearTimeout(autoResetTimer.current);
        autoResetTimer.current = null;
      }
    };
  }, [step]);

  const handleInputChange = (e) => {
    const val = e.target.value;

    if (/^\d+$/.test(val)) {
      setInput(val.slice(0, 17));
    } else {
      setInput(val);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setMember(null);
    setAlreadyRegistered(false);
    setPreviousChoice(null);
    setWillAttend(null);

    if (isNumericInput) {
      if (trimmedInput.length < 3) {
        setError('يجب إدخال 3 أرقام على الأقل');
        toast.error('يجب إدخال 3 أرقام على الأقل');
        return;
      }
      if (trimmedInput.length > 17) {
        setError('الرقم طويل جداً');
        toast.error('الرقم طويل جداً');
        return;
      }
    } else {
      if (nameWords.length < 3) {
        setError('يجب إدخال الاسم الثلاثي كاملاً (3 كلمات على الأقل)');
        toast.error('يجب إدخال الاسم الثلاثي كاملاً');
        return;
      }
    }

    setLoading(true);
    try {
      const { data } = await electionAPI.searchMember({ input: trimmedInput });
      setMember(data.member);
      setAlreadyRegistered(data.alreadyRegistered);
      setPreviousChoice(data.previousChoice);
      setStep('confirm');
      toast.success(`مرحباً ${data.member.name}`);
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
      toast.warning('يرجى اختيار أحد الخيارين');
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
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    if (autoResetTimer.current) {
      clearTimeout(autoResetTimer.current);
      autoResetTimer.current = null;
    }
    setStep('search');
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
        </div>

        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-5 mb-6 flex items-start gap-3">
          <FaExclamationTriangle className="text-red-600 text-2xl flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-black text-red-800 mb-1">⚠️ ملاحظة مهمة</p>
            <p className="text-red-700 text-sm leading-relaxed font-bold">
              هذا التسجيل <strong>لتأكيد حضور الانتخابات فقط</strong> — لتحديد نقاط التجمع ومعرفة مكان اللجنة.
              <br />
              هذا <strong>ليس إجراء الانتخابات نفسها</strong>، بل خطوة تحضيرية لتنظيم الحضور.
            </p>
            <a
              href={MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-3 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition"
            >
              <FaMapPin />
              اضغط هنا لمعرفة مكان الانتخابات
            </a>
          </div>
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
                  <p className="text-sm text-gray-500"></p>
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
                  <label className="block font-bold text-gray-700 mb-2">
                    رقم العامل أو رقم العضوية أو الاسم الثلاثي *
                  </label>

                  <input
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    placeholder="اكتب الرقم أو الاسم الثلاثي"
                    dir={isNumericInput ? 'ltr' : 'rtl'}
                    className={`input-field text-center text-lg sm:text-xl md:text-2xl font-black tracking-wider sm:tracking-widest placeholder:text-sm sm:placeholder:text-base md:placeholder:text-lg placeholder:font-normal placeholder:tracking-normal ${
                      isNumericInput ? '' : 'text-right'
                    }`}
                    maxLength={isNumericInput ? 17 : 60}
                    autoFocus
                  />

                  <p className="text-xs text-gray-500 mt-2 text-center">
                    {trimmedInput.length === 0
                      ? 'اكتب رقم العامل أو رقم العضوية — أو الاسم الثلاثي كاملاً'
                      : isReady
                      ? '✅ جاهز'
                      : isNumericInput
                      ? '⚠️ 3 أرقام على الأقل'
                      : '⚠️ اكتب الاسم الثلاثي كاملاً'}
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isReady}
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
                  <InfoRow
                    icon={<FaHashtag />}
                    label="رقم العامل"
                    value={member.companyNumber}
                    ltr
                  />
                  <InfoRow
                    icon={<FaHashtag />}
                    label="رقم العضوية"
                    value={member.membershipNumber}
                    ltr
                  />
                  <InfoRow
                    icon={<FaUsers />}
                    label="نوع العضوية"
                    value={member.membershipType === 'working' ? '👷 عامل' : '👴 بالمعاش'}
                  />
                  <InfoRow
                    icon={<FaMapMarkerAlt />}
                    label="مكان اللجنة"
                    value={member.committeeName || 'لم يُحدد بعد'}
                  />
                  <InfoRow
                    icon={<FaClock />}
                    label="توقيت الانتخاب"
                    value={member.electionTime || 'لم يُحدد بعد'}
                  />
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
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {willAttend
                  ? 'شكراً لك. نتشرف بحضوركم في انتخابات الجمعية العمومية.'
                  : 'شكراً لك على إبلاغنا. نتفهم عدم تمكنك من الحضور.'}
              </p>

              <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-5 mb-8 max-w-2xl mx-auto text-right">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-red-600 text-xl flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-black text-red-700 mb-2">تنبيه مهم</p>
                    <p className="text-red-600 text-sm leading-relaxed">
                      هذا التسجيل <strong>لتأكيد حضور الانتخابات فقط</strong> — بهدف تحديد نقاط التجمع
                      ومعرفة مكان اللجنة الخاصة بكم.
                    </p>
                    <p className="text-red-600 text-sm leading-relaxed mt-2">
                      <strong>هذا ليس إجراء الانتخابات نفسها</strong>، بل خطوة تحضيرية لتنظيم الحضور.
                      سيتم التواصل معكم لاحقاً بتفاصيل الموعد الرسمي للانتخابات.
                    </p>
                    <a
                      href={MAPS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition"
                    >
                      <FaMapPin />
                      اضغط هنا لمعرفة مكان الانتخابات
                    </a>
                  </div>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="btn-primary inline-flex items-center gap-2"
              >
                رجوع
              </button>
            </div>
          )}
        </div>

        <section className="mt-8">
          <BusGatheringPoints />
        </section>

        <div className="text-center mt-8 space-y-2">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} نادي المصرية للاتصالات - جميع الحقوق محفوظة
          </p>
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