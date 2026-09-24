import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaTrophy, FaMapMarkerAlt, FaBolt } from 'react-icons/fa';

const competitionNames = {
  league: 'الدوري',
  cup: 'الكأس',
  friendly: 'ودية',
  african: 'أفريقي',
  arab: 'عربي',
  other: 'أخرى',
};

const LiveMatchCard = ({ match }) => {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(interval);
  }, []);

  if (!match) return null;

  return (
    <Link to={`/matches/${match._id}`} className="block group">
      <div className="relative bg-gradient-to-br from-red-600 via-red-700 to-primary-dark rounded-2xl overflow-hidden shadow-2xl hover:shadow-red-500/50 transition-all duration-500">
        <div className="absolute inset-0 opacity-20">
          <div className={`absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transition-transform duration-1000 ${pulse ? 'scale-110' : 'scale-100'}`}></div>
        </div>

        <div className="absolute top-3 right-3 bg-white text-red-600 px-3 py-1.5 rounded-full font-black text-xs flex items-center gap-2 shadow-xl z-10">
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full live-dot"></span>
          مباشر الآن
        </div>

        <div className="relative z-10 p-6 text-white">
          <div className="flex items-center gap-2 text-sm mb-4 opacity-90">
            <FaTrophy className="text-yellow-300" />
            <span className="font-bold">
              {match.competitionName || competitionNames[match.competition]}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 items-center mb-4">
<div className="text-center">
  <div className="w-14 h-14 mx-auto flex items-center justify-center mb-2">
    <img
      src="/logo.jpeg"
      alt="المصرية للاتصالات"
      className="w-full h-full object-contain drop-shadow-xl"
    />
  </div>
  <p className="font-black text-xs md:text-sm line-clamp-1">Telecom</p>
</div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="text-4xl md:text-5xl font-black text-yellow-300">
                  {match.ourScore ?? 0}
                </span>
                <span className="text-2xl text-white/60">-</span>
                <span className="text-4xl md:text-5xl font-black text-white">
                  {match.opponentScore ?? 0}
                </span>
              </div>
              {match.minute > 0 && (
                <div className="mt-2 flex items-center justify-center gap-1">
                  <FaBolt className="text-yellow-300 text-xs" />
                  <span className="text-yellow-300 font-black text-sm">
                    الدقيقة {match.minute}'
                  </span>
                </div>
              )}
            </div>

            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center overflow-hidden border-2 border-white/30 mb-2">
                {match.opponentLogo ? (
                  <img
                    src={match.opponentLogo.startsWith('http') ? match.opponentLogo : `http://localhost:3000${match.opponentLogo}`}
                    alt={match.opponent}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-white font-black text-lg">{match.opponent.charAt(0)}</span>
                )}
              </div>
              <p className="font-black text-xs md:text-sm line-clamp-1">{match.opponent}</p>
            </div>
          </div>

          <div className="relative h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min((match.minute / 90) * 100, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-3 text-xs opacity-90">
            <span className="flex items-center gap-1">
              <FaMapMarkerAlt />
              {match.venue === 'home' ? 'الملعب الرئيسي' : 'خارج الأرض'}
            </span>
            <span className="bg-white/20 px-2 py-1 rounded font-bold">
              {match.stadium || 'غير محدد'}
            </span>
          </div>
        </div>

        <div className={`absolute inset-0 rounded-2xl border-2 border-red-400/50 pointer-events-none transition-opacity duration-1000 ${pulse ? 'opacity-100' : 'opacity-30'}`}></div>
      </div>
    </Link>
  );
};

export default LiveMatchCard;