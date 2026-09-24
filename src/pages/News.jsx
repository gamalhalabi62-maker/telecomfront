import { Link } from 'react-router-dom';
import { FaRegCalendarAlt, FaEye } from 'react-icons/fa';

const NewsCard = ({ news }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      {/* صورة الخبر (تدعم Base64 والروابط العادية بكفاءة عالية) */}
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={news.imageUrl || '/default-news.jpg'} 
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // صورة احتياطية في حال حدث أي خطأ في تحميل البيانات
            e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
          }}
        />
        {news.category && (
          <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {news.category}
          </span>
        )}
      </div>

      {/* محتوى الخبر */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-black text-lg text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
            {news.excerpt || news.content}
          </p>
        </div>

        {/* تذيل الكارت (التاريخ والمشاهدات) */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-medium">
          <div className="flex items-center gap-1.5">
            <FaRegCalendarAlt className="text-primary" />
            <span>{new Date(news.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <FaEye className="text-primary" />
            <span>{news.views || 0} مشاهدة</span>
          </div>
        </div>

        {/* زر قراءة المزيد */}
        <div className="mt-4">
          <Link
            to={`/news/${news._id}`}
            className="block w-full text-center bg-gray-50 hover:bg-primary hover:text-white text-primary font-bold py-2.5 rounded-xl transition-all duration-300 text-sm"
          >
            اقرأ المزيد ←
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;