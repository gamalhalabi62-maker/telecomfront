import { Link } from 'react-router-dom';
import { FaCalendar, FaArrowLeft } from 'react-icons/fa';
import { getImageUrl, formatRelativeTime, getCategoryName } from '../utils/formatDate';

const RelatedNews = ({ news = [], currentId }) => {
  const filtered = news.filter(n => n._id !== currentId).slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <section className="mt-12 pt-8 border-t-2 border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <span className="w-1 h-8 bg-secondary rounded"></span>
        <h2 className="text-2xl md:text-3xl font-black text-primary">
          أخبار <span className="text-secondary">ذات صلة</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Link
            key={item._id}
            to={`/news/${item._id}`}
            className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
          >
            <div className="relative h-48 overflow-hidden">
              <img
                src={getImageUrl(item.imageUrl)}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300/4A148C/FFFFFF?text=News'; }}
              />
              <span className="absolute top-3 right-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-bold">
                {getCategoryName(item.category)}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-bold text-base text-primary line-clamp-2 mb-3 group-hover:text-secondary transition min-h-[3rem]">
                {item.title}
              </h3>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <FaCalendar /> {formatRelativeTime(item.createdAt)}
                </span>
                <span className="text-primary font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                  اقرأ <FaArrowLeft />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RelatedNews;