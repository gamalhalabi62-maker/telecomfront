import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUsers, FaSearch, FaFilter } from 'react-icons/fa';
import { playerAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { getImageUrl } from '../../utils/formatDate';

const positionNames = {
  goalkeeper: 'حارس مرمى',
  defender: 'مدافع',
  midfielder: 'وسط',
  forward: 'مهاجم',
};

const positionColors = {
  goalkeeper: 'bg-yellow-500',
  defender: 'bg-blue-500',
  midfielder: 'bg-green-500',
  forward: 'bg-red-500',
};

const ManagePlayers = () => {
  const [players, setPlayers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');

  const fetchPlayers = async () => {
    try {
      const { data } = await playerAPI.getAll();
      setPlayers(data.players);
      setFiltered(data.players);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  useEffect(() => {
    let result = [...players];
    if (search) {
      result = result.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (positionFilter) {
      result = result.filter((p) => p.position === positionFilter);
    }
    setFiltered(result);
  }, [search, positionFilter, players]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف اللاعب "${name}"؟`)) return;
    try {
      await playerAPI.delete(id);
      setPlayers(players.filter((p) => p._id !== id));
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      {/* Header */}
      <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-6 md:p-8 rounded-2xl mb-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl">
              <FaUsers />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black">إدارة اللاعبين</h1>
              <p className="text-gray-200 text-sm">
                إجمالي {players.length} لاعب مسجل
              </p>
            </div>
          </div>
          <Link
            to="/admin/players/create"
            className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> إضافة لاعب جديد
          </Link>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث باسم اللاعب..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pr-12"
            />
          </div>

          {/* Position Filter */}
          <select
            value={positionFilter}
            onChange={(e) => setPositionFilter(e.target.value)}
            className="input-field"
          >
            <option value="">كل المراكز</option>
            <option value="goalkeeper">حراس المرمى</option>
            <option value="defender">المدافعون</option>
            <option value="midfielder">لاعبو الوسط</option>
            <option value="forward">المهاجمون</option>
          </select>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-sm">
          <span className="text-gray-600">
            📊 النتائج: <strong className="text-primary">{filtered.length}</strong>
          </span>
          {positionFilter && (
            <button
              onClick={() => setPositionFilter('')}
              className="text-primary hover:text-secondary font-bold"
            >
              ✖ مسح الفلتر
            </button>
          )}
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-primary hover:text-secondary font-bold"
            >
              ✖ مسح البحث
            </button>
          )}
        </div>
      </div>

      {/* Players Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-bold mb-4">
              {players.length === 0 ? 'لا يوجد لاعبون بعد' : 'لا توجد نتائج مطابقة'}
            </p>
            {players.length === 0 && (
              <Link
                to="/admin/players/create"
                className="btn-primary inline-flex items-center gap-2"
              >
                <FaPlus /> أضف أول لاعب
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-4 text-right">الصورة</th>
                  <th className="p-4 text-right">الرقم</th>
                  <th className="p-4 text-right">الاسم</th>
                  <th className="p-4 text-right">المركز</th>
                  <th className="p-4 text-right">الجنسية</th>
                  <th className="p-4 text-right">الأهداف</th>
                  <th className="p-4 text-right">الحالة</th>
                  <th className="p-4 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((player) => (
                  <tr key={player._id} className="border-b hover:bg-gray-50 transition">
                    <td className="p-4">
                      <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                        {player.imageUrl ? (
                          <img
                            src={getImageUrl(player.imageUrl)}
                            alt={player.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <span className="text-white font-black text-sm">
                            {player.number}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-secondary text-primary w-10 h-10 rounded-full flex items-center justify-center font-black">
                        {player.number}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-primary flex items-center gap-2">
                        {player.name}
                        {player.isCaptain && (
                          <span className="text-yellow-500" title="قائد الفريق">👑</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`${positionColors[player.position]} text-white px-3 py-1 rounded-full text-xs font-bold`}>
                        {positionNames[player.position]}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600 text-sm">{player.nationality}</td>
                    <td className="p-4 text-center">
                      <span className="font-bold text-primary">
                        {player.stats?.goals || 0}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        player.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {player.isActive ? '✅ نشط' : '⬜ غير نشط'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link
                          to={`/team/${player._id}`}
                          className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition"
                          title="عرض"
                        >
                          <FaEye />
                        </Link>
                        <Link
                          to={`/admin/players/edit/${player._id}`}
                          className="text-primary hover:text-primary-light p-2 rounded hover:bg-primary/10 transition"
                          title="تعديل"
                        >
                          <FaEdit />
                        </Link>
                        <button
                          onClick={() => handleDelete(player._id, player.name)}
                          className="text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50 transition"
                          title="حذف"
                        >
                          <FaTrash />
                        </button>
                      </div>
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

export default ManagePlayers;