import { Link } from 'react-router-dom';
import { FaFutbol, FaTrophy } from 'react-icons/fa';
import { getImageUrl } from '../utils/formatDate';

const positionNames = {
  goalkeeper: 'حارس مرمى',
  defender: 'مدافع',
  midfielder: 'وسط',
  forward: 'مهاجم',
};

const PlayerCard = ({ player, variant = 'standard' }) => {
  if (!player) return null;

  if (variant === 'compact') {
    return (
      <Link
        to={`/team/${player._id}`}
        className="block group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-primary to-primary-dark">
          {player.imageUrl ? (
            <img
              src={getImageUrl(player.imageUrl)}
              alt={player.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-white/50 text-6xl font-black">{player.number}</span>
            </div>
          )}

          <div className="absolute top-3 right-3 w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center font-black text-xl shadow-xl">
            {player.number}
          </div>

          {player.isCaptain && (
            <div className="absolute top-3 left-3 bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg">
              <FaTrophy className="text-xs" />
            </div>
          )}
        </div>

        <div className="p-4 text-center">
          <h3 className="font-black text-base text-primary group-hover:text-secondary transition mb-1 line-clamp-1">
            {player.name}
          </h3>
          <p className="text-gray-500 text-xs">{positionNames[player.position]}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/team/${player._id}`}
      className="block group"
    >
      <div className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 aspect-[3/4]">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative h-3/4 flex items-end justify-center overflow-hidden">
          {player.imageUrl ? (
            <img
              src={getImageUrl(player.imageUrl)}
              alt={player.name}
              className="h-full object-contain object-bottom group-hover:scale-110 transition-transform duration-700"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-white/30 text-9xl font-black">{player.number}</span>
            </div>
          )}
        </div>

        <div className="absolute top-4 right-4 w-14 h-14 bg-secondary text-primary rounded-full flex items-center justify-center font-black text-2xl shadow-2xl z-10">
          {player.number}
        </div>

        {player.isCaptain && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg z-10 flex items-center gap-1">
            <FaTrophy className="text-xs" /> القائد
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-4">
          <h3 className="font-black text-white text-lg md:text-xl mb-1 line-clamp-1 group-hover:text-secondary transition">
            {player.name}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-secondary text-sm font-bold">
              {positionNames[player.position]}
            </span>
            {player.stats?.goals > 0 && (
              <span className="text-white/80 text-xs flex items-center gap-1">
                <FaFutbol className="text-secondary" /> {player.stats.goals}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default PlayerCard;