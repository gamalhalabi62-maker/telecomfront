import { Link } from 'react-router-dom';
import { FaPlay, FaEye, FaClock } from 'react-icons/fa';
import { getImageUrl, getCategoryName, formatRelativeTime } from '../utils/formatDate';

const formatDuration = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const VideoCard = ({ video, variant = 'standard', onPlay }) => {
  if (!video) return null;

  const handleClick = (e) => {
    if (onPlay) {
      e.preventDefault();
      onPlay(video);
    }
  };

  const Wrapper = onPlay ? 'div' : Link;
  const wrapperProps = onPlay
    ? { onClick: handleClick, className: 'block cursor-pointer group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1' }
    : { to: `/videos/${video._id}`, className: 'block cursor-pointer group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1' };

  if (variant === 'compact') {
    return (
      <Wrapper {...wrapperProps}>
        <div className="relative aspect-video overflow-hidden bg-black">
          {video.thumbnailUrl ? (
            <img
              src={getImageUrl(video.thumbnailUrl)}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => { e.target.src = 'https://via.placeholder.com/400x225/4A148C/FFFFFF?text=Video'; }}
            />
          ) : (
            <video src={getImageUrl(video.videoUrl)} className="w-full h-full object-cover" muted />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-secondary/90 rounded-full flex items-center justify-center pulse-ring">
              <FaPlay className="text-primary text-lg mr-[-3px]" />
            </div>
          </div>
          <span className="absolute bottom-3 left-3 bg-black/80 text-white text-xs px-2 py-1 rounded font-bold">
            {formatDuration(video.duration)}
          </span>
        </div>
        <div className="p-4">
          <h4 className="font-bold text-sm text-primary line-clamp-2 group-hover:text-secondary transition">
            {video.title}
          </h4>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FaEye className="text-primary" /> {video.views || 0}
            </span>
            <span>{formatRelativeTime(video.createdAt)}</span>
          </div>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper {...wrapperProps}>
      <div className="relative aspect-video overflow-hidden bg-black">
        {video.thumbnailUrl ? (
          <img
            src={getImageUrl(video.thumbnailUrl)}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.src = 'https://via.placeholder.com/640x360/4A148C/FFFFFF?text=Video'; }}
          />
        ) : (
          <video src={getImageUrl(video.videoUrl)} className="w-full h-full object-cover" muted />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

        <div className="absolute inset-0 flex items-center justify-center opacity-80 group-hover:opacity-100 transition">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center pulse-ring shadow-2xl">
            <FaPlay className="text-primary text-2xl mr-[-4px]" />
          </div>
        </div>

        <span className="absolute top-3 right-3 bg-primary text-white text-xs px-3 py-1 rounded-full font-bold">
          {getCategoryName(video.category)}
        </span>

        <span className="absolute bottom-3 left-3 bg-black/80 text-white text-sm px-3 py-1.5 rounded-lg font-bold flex items-center gap-2">
          <FaClock /> {formatDuration(video.duration)}
        </span>
      </div>

      <div className="p-5">
        <h3 className="font-black text-lg text-primary line-clamp-2 group-hover:text-secondary transition mb-3 min-h-[3.5rem]">
          {video.title}
        </h3>
        {video.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{video.description}</p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
          <span className="flex items-center gap-1">
            <FaEye className="text-primary" /> {video.views || 0} مشاهدة
          </span>
          <span>{formatRelativeTime(video.createdAt)}</span>
        </div>
      </div>
    </Wrapper>
  );
};

export default VideoCard;