import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers, FaCheckCircle, FaTimesCircle, FaSearch,
  FaDownload, FaPrint, FaTrash, FaChartBar, FaUpload,
  FaFilter, FaSpinner, FaUserCheck, FaUserTimes,
  FaMapMarkerAlt, FaPhone, FaTimes, FaFileExcel,
  FaChartPie, FaSync, FaChevronDown, FaChevronUp,
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
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

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

    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === 'createdAt') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      if (sortOrder === 'asc') return aVal > bVal ? 1 : -1;
      return aVal < bVal ? 1 : -1;
    });

    return result;
  }, [list, activeTab, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <AdminHeader stats={stats} refreshing={refreshing} onRefresh={() => fetchData(true)} />

      <StatsGrid stats={stats} />

      {stats && stats.byCommittee && stats.byCommittee.length > 0 && (
        <CommitteesSection committees={stats.byCommittee} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t animate-fade-in">
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
          <TabButton
            active={activeTab === 'all'}
            onClick={() => setActiveTab('all')}
            icon={<FaUsers />}
            label="الكل"
            count={list.length}
            color="primary"
          />
          <TabButton
            active={activeTab === 'attending'}
            onClick={() => setActiveTab('attending')}
            icon={<FaUserCheck />}
            label="سيحضر"
            count={list.filter(l => l.willAttend).length}
            color="green"
          />
          <TabButton
            active={activeTab === 'notAttending'}
            onClick={() => setActiveTab('notAttending')}
            icon={<FaUserTimes />}
            label="لن يحضر"
            count={list.filter(l => !l.willAttend).length}
            color="red"
          />
        </div>

        {filteredList.length === 0 ? (
          <EmptyState hasFilters={!!(search || willAttendFilter || typeFilter)} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 text-right text-xs font-bold text-gray-600">#</th>
                  <SortableTh label="الاسم" field="name" currentField={sortField} order={sortOrder} onSort={toggleSort} />
                  <SortableTh label="رقم الشركة" field="companyNumber" currentField={sortField} order={sortOrder} onSort={toggleSort} />
                  <th className="p-3 text-right text-xs font-bold text-gray-600">النوع</th>
                  <th className="p-3 text-right text-xs font-bold text-gray-600">الهاتف</th>
                  <th className="p-3 text-right text-xs font-bold text-gray-600">اللجنة</th>
                  <th className="p-3 text-center text-xs font-bold text-gray-600">الحالة</th>
                  <SortableTh label="التاريخ" field="createdAt" currentField={sortField} order={sortOrder} onSort={toggleSort} />
                  <th className="p-3 text-center text-xs font-bold text-gray-600">حذف</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((item, i) => (
                  <tr key={item._id} className="border-b hover:bg-primary/5 transition group">
                    <td className="p-3 text-gray-500 text-xs">{i + 1}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0">
                          {item.name.charAt(0)}
                        </div>
                        <span className="font-bold text-primary text-sm">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-sm text-gray-700" dir="ltr">{item.companyNumber}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        item.membershipType === 'working'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {item.membershipType === 'working' ? '👷 عامل' : '👴 بالمعاش'}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-600" dir="ltr">{item.phone || '—'}</td>
                    <td className="p-3 text-xs text-gray-600">
                      {item.committeeName ? (
                        <div>
                          <div className="font-bold truncate max-w-[150px]">{item.committeeName}</div>
                          {item.committeeNumber && (
                            <div className="text-gray-400">رقم {item.committeeNumber}</div>
                          )}
                        </div>
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
                      {new Date(item.createdAt).toLocaleDateString('ar-EG', { day: '2-digit', month: '2-digit' })}
                      <div className="text-gray-400 text-[10px]">
                        {new Date(item.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-500 hover:text-red-700 opacity-50 group-hover:opacity-100 transition"
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

        {filteredList.length > 0 && (
          <div className="p-4 bg-gray-50 border-t text-center text-sm text-gray-600">
            📊 إجمالي النتائج: <strong className="text-primary">{filteredList.length}</strong>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminHeader = ({ stats, refreshing, onRefresh }) => (
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
          onClick={onRefresh}
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
);

const StatsGrid = ({ stats }) => {
  if (!stats) return null;

  const registrationRate = stats.totalMembers > 0
    ? Math.round((stats.registered / stats.totalMembers) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <ModernStatCard
        icon={<FaUsers />}
        value={stats.totalMembers}
        label="إجمالي الأعضاء"
        gradient="from-blue-500 to-indigo-600"
        subtitle={`👷 ${stats.workingTotal} | 👴 ${stats.retiredTotal}`}
      />
      <ModernStatCard
        icon={<FaUserCheck />}
        value={stats.attending}
        label="سيحضر"
        gradient="from-green-500 to-emerald-600"
        subtitle={`👷 ${stats.attendingWorking} | 👴 ${stats.attendingRetired}`}
      />
      <ModernStatCard
        icon={<FaUserTimes />}
        value={stats.notAttending}
        label="لن يحضر"
        gradient="from-red-500 to-rose-600"
        subtitle={`👷 ${stats.notAttendingWorking} | 👴 ${stats.notAttendingRetired}`}
      />
      <div className="relative overflow-hidden rounded-2xl p-5 bg-white border-2 border-primary/20 hover:shadow-xl transition group">
        <div className="flex items-start justify-between mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
            <FaChartPie />
          </div>
          <span className="text-2xl md:text-3xl font-black text-primary">{registrationRate}%</span>
        </div>
        <p className="text-gray-500 text-xs font-bold mb-2">نسبة التسجيل</p>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-1000"
            style={{ width: `${registrationRate}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const ModernStatCard = ({ icon, value, label, gradient, subtitle }) => (
  <div className="relative overflow-hidden rounded-2xl p-5 bg-white border-2 border-gray-100 hover:shadow-xl hover:-translate-y-1 transition group">
    <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white text-xl shadow-lg mb-3 group-hover:scale-110 transition`}>
      {icon}
    </div>
    <p className="text-3xl md:text-4xl font-black text-primary mb-1">{value}</p>
    <p className="text-gray-500 text-xs font-bold">{label}</p>
    {subtitle && (
      <p className="text-[10px] text-gray-400 mt-2 font-medium">{subtitle}</p>
    )}
  </div>
);

const CommitteesSection = ({ committees }) => (
  <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center text-white">
        <FaMapMarkerAlt />
      </div>
      <h3 className="text-xl font-black text-primary">توزيع الحاضرين حسب اللجنة</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {committees.map((c, i) => (
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
);

const TabButton = ({ active, onClick, icon, label, count, color }) => {
  const colors = {
    primary: 'text-primary border-primary',
    green: 'text-green-600 border-green-500',
    red: 'text-red-600 border-red-500',
  };

  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap transition ${
        active ? `${colors[color]} bg-white` : 'text-gray-500 hover:text-primary hover:bg-white/50'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
        active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
      }`}>
        {count}
      </span>
      {active && (
        <div className={`absolute bottom-0 right-0 left-0 h-1 ${color === 'green' ? 'bg-green-500' : color === 'red' ? 'bg-red-500' : 'bg-primary'}`}></div>
      )}
    </button>
  );
};

const SortableTh = ({ label, field, currentField, order, onSort }) => (
  <th
    className="p-3 text-right text-xs font-bold text-gray-600 cursor-pointer hover:text-primary transition select-none"
    onClick={() => onSort(field)}
  >
    <div className="flex items-center gap-1 justify-end">
      {label}
      {currentField === field && (
        order === 'asc' ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />
      )}
    </div>
  </th>
);

const EmptyState = ({ hasFilters }) => (
  <div className="text-center py-20">
    <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
      <FaUsers className="text-5xl text-gray-300" />
    </div>
    <p className="text-gray-500 font-bold text-lg mb-2">
      {hasFilters ? 'لا توجد نتائج مطابقة للفلاتر' : 'لا توجد تسجيلات بعد'}
    </p>
    <p className="text-gray-400 text-sm">
      {hasFilters ? 'جرّب تغيير معايير البحث' : 'عندما يسجل الأعضاء، ستظهر بياناتهم هنا'}
    </p>
  </div>
);

export default ManageElection;