import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaCheckCircle, FaTimesCircle, FaSearch,
  FaDownload, FaPrint, FaTrash, FaChartBar, FaUpload,
  FaFilter, FaUserCheck, FaUserTimes,
  FaMapMarkerAlt, FaPhone, FaTimes, FaFileExcel,
  FaChartPie, FaSync, FaChevronDown, FaChevronUp,
  FaHashtag, FaLayerGroup,
} from 'react-icons/fa';
import { electionAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';

const ManageElection = () => {
  const toast = useToast();

  const [stats, setStats] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [willAttendFilter, setWillAttendFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const [statsRes, listRes] = await Promise.all([
        electionAPI.getStats(),
        electionAPI.getList({
          willAttend: willAttendFilter,
          membershipType: typeFilter,
          search,
          limit: 1000,
        }),
      ]);
      setStats(statsRes.data);
      setList(listRes.data.list);
    } catch (err) {
      console.error(err);
      toast.error('حدث خطأ أثناء تحميل البيانات');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [willAttendFilter, typeFilter, search]);

  const handleExport = async (willAttend) => {
    try {
      toast.info('جاري تحضير الملف...');
      const params = new URLSearchParams();
      if (willAttend !== undefined && willAttend !== '') params.append('willAttend', willAttend);
      if (typeFilter) params.append('membershipType', typeFilter);

      const response = await electionAPI.export(params.toString());
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `election-${willAttend === 'true' ? 'attending' : willAttend === 'false' ? 'not-attending' : 'all'}-${Date.now()}.xlsx`);
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
      fetchData(true);
    } catch (err) {
      toast.error('حدث خطأ');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredList = useMemo(() => {
    let result = [...list];
    if (activeTab === 'attending') result = result.filter((item) => item.willAttend === true);
    if (activeTab === 'notAttending') result = result.filter((item) => item.willAttend === false);
    return result;
  }, [list, activeTab]);

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <div className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white p-6 md:p-8 rounded-2xl mb-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-secondary to-yellow-500 rounded-xl flex items-center justify-center text-primary text-2xl shadow-xl">
              <FaChartBar />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">إدارة انتخابات الجمعية العمومية</h1>
              <p className="text-gray-200 text-sm">متابعة تسجيلات الحضور والتحليلات</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-3 rounded-lg font-bold transition flex items-center gap-2 disabled:opacity-50"
            >
              <FaSync className={refreshing ? 'animate-spin' : ''} />
              تحديث
            </button>
            <Link
              to="/admin/elections/upload"
              className="bg-secondary text-primary px-4 py-3 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2 shadow-lg"
            >
              <FaUpload /> استيراد أعضاء
            </Link>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:shadow-xl hover:-translate-y-1 transition group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg mb-3 group-hover:scale-110 transition">
              <FaUsers />
            </div>
            <p className="text-3xl md:text-4xl font-black text-primary mb-1">{stats.totalMembers}</p>
            <p className="text-gray-500 text-xs font-bold">إجمالي الأعضاء</p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">
              👷 {stats.workingTotal} | 👴 {stats.retiredTotal}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:shadow-xl hover:-translate-y-1 transition group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg mb-3 group-hover:scale-110 transition">
              <FaUserCheck />
            </div>
            <p className="text-3xl md:text-4xl font-black text-green-600 mb-1">{stats.attending}</p>
            <p className="text-gray-500 text-xs font-bold">سيحضر</p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">
              👷 {stats.attendingWorking} | 👴 {stats.attendingRetired}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:shadow-xl hover:-translate-y-1 transition group">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg mb-3 group-hover:scale-110 transition">
              <FaUserTimes />
            </div>
            <p className="text-3xl md:text-4xl font-black text-red-600 mb-1">{stats.notAttending}</p>
            <p className="text-gray-500 text-xs font-bold">لن يحضر</p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">
              👷 {stats.notAttendingWorking} | 👴 {stats.notAttendingRetired}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-primary/20 hover:shadow-xl hover:-translate-y-1 transition group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
                <FaChartPie />
              </div>
              <span className="text-2xl md:text-3xl font-black text-primary">
                {stats.totalMembers > 0 ? Math.round((stats.registered / stats.totalMembers) * 100) : 0}%
              </span>
            </div>
            <p className="text-gray-500 text-xs font-bold mb-2">نسبة التسجيل</p>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000"
                style={{ width: `${stats.totalMembers > 0 ? (stats.registered / stats.totalMembers) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {stats && stats.byCommittee && stats.byCommittee.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
              <FaMapMarkerAlt />
            </div>
            <h3 className="text-xl font-black text-primary">توزيع الحاضرين حسب اللجنة</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.byCommittee.map((c, i) => (
              <div key={i} className="relative bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 border-r-4 border-primary hover:shadow-lg transition">
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 font-bold">رقم {c.committeeNumber || '—'}</p>
                    <p className="font-black text-primary truncate">{c.committeeName || 'غير محدد'}</p>
                  </div>
                  <div className="bg-secondary text-primary font-black text-2xl w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                    {c.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
        <div className="p-4 md:p-6 border-b">
          <div className="flex flex-wrap gap-3 items-center mb-4">
            <div className="relative flex-1 min-w-[240px]">
              <FaSearch className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث بالاسم، رقم الشركة، أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pr-12"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-400 hover:text-red-500"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold transition ${
                showFilters || willAttendFilter || typeFilter
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <FaFilter />
              فلاتر
              {(willAttendFilter || typeFilter) && (
                <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {[willAttendFilter, typeFilter].filter(Boolean).length}
                </span>
              )}
              {showFilters ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
            </button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-field"
              >
                <option value="">كل الأنواع</option>
                <option value="working">👷 عامل</option>
                <option value="retired">👴 بالمعاش</option>
              </select>

              <select
                value={willAttendFilter}
                onChange={(e) => setWillAttendFilter(e.target.value)}
                className="input-field"
              >
                <option value="">كل الحالات</option>
                <option value="true">✓ سيحضر</option>
                <option value="false">✗ لن يحضر</option>
              </select>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
            <button
              onClick={() => handleExport('true')}
              className="bg-gradient-to-l from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2 text-sm"
            >
              <FaFileExcel /> تصدير الحاضرين
            </button>
            <button
              onClick={() => handleExport('false')}
              className="bg-gradient-to-l from-red-500 to-rose-600 text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2 text-sm"
            >
              <FaFileExcel /> تصدير المعتذرين
            </button>
            <button
              onClick={() => handleExport()}
              className="bg-gradient-to-l from-primary to-primary-dark text-white px-4 py-2 rounded-lg font-bold hover:shadow-lg transition flex items-center gap-2 text-sm"
            >
              <FaDownload /> تصدير الكل
            </button>
            <button
              onClick={handlePrint}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-800 transition flex items-center gap-2 text-sm"
            >
              <FaPrint /> طباعة
            </button>
          </div>
        </div>

        <div className="flex border-b overflow-x-auto bg-gray-50">
          <button
            onClick={() => setActiveTab('all')}
            className={`relative px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'all' ? 'text-primary bg-white' : 'text-gray-500 hover:text-primary hover:bg-white/50'
            }`}
          >
            <FaUsers />
            <span>الكل</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
              activeTab === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {list.length}
            </span>
            {activeTab === 'all' && <div className="absolute bottom-0 right-0 left-0 h-1 bg-primary"></div>}
          </button>

          <button
            onClick={() => setActiveTab('attending')}
            className={`relative px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'attending' ? 'text-green-600 bg-white' : 'text-gray-500 hover:text-primary hover:bg-white/50'
            }`}
          >
            <FaUserCheck />
            <span>سيحضر</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
              activeTab === 'attending' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {list.filter(l => l.willAttend).length}
            </span>
            {activeTab === 'attending' && <div className="absolute bottom-0 right-0 left-0 h-1 bg-green-500"></div>}
          </button>

          <button
            onClick={() => setActiveTab('notAttending')}
            className={`relative px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'notAttending' ? 'text-red-600 bg-white' : 'text-gray-500 hover:text-primary hover:bg-white/50'
            }`}
          >
            <FaUserTimes />
            <span>لن يحضر</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
              activeTab === 'notAttending' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {list.filter(l => !l.willAttend).length}
            </span>
            {activeTab === 'notAttending' && <div className="absolute bottom-0 right-0 left-0 h-1 bg-red-500"></div>}
          </button>
        </div>
      </div>

      {filteredList.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg text-center py-20">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
            <FaUsers className="text-5xl text-gray-300" />
          </div>
          <p className="text-gray-500 font-bold text-lg mb-2">
            {search || willAttendFilter || typeFilter ? 'لا توجد نتائج مطابقة للفلاتر' : 'لا توجد تسجيلات بعد'}
          </p>
          <p className="text-gray-400 text-sm">
            {search || willAttendFilter || typeFilter ? 'جرّب تغيير معايير البحث' : 'عندما يسجل الأعضاء، ستظهر بياناتهم هنا'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredList.map((item) => (
              <MemberCard key={item._id} item={item} onDelete={handleDelete} />
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-md mt-6 p-4 text-center text-sm text-gray-600">
            📊 إجمالي النتائج: <strong className="text-primary">{filteredList.length}</strong>
          </div>
        </>
      )}
    </div>
  );
};

const MemberCard = ({ item, onDelete }) => {
  const isAttending = item.willAttend;

  return (
    <div
      className={`group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-2 ${
        isAttending ? 'border-green-100 hover:border-green-300' : 'border-red-100 hover:border-red-300'
      }`}
    >
      <div className={`absolute top-0 right-0 left-0 h-1.5 ${
        isAttending
          ? 'bg-gradient-to-l from-green-400 to-emerald-500'
          : 'bg-gradient-to-l from-red-400 to-rose-500'
      }`}></div>

      <div className="p-5 pt-7">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg flex-shrink-0 ${
              isAttending
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            }`}>
              {item.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-black text-primary text-base truncate" title={item.name}>
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  item.membershipType === 'working'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {item.membershipType === 'working' ? '👷 عامل' : '👴 بالمعاش'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onDelete(item._id)}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition opacity-50 group-hover:opacity-100 flex-shrink-0"
            title="حذف"
          >
            <FaTrash size={14} />
          </button>
        </div>

        <div className="space-y-2.5 mb-4">
          <CardRow
            icon={<FaHashtag />}
            label="رقم الشركة"
            value={item.companyNumber}
            ltr
            highlight
          />
          <CardRow
            icon={<FaPhone />}
            label="الهاتف"
            value={item.phone || 'غير مسجل'}
            ltr
          />
          <CardRow
            icon={<FaMapMarkerAlt />}
            label="مكان اللجنة"
            value={item.committeeName || 'لم يُحدد بعد'}
            subValue={item.committeeNumber ? `رقم اللجنة: ${item.committeeNumber}` : null}
          />
        </div>

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-black ${
            isAttending
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {isAttending ? (
              <>
                <FaCheckCircle /> سيحضر
              </>
            ) : (
              <>
                <FaTimesCircle /> لن يحضر
              </>
            )}
          </div>

          <div className="text-xs text-gray-400 text-left" dir="ltr">
            <div>{new Date(item.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit', year: 'numeric' })}</div>
            <div className="text-[10px]">
              {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CardRow = ({ icon, label, value, ltr, subValue, highlight }) => (
  <div className={`flex items-start gap-3 p-2.5 rounded-lg ${highlight ? 'bg-primary/5 border border-primary/10' : ''}`}>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
      highlight ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'
    }`}>
      {icon}
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] text-gray-500 font-bold mb-0.5">{label}</p>
      <p
        className={`text-sm font-black truncate ${highlight ? 'text-primary' : 'text-gray-700'}`}
        dir={ltr ? 'ltr' : 'rtl'}
        style={ltr ? { textAlign: 'right' } : {}}
        title={value}
      >
        {value}
      </p>
      {subValue && (
        <p className="text-[10px] text-gray-400 mt-0.5 truncate">{subValue}</p>
      )}
    </div>
  </div>
);

export default ManageElection;