import { Link } from 'react-router-dom';
import { FaCalendar, FaMapMarkerAlt, FaTrophy, FaEye } from 'react-icons/fa';
import { formatDate } from '../utils/formatDate';

const competitionNames = {
  league: 'الدوري',
  cup: 'الكأس',
  friendly: 'ودية',
  african: 'أفريقي',
  arab: 'عربي',
  other: 'أخرى',
};

const statusLabels = {
  upcoming: { text: 'قادمة', color: 'bg-blue-500' },
  live: { text: 'مباشر', color: 'bg-red-500' },
  finished: { text: 'انتهت', color: 'bg-gray-500' },
  postponed: { text: 'مؤجلة', color: 'bg-yellow-500' },
  cancelled: { text: 'ملغاة', color: 'bg-gray-700' },
};

const formatMatchTime = (date) => {
  return new Date(date).toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MatchCard = ({ match }) => {
  if (!match) return null;

  const statusInfo = statusLabels[match.status] || statusLabels.upcoming;
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  let result = null;
  if (isFinished && match.ourScore !== null && match.opponentScore !== null) {
    if (match.ourScore > match.opponentScore) result = { text: 'فوز', color: 'text-green-600' };
    else if (match.ourScore < match.opponentScore) result = { text: 'خسارة', color: 'text-red-600' };
    else result = { text: 'تعادل', color: 'text-yellow-600' };
  }

  return (
    <Link to={`/matches/${match._id}`} className="block group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1">
        <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-sm">
            <FaTrophy className="text-secondary" />
            <span className="font-bold">
              {match.competitionName || competitionNames[match.competition]}
            </span>
            {match.round && (
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                {match.round}
              </span>
            )}
          </div>
          <div className={`${statusInfo.color} px-3 py-1 rounded-full text-xs font-black flex items-center gap-1`}>
            {isLive && <span className="w-2 h-2 bg-white rounded-full live-dot"></span>}
            {statusInfo.text}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-3 gap-4 items-center">

<div className="text-center">
  <div className="w-16 h-16 md:w-20 md:h-20 mx-auto flex items-center justify-center mb-2">
    <img
      src="/logo.jpeg"
      alt="Telecom"
      className="w-full h-full object-contain drop-shadow-lg"
    />
  </div>
  <p className="font-black text-primary text-sm md:text-base"> Telecom</p>
</div>

            <div className="text-center">
              {isFinished || isLive ? (
                <div>
                  <div className="flex items-center justify-center gap-3">
                    <span className={`text-3xl md:text-5xl font-black ${match.ourScore > match.opponentScore ? 'text-green-600' : 'text-primary'}`}>
                      {match.ourScore ?? 0}
                    </span>
                    <span className="text-2xl md:text-3xl text-gray-400 font-black">-</span>
                    <span className={`text-3xl md:text-5xl font-black ${match.opponentScore > match.ourScore ? 'text-red-600' : 'text-primary'}`}>
                      {match.opponentScore ?? 0}
                    </span>
                  </div>
                  {isLive && match.minute > 0 && (
                    <p className="text-red-500 font-black text-sm mt-2 live-dot">
                      ⏱ {match.minute}'
                    </p>
                  )}
                  {isFinished && result && (
                    <p className={`${result.color} font-black text-sm mt-2`}>
                      {result.text}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <span className="inline-block bg-secondary text-primary px-4 py-2 rounded-full font-black text-lg vs-badge">
                    VS
                  </span>
                  <p className="text-xs text-gray-500 mt-2">
                    {formatMatchTime(match.date)}
                  </p>
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="w-16 h-16 md:w-20 md:h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shadow-lg mb-2">
                {match.opponentLogo ? (
                  <img
                    src={match.opponentLogo.startsWith('http') ? match.opponentLogo : `http://localhost:3000${match.opponentLogo}`}
                    alt={match.opponent}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-primary font-black text-xl">{match.opponent.charAt(0)}</span>
                )}
              </div>
              <p className="font-black text-primary text-sm md:text-base line-clamp-2">{match.opponent}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FaCalendar className="text-primary" />
              {formatDate(match.date)}
            </span>
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-primary" />
              {match.venue === 'home' ? 'الملعب الرئيسي' : match.venue === 'away' ? 'خارج الأرض' : 'ملعب محايد'}
            </span>
          </div>
        </div>

        <div className={`h-1 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-l from-primary via-secondary to-primary'} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right`}></div>
      </div>
    </Link>
  );
};

export default MatchCard;