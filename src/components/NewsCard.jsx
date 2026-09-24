import { Link } from 'react-router-dom';
import { FaCalendar, FaEye, FaArrowLeft, FaClock, FaPlay, FaVideo } from 'react-icons/fa';
import { formatRelativeTime, getCategoryName } from '../utils/formatDate';
import { getMediaPreviewImage, formatDuration, isVideoNews } from '../utils/mediaHelpers';

const getReadingTime = (content = '') => {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const isNew = (date) => {
  const hours = (new Date() - new Date(date)) / 3600000;
  return hours < 24;
};

const resolveImageUrl = (url) => {
  if (!url) return 'https://placehold.co/600x400/4A148C/FFFFFF?text=Telecom+Egypt';
  if (url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return url;
};

export const FeaturedCard = ({ news }) => {
  if (!news) return null;

  const previewImage = getMediaPreviewImage(news);
  const isVideo = isVideoNews(news);
  const duration = formatDuration(news.videoDuration);

  return (
    <Link to={`/news/${news._id}`} className="block group animate-fade-in-up">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl h-[400px] md:h-[600px]">
        <img
          src={resolveImageUrl(previewImage)}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
          onError={(e) => { e.target.src = 'https://placehold.co/1200x600/4A148C/FFFFFF?text=Telecom+Egypt'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/60 to-transparent"></div>

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-white/95 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
              <FaPlay className="text-primary text-2xl md:text-3xl mr-1" />
            </div>
          </div>
        )}

        <div className="absolute top-6 right-6 flex gap-2 flex-wrap">
          {isVideo && (
            <span className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
              <FaVideo size={10} />
              {duration ? `فيديو • ${duration}` : 'فيديو'}
            </span>
          )}
          {isNew(news.createdAt) && (
            <span className="badge-new relative bg-red-500 text-white px-4 py-2 rounded-full text-xs font-black z-10">🔥 جديد</span>
          )}
          {news.isFeatured && (
            <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-xs font-black">⭐ مميز</span>
          )}
          <span className="bg-secondary text-primary px-4 py-2 rounded-full text-xs font-black">
            {getCategoryName(news.category)}
          </span>
        </div>

        <div className="absolute bottom-0 right-0 left-0 p-6 md:p-12 text-white">
          <div className="flex items-center gap-4 mb-4 text-sm flex-wrap">
            <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
              <FaCalendar /> {formatRelativeTime(news.createdAt)}
            </span>
            <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
              <FaClock /> {getReadingTime(news.content)} دقيقة قراءة
            </span>
            <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full">
              <FaEye /> {news.views || 0}
            </span>
          </div>

          <h2 className="text-3xl md:text-6xl font-black mb-4 leading-tight group-hover:text-secondary transition line-clamp-3">
            {news.title}
          </h2>

          <p className="text-gray-200 line-clamp-2 text-lg hidden md:block mb-6">
            {news.excerpt}
          </p>

          <div className="inline-flex items-center gap-2 text-secondary font-bold text-lg group-hover:gap-4 transition-all">
            {isVideo ? 'شاهد الآن' : 'اقرأ التفاصيل'} <FaArrowLeft />
          </div>
        </div>
      </div>
    </Link>
  );
};

export const LargeCard = ({ news }) => {
  if (!news) return null;

  const previewImage = getMediaPreviewImage(news);
  const isVideo = isVideoNews(news);
  const duration = formatDuration(news.videoDuration);

  return (
    <Link to={`/news/${news._id}`} className="block group animate-fade-in-up">
      <div className="relative overflow-hidden rounded-2xl shadow-xl h-[350px]">
        <img
          src={resolveImageUrl(previewImage)}
          alt={news.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          onError={(e) => { e.target.src = 'https://placehold.co/800x400/4A148C/FFFFFF?text=News'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent"></div>

        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
              <FaPlay className="text-primary text-lg mr-1" />
            </div>
          </div>
        )}

        <div className="absolute top-4 right-4 flex gap-2 flex-wrap">
          {isVideo && (
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
              <FaVideo size={9} />
              {duration || 'فيديو'}
            </span>
          )}
          {isNew(news.createdAt) && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black">جديد</span>
          )}
          <span className="bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
            {getCategoryName(news.category)}
          </span>
        </div>

        <div className="absolute bottom-0 right-0 left-0 p-5 text-white">
          <h3 className="font-black text-xl md:text-2xl mb-3 line-clamp-2 group-hover:text-secondary transition">
            {news.title}
          </h3>
          <div className="flex items-center gap-4 text-xs text-gray-300">
            <span className="flex items-center gap-1">
              <FaCalendar /> {formatRelativeTime(news.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <FaClock /> {getReadingTime(news.content)} د
            </span>
            <span className="flex items-center gap-1">
              <FaEye /> {news.views || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

const NewsCard = ({ news, variant = 'standard' }) => {
  if (variant === 'featured') return <FeaturedCard news={news} />;
  if (variant === 'large') return <LargeCard news={news} />;

  if (!news) return null;

  const previewImage = getMediaPreviewImage(news);
  const isVideo = isVideoNews(news);
  const duration = formatDuration(news.videoDuration);

  return (
    <Link to={`/news/${news._id}`} className="block group animate-fade-in-up">
      <article className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 h-full flex flex-col">
        <div className="relative overflow-hidden h-56 flex-shrink-0">
          <img
            src={resolveImageUrl(previewImage)}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { e.target.src = 'https://placehold.co/400x300/4A148C/FFFFFF?text=News'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          {isVideo && (
            <>
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform">
                  <FaPlay className="text-primary text-lg mr-1" />
                </div>
              </div>

              <div className="absolute bottom-4 right-4 bg-black/75 backdrop-blur-sm text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <FaVideo size={9} />
                {news.mediaType === 'both' ? 'فيديو + صورة' : 'فيديو'}
                {duration && <span className="text-white/80">• {duration}</span>}
              </div>
            </>
          )}

          <span className="absolute top-4 right-4 bg-primary text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            {getCategoryName(news.category)}
          </span>

          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isNew(news.createdAt) && (
              <span className="badge-new relative bg-red-500 text-white px-3 py-1 rounded-full text-xs font-black z-10">
                🔥 جديد
              </span>
            )}
            {news.isUrgent && (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-black">
                ⚡ عاجل
              </span>
            )}
          </div>

          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition">
            <span className="bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
              <FaClock /> {getReadingTime(news.content)} د
            </span>
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          <h3 className="font-black text-lg text-primary mb-3 line-clamp-2 group-hover:text-secondary transition min-h-[3.5rem]">
            {news.title}
          </h3>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed flex-1">
            {news.excerpt}
          </p>

          <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <FaCalendar className="text-primary" />
                {formatRelativeTime(news.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <FaEye className="text-primary" />
                {news.views || 0}
              </span>
            </div>
            <span className="flex items-center gap-1 text-primary font-bold group-hover:text-secondary group-hover:gap-2 transition-all">
              {isVideo ? 'شاهد' : 'اقرأ'} <FaArrowLeft />
            </span>
          </div>
        </div>

        <div className="h-1 bg-gradient-to-l from-primary via-secondary to-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-right"></div>
      </article>
    </Link>
  );
};

export default NewsCard;