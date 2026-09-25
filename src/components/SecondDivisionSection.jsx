import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaTrophy, FaArrowLeft, FaClock, FaCircle, FaCalendarAlt,
} from 'react-icons/fa';
import { filgoalAPI } from '../services/api';

const SecondDivisionSection = () => {
  const [stats, setStats] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [live, setLive] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, upRes, liveRes, newsRes] = await Promise.allSettled([
          filgoalAPI.getStats(),
          filgoalAPI.getUpcoming(6),
          filgoalAPI.getLive(),
          filgoalAPI.getNews(4),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (upRes.status === 'fulfilled') setUpcoming(upRes.value.data.matches || []);
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

  return (
    <section className="py-12 bg-gray-50">
      <div className="container-custom">
        {/* العنوان */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-secondary text-xl shadow-lg">
              <FaTrophy />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-primary">
                الدوري المصري الدرجة الثانية
              </h2>
              <p className="text-xs text-gray-500">آخر النتائج والمباريات القادمة</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الجانب الأيسر: فريقنا + المباريات */}
          <div className="lg:col-span-2 space-y-6">
            {/* كارت فريقنا */}
            {ourTeam && (
              <div className="bg-gradient-to-l from-primary to-primary-dark text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>

                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl shadow-lg">
                      <FaTrophy />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">{ourTeam.teamName}</h3>
                      <p className="text-xs text-gray-200">{ourTeam.group?.replace('ترتيب ', '')}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-center">
                      <p className="text-2xl font-black text-secondary">{ourTeam.rank}</p>
                      <p className="text-[10px] text-gray-200">المركز</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl px-4 py-2 text-center">
                      <p className="text-2xl font-black text-green-300">{ourTeam.points}</p>
                      <p className="text-[10px] text-gray-200">نقاط</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* المباريات المباشرة */}
            {live.length > 0 && (
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                  <FaCircle className="text-red-500 animate-pulse text-xs" />
                  <h3 className="font-black text-red-600">مباريات مباشرة الآن</h3>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {live.map((m) => (
                    <HomeMatchCard key={m._id} match={m} />
                  ))}
                </div>
              </div>
            )}

            {/* المباريات القادمة */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-1 h-6 bg-secondary rounded"></span>
                <h3 className="font-black text-primary flex items-center gap-2">
                  <FaCalendarAlt className="text-secondary" />
                  المباريات القادمة
                </h3>
              </div>

              {upcoming.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">لا توجد مباريات قادمة</p>
              ) : (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {upcoming.slice(0, 6).map((m) => (
                    <HomeMatchCard key={m._id} match={m} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* الجانب الأيمن: الأخبار */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-1 h-6 bg-secondary rounded"></span>
                <h3 className="font-black text-primary">آخر الأخبار</h3>
              </div>

              {news.length === 0 ? (
                <p className="text-center text-gray-500 py-6 text-sm">لا توجد أخبار</p>
              ) : (
                <div className="p-3 space-y-3">
                  {news.map((n) => (
                    <a
                      key={n._id}
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      {n.imageUrl && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={n.imageUrl}
                            alt={n.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-primary line-clamp-3 group-hover:text-secondary transition">
                          {n.title}
                        </h4>
                      </div>
                    </a>
                  ))}

                  <Link
                    to="/second-division"
                    className="block text-center bg-primary/5 hover:bg-primary/10 text-primary font-bold py-2 rounded-lg text-xs transition"
                  >
                    عرض كل الأخبار ←
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* كارد مباراة مبسّط */
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
          {isLive ? '🔴 مباشر' : isFinished ? 'انتهت' : dateObj?.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-bold truncate ${
            match.isOurTeam && match.homeTeam?.includes('اتصالات') ? 'text-primary' : 'text-gray-700'
          }`}>
            {match.homeTeam}
          </span>
          {(isFinished || isLive) && (
            <span className="text-lg font-black text-gray-800">{match.homeScore}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-bold truncate ${
            match.isOurTeam && match.awayTeam?.includes('اتصالات') ? 'text-primary' : 'text-gray-700'
          }`}>
            {match.awayTeam}
          </span>
          {(isFinished || isLive) && (
            <span className="text-lg font-black text-gray-800">{match.awayScore}</span>
          )}
        </div>
      </div>

      {!isFinished && !isLive && dateObj && (
        <div className="mt-2 pt-2 border-t border-gray-100 text-[10px] text-gray-500 flex items-center justify-center gap-1">
          <FaClock size={9} />
          {dateObj.toLocaleDateString('ar-EG', { day: '2-digit', month: 'short' })}
        </div>
      )}
    </a>
  );
};

export default SecondDivisionSection;