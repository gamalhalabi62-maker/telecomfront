import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight, FaTrophy, FaCalendar, FaMapMarkerAlt,
  FaFutbol, FaEye, FaClock, FaBroadcastTower,
} from 'react-icons/fa';
import { matchAPI } from '../services/api';
import Loading from '../components/Loading';
import MatchCard from '../components/MatchCard';
import { formatDate } from '../utils/formatDate';

const competitionNames = {
  league: 'الدوري',
  cup: 'الكأس',
  friendly: 'ودية',
  african: 'أفريقي',
  arab: 'عربي',
  other: 'أخرى',
};

const eventIcons = {
  goal: '⚽',
  own_goal: '⚽',
  penalty: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
  substitution: '🔄',
  var: '📺',
};

const MatchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const { data } = await matchAPI.getById(id);
        setMatch(data);
      } catch (err) {
        setError('المباراة غير موجودة');
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [id]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-4xl font-black text-primary mb-4">عذراً</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/matches')} className="btn-primary">
          العودة للمباريات
        </button>
      </div>
    );
  }

  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';
  const isUpcoming = match.status === 'upcoming';

  let result = null;
  if (isFinished && match.ourScore !== null && match.opponentScore !== null) {
    if (match.ourScore > match.opponentScore) result = { text: 'فوز', color: 'text-green-600', bg: 'bg-green-50' };
    else if (match.ourScore < match.opponentScore) result = { text: 'خسارة', color: 'text-red-600', bg: 'bg-red-50' };
    else result = { text: 'تعادل', color: 'text-yellow-600', bg: 'bg-yellow-50' };
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">الرئيسية</Link>
            <span>›</span>
            <Link to="/matches" className="hover:text-primary">المباريات</Link>
            <span>›</span>
            <span className="text-primary font-bold">vs {match.opponent}</span>
          </nav>
        </div>
      </div>

      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-6 py-2 rounded-full">
              <FaTrophy className="text-secondary" />
              <span className="font-bold">
                {match.competitionName || competitionNames[match.competition]}
              </span>
              {match.round && (
                <span className="bg-secondary text-primary px-2 py-0.5 rounded text-xs font-black">
                  {match.round}
                </span>
              )}
            </div>
          </div>

          {/* Teams & Score */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 items-center max-w-4xl mx-auto">
         {/* Our Team */}
<div className="text-center">
  <div className="w-24 h-24 md:w-32 md:h-32 mx-auto flex items-center justify-center mb-4">
    <img
      src="/logo.jpeg"
      alt="المصرية للاتصالات"
      className="w-full h-full object-contain drop-shadow-2xl"
    />
  </div>
  <p className="font-black text-base md:text-xl"> Telecom</p>
</div>

            {/* Score */}
            <div className="text-center">
              {isFinished || isLive ? (
                <div>
                  <div className="flex items-center justify-center gap-4 md:gap-6">
                    <span className={`text-5xl md:text-8xl font-black ${match.ourScore > match.opponentScore ? 'text-green-400' : 'text-white'}`}>
                      {match.ourScore ?? 0}
                    </span>
                    <span className="text-4xl text-white/50">-</span>
                    <span className={`text-5xl md:text-8xl font-black ${match.opponentScore > match.ourScore ? 'text-red-400' : 'text-white'}`}>
                      {match.opponentScore ?? 0}
                    </span>
                  </div>
                  {isLive && match.minute > 0 && (
                    <div className="mt-4 inline-flex items-center gap-2 bg-red-500 px-4 py-2 rounded-full">
                      <span className="w-2 h-2 bg-white rounded-full live-dot"></span>
                      <span className="font-black">مباشر - الدقيقة {match.minute}'</span>
                    </div>
                  )}
                  {isFinished && result && (
                    <div className={`mt-4 inline-block ${result.bg} ${result.color} px-6 py-2 rounded-full font-black text-lg`}>
                      {result.text}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <span className="inline-block bg-secondary text-primary px-6 py-3 rounded-full font-black text-3xl vs-badge">
                    VS
                  </span>
                </div>
              )}
            </div>

            {/* Opponent */}
            <div className="text-center">
              <div className="w-24 h-24 md:w-32 md:h-32 mx-auto bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center overflow-hidden border-4 border-white/30 shadow-2xl mb-4">
                {match.opponentLogo ? (
                  <img
                    src={match.opponentLogo.startsWith('http') ? match.opponentLogo : `http://localhost:3000${match.opponentLogo}`}
                    alt={match.opponent}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-white font-black text-3xl md:text-5xl">{match.opponent.charAt(0)}</span>
                )}
              </div>
              <p className="font-black text-base md:text-xl line-clamp-2">{match.opponent}</p>
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-wrap gap-4 justify-center mt-10 text-sm">
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
              <FaCalendar /> {formatDate(match.date)}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
              <FaClock /> {new Date(match.date).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
              <FaMapMarkerAlt /> {match.stadium || (match.venue === 'home' ? 'الملعب الرئيسي' : 'خارج الأرض')}
            </span>
            <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full">
              <FaEye /> {match.views || 0} مشاهدة
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2 space-y-6">
            {/* Events */}
            {match.events && match.events.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
                  <span className="w-1 h-8 bg-secondary rounded"></span>
                  أحداث المباراة
                </h2>
                <div className="space-y-3">
                  {match.events.map((event, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        event.team === 'us' ? 'bg-primary/5 border-r-4 border-primary' : 'bg-red-50 border-l-4 border-red-500'
                      }`}
                    >
                      <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-black text-primary shadow-md">
                        {event.minute}'
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-primary">
                          {eventIcons[event.type]} {event.player}
                        </p>
                        {event.description && (
                          <p className="text-sm text-gray-600">{event.description}</p>
                        )}
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${
                        event.team === 'us' ? 'bg-primary text-white' : 'bg-red-500 text-white'
                      }`}>
                        {event.team === 'us' ? 'لنا' : 'علينا'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {match.notes && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-black text-primary mb-4 flex items-center gap-3">
                  <span className="w-1 h-8 bg-secondary rounded"></span>
                  ملاحظات
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {match.notes}
                </p>
              </div>
            )}

            {/* Lineup */}
            {match.lineup && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <h2 className="text-2xl font-black text-primary mb-4 flex items-center gap-3">
                  <span className="w-1 h-8 bg-secondary rounded"></span>
                  التشكيلة
                </h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {match.lineup}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h3 className="text-xl font-black text-primary mb-4 pb-3 border-b-2 border-secondary">
                🎯 مباريات ذات صلة
              </h3>
              {match.related && match.related.length > 0 ? (
                <div className="space-y-3">
                  {match.related.map((m) => (
                    <Link
                      key={m._id}
                      to={`/matches/${m._id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-primary">vs {m.opponent}</span>
                        <span className="text-xs text-gray-500">{formatDate(m.date)}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">
                          {m.status === 'finished' ? `${m.ourScore}-${m.opponentScore}` : m.status === 'live' ? 'مباشر' : 'قادمة'}
                        </span>
                        <span className="text-secondary font-black text-xs">
                          {competitionNames[m.competition]}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لا توجد مباريات مشابهة</p>
              )}

              <Link
                to="/matches"
                className="block text-center mt-6 pt-6 border-t text-primary font-bold hover:text-secondary transition"
              >
                عرض كل المباريات ←
              </Link>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="text-center mt-12">
          <Link
            to="/matches"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition shadow-lg"
          >
            <FaArrowRight /> العودة لجميع المباريات
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MatchDetail;