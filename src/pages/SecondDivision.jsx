import { useEffect, useState } from 'react';
import {
  FaTrophy, FaFutbol, FaNewspaper, FaCircle,
  FaCalendarAlt, FaClock, FaCheckCircle, FaHourglassHalf,
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
            filgoalAPI.getUpcoming(30),
            filgoalAPI.getLive(),
            filgoalAPI.getFinished(30),
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
      {/* ═══════════════ HERO ═══════════════ */}
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
              <StatBox
                value={stats.totalMatches}
                label="إجمالي المباريات"
                color="text-white"
                icon={<FaFutbol />}
              />
              <StatBox
                value={stats.upcoming}
                label="قادمة"
                color="text-blue-200"
                icon={<FaHourglassHalf />}
              />
              <StatBox
                value={stats.live}
                label="مباشرة"
                color="text-red-300"
                icon={<FaCircle size={10} />}
              />
              <StatBox
                value={stats.finished}
                label="منتهية"
                color="text-green-300"
                icon={<FaCheckCircle />}
              />
            </div>
          )}
        </div>
      </div>

      <div className="container-custom py-8">
        {/* ═══════════════ OUR TEAM CARD ═══════════════ */}
        {stats?.ourTeam && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-r-4 border-secondary">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
                  <FaFutbol />
                </div>
                <div>
                  <h2 className="text-xl font-black text-primary">{stats.ourTeam.teamName}</h2>
                  <p className="text-xs text-gray-500">{stats.ourTeam.group}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                  المركز {stats.ourTeam.rank}
                </span>
                <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold">
                  {stats.ourTeam.points} نقطة
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <MiniStat label="لعب" value={stats.ourTeam.played} color="text-gray-700" />
              <MiniStat label="فاز" value={stats.ourTeam.won} color="text-green-600" />
              <MiniStat label="تعادل" value={stats.ourTeam.drawn} color="text-yellow-600" />
              <MiniStat label="خسر" value={stats.ourTeam.lost} color="text-red-600" />
              <MiniStat label="له" value={stats.ourTeam.goalsFor} color="text-blue-600" />
              <MiniStat label="عليه" value={stats.ourTeam.goalsAgainst} color="text-orange-600" />
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ═══════════════ STANDINGS ═══════════════ */}
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
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${
                          activeGroup === g
                            ? 'bg-primary text-white shadow-lg'
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
                  <thead className="bg-gradient-to-l from-primary to-primary-dark text-white">
                    <tr>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">#</th>
                      <th className="p-3 text-right text-xs font-bold whitespace-nowrap">الفريق</th>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">لعب</th>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">فاز</th>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">تعادل</th>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">خسر</th>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">له</th>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">عليه</th>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">+/-</th>
                      <th className="p-3 text-center text-xs font-bold whitespace-nowrap">نقاط</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandings.map((team) => {
                      const isTop = team.rank <= 2;
                      const isBottom = team.rank >= filteredStandings.length - 1;

                      return (
                        <tr
                          key={team._id}
                          className={`border-b transition ${
                            team.isOurTeam
                              ? 'bg-secondary/10 hover:bg-secondary/20'
                              : isTop
                              ? 'bg-green-50/30 hover:bg-green-50/60'
                              : isBottom
                              ? 'bg-red-50/30 hover:bg-red-50/60'
                              : 'hover:bg-primary/5'
                          }`}
                        >
                          <td className="p-3 text-center">
                            <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                              isTop ? 'bg-green-500 text-white' :
                              isBottom ? 'bg-red-500 text-white' :
                              team.isOurTeam ? 'bg-secondary text-primary' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {team.rank}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center gap-2">
                              {team.isOurTeam && (
                                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                              )}
                              <span className={`text-sm ${
                                team.isOurTeam ? 'text-primary font-black' : 'text-gray-700 font-bold'
                              }`}>
                                {team.teamName}
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-center text-sm font-bold text-gray-700">{team.played}</td>
                          <td className="p-3 text-center text-sm font-bold text-green-600">{team.won}</td>
                          <td className="p-3 text-center text-sm font-bold text-yellow-600">{team.drawn}</td>
                          <td className="p-3 text-center text-sm font-bold text-red-600">{team.lost}</td>
                          <td className="p-3 text-center text-sm text-gray-600">{team.goalsFor}</td>
                          <td className="p-3 text-center text-sm text-gray-600">{team.goalsAgainst}</td>
                          <td className={`p-3 text-center text-sm font-black ${
                            team.goalDifference > 0 ? 'text-green-600' :
                            team.goalDifference < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center min-w-[36px] h-8 bg-primary text-white rounded-lg text-sm font-black">
                              {team.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-4 bg-gray-50 border-t flex flex-wrap gap-4 justify-center text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>منطقة الصعود</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>منطقة الهبوط</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 bg-secondary rounded-full"></span>
                  <span>فريقنا</span>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════ SIDEBAR ═══════════════ */}
          <div className="lg:col-span-1">
            {live.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border-r-4 border-red-500">
                <h2 className="text-lg font-black text-red-600 mb-4 flex items-center gap-2">
                  <FaCircle className="text-red-500 animate-pulse" size={10} />
                  مباشر الآن
                </h2>
                <div className="space-y-3">
                  {live.map((m) => (
                    <MatchCard key={m._id} match={m} variant="live" />
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-md p-5">
              <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-secondary rounded"></span>
                مبارياتنا القادمة
              </h2>
              {upcoming.filter((m) => m.isOurTeam).length === 0 ? (
                <p className="text-gray-500 text-center py-4 text-sm">لا توجد مباريات قادمة</p>
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

        {/* ═══════════════ MATCHES TABS ═══════════════ */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden mb-6">
          <div className="flex border-b overflow-x-auto bg-gray-50">
            <TabButton
              active={activeTab === 'upcoming'}
              onClick={() => setActiveTab('upcoming')}
              icon={<FaCalendarAlt />}
              label="المباريات القادمة"
              count={upcoming.length}
              color="blue"
            />
            <TabButton
              active={activeTab === 'finished'}
              onClick={() => setActiveTab('finished')}
              icon={<FaCheckCircle />}
              label="المباريات المنتهية"
              count={finished.length}
              color="green"
            />
          </div>

          <div className="p-5">
            {activeTab === 'upcoming' && (
              <>
                {upcoming.length === 0 ? (
                  <EmptyState
                    icon={<FaCalendarAlt />}
                    title="لا توجد مباريات قادمة"
                    subtitle="سيتم عرض المباريات القادمة هنا عند إضافتها"
                  />
                ) : (
                  <div className="space-y-3">
                    {upcoming.map((m) => (
                      <MatchRow key={m._id} match={m} />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeTab === 'finished' && (
              <>
                {finished.length === 0 ? (
                  <EmptyState
                    icon={<FaCheckCircle />}
                    title="لا توجد مباريات منتهية"
                    subtitle="سيتم عرض نتائج المباريات هنا"
                  />
                ) : (
                  <div className="space-y-3">
                    {finished.map((m) => (
                      <MatchRow key={m._id} match={m} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ═══════════════ NEWS ═══════════════ */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-xl font-black text-primary mb-6 flex items-center gap-3">
            <span className="w-1 h-6 bg-secondary rounded"></span>
            آخر أخبار الدوري
          </h2>

          {news.length === 0 ? (
            <EmptyState
              icon={<FaNewspaper />}
              title="لا توجد أخبار"
              subtitle="سيتم عرض آخر أخبار الدوري هنا"
            />
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

/* ═══════════════ Sub Components ═══════════════ */

const StatBox = ({ value, label, color, icon }) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20 hover:bg-white/20 transition">
    <div className={`flex items-center justify-center gap-2 ${color} mb-1`}>
      {icon}
      <p className="text-3xl font-black">{value}</p>
    </div>
    <p className="text-xs text-gray-200">{label}</p>
  </div>
);

const MiniStat = ({ label, value, color }) => (
  <div className="text-center bg-gray-50 rounded-xl p-3 border border-gray-100">
    <p className={`text-2xl font-black ${color}`}>{value}</p>
    <p className="text-xs text-gray-500 font-bold mt-1">{label}</p>
  </div>
);

const TabButton = ({ active, onClick, icon, label, count, color }) => {
  const colors = {
    blue: { active: 'text-blue-600', bar: 'bg-blue-500' },
    green: { active: 'text-green-600', bar: 'bg-green-500' },
  };

  return (
    <button
      onClick={onClick}
      className={`relative px-6 py-4 font-bold flex items-center gap-2 whitespace-nowrap transition ${
        active
          ? `${colors[color].active} bg-white`
          : 'text-gray-500 hover:text-primary hover:bg-white/50'
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
        <div className={`absolute bottom-0 right-0 left-0 h-1 ${colors[color].bar}`}></div>
      )}
    </button>
  );
};

const EmptyState = ({ icon, title, subtitle }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 text-gray-300 text-2xl">
      {icon}
    </div>
    <p className="text-gray-500 font-bold mb-1">{title}</p>
    <p className="text-gray-400 text-xs">{subtitle}</p>
  </div>
);

/* ═══════════════ MatchCard (للـ sidebar) ═══════════════ */
const MatchCard = ({ match, variant }) => {
  const isLive = variant === 'live' || match.status === 'live';
  const isFinished = variant === 'finished' || match.status === 'finished';

  return (
    <div className={`p-3 rounded-xl border transition ${
      isLive ? 'bg-red-50 border-red-200' :
      match.isOurTeam ? 'bg-secondary/10 border-secondary/30' :
      'bg-gray-50 border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="text-gray-500 truncate max-w-[120px]">
          {match.round || match.championship || 'الدوري'}
        </span>
        <span className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
          isLive ? 'bg-red-500 text-white' :
          isFinished ? 'bg-gray-200 text-gray-600' :
          'bg-blue-100 text-blue-700'
        }`}>
          {isLive ? '🔴 مباشر' : isFinished ? 'انتهت' : 'قادمة'}
        </span>
      </div>

      <div className="grid grid-cols-3 items-center gap-2">
        <span className={`text-xs font-bold truncate text-right ${
          match.isOurTeam ? 'text-primary' : 'text-gray-700'
        }`}>
          {match.homeTeam}
        </span>

        <span className={`font-black px-2 py-1 rounded-lg text-sm text-center whitespace-nowrap ${
          isLive ? 'bg-red-500 text-white' :
          isFinished ? 'bg-gray-700 text-white' :
          'bg-white text-gray-500 border border-gray-200'
        }`}>
          {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
        </span>

        <span className={`text-xs font-bold truncate ${
          match.isOurTeam ? 'text-primary' : 'text-gray-700'
        }`}>
          {match.awayTeam}
        </span>
      </div>

      {!isFinished && !isLive && match.date && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-center gap-1">
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

/* ═══════════════ MatchRow (للمباريات القادمة/المنتهية - أفقي) ═══════════════ */
const MatchRow = ({ match }) => {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border-2 transition hover:shadow-md ${
      isLive ? 'bg-red-50 border-red-200' :
      match.isOurTeam ? 'bg-secondary/10 border-secondary/30' :
      'bg-white border-gray-100 hover:border-primary/30'
    }`}>
      {/* التاريخ */}
      <div className="flex flex-col items-center justify-center w-20 flex-shrink-0">
        {isFinished || isLive ? (
          <>
            <span className={`text-2xl font-black ${
              isLive ? 'text-red-600' : 'text-gray-800'
            }`}>
              {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
            </span>
            {isLive && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-bold mt-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                مباشر
              </span>
            )}
          </>
        ) : (
          <>
            <span className="text-xs text-gray-400 font-bold">
              {new Date(match.date).toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}
            </span>
            <span className="text-lg font-black text-primary">
              {new Date(match.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </>
        )}
      </div>

      {/* الفرق */}
      <div className="flex-1 grid grid-cols-2 gap-3 items-center">
        <div className="flex items-center justify-end gap-2 text-right">
          <span className={`font-bold text-sm ${match.isOurTeam ? 'text-primary font-black' : 'text-gray-700'} truncate`}>
            {match.homeTeam}
          </span>
          {match.isOurTeam && <span className="text-secondary">⭐</span>}
        </div>

        <div className="flex items-center justify-start gap-2">
          {match.isOurTeam && <span className="text-secondary">⭐</span>}
          <span className={`font-bold text-sm ${match.isOurTeam ? 'text-primary font-black' : 'text-gray-700'} truncate`}>
            {match.awayTeam}
          </span>
        </div>
      </div>

      {/* الحالة */}
      <div className="flex-shrink-0 w-24 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
          isLive ? 'bg-red-500 text-white' :
          isFinished ? 'bg-gray-200 text-gray-600' :
          'bg-blue-100 text-blue-700'
        }`}>
          {isLive ? '🔴 مباشر' : isFinished ? '✓ انتهت' : '⏰ قادمة'}
        </span>
      </div>
    </div>
  );
};

export default SecondDivision;