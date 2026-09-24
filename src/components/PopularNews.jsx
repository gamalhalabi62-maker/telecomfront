import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFire, FaEye } from 'react-icons/fa';
import { newsAPI } from '../services/api';
import { getImageUrl } from '../utils/formatDate';

const PopularNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const { data } = await newsAPI.getPopular(5);
        setNews(data.news);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b-2 border-secondary">
        <FaFire className="text-red-500 text-2xl" />
        <h3 className="text-xl font-black text-primary">الأكثر قراءة</h3>
      </div>
      <div className="space-y-4">
        {news.map((item, index) => (
          <Link
            key={item._id}
            to={`/news/${item._id}`}
            className="flex gap-3 group"
          >
            <div className="flex-shrink-0 relative">
              <span className="absolute -top-2 -right-2 w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm z-10">
                {index + 1}
              </span>
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.title}
                className="w-20 h-20 object-cover rounded-lg group-hover:scale-105 transition"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/80/4A148C/FFFFFF?text=T';
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-gray-800 line-clamp-2 group-hover:text-primary transition">
                {item.title}
              </h4>
              <span className="flex items-center gap-1 text-xs text-gray-500 mt-2">
                <FaEye className="text-primary" /> {item.views || 0}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularNews;