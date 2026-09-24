import { useEffect, useState } from 'react';
import { FaFutbol, FaTrophy, FaCalendarAlt, FaBroadcastTower } from 'react-icons/fa';
import { matchAPI } from '../services/api';
import MatchCard from '../components/MatchCard';
import LiveMatchCard from '../components/LiveMatchCard';
import Loading from '../components/Loading';

const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [finished, setFinished] = useState([]);
  const [live, setLive] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      const [allRes, upcomingRes, finishedRes, liveRes, statsRes] = await Promise.all([
        matchAPI.getAll({ limit: 50 }),
        matchAPI.getUpcoming(10),
        matchAPI.getFinished(10),
        matchAPI.getLive(),
        matchAPI.getStats(),
      ]);
      setMatches(allRes.data.matches);
      setUpcoming(upcomingRes.data.matches);
      setFinished(finishedRes.data.matches);
      setLive(liveRes.data.matches);
      setStats(statsRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // تحديث كل 30 ثانية للمباريات المباشرة
    const interval = setInterval(async () => {
      try {
        const liveRes = await matchAPI.getLive();
        setLive(liveRes.data.matches);
      } catch (err) { /* silent */ }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { key: 'all', label: 'الكل', icon: <FaFutbol />, count: matches.length },
    { key: 'live', label: 'مباشر', icon: <FaBroadcastTower />, count: live.length },
    { key: 'upcoming', label: 'قادمة', icon: <FaCalendarAlt />, count: upcoming.length },
    { key: 'finished', label: 'منتهية', icon: <FaTrophy />, count: finished.length },
  ];

  const getDisplayedMatches = () => {
    let list = [];
    if (activeTab === 'all') list = matches;
    else if (activeTab === 'upcoming') list = upcoming;
    else if (activeTab === 'finished') list = finished;
    else if (activeTab === 'live') list = live;

    if (filter === 'home') list = list.filter(m => m.venue === 'home');
    if (filter === 'away') list = list.filter(m => m.venue === 'away');

    return list;
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="container-custom text-center relative z-10">
          <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary text-4xl shadow-2xl animate-float">
            <FaFutbol className="ball-spin" />
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-4">
            مباريات <span className="text-secondary">النادي</span>
          </h1>
          <p className="text-gray-200 text-lg">تابع جميع مباريات الفريق لحظة بلحظة</p>

          {stats && (
            <div className="flex justify-center gap-6 md:gap-10 mt-8 flex-wrap">
              <div className="text-center">
                <p className="text-3xl md:text-5xl font-black text-secondary">{stats.total}</p>
                <p className="text-xs text-gray-300 font-bold mt-1">إجمالي</p>
              </div>
              <div className="w-px bg-white/30"></div>
              <div className="text-center">
                <p className="text-3xl md:text-5xl font-black text-green-400">{stats.wins}</p>
                <p className="text-xs text-gray-300 font-bold mt-1">فوز</p>
              </div>
              <div className="w-px bg-white/30"></div>
              <div className="text-center">
                <p className="text-3xl md:text-5xl font-black text-yellow-400">{stats.draws}</p>
                <p className="text-xs text-gray-300 font-bold mt-1">تعادل</p>
              </div>
              <div className="w-px bg-white/30"></div>
              <div className="text-center">
                <p className="text-3xl md:text-5xl font-black text-red-400">{stats.losses}</p>
                <p className="text-xs text-gray-300 font-bold mt-1">خسارة</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {live.length > 0 && (
        <section className="container-custom -mt-8 relative z-20">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border-2 border-red-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl live-dot">
                <FaBroadcastTower />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-red-600">
                  مباشر الآن
                </h2>
                <p className="text-gray-500 text-sm">تابع المباريات الجارية</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {live.map((match) => (
                <LiveMatchCard key={match._id} match={match} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="container-custom py-12">
        <div className="bg-white rounded-2xl shadow-md sticky top-24 z-20 p-4 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-3 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab.key
                    ? 'bg-gradient-to-l from-primary to-primary-dark text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon}
                {tab.label}
                <span className={`px-2 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-white/30' : 'bg-primary/10 text-primary'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold ${
                filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              كل المباريات
            </button>
            <button
              onClick={() => setFilter('home')}
              className={`px-4 py-2 rounded-full text-xs font-bold ${
                filter === 'home' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              🏠 على أرضنا
            </button>
            <button
              onClick={() => setFilter('away')}
              className={`px-4 py-2 rounded-full text-xs font-bold ${
                filter === 'away' ? 'bg-primary text-white' : 'bg-gray-100'
              }`}
            >
              ✈️ خارج الأرض
            </button>
          </div>
        </div>

        {getDisplayedMatches().length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <FaFutbol className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-bold mb-2">لا توجد مباريات</p>
            <p className="text-gray-400 text-sm">سيتم الإعلان عن المباريات قريباً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getDisplayedMatches().map((match) => (
              <MatchCard key={match._id} match={match} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Matches;