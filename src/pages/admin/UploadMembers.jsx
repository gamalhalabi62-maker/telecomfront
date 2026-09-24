import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUpload, FaFileExcel, FaCheckCircle, FaTimesCircle,
  FaSpinner, FaTrash, FaInfoCircle, FaChartBar,
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

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) {
      toast.error('يُسمح بملفات Excel فقط');
      return;
    }

    if (f.size > 20 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً (الحد 20MB)');
      return;
    }

    setFile(f);
    setResult(null);
    setError('');
  };

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
    <div className="container-custom py-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white text-2xl">
          <FaUpload />
        </div>
        <div>
          <h1 className="text-3xl font-black text-primary">استيراد بيانات الأعضاء</h1>
          <p className="text-gray-500">رفع ملف Excel لتحديث قاعدة بيانات الأعضاء</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
        <div className="flex items-start gap-3 p-4 bg-blue-50 border-r-4 border-blue-500 rounded-lg mb-6">
          <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-bold mb-2">📋 الأعمدة المطلوبة في ملف Excel:</p>
            <ul className="list-disc list-inside space-y-1 mr-4">
              <li><strong>رقم الشركة بالشيت</strong> — مثال: <code dir="ltr">000029</code></li>
              <li><strong>رقم العضوية</strong> — مثال: <code dir="ltr">001</code></li>
              <li><strong>النوع</strong> — عامل / بالمعاش</li>
              <li><strong>الاسم</strong> — الاسم الكامل</li>
              <li><strong>التليفون</strong> — رقم الهاتف</li>
              <li><strong>العنوان</strong> — العنوان</li>
            </ul>
            <p className="mt-3">
              ✅ الأعمدة الإضافية (مكان اللجنة، رقم اللجنة) اختيارية.
            </p>
            <p className="mt-1">
              ✅ الأرقام المركبة: <code dir="ltr">00101 + 000029 + 001 = 00101000029001</code>
            </p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-primary transition">
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
              <FaFileExcel className="text-6xl text-green-500 mx-auto mb-4" />
              <p className="text-xl font-black text-primary mb-2">اختر ملف Excel</p>
              <p className="text-sm text-gray-500">.xlsx, .xls, .csv — الحد 20MB</p>
            </div>
          ) : (
            <div>
              <FaFileExcel className="text-6xl text-green-500 mx-auto mb-4" />
              <p className="text-lg font-black text-primary mb-1">{file.name}</p>
              <p className="text-sm text-gray-500 mb-4">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition"
                >
                  تغيير الملف
                </button>
                <button
                  onClick={() => { setFile(null); setResult(null); }}
                  className="bg-red-50 text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-100 transition"
                >
                  إزالة
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-6 bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {file && !result && (
          <button
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 w-full btn-primary flex items-center justify-center gap-2 py-4 text-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" /> جاري الاستيراد...
              </>
            ) : (
              <>
                <FaUpload /> ابدأ الاستيراد
              </>
            )}
          </button>
        )}
      </div>

      {result && (
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <FaCheckCircle className="text-green-500 text-3xl" />
            <h2 className="text-2xl font-black text-primary">نتيجة الاستيراد</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatBox label="إجمالي الصفوف" value={result.summary.total} color="bg-gray-100 text-gray-700" />
            <StatBox label="أعضاء جدد" value={result.summary.created} color="bg-green-100 text-green-700" />
            <StatBox label="تم التحديث" value={result.summary.updated} color="bg-blue-100 text-blue-700" />
            <StatBox label="تم التخطي" value={result.summary.skipped} color="bg-yellow-100 text-yellow-700" />
          </div>

          {result.detectedColumns && (
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="font-bold text-sm text-gray-700 mb-2">🔍 الأعمدة المكتشفة:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {Object.entries(result.detectedColumns).map(([key, val]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-gray-500">{key}:</span>
                    <span className="font-mono text-primary">{val || '❌ لم يُعثر'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 rounded-xl p-4">
              <p className="font-bold text-red-700 mb-2">⚠️ أخطاء:</p>
              <ul className="text-xs text-red-600 space-y-1">
                {result.errors.map((e, i) => (
                  <li key={i}>صف {e.row}: {e.error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="font-black text-primary mb-4">⚠️ عمليات خطرة</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleResetAttendance}
            className="bg-yellow-50 text-yellow-700 px-6 py-3 rounded-lg font-bold hover:bg-yellow-100 transition flex items-center gap-2"
          >
            <FaTrash /> حذف كل تسجيلات الحضور
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-red-50 text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-red-100 transition flex items-center gap-2"
          >
            <FaTrash /> حذف كل الأعضاء
          </button>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <Link to="/admin/elections" className="btn-primary flex items-center gap-2">
          <FaChartBar /> الانتقال إلى إدارة الانتخابات
        </Link>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color }) => (
  <div className={`${color} rounded-xl p-4 text-center`}>
    <p className="text-3xl font-black">{value}</p>
    <p className="text-xs font-bold mt-1">{label}</p>
  </div>
);

export default UploadMembers;