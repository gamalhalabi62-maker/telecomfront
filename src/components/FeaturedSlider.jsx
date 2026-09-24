import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaChevronLeft, FaCalendar, FaEye, FaClock } from 'react-icons/fa';
import { getImageUrl, getCategoryName, formatRelativeTime } from '../utils/formatDate';

const FeaturedSlider = ({ news = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (news.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % news.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [news.length, isPaused]);

  if (news.length === 0) return null;

  const goTo = (index) => setCurrent(index);
  const next = () => setCurrent((prev) => (prev + 1) % news.length);
  const prev = () => setCurrent((prev) => (prev - 1 + news.length) % news.length);

  const currentNews = news[current];

  const getReadingTime = (content = '') => {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  return (
    <div
      className="relative h-[500px] md:h-[600px] overflow-hidden rounded-2xl shadow-2xl group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {news.map((item, index) => (
        <div
          key={item._id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <img
            src={getImageUrl(item.imageUrl)}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/1200x600/4A148C/FFFFFF?text=Telecom+Egypt';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/60 to-transparent"></div>
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex items-end" key={current}>
        <div className="p-6 md:p-12 text-white w-full animate-slide-from-right">
          <div className="flex gap-3 mb-4 flex-wrap">
            <span className="bg-secondary text-primary px-4 py-1.5 rounded-full text-xs md:text-sm font-black">
              {getCategoryName(currentNews.category)}
            </span>
            {currentNews.isFeatured && (
              <span className="bg-yellow-500 text-white px-4 py-1.5 rounded-full text-xs md:text-sm font-black">
                ⭐ خبر مميز
              </span>
            )}
          </div>

          <Link to={`/news/${currentNews._id}`}>
            <h2 className="text-2xl md:text-5xl font-black mb-4 leading-tight hover:text-secondary transition line-clamp-3 max-w-4xl">
              {currentNews.title}
            </h2>
          </Link>

          <p className="text-gray-200 line-clamp-2 text-sm md:text-lg mb-6 max-w-3xl hidden md:block">
            {currentNews.excerpt}
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 mb-6">
            <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs md:text-sm">
              <FaCalendar /> {formatRelativeTime(currentNews.createdAt)}
            </span>
            <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs md:text-sm">
              <FaClock /> {getReadingTime(currentNews.content)} د
            </span>
            <span className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs md:text-sm">
              <FaEye /> {currentNews.views || 0}
            </span>
          </div>

          <Link
            to={`/news/${currentNews._id}`}
            className="inline-flex items-center gap-2 bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition group-hover:gap-4"
          >
            اقرأ التفاصيل <FaChevronLeft />
          </Link>
        </div>
      </div>

      {news.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute top-1/2 -translate-y-1/2 right-4 z-30 bg-white/20 backdrop-blur-md text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition opacity-0 group-hover:opacity-100"
            aria-label="السابق"
          >
            <FaChevronRight className="text-xl" />
          </button>
          <button
            onClick={next}
            className="absolute top-1/2 -translate-y-1/2 left-4 z-30 bg-white/20 backdrop-blur-md text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition opacity-0 group-hover:opacity-100"
            aria-label="التالي"
          >
            <FaChevronLeft className="text-xl" />
          </button>
        </>
      )}

      {news.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
          {news.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-secondary' : 'w-2 bg-white/60 hover:bg-white'
              }`}
              aria-label={`الانتقال إلى الخبر ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FeaturedSlider;