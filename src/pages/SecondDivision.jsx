import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTrophy, FaFutbol, FaNewspaper, FaSync,
  FaCircle, FaCalendarAlt, FaMapMarkerAlt, FaClock,
} from 'react-icons/fa';
import { filgoalAPI } from '../services/api';
import Loading from '../components/Loading';

const SecondDivision = () => {
  const [stats, setStats] = useState(null);
  const [standings, setStandings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState('');
  const [upcoming, setUpcoming] = useState([]);
  const [live, setLive] = useState([]);
  const [finished, setFinished] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, standingsRes, upRes, liveRes, finRes, newsRes] =
          await Promise.allSettled([
            filgoalAPI.getStats(),
            filgoalAPI.getStandings(),
            filgoalAPI.getUpcoming(10),
            filgoalAPI.getLive(),
            filgoalAPI.getFinished(10),
            filgoalAPI.getNews(8),
          ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);

        if (standingsRes.status === 'fulfilled') {
          setStandings(standingsRes.value.data.standings || []);
          const gs = standingsRes.value.data.groups || [];
          setGroups(gs);
          if (gs.length > 0) setActiveGroup(gs[0]);
        }

        if (upRes.status === 'fulfilled') setUpcoming(upRes.value.data.matches || []);
        if (liveRes.status === 'fulfilled') setLive(liveRes.value.data.matches || []);
        if (finRes.status === 'fulfilled') setFinished(finRes.value.data.matches || []);
        if (newsRes.status === 'fulfilled') setNews(newsRes.value.data.news || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <Loading />;

  const filteredStandings = activeGroup
    ? standings.filter((s) => s.group === activeGroup)
    : standings;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white py-12 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-2xl mb-4 shadow-2xl">
              <FaTrophy className="text-primary text-4xl" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3">
              الدوري المصري الدرجة الثانية
            </h1>
            <p className="text-gray-200 text-base md:text-lg max-w-2xl mx-auto">
              ترتيب المجموعات، نتائج المباريات، وأخبار الدوري
            </p>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <StatBox value={stats.totalMatches} label="إجمالي المباريات" color="text-white" />
              <StatBox value={stats.upcoming} label="قادمة" color="text-blue-200" />
              <StatBox value={stats.live} label="مباشرة" color="text-red-300" />
              <StatBox value={stats.finished} label="منتهية" color="text-green-300" />
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        {stats?.ourTeam && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-r-4 border-secondary">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary text-2xl">
                <FaFutbol />
              </div>
              <div>
                <h2 className="text-xl font-black text-primary">{stats.ourTeam.teamName}</h2>
                <p className="text-xs text-gray-500">{stats.ourTeam.group}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <MiniStat label="المركز" value={stats.ourTeam.rank} color="text-primary" />
              <MiniStat label="النقاط" value={stats.ourTeam.points} color="text-green-600" />
              <MiniStat label="لعب" value={stats.ourTeam.played} color="text-gray-700" />
              <MiniStat label="فاز" value={stats.ourTeam.won} color="text-green-600" />
              <MiniStat label="تعادل" value={stats.ourTeam.drawn} color="text-yellow-600" />
              <MiniStat label="خسر" value={stats.ourTeam.lost} color="text-red-600" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
              <div className="p-5 border-b border-gray-100 flex flex-wrap justify-between items-center gap-3">
                <h2 className="text-xl font-black text-primary flex items-center gap-3">
                  <span className="w-1 h-6 bg-secondary rounded"></span>
                  ترتيب الدوري
                </h2>

                {groups.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {groups.map((g) => (
                      <button
                        key={g}
                        onClick={() => setActiveGroup(g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          activeGroup === g
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {g.replace('ترتيب ', '')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-right text-xs font-bold text-gray-600">#</th>
                      <th className="p-3 text-right text-xs font-bold text-gray-600">الفريق</th>
                      <th className="p-3 text-center text-xs font-bold text-gray-600">لعب</th>
                      <th className="p-3 text-center text-xs font-bold text-gray-600">فاز</th>
                      <th className="p-3 text-center text-xs font-bold text-gray-600">تعادل</th>
                      <th className="p-3 text-center text-xs font-bold text-gray-600">خسر</th>
                      <th className="p-3 text-center text-xs font-bold text-gray-600">له</th>
                      <th className="p-3 text-center text-xs font-bold text-gray-600">عليه</th>
                      <th className="p-3 text-center text-xs font-bold text-gray-600">+/-</th>
                      <th className="p-3 text-center text-xs font-bold text-gray-600">نقاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandings.map((team) => (
                      <tr
                        key={team._id}
                        className={`border-b hover:bg-primary/5 transition ${
                          team.isOurTeam ? 'bg-secondary/10 font-black' : ''
                        }`}
                      >
                        <td className="p-3 text-right">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                            team.rank <= 2 ? 'bg-green-100 text-green-700' :
                            team.rank >= filteredStandings.length - 1 ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {team.rank}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center gap-2">
                            {team.isOurTeam && <span className="text-secondary">⭐</span>}
                            <span className={`text-sm ${team.isOurTeam ? 'text-primary font-black' : 'text-gray-700'}`}>
                              {team.teamName}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center text-sm">{team.played}</td>
                        <td className="p-3 text-center text-sm text-green-600 font-bold">{team.won}</td>
                        <td className="p-3 text-center text-sm text-yellow-600">{team.drawn}</td>
                        <td className="p-3 text-center text-sm text-red-600">{team.lost}</td>
                        <td className="p-3 text-center text-sm">{team.goalsFor}</td>
                        <td className="p-3 text-center text-sm">{team.goalsAgainst}</td>
                        <td className={`p-3 text-center text-sm font-bold ${
                          team.goalDifference > 0 ? 'text-green-600' :
                          team.goalDifference < 0 ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                        </td>
                        <td className="p-3 text-center text-sm font-black text-primary">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            {live.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border-r-4 border-red-500">
                <h2 className="text-lg font-black text-red-600 mb-4 flex items-center gap-2">
                  <FaCircle className="text-red-500 animate-pulse text-xs" />
                  مباشر الآن
                </h2>
                {live.map((m) => (
                  <MatchCard key={m._id} match={m} variant="live" />
                ))}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
              <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-secondary rounded"></span>
                مبارياتنا القادمة
              </h2>
              {upcoming.filter((m) => m.isOurTeam).slice(0, 5).length === 0 ? (
                <p className="text-gray-500 text-center py-4">لا توجد مباريات قادمة</p>
              ) : (
                <div className="space-y-3">
                  {upcoming
                    .filter((m) => m.isOurTeam)
                    .slice(0, 5)
                    .map((m) => (
                      <MatchCard key={m._id} match={m} variant="upcoming" />
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="flex border-b overflow-x-auto">
            <TabButton
              active={activeTab === 'upcoming'}
              onClick={() => setActiveTab('upcoming')}
              icon={<FaCalendarAlt />}
              label="قادمة"
              count={upcoming.length}
            />
            <TabButton
              active={activeTab === 'finished'}
              onClick={() => setActiveTab('finished')}
              icon={<FaFutbol />}
              label="منتهية"
              count={finished.length}
            />
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(activeTab === 'upcoming' ? upcoming : finished).map((m) => (
                <MatchCard key={m._id} match={m} variant={activeTab} />
              ))}
            </div>

            {(activeTab === 'upcoming' ? upcoming : finished).length === 0 && (
              <p className="text-gray-500 text-center py-8">لا توجد مباريات</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-black text-primary mb-6 flex items-center gap-3">
            <span className="w-1 h-6 bg-secondary rounded"></span>
            آخر أخبار الدوري
          </h2>

          {news.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد أخبار</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {news.map((n) => (
                <a
                  key={n._id}
                  href={n.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition"
                >
                  {n.imageUrl && (
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={n.imageUrl}
                        alt={n.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold text-sm text-primary line-clamp-2 group-hover:text-secondary transition">
                      {n.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ value, label, color }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
    <p className={`text-3xl font-black ${color}`}>{value}</p>
    <p className="text-xs text-gray-200 mt-1">{label}</p>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div className="text-center bg-gray-50 rounded-xl p-3">
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 font-bold mt-1">{label}</p>
  </div>
);

const TabButton = ({ active, onClick, icon, label, count }) => (
  <button
    onClick={onClick}
    className={`relative px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap transition ${
      active ? 'text-primary bg-white' : 'text-gray-500 hover:text-primary'
    }`}
  >
    {icon}
    <span>{label}</span>
    <span className={`text-xs px-2 py-0.5 rounded-full font-black ${
      active ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
    }`}>
      {count}
    </span>
    {active && <div className="absolute bottom-0 right-0 left-0 h-1 bg-primary"></div>}
  </button>
);

const MatchCard = ({ match, variant }) => {
  const isLive = variant === 'live' || match.status === 'live';
  const isFinished = variant === 'finished' || match.status === 'finished';

  return (
    <div className={`p-3 rounded-xl border transition ${
      isLive ? 'bg-red-50 border-red-200' :
      match.isOurTeam ? 'bg-secondary/10 border-secondary/30' :
      'bg-gray-50 border-gray-100 hover:bg-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="text-gray-500 truncate">
          {match.championship || 'الدوري'}
        </span>
        <span className={`px-2 py-0.5 rounded-full font-bold ${
          isLive ? 'bg-red-500 text-white' :
          isFinished ? 'bg-gray-200 text-gray-600' :
          'bg-blue-100 text-blue-700'
        }`}>
          {isLive ? '🔴 مباشر' : isFinished ? 'انتهت' : 'قادمة'}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <span className={`text-sm font-bold truncate flex-1 ${
          match.isOurTeam && match.homeTeam?.includes('اتصالات') ? 'text-primary' : 'text-gray-700'
        }`}>
          {match.homeTeam}
        </span>

        <span className={`font-black px-3 py-1 rounded-lg text-lg ${
          isLive ? 'bg-red-500 text-white' :
          isFinished ? 'bg-gray-700 text-white' :
          'bg-white text-gray-400'
        }`}>
          {match.homeScore ?? '-'} - {match.awayScore ?? '-'}
        </span>

        <span className={`text-sm font-bold truncate flex-1 text-left ${
          match.isOurTeam && match.awayTeam?.includes('اتصالات') ? 'text-primary' : 'text-gray-700'
        }`}>
          {match.awayTeam}
        </span>
      </div>

      {!isFinished && !isLive && match.date && (
        <div className="mt-2 text-xs text-gray-500 text-center flex items-center justify-center gap-1">
          <FaClock className="text-primary" />
          {new Date(match.date).toLocaleString('ar-EG', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
};

export default SecondDivision;