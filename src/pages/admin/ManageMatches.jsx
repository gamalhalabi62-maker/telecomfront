import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaPlus, FaEdit, FaTrash, FaEye, FaFutbol,
  FaSearch, FaBroadcastTower, FaCalendarAlt, FaTrophy,
} from 'react-icons/fa';
import { matchAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { formatDate } from '../../utils/formatDate';

const competitionNames = {
  league: 'الدوري',
  cup: 'الكأس',
  friendly: 'ودية',
  african: 'أفريقي',
  arab: 'عربي',
  other: 'أخرى',
};

const ManageMatches = () => {
  const [matches, setMatches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [competitionFilter, setCompetitionFilter] = useState('');

  const fetchMatches = async () => {
    try {
      const { data } = await matchAPI.getAll({ limit: 100 });
      setMatches(data.matches);
      setFiltered(data.matches);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  useEffect(() => {
    let result = [...matches];
    if (search) {
      result = result.filter((m) =>
        m.opponent.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter) {
      result = result.filter((m) => m.status === statusFilter);
    }
    if (competitionFilter) {
      result = result.filter((m) => m.competition === competitionFilter);
    }
    setFiltered(result);
  }, [search, statusFilter, competitionFilter, matches]);

  const handleDelete = async (id, opponent) => {
    if (!window.confirm(`هل أنت متأكد من حذف مباراة "${opponent}"؟`)) return;
    try {
      await matchAPI.delete(id);
      setMatches(matches.filter((m) => m._id !== id));
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: 'قادمة', class: 'bg-blue-100 text-blue-700' },
      live: { text: 'مباشر', class: 'bg-red-100 text-red-700' },
      finished: { text: 'انتهت', class: 'bg-gray-100 text-gray-700' },
      postponed: { text: 'مؤجلة', class: 'bg-yellow-100 text-yellow-700' },
      cancelled: { text: 'ملغاة', class: 'bg-gray-200 text-gray-600' },
    };
    return badges[status] || badges.upcoming;
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-6 md:p-8 rounded-2xl mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl">
              <FaFutbol className="ball-spin" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">إدارة المباريات</h1>
              <p className="text-gray-200 text-sm">
                إجمالي {matches.length} مباراة مسجلة
              </p>
            </div>
          </div>
          <Link
            to="/admin/matches/create"
            className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> مباراة جديدة
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 relative">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث باسم الفريق المنافس..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pr-12"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">كل الحالات</option>
            <option value="upcoming">قادمة</option>
            <option value="live">مباشر</option>
            <option value="finished">منتهية</option>
            <option value="postponed">مؤجلة</option>
            <option value="cancelled">ملغاة</option>
          </select>

          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            className="input-field"
          >
            <option value="">كل البطولات</option>
            <option value="league">الدوري</option>
            <option value="cup">الكأس</option>
            <option value="friendly">ودية</option>
            <option value="african">أفريقي</option>
            <option value="arab">عربي</option>
            <option value="other">أخرى</option>
          </select>
        </div>

        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm">
          <span className="text-gray-600">
            📊 النتائج: <strong className="text-primary">{filtered.length}</strong>
          </span>
          {(search || statusFilter || competitionFilter) && (
            <button
              onClick={() => { setSearch(''); setStatusFilter(''); setCompetitionFilter(''); }}
              className="text-primary hover:text-secondary font-bold"
            >
              ✖ مسح الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Matches Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FaFutbol className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-bold mb-4">
              {matches.length === 0 ? 'لا توجد مباريات بعد' : 'لا توجد نتائج مطابقة'}
            </p>
            {matches.length === 0 && (
              <Link
                to="/admin/matches/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                <FaPlus /> أضف أول مباراة
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-4 text-right">الشعار</th>
                  <th className="p-4 text-right">المنافس</th>
                  <th className="p-4 text-right">البطولة</th>
                  <th className="p-4 text-right">التاريخ</th>
                  <th className="p-4 text-right">النتيجة</th>
                  <th className="p-4 text-right">الحالة</th>
                  <th className="p-4 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((match) => {
                  const badge = getStatusBadge(match.status);
                  const isFinished = match.status === 'finished';
                  const isLive = match.status === 'live';

                  return (
                    <tr key={match._id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-4">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                          {match.opponentLogo ? (
                            <img
                              src={match.opponentLogo.startsWith('http') ? match.opponentLogo : `http://localhost:3000${match.opponentLogo}`}
                              alt={match.opponent}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-primary font-black text-lg">
                              {match.opponent.charAt(0)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-primary">
                        {match.opponent}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {match.competitionName || competitionNames[match.competition]}
                        {match.round && <span className="text-xs block text-gray-400">{match.round}</span>}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <div>{formatDate(match.date)}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(match.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="p-4">
                        {isFinished || isLive ? (
                          <span className={`font-black text-lg ${
                            match.ourScore > match.opponentScore ? 'text-green-600' :
                            match.ourScore < match.opponentScore ? 'text-red-600' :
                            'text-gray-600'
                          }`}>
                            {match.ourScore} - {match.opponentScore}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`${badge.class} px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1`}>
                          {isLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot"></span>}
                          {badge.text}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link
                            to={`/matches/${match._id}`}
                            className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                            title="عرض"
                          >
                            <FaEye />
                          </Link>
                          <Link
                            to={`/admin/matches/edit/${match._id}`}
                            className="text-primary hover:text-primary-light p-2 rounded hover:bg-primary/10 transition"
                            title="تعديل"
                          >
                            <FaEdit />
                          </Link>
                          <button
                            onClick={() => handleDelete(match._id, match.opponent)}
                            className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMatches;