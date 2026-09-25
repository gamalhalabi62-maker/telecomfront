import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTrophy, FaArrowLeft, FaCircle, FaFutbol,
  FaNewspaper, FaChevronLeft,
} from 'react-icons/fa';
import { filgoalAPI } from '../services/api';

const SecondDivisionSection = () => {
  const [stats, setStats] = useState(null);
  const [standings, setStandings] = useState([]);
  const [live, setLive] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, standingsRes, liveRes, newsRes] =
          await Promise.allSettled([
            filgoalAPI.getStats(),
            filgoalAPI.getStandings(),
            filgoalAPI.getLive(),
            filgoalAPI.getNews(8),
          ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (standingsRes.status === 'fulfilled')
          setStandings(standingsRes.value.data.standings || []);
        if (liveRes.status === 'fulfilled') setLive(liveRes.value.data.matches || []);
        if (newsRes.status === 'fulfilled') setNews(newsRes.value.data.news || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading || !stats) return null;

  if (stats.totalMatches === 0 && stats.totalNews === 0) return null;

  const ourTeam = stats.ourTeam;
  const sortedStandings = [...standings].sort((a, b) => a.rank - b.rank);

  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-secondary text-xl shadow-lg">
              <FaTrophy />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-primary">
                الدوري المصري الدرجة الثانية
              </h2>
              <p className="text-xs text-gray-500">
                الترتيب الكامل، الأخبار، والنتائج
              </p>
            </div>
          </div>

          <Link
            to="/second-division"
            className="inline-flex items-center gap-2 text-primary hover:text-secondary font-bold transition group"
          >
            عرض التفاصيل الكاملة
            <FaArrowLeft className="group-hover:-translate-x-1 transition" />
          </Link>
        </div>

        {ourTeam && (
          <div className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-secondary rounded-full blur-3xl opacity-10"></div>

            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {ourTeam.teamLogo ? (
                  <img
                    src={ourTeam.teamLogo}
                    alt={ourTeam.teamName}
                    className="w-20 h-20 object-contain bg-white/10 rounded-2xl p-2"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center text-primary text-3xl shadow-lg">
                    <FaFutbol />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl md:text-3xl font-black">
                    {ourTeam.teamName}
                  </h3>
                  <p className="text-sm text-gray-200 mt-1">
                    {ourTeam.group?.replace('ترتيب ', '') || 'دوري المحترفين المصري'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center min-w-[90px]">
                  <p className="text-3xl font-black text-secondary">
                    {ourTeam.rank}
                  </p>
                  <p className="text-[10px] text-gray-200 mt-1">المركز</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center min-w-[90px]">
                  <p className="text-3xl font-black text-green-300">
                    {ourTeam.points}
                  </p>
                  <p className="text-[10px] text-gray-200 mt-1">نقاط</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center min-w-[90px]">
                  <p className="text-3xl font-black text-blue-200">
                    {ourTeam.played}
                  </p>
                  <p className="text-[10px] text-gray-200 mt-1">مباريات</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 text-center min-w-[90px]">
                  <p className="text-3xl font-black text-yellow-200">
                    {ourTeam.won}
                  </p>
                  <p className="text-[10px] text-gray-200 mt-1">فوز</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/20">
              <MiniStatDark label="تعادل" value={ourTeam.drawn} />
              <MiniStatDark label="خسارة" value={ourTeam.lost} />
              <MiniStatDark label="له" value={ourTeam.goalsFor} />
              <MiniStatDark label="عليه" value={ourTeam.goalsAgainst} />
            </div>
          </div>
        )}

        {live.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden border-r-4 border-red-500">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <FaCircle className="text-red-500 animate-pulse text-xs" />
              <h3 className="font-black text-red-600">
                مباريات مباشرة الآن ({live.length})
              </h3>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {live.map((m) => (
                <HomeMatchCard key={m._id} match={m} />
              ))}
            </div>
          </div>
        )}

        {sortedStandings.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-5">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-primary text-xl">
                    <FaTrophy />
                  </div>
                  <div>
                    <h3 className="font-black text-lg">
                      ترتيب الفرق في دوري المحترفين المصري
                    </h3>
                    <p className="text-xs text-gray-200">
                      {sortedStandings.length} فريق • الجولة{' '}
                      {sortedStandings[0]?.played || 0}
                    </p>
                  </div>
                </div>

                <Link
                  to="/second-division"
                  className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-lg text-sm font-bold transition"
                >
                  الجدول الكامل
                  <FaChevronLeft className="text-xs" />
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-center text-xs font-bold text-gray-600 w-14">
                      #
                    </th>
                    <th className="p-3 text-right text-xs font-bold text-gray-600">
                      الفريق
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-gray-600">
                      لعب
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-gray-600">
                      ف
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-gray-600">
                      ت
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-gray-600">
                      خ
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-gray-600">
                      له
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-gray-600">
                      عليه
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-gray-600">
                      +/-
                    </th>
                    <th className="p-3 text-center text-xs font-bold text-gray-600">
                      نقاط
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedStandings.map((team) => {
                    const isTop = team.rank <= 2;
                    const isBottom = team.rank >= sortedStandings.length - 1;

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
                        <td className="p-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${
                              isTop
                                ? 'bg-green-500 text-white'
                                : isBottom
                                ? 'bg-red-500 text-white'
                                : team.isOurTeam
                                ? 'bg-secondary text-primary'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {team.rank}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <span
                              className={`text-sm truncate max-w-[180px] ${
                                team.isOurTeam
                                  ? 'text-primary font-black'
                                  : 'text-gray-700 font-bold'
                              }`}
                            >
                              {team.teamName}
                            </span>
                            {team.teamLogo && (
                              <img
                                src={team.teamLogo}
                                alt=""
                                className="w-6 h-6 object-contain flex-shrink-0"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            {team.isOurTeam && (
                              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse flex-shrink-0"></span>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center text-sm text-gray-700 font-bold">
                          {team.played}
                        </td>
                        <td className="p-3 text-center text-sm text-green-600 font-bold">
                          {team.won}
                        </td>
                        <td className="p-3 text-center text-sm text-yellow-600 font-bold">
                          {team.drawn}
                        </td>
                        <td className="p-3 text-center text-sm text-red-600 font-bold">
                          {team.lost}
                        </td>
                        <td className="p-3 text-center text-sm text-blue-600 font-bold">
                          {team.goalsFor}
                        </td>
                        <td className="p-3 text-center text-sm text-orange-600 font-bold">
                          {team.goalsAgainst}
                        </td>
                        <td
                          className={`p-3 text-center text-sm font-black ${
                            team.goalDifference > 0
                              ? 'text-green-600'
                              : team.goalDifference < 0
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {team.goalDifference > 0 ? '+' : ''}
                          {team.goalDifference}
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

            <div className="bg-gray-50 p-4 flex flex-wrap gap-4 justify-center text-xs text-gray-600 border-t">
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
        )}

        {news.length > 0 && (
          <div>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="w-1 h-8 bg-secondary rounded"></span>
                <h3 className="text-2xl font-black text-primary flex items-center gap-2">
                  <FaNewspaper className="text-secondary" />
                  آخر أخبار البطولة
                </h3>
              </div>

              <Link
                to="/second-division"
                className="text-primary hover:text-secondary font-bold text-sm inline-flex items-center gap-2 transition group"
              >
                كل الأخبار
                <FaArrowLeft className="group-hover:-translate-x-1 transition text-xs" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {news.map((n) => (
                <NewsCard key={n._id} item={n} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const MiniStatDark = ({ label, value }) => (
  <div className="bg-white/5 backdrop-blur-md rounded-xl p-3 text-center">
    <p className="text-xl font-black text-white">{value}</p>
    <p className="text-[10px] text-gray-200 mt-1">{label}</p>
  </div>
);

const HomeMatchCard = ({ match }) => {
  const isLive = match.status === 'live';
  const isFinished = match.status === 'finished';
  const dateObj = match.date ? new Date(match.date) : null;

  return (
    <a
      href={match.filgoalUrl || '#'}
      target={match.filgoalUrl ? '_blank' : '_self'}
      rel="noopener noreferrer"
      className={`block p-3 rounded-xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${
        isLive
          ? 'bg-red-50 border-red-300'
          : match.isOurTeam
          ? 'bg-secondary/10 border-secondary/40'
          : 'bg-white border-gray-100 hover:border-primary/30'
      }`}
    >
      <div className="text-[10px] font-bold text-gray-500 mb-2 flex items-center justify-between">
        <span className="truncate">{match.round || 'الدوري'}</span>
        <span className={isLive ? 'text-red-600' : ''}>
          {isLive
            ? '🔴 مباشر'
            : isFinished
            ? 'انتهت'
            : dateObj?.toLocaleTimeString('ar-EG', {
                hour: '2-digit',
                minute: '2-digit',
              })}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-bold truncate ${
              match.isOurTeam && match.homeTeam?.includes('اتصالات')
                ? 'text-primary'
                : 'text-gray-700'
            }`}
          >
            {match.homeTeam}
          </span>
          {(isFinished || isLive) && (
            <span className="text-lg font-black text-gray-800">
              {match.homeScore}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-bold truncate ${
              match.isOurTeam && match.awayTeam?.includes('اتصالات')
                ? 'text-primary'
                : 'text-gray-700'
            }`}
          >
            {match.awayTeam}
          </span>
          {(isFinished || isLive) && (
            <span className="text-lg font-black text-gray-800">
              {match.awayScore}
            </span>
          )}
        </div>
      </div>
    </a>
  );
};

const NewsCard = ({ item }) => (
  <Link
    to={`/news/${item.filgoalArticleId}`}
    className="group bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
  >
    {item.imageUrl ? (
      <div className="aspect-video overflow-hidden bg-gray-100 relative">
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
        <div className="absolute top-3 right-3 bg-secondary text-primary text-[10px] font-black px-2 py-1 rounded-full">
          بطولة
        </div>
      </div>
    ) : (
      <div className="aspect-video bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
        <FaNewspaper className="text-secondary text-4xl" />
      </div>
    )}

    <div className="p-4 flex-1 flex flex-col">
      <h4 className="font-bold text-sm text-primary line-clamp-3 group-hover:text-secondary transition leading-relaxed">
        {item.title}
      </h4>

      <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100 mt-3">
        <span className="text-[10px] text-gray-400">
          {item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString('ar-EG', {
                day: '2-digit',
                month: 'short',
              })
            : 'الآن'}
        </span>
        <span className="text-[10px] font-bold text-secondary group-hover:text-primary transition inline-flex items-center gap-1">
          اقرأ المزيد
          <FaArrowLeft className="text-[8px] group-hover:-translate-x-0.5 transition" />
        </span>
      </div>
    </div>
  </Link>
);

export default SecondDivisionSection;