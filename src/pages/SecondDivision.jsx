import { useEffect, useState } from 'react';
import {
  FaTrophy, FaFutbol, FaNewspaper, FaCircle,
  FaCalendarAlt, FaClock, FaCheckCircle, FaHourglassHalf,
  FaMedal, FaChartLine, FaExclamationTriangle,
} from 'react-icons/fa';
import { filgoalAPI } from '../services/api';
import Loading from '../components/Loading';

const CHAMPIONSHIP_ID = 1668;
const CHAMPIONSHIP_NAME = 'دوري المحترفين المصري';

const SecondDivision = () => {
  const [stats, setStats] = useState(null);
  const [standings, setStandings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [live, setLive] = useState([]);
  const [finished, setFinished] = useState([]);
  const [news, setNews] = useState([]);
  const [scorers, setScorers] = useState([]);
  const [championships, setChampionships] = useState([]);
  const [selectedChampionship, setSelectedChampionship] = useState(CHAMPIONSHIP_ID);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [
          statsRes, standingsRes, upRes, liveRes, finRes,
          newsRes, scorersRes, champsRes,
        ] = await Promise.allSettled([
          filgoalAPI.getStats({ championshipId: selectedChampionship }),
          filgoalAPI.getStandings(),
          filgoalAPI.getUpcoming(30),
          filgoalAPI.getLive(),
          filgoalAPI.getFinished(30),
          filgoalAPI.getNews(8),
          filgoalAPI.getScorers(20),
          filgoalAPI.getChampionships(),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);

        if (standingsRes.status === 'fulfilled') {
          setStandings(standingsRes.value.data.standings || []);
          setGroups(standingsRes.value.data.groups || []);
        }

        if (upRes.status === 'fulfilled') setUpcoming(upRes.value.data.matches || []);
        if (liveRes.status === 'fulfilled') setLive(liveRes.value.data.matches || []);
        if (finRes.status === 'fulfilled') setFinished(finRes.value.data.matches || []);
        if (newsRes.status === 'fulfilled') setNews(newsRes.value.data.news || []);
        if (scorersRes.status === 'fulfilled') setScorers(scorersRes.value.data.scorers || []);
        if (champsRes.status === 'fulfilled') setChampionships(champsRes.value.data.championships || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <HeroSection stats={stats} />

      <div className="container-custom py-8">
        {stats?.ourTeam && <OurTeamCard team={stats.ourTeam} />}

        {live.length > 0 && <LiveMatchesSection matches={live} />}

        <StandingsSection standings={standings} groups={groups} />

        <MatchesSection
          upcoming={upcoming}
          finished={finished}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          championships={championships}
          selectedChampionship={selectedChampionship}
          setSelectedChampionship={setSelectedChampionship}
        />

        {scorers.length > 0 && <ScorersSection scorers={scorers} />}

        {stats?.ourTeam && upcoming.filter((m) => m.isOurTeam).length > 0 && (
          <OurUpcomingMatches matches={upcoming.filter((m) => m.isOurTeam).slice(0, 5)} />
        )}

        <NewsSection news={news} />
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
 *  HERO SECTION
 * ═══════════════════════════════════════════════════════════ */
const HeroSection = ({ stats }) => (
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
          {CHAMPIONSHIP_NAME}
        </h1>
        <p className="text-gray-200 text-base md:text-lg max-w-2xl mx-auto">
          ترتيب الفرق، نتائج المباريات، الهدافون، وأخبار البطولة
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
          <StatBox value={stats.totalMatches} label="إجمالي المباريات" color="text-white" icon={<FaFutbol />} />
          <StatBox value={stats.upcoming} label="قادمة" color="text-blue-200" icon={<FaHourglassHalf />} />
          <StatBox value={stats.live} label="مباشرة" color="text-red-300" icon={<FaCircle size={10} />} />
          <StatBox value={stats.finished} label="منتهية" color="text-green-300" icon={<FaCheckCircle />} />
          <StatBox value={stats.totalGoals || 0} label="أهداف" color="text-yellow-200" icon={<FaFutbol />} />
        </div>
      )}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
 *  OUR TEAM CARD
 * ═══════════════════════════════════════════════════════════ */
const OurTeamCard = ({ team }) => (
  <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border-r-4 border-secondary">
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-4">
        {team.teamLogo ? (
          <img
            src={team.teamLogo}
            alt={team.teamName}
            className="w-14 h-14 object-contain"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white text-2xl shadow-lg">
            <FaFutbol />
          </div>
        )}
        <div>
          <h2 className="text-xl font-black text-primary">{team.teamName}</h2>
          <p className="text-xs text-gray-500">{team.group?.replace('ترتيب ', '')}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold">
          المركز {team.rank}
        </span>
        <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-bold">
          {team.points} نقطة
        </span>
        {team.yellowCards > 0 && (
          <span className="bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg text-xs font-bold">
            🟨 {team.yellowCards}
          </span>
        )}
        {team.redCards > 0 && (
          <span className="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold">
            🟥 {team.redCards}
          </span>
        )}
      </div>
    </div>

    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
      <MiniStat label="لعب" value={team.played} color="text-gray-700" />
      <MiniStat label="فاز" value={team.won} color="text-green-600" />
      <MiniStat label="تعادل" value={team.drawn} color="text-yellow-600" />
      <MiniStat label="خسر" value={team.lost} color="text-red-600" />
      <MiniStat label="له" value={team.goalsFor} color="text-blue-600" />
      <MiniStat label="عليه" value={team.goalsAgainst} color="text-orange-600" />
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
 *  LIVE MATCHES SECTION
 * ═══════════════════════════════════════════════════════════ */
const LiveMatchesSection = ({ matches }) => (
  <div className="bg-white rounded-2xl shadow-md p-5 mb-6 border-r-4 border-red-500">
    <h2 className="text-lg font-black text-red-600 mb-4 flex items-center gap-2">
      <FaCircle className="text-red-500 animate-pulse" size={10} />
      مباشر الآن ({matches.length})
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {matches.map((m) => (
        <MatchCard key={m._id} match={m} variant="live" />
      ))}
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
 *  STANDINGS SECTION
 * ═══════════════════════════════════════════════════════════ */
const StandingsSection = ({ standings, groups }) => {
  if (groups.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-5">
        <span className="w-1 h-8 bg-secondary rounded"></span>
        <h2 className="text-2xl font-black text-primary">
          ترتيب الفرق ({standings.length} فريق)
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {groups.map((groupName) => (
          <StandingsTable
            key={groupName}
            groupName={groupName}
            teams={standings
              .filter((s) => s.group === groupName)
              .sort((a, b) => a.rank - b.rank)}
          />
        ))}
      </div>

      <StandingsLegend />
    </div>
  );
};

const StandingsTable = ({ groupName, teams }) => (
  <div className="bg-white rounded-2xl shadow-md overflow-hidden">
    <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary font-black">
          <FaTrophy />
        </div>
        <div>
          <h3 className="font-black text-base">{groupName.replace('ترتيب ', '')}</h3>
          <p className="text-xs text-gray-200">{teams.length} فريق</p>
        </div>
      </div>
    </div>

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-2 text-center text-[10px] font-bold text-gray-600 whitespace-nowrap">#</th>
            <th className="p-2 text-right text-[10px] font-bold text-gray-600 whitespace-nowrap">الفريق</th>
            <th className="p-2 text-center text-[10px] font-bold text-gray-600">لعب</th>
            <th className="p-2 text-center text-[10px] font-bold text-gray-600">ف</th>
            <th className="p-2 text-center text-[10px] font-bold text-gray-600">ت</th>
            <th className="p-2 text-center text-[10px] font-bold text-gray-600">خ</th>
            <th className="p-2 text-center text-[10px] font-bold text-gray-600 whitespace-nowrap">+/-</th>
            <th className="p-2 text-center text-[10px] font-bold text-gray-600">نقاط</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const isTop = team.rank <= 2;
            const isBottom = team.rank >= teams.length - 1;

            return (
              <tr
                key={team._id}
                className={`border-b transition ${
                  team.isOurTeam
                    ? 'bg-secondary/10 hover:bg-secondary/20'
                    : isTop
                    ? 'bg-green-50/40 hover:bg-green-50/70'
                    : isBottom
                    ? 'bg-red-50/40 hover:bg-red-50/70'
                    : 'hover:bg-primary/5'
                }`}
              >
                <td className="p-2 text-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-black ${
                    isTop ? 'bg-green-500 text-white' :
                    isBottom ? 'bg-red-500 text-white' :
                    team.isOurTeam ? 'bg-secondary text-primary' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {team.rank}
                  </span>
                </td>
                <td className="p-2 text-right">
                  <div className="flex items-center gap-2">
                    {team.teamLogo && (
                      <img
                        src={team.teamLogo}
                        alt=""
                        className="w-5 h-5 object-contain flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    )}
                    <span className={`text-xs truncate max-w-[140px] ${
                      team.isOurTeam ? 'text-primary font-black' : 'text-gray-700 font-bold'
                    }`}>
                      {team.teamName}
                    </span>
                    {team.isOurTeam && (
                      <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
                    )}
                  </div>
                </td>
                <td className="p-2 text-center text-xs text-gray-700">{team.played}</td>
                <td className="p-2 text-center text-xs text-green-600 font-bold">{team.won}</td>
                <td className="p-2 text-center text-xs text-yellow-600">{team.drawn}</td>
                <td className="p-2 text-center text-xs text-red-600">{team.lost}</td>
                <td className={`p-2 text-center text-xs font-black ${
                  team.goalDifference > 0 ? 'text-green-600' :
                  team.goalDifference < 0 ? 'text-red-600' : 'text-gray-500'
                }`}>
                  {team.goalDifference > 0 ? '+' : ''}{team.goalDifference}
                </td>
                <td className="p-2 text-center">
                  <span className="inline-flex items-center justify-center min-w-[28px] h-6 bg-primary text-white rounded text-xs font-black">
                    {team.points}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

const StandingsLegend = () => (
  <div className="mt-4 bg-white rounded-xl shadow-sm p-3 flex flex-wrap gap-4 justify-center text-xs text-gray-600">
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
);

/* ═══════════════════════════════════════════════════════════
 *  MATCHES SECTION — Tabs + Filter
 * ═══════════════════════════════════════════════════════════ */
const MatchesSection = ({
  upcoming, finished, activeTab, setActiveTab,
  championships, selectedChampionship, setSelectedChampionship,
}) => {
  const currentList = activeTab === 'upcoming' ? upcoming : finished;

  // فلترة حسب البطولة المختارة
  const filtered = selectedChampionship === 'all'
    ? currentList
    : currentList.filter((m) => m.championshipId === Number(selectedChampionship));

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <span className="w-1 h-8 bg-secondary rounded"></span>
          <h2 className="text-2xl font-black text-primary">المباريات</h2>
        </div>

        {/* فلترة حسب البطولة */}
        {championships.length > 1 && (
          <select
            value={selectedChampionship}
            onChange={(e) => setSelectedChampionship(e.target.value)}
            className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-primary"
          >
            <option value={CHAMPIONSHIP_ID}>{CHAMPIONSHIP_NAME}</option>
            <option value="all">كل البطولات ({currentList.length})</option>
            {championships
              .filter((c) => c._id !== CHAMPIONSHIP_ID && c._id)
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} ({c.count})
                </option>
              ))}
          </select>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="flex border-b overflow-x-auto bg-gray-50">
          <TabButton
            active={activeTab === 'upcoming'}
            onClick={() => setActiveTab('upcoming')}
            icon={<FaCalendarAlt />}
            label="القادمة"
            count={upcoming.length}
            color="blue"
          />
          <TabButton
            active={activeTab === 'finished'}
            onClick={() => setActiveTab('finished')}
            icon={<FaCheckCircle />}
            label="المنتهية"
            count={finished.length}
            color="green"
          />
        </div>

        <div className="p-4 md:p-6">
          {filtered.length === 0 ? (
            <EmptyState
              icon={activeTab === 'upcoming' ? <FaCalendarAlt /> : <FaCheckCircle />}
              title={activeTab === 'upcoming' ? 'لا توجد مباريات قادمة' : 'لا توجد مباريات منتهية'}
              subtitle="سيتم عرض المباريات هنا عند إضافتها"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {filtered.map((m) => (
                <MatchMiniCard key={m._id} match={m} variant={activeTab} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
 *  SCORERS SECTION (جديد)
 * ═══════════════════════════════════════════════════════════ */
const ScorersSection = ({ scorers }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-8 bg-secondary rounded"></span>
      <h2 className="text-2xl font-black text-primary flex items-center gap-2">
        <FaMedal className="text-yellow-500" />
        الهدافون
      </h2>
    </div>

    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="p-3 text-center text-xs font-bold text-gray-600">#</th>
            <th className="p-3 text-right text-xs font-bold text-gray-600">اللاعب</th>
            <th className="p-3 text-right text-xs font-bold text-gray-600">الفريق</th>
            <th className="p-3 text-center text-xs font-bold text-gray-600">الأهداف</th>
          </tr>
        </thead>
        <tbody>
          {scorers.map((scorer, idx) => (
            <tr key={scorer._id} className="border-b hover:bg-primary/5">
              <td className="p-3 text-center">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-black ${
                  idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                  idx === 1 ? 'bg-gray-300 text-gray-700' :
                  idx === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {idx + 1}
                </span>
              </td>
              <td className="p-3 text-right text-sm font-bold text-gray-700">
                {scorer.playerName}
              </td>
              <td className="p-3 text-right text-xs text-gray-500">
                {scorer.teamName}
              </td>
              <td className="p-3 text-center">
                <span className="inline-flex items-center justify-center min-w-[32px] h-7 bg-primary text-white rounded text-sm font-black">
                  {scorer.goals}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
 *  OUR UPCOMING MATCHES
 * ═══════════════════════════════════════════════════════════ */
const OurUpcomingMatches = ({ matches }) => (
  <div className="mb-8">
    <div className="flex items-center gap-3 mb-5">
      <span className="w-1 h-8 bg-secondary rounded"></span>
      <h2 className="text-2xl font-black text-primary">مبارياتنا القادمة</h2>
    </div>

    <div className="bg-white rounded-2xl shadow-md p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => (
          <MatchCard key={m._id} match={m} variant="upcoming" />
        ))}
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════
 *  NEWS SECTION
 * ═══════════════════════════════════════════════════════════ */
const NewsSection = ({ news }) => (
  <div className="bg-white rounded-2xl shadow-md p-6">
    <h2 className="text-xl font-black text-primary mb-6 flex items-center gap-3">
      <span className="w-1 h-6 bg-secondary rounded"></span>
      آخر أخبار البطولة
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
          <NewsCard key={n._id} item={n} />
        ))}
      </div>
    )}
  </div>
);

const NewsCard = ({ item }) => (
  <a
    href={item.url}
    target="_blank"
    rel="noopener noreferrer"
    className="group block bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition"
  >
    {item.imageUrl && (
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>
    )}
    <div className="p-4">
      <h3 className="font-bold text-sm text-primary line-clamp-2 group-hover:text-secondary transition">
        {item.title}
      </h3>
    </div>
  </a>
);

/* ═══════════════════════════════════════════════════════════
 *  SHARED COMPONENTS
 * ═══════════════════════════════════════════════════════════ */
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

const MatchCard = ({ match, variant }) => {
  const isLive = variant === 'live' || match.status === 'live';
  const isFinished = variant === 'finished' || match.status === 'finished';
  const isOurMatch = match.isOurTeam;
  const dateObj = match.date ? new Date(match.date) : null;

  return (
    <div className={`p-3 rounded-xl border-2 transition ${
      isLive
        ? 'bg-red-50 border-red-300'
        : isOurMatch
        ? 'bg-secondary/10 border-secondary/40'
        : 'bg-white border-gray-100'
    }`}>
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="text-gray-500 truncate">
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
        <div className="flex items-center gap-1.5 justify-end">
          <span className={`text-xs font-bold truncate ${
            isOurMatch && match.homeTeam?.includes('اتصالات')
              ? 'text-primary'
              : 'text-gray-700'
          }`}>
            {match.homeTeam}
          </span>
          {match.homeTeamLogo && (
            <img
              src={match.homeTeamLogo}
              alt=""
              className="w-5 h-5 object-contain flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
        </div>

        <span className={`font-black px-2 py-1 rounded-lg text-sm text-center whitespace-nowrap ${
          isLive ? 'bg-red-500 text-white' :
          isFinished ? 'bg-gray-700 text-white' :
          'bg-white text-gray-500 border border-gray-200'
        }`}>
          {match.homeScore ?? '-'} : {match.awayScore ?? '-'}
        </span>

        <div className="flex items-center gap-1.5">
          {match.awayTeamLogo && (
            <img
              src={match.awayTeamLogo}
              alt=""
              className="w-5 h-5 object-contain flex-shrink-0"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <span className={`text-xs font-bold truncate ${
            isOurMatch && match.awayTeam?.includes('اتصالات')
              ? 'text-primary'
              : 'text-gray-700'
          }`}>
            {match.awayTeam}
          </span>
        </div>
      </div>

      {!isFinished && !isLive && dateObj && (
        <div className="mt-2 pt-2 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-center gap-1">
          <FaClock className="text-primary" />
          {dateObj.toLocaleString('ar-EG', {
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

const MatchMiniCard = ({ match, variant }) => {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isOurMatch = match.isOurTeam;
  const dateObj = match.date ? new Date(match.date) : null;

  const timeStr = dateObj
    ? dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    : '';
  const dateStr = dateObj
    ? dateObj.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })
    : '';

  return (
    <a
      href={match.filgoalUrl || '#'}
      target={match.filgoalUrl ? '_blank' : '_self'}
      rel="noopener noreferrer"
      className={`block rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        isLive
          ? 'bg-red-50 border-red-300'
          : isOurMatch
          ? 'bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary'
          : 'bg-white border-gray-100 hover:border-primary/30'
      }`}
    >
      <div className={`px-3 py-2 text-[10px] font-bold flex items-center justify-between ${
        isLive
          ? 'bg-red-500 text-white'
          : isFinished
          ? 'bg-gray-100 text-gray-600'
          : 'bg-primary text-white'
      }`}>
        <span className="truncate">
          {match.round || match.championship?.substring(0, 15) || 'الدوري'}
        </span>
        <span className="flex items-center gap-1 whitespace-nowrap">
          {isLive && <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>}
          {isLive ? 'مباشر' : isFinished ? 'انتهت' : timeStr}
        </span>
      </div>

      <div className="p-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {match.homeTeamLogo && (
              <img
                src={match.homeTeamLogo}
                alt=""
                className="w-6 h-6 object-contain flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <span className={`text-xs font-bold truncate ${
              isOurMatch && match.homeTeam?.includes('اتصالات')
                ? 'text-primary'
                : 'text-gray-700'
            }`}>
              {match.homeTeam}
            </span>
          </div>

          {(isFinished || isLive) && (
            <span className={`text-base font-black px-2 ${
              isLive ? 'text-red-600' : 'text-gray-800'
            }`}>
              {match.homeScore ?? '-'}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {match.awayTeamLogo && (
              <img
                src={match.awayTeamLogo}
                alt=""
                className="w-6 h-6 object-contain flex-shrink-0"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <span className={`text-xs font-bold truncate ${
              isOurTeam(match.awayTeam) ? 'text-primary' : 'text-gray-700'
            }`}>
              {match.awayTeam}
            </span>
          </div>

          {(isFinished || isLive) && (
            <span className={`text-base font-black px-2 ${
              isLive ? 'text-red-600' : 'text-gray-800'
            }`}>
              {match.awayScore ?? '-'}
            </span>
          )}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500 flex items-center justify-center gap-1">
        <FaClock className="text-primary" size={9} />
        {isFinished || isLive ? dateStr : `${dateStr} • ${timeStr}`}
      </div>
    </a>
  );
};

const isOurTeam = (teamName) => {
  if (!teamName) return false;
  const keywords = ['اتصالات', 'المصرية للاتصالات', 'we'];
  return keywords.some((kw) => teamName.includes(kw));
};

export default SecondDivision;