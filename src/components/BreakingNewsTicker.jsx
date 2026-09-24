import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBullhorn, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { newsAPI } from '../services/api';

const BreakingNewsTicker = () => {
  const [news, setNews] = useState([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const { data } = await newsAPI.getBreaking(8);
        setNews(data.news || []);
      } catch (error) {
        console.error(error);
      }
    };
    fetchBreaking();
  }, []);

  if (!isVisible || news.length === 0) return null;

  const tickerItems = [...news, ...news, ...news];

  return (
    <div className="relative bg-gradient-to-l from-primary-dark via-primary to-primary-dark text-white overflow-hidden border-b-2 border-t-2 border-secondary shadow-lg">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, white 10px, white 11px)`,
          }}
        ></div>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-32 h-full bg-secondary opacity-10 blur-2xl"></div>
        <div className="absolute top-0 right-1/4 w-32 h-full bg-secondary opacity-10 blur-2xl"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="flex items-center gap-3 md:gap-4 py-2.5 md:py-3">
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="relative">
              <span className="absolute inset-0 bg-red-500 rounded-lg opacity-75 animate-ping"></span>

              <div className="relative bg-gradient-to-br from-red-500 to-red-700 text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg font-black text-xs md:text-sm shadow-xl flex items-center gap-1.5 md:gap-2">
                <FaBullhorn className="animate-pulse text-xs md:text-sm" />
                <span>عاجل</span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse hidden md:inline-block"></span>
              </div>
            </div>

            <div className="hidden sm:block w-px h-6 bg-secondary/50"></div>
          </div>

          <div
            className="flex-1 overflow-hidden relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="absolute top-0 right-0 w-8 md:w-16 h-full bg-gradient-to-l from-primary to-transparent z-10 pointer-events-none"></div>
            <div className="absolute top-0 left-0 w-8 md:w-16 h-full bg-gradient-to-r from-primary to-transparent z-10 pointer-events-none"></div>

            <div
              className="flex gap-6 md:gap-10 whitespace-nowrap animate-ticker"
              style={{
                animationPlayState: isPaused ? 'paused' : 'running',
              }}
            >
              {tickerItems.map((item, i) => (
                <Link
                  key={`${item._id}-${i}`}
                  to={`/news/${item._id}`}
                  className="group inline-flex items-center gap-2 md:gap-3 hover:text-secondary transition-colors duration-300"
                >
                  <span className="w-2 h-2 bg-secondary rounded-full flex-shrink-0 group-hover:scale-150 transition-transform"></span>

                  <span className="font-bold text-sm md:text-base">
                    {item.title}
                  </span>

                  {item.category && (
                    <span className="hidden md:inline-block bg-white/10 text-secondary text-[10px] px-2 py-0.5 rounded-full border border-secondary/30">
                      {item.category === 'football' ? 'كرة القدم' :
                       item.category === 'club' ? 'النادي' :
                       item.category === 'elections' ? 'الانتخابات' :
                       item.category === 'academy' ? 'الأكاديمية' :
                       'عام'}
                    </span>
                  )}

                  {/* Arrow */}
                  <FaArrowLeft className="text-secondary text-xs opacity-0 group-hover:opacity-100 group-hover:-translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 bg-white/10 hover:bg-red-500 rounded-lg flex items-center justify-center transition-colors group"
            title="إغلاق"
          >
            <FaTimes className="text-xs md:text-sm text-white/70 group-hover:text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BreakingNewsTicker;