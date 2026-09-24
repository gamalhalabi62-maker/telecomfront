import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaCheckCircle, FaTimesCircle, FaSearch,
  FaDownload, FaPrint, FaTrash, FaChartBar, FaUpload,
  FaFilter, FaSpinner, FaUserCheck, FaUserTimes,
} from 'react-icons/fa';
import { electionAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';

const ManageElection = () => {
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [willAttendFilter, setWillAttendFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchData = async () => {
    try {
      const [statsRes, listRes] = await Promise.all([
        electionAPI.getStats(),
        electionAPI.getList({
          willAttend: willAttendFilter,
          membershipType: typeFilter,
          search,
          limit: 500,
        }),
      ]);
      setStats(statsRes.data);
      setList(listRes.data.list);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [willAttendFilter, typeFilter, search]);

  const handleExport = async (willAttend) => {
    try {
      const params = new URLSearchParams();
      if (willAttend !== undefined) params.append('willAttend', willAttend);
      if (typeFilter) params.append('membershipType', typeFilter);

      const response = await electionAPI.export(params.toString());
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `election-attendance-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('تم التصدير بنجاح');
    } catch (err) {
      toast.error('حدث خطأ أثناء التصدير');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التسجيل؟')) return;
    try {
      await electionAPI.deleteAttendance(id);
      toast.success('تم الحذف');
      fetchData();
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const displayedList = list.filter((item) => {
    if (activeTab === 'attending') return item.willAttend === true;
    if (activeTab === 'notAttending') return item.willAttend === false;
    return true;
  });

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl">
              <FaChartBar />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">إدارة انتخابات الجمعية العمومية</h1>
              <p className="text-gray-200 text-sm">متابعة تسجيلات الحضور والإحصائيات</p>
            </div>
          </div>
          <Link
            to="/admin/elections/upload"
            className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2"
          >
            <FaUpload /> استيراد أعضاء
          </Link>
        </div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
            <StatCard label="إجمالي الأعضاء" value={stats.totalMembers} color="text-white" />
            <StatCard label="عامل" value={stats.workingTotal} color="text-blue-200" />
            <StatCard label="بالمعاش" value={stats.retiredTotal} color="text-purple-200" />
            <StatCard label="سيحضر" value={stats.attending} color="text-green-300" />
            <StatCard label="لن يحضر" value={stats.notAttending} color="text-red-300" />
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="relative md:col-span-1">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم أو الرقم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pr-12"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="">كل الأنواع</option>
            <option value="working">عامل</option>
            <option value="retired">بالمعاش</option>
          </select>

          <select
            value={willAttendFilter}
            onChange={(e) => setWillAttendFilter(e.target.value)}
            className="input-field"
          >
            <option value="">الكل</option>
            <option value="true">سيحضر</option>
            <option value="false">لن يحضر</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <button
            onClick={() => handleExport('true')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition flex items-center gap-2 text-sm"
          >
            <FaDownload /> تصدير الحاضرين
          </button>
          <button
            onClick={() => handleExport('false')}
            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition flex items-center gap-2 text-sm"
          >
            <FaDownload /> تصدير المعتذرين
          </button>
          <button
            onClick={() => handleExport()}
            className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2 text-sm"
          >
            <FaDownload /> تصدير الكل
          </button>
          <button
            onClick={handlePrint}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-700 transition flex items-center gap-2 text-sm"
          >
            <FaPrint /> طباعة
          </button>
        </div>
      </div>

      {stats && stats.byCommittee && stats.byCommittee.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-black text-primary mb-4">📍 توزيع الحاضرين حسب اللجنة</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.byCommittee.map((c, i) => (
              <div key={i} className="bg-primary/5 rounded-xl p-4 border-r-4 border-primary">
                <p className="text-xs text-gray-500">رقم {c.committeeNumber || '—'}</p>
                <p className="font-bold text-primary">{c.committeeName || 'غير محدد'}</p>
                <p className="text-2xl font-black text-secondary mt-1">{c.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="flex border-b overflow-x-auto">
          <TabButton
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            icon={<FaUsers />}
            label={`الكل (${list.length})`}
          />
          <TabButton
            active={activeTab === 'attending'}
            onClick={() => setActiveTab('attending')}
            icon={<FaUserCheck />}
            label={`سيحضر (${list.filter(l => l.willAttend).length})`}
          />
          <TabButton
            active={activeTab === 'notAttending'}
            onClick={() => setActiveTab('notAttending')}
            icon={<FaUserTimes />}
            label={`لن يحضر (${list.filter(l => !l.willAttend).length})`}
          />
        </div>

        {displayedList.length === 0 ? (
          <div className="text-center py-16">
            <FaUsers className="text-6xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 font-bold">لا توجد بيانات</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-3 text-right text-sm">#</th>
                  <th className="p-3 text-right text-sm">الاسم</th>
                  <th className="p-3 text-right text-sm">رقم العضوية</th>
                  <th className="p-3 text-right text-sm">النوع</th>
                  <th className="p-3 text-right text-sm">الهاتف</th>
                  <th className="p-3 text-right text-sm">اللجنة</th>
                  <th className="p-3 text-center text-sm">الحالة</th>
                  <th className="p-3 text-center text-sm">التاريخ</th>
                  <th className="p-3 text-center text-sm">حذف</th>
                </tr>
              </thead>
              <tbody>
                {displayedList.map((item, i) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-500 text-sm">{i + 1}</td>
                    <td className="p-3 font-bold text-primary">{item.name}</td>
                    <td className="p-3 font-mono text-sm text-gray-600" dir="ltr">
                      {item.fullMembershipNumber}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        item.membershipType === 'working'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.membershipType === 'working' ? 'عامل' : 'بالمعاش'}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600" dir="ltr">{item.phone || '—'}</td>
                    <td className="p-3 text-sm text-gray-600">
                      {item.committeeName ? (
                        <>
                          <span>{item.committeeName}</span>
                          {item.committeeNumber && (
                            <span className="text-xs text-gray-400 block">رقم {item.committeeNumber}</span>
                          )}
                        </>
                      ) : '—'}
                    </td>
                    <td className="p-3 text-center">
                      {item.willAttend ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                          <FaCheckCircle /> سيحضر
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
                          <FaTimesCircle /> لن يحضر
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-center text-xs text-gray-500">
                      {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700"
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    <p className="text-xs text-gray-200 mt-1">{label}</p>
  </div>
);

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap transition ${
      active
        ? 'text-primary border-b-3 border-primary bg-primary/5'
        : 'text-gray-500 hover:text-primary'
    }`}
    style={active ? { borderBottom: '3px solid #4A148C' } : {}}
  >
    {icon} {label}
  </button>
);

export default ManageElection;