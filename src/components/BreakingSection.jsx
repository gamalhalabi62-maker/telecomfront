import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBolt, FaArrowLeft, FaClock } from 'react-icons/fa';
import { newsAPI } from '../services/api';
import { getImageUrl, getCategoryName, formatRelativeTime } from '../utils/formatDate';

const BreakingSection = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBreaking = async () => {
      try {
        const { data } = await newsAPI.getBreaking(4);
        setNews(data.news);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBreaking();
  }, []);

  if (loading || news.length === 0) return null;

  const [main, ...rest] = news;

  return (
    <section className="bg-gradient-to-l from-primary-dark via-primary to-primary-dark py-8 md:py-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
      </div>

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      ></div>

      <div className="container-custom relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-secondary text-primary-dark p-2.5 rounded-full animate-shake shadow-lg">
            <FaBolt className="text-2xl" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white">
            عاجل <span className="text-secondary">الآن</span>
          </h2>
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary"></span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Link
            to={`/news/${main._id}`}
            className="lg:col-span-2 group bg-white/10 backdrop-blur-md border-2 border-secondary/30 rounded-2xl p-6 md:p-8 hover:bg-white/20 hover:border-secondary transition-all duration-500"
          >
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="bg-secondary text-primary-dark px-3 py-1 rounded-full text-xs font-black">
                {getCategoryName(main.category)}
              </span>
              {main.isUrgent && (
                <span className="bg-primary-light text-white px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                  ⚡ طارئ
                </span>
              )}
              <span className="flex items-center gap-1 text-white/80 text-xs">
                <FaClock /> {formatRelativeTime(main.createdAt)}
              </span>
            </div>
            <h3 className="text-xl md:text-3xl font-black text-white mb-3 leading-tight group-hover:text-secondary transition line-clamp-3">
              {main.title}
            </h3>
            <div className="flex items-center gap-2 text-secondary font-bold text-sm mt-4 group-hover:gap-4 transition-all">
              التفاصيل الكاملة <FaArrowLeft />
            </div>
          </Link>

          <div className="space-y-3">
            {rest.map((item) => (
              <Link
                key={item._id}
                to={`/news/${item._id}`}
                className="block bg-white/10 backdrop-blur-md border border-secondary/20 rounded-xl p-4 hover:bg-white/20 hover:border-secondary transition-all duration-300 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-secondary text-xs font-bold">
                    {getCategoryName(item.category)}
                  </span>
                  <span className="text-white/60 text-xs">•</span>
                  <span className="text-white/60 text-xs">
                    {formatRelativeTime(item.createdAt)}
                  </span>
                </div>
                <h4 className="text-white font-bold text-sm line-clamp-2 group-hover:text-secondary transition">
                  {item.title}
                </h4>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BreakingSection;