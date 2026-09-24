import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUpload, FaFileExcel, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaTrash, FaInfoCircle, FaChartBar,
  FaCloudUploadAlt, FaFile, FaUsers, FaPlusCircle,
  FaSync, FaExclamationTriangle, FaArrowLeft,
} from 'react-icons/fa';
import { electionAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const UploadMembers = () => {
  const toast = useToast();
  const fileRef = useRef();

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (f) => {
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) {
      toast.error('يُسمح بملفات Excel فقط (.xlsx, .xls, .csv)');
      return false;
    }
    if (f.size > 20 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً (الحد 20MB)');
      return false;
    }
    return true;
  };

  const handleFile = (f) => {
    if (!validateFile(f)) return;
    setFile(f);
    setResult(null);
    setError('');
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('excel', file);

      const { data } = await electionAPI.importMembers(formData);
      setResult(data);
      toast.success(data.message);
    } catch (err) {
      const msg = err.response?.data?.message || 'حدث خطأ أثناء الاستيراد';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('⚠️ سيتم حذف جميع الأعضاء نهائياً. هل أنت متأكد؟')) return;
    if (!window.confirm('تأكيد أخير: هل تريد المتابعة؟')) return;

    try {
      const { data } = await electionAPI.deleteAllMembers();
      toast.success(data.message);
      setResult(null);
      setFile(null);
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const handleResetAttendance = async () => {
    if (!window.confirm('⚠️ سيتم حذف جميع تسجيلات الحضور. هل أنت متأكد؟')) return;
    try {
      const { data } = await electionAPI.resetAttendance();
      toast.success(data.message);
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  return (
    <div className="container-custom py-8 max-w-5xl mx-auto">
      <div className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white p-6 md:p-8 rounded-2xl mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl shadow-xl">
              <FaCloudUploadAlt />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">استيراد بيانات الأعضاء</h1>
              <p className="text-gray-200 text-sm">رفع ملف Excel لتحديث قاعدة بيانات الأعضاء</p>
            </div>
          </div>
          <Link
            to="/admin/elections"
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-5 py-3 rounded-lg font-bold transition flex items-center gap-2"
          >
            <FaArrowLeft /> رجوع للوحة
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
        <div className="flex items-start gap-3 p-4 bg-gradient-to-l from-blue-50 to-indigo-50 border-r-4 border-blue-500 rounded-xl mb-6">
          <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0 text-lg" />
          <div className="text-sm text-blue-800 flex-1">
            <p className="font-black mb-3 text-base">📋 الأعمدة المطلوبة في ملف Excel:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span><strong>رقم العامل بالشركة</strong> — مثال: 000029</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span><strong>رقم العضوية</strong> — مثال: 001</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span><strong>الاسم</strong> — الاسم الكامل</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span><strong>النوع</strong> — معاش / عامل</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span><strong>التليفون</strong> — رقم الهاتف</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500 flex-shrink-0" />
                <span><strong>العنوان</strong> — العنوان</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200 text-xs space-y-1">
              <p>✅ <strong>الأعمدة الإضافية</strong> (مكان اللجنة، رقم اللجنة) اختيارية</p>
              <p>✅ <strong>الأرقام المركبة تلقائياً:</strong> <code dir="ltr" className="bg-blue-100 px-2 py-0.5 rounded">00101 + 000029 + 001</code></p>
            </div>
          </div>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-3 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-300 ${
            isDragging
              ? 'border-primary bg-primary/5 scale-[1.02] shadow-2xl'
              : file
              ? 'border-green-400 bg-green-50/50'
              : 'border-gray-300 hover:border-primary/50 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          {!file ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="cursor-pointer"
            >
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl mb-6 shadow-2xl shadow-green-500/30 transform hover:scale-110 transition">
                <FaFileExcel className="text-white text-5xl" />
              </div>
              <p className="text-2xl font-black text-primary mb-2">
                {isDragging ? '✨ أفلت الملف هنا' : 'اختر ملف Excel'}
              </p>
              <p className="text-sm text-gray-500 mb-4">
                أو اسحب وأفلت الملف هنا
              </p>
              <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg text-xs font-bold">
                <FaFile /> .xlsx, .xls, .csv — الحد 20MB
              </div>
            </div>
          ) : (
            <div>
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-xl">
                <FaCheckCircle className="text-white text-4xl" />
              </div>
              <p className="text-xl font-black text-primary mb-1">{file.name}</p>
              <p className="text-sm text-gray-500 mb-6">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <FaSync /> تغيير الملف
                </button>
                <button
                  onClick={() => { setFile(null); setResult(null); }}
                  className="bg-red-50 text-red-600 px-6 py-2.5 rounded-lg font-bold hover:bg-red-100 transition flex items-center gap-2"
                >
                  <FaTimesCircle /> إزالة
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-xl flex items-start gap-3 animate-shake">
            <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {file && !result && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="group relative mt-6 w-full bg-gradient-to-l from-primary to-primary-dark text-white py-5 rounded-2xl font-black text-lg transition-all disabled:opacity-50 shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-l from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
            <span className="relative flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <FaSpinner className="animate-spin" /> جاري الاستيراد...
                </>
              ) : (
                <>
                  <FaUpload /> ابدأ الاستيراد
                </>
              )}
            </span>
          </button>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6 animate-fade-in-up">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-2xl">
              <FaCheckCircle />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary">تم الاستيراد بنجاح!</h2>
              <p className="text-sm text-gray-500">ملخص النتائج</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <ResultStat label="إجمالي الصفوف" value={result.summary.total} gradient="from-blue-500 to-indigo-600" icon={<FaFile />} />
            <ResultStat label="أعضاء جدد" value={result.summary.created} gradient="from-green-500 to-emerald-600" icon={<FaPlusCircle />} />
            <ResultStat label="تم التحديث" value={result.summary.updated} gradient="from-purple-500 to-pink-600" icon={<FaSync />} />
            <ResultStat label="تم التخطي" value={result.summary.skipped} gradient="from-yellow-500 to-orange-600" icon={<FaTimesCircle />} />
          </div>

          {result.detectedColumns && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border border-gray-100 mb-4">
              <p className="font-black text-sm text-gray-700 mb-3 flex items-center gap-2">
                <FaInfoCircle className="text-primary" />
                الأعمدة المكتشفة
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {Object.entries(result.detectedColumns).map(([key, val]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-white rounded-lg">
                    <span className="text-gray-500 font-bold">{key}:</span>
                    {val ? (
                      <span className="font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded">
                        {val}
                      </span>
                    ) : (
                      <span className="text-red-500 font-bold">❌ لم يُعثر</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-5 border-r-4 border-red-500">
              <p className="font-black text-red-700 mb-3 flex items-center gap-2">
                <FaExclamationTriangle />
                أخطاء ({result.errors.length})
              </p>
              <ul className="text-xs text-red-600 space-y-1 max-h-40 overflow-y-auto">
                {result.errors.map((e, i) => (
                  <li key={i} className="font-mono">صف {e.row}: {e.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

     
    </div>
  );
};

const ResultStat = ({ label, value, gradient, icon }) => (
  <div className="relative overflow-hidden rounded-xl p-4 bg-white border-2 border-gray-100 hover:shadow-lg transition group">
    <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center text-white shadow-md mb-3 group-hover:scale-110 transition`}>
      {icon}
    </div>
    <p className="text-3xl font-black text-primary">{value}</p>
    <p className="text-xs text-gray-500 font-bold mt-1">{label}</p>
  </div>
);

export default UploadMembers;