import { useEffect, useState, useMemo } from 'react';
import {
  FaRegCalendarAlt, FaEye, FaSearch, FaSpinner,
  FaNewspaper, FaChevronRight, FaChevronLeft,
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { newsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const PER_PAGE = 12;

const News = () => {
  const toast = useToast();
  const [allNews, setAllNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const { data } = await newsAPI.getAll();
        const list = Array.isArray(data) ? data : data.news || [];
        setAllNews(list);
      } catch (err) {
        console.error(err);
        toast.error('حدث خطأ أثناء تحميل الأخبار');
        setAllNews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const filteredNews = useMemo(() => {
    if (!search.trim()) return allNews;
    const q = search.trim().toLowerCase();
    return allNews.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.excerpt || '').toLowerCase().includes(q)
    );
  }, [allNews, search]);

  const totalPages = Math.max(1, Math.ceil(filteredNews.length / PER_PAGE));
  const total = filteredNews.length;

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages]);

  const currentNews = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filteredNews.slice(start, start + PER_PAGE);
  }, [filteredNews, page]);

  const goToPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary/5 py-8 md:py-12">
      <div className="container-custom max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white rounded-3xl shadow-2xl p-6 md:p-10 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-secondary rounded-2xl mb-4 shadow-2xl">
              <FaNewspaper className="text-primary text-4xl" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black mb-3 leading-tight">
              الأخبار
            </h1>
            <p className="text-gray-200 text-base md:text-lg max-w-2xl mx-auto">
              تابع آخر أخبار وأنشطة نادي المصرية للاتصالات
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 mb-6">
          <div className="relative">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="ابحث في الأخبار..."
              className="input-field pr-12 text-base"
            />
          </div>
          {!loading && total > 0 && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              إجمالي النتائج: <strong className="text-primary">{total}</strong>
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="text-primary text-4xl animate-spin mb-4" />
            <p className="text-gray-500 font-bold">جاري تحميل الأخبار...</p>
          </div>
        ) : currentNews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-full mb-4">
              <FaNewspaper className="text-5xl text-gray-300" />
            </div>
            <p className="text-gray-500 font-bold text-lg mb-2">
              {search ? 'لا توجد نتائج مطابقة' : 'لا توجد أخبار حالياً'}
            </p>
            <p className="text-gray-400 text-sm">
              {search ? 'جرّب كلمات بحث مختلفة' : 'تابعنا لاحقاً للمزيد من الأخبار'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {currentNews.map((item) => (
                <NewsCard key={item._id} news={item} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 text-primary font-bold hover:bg-primary hover:text-white hover:border-primary transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FaChevronRight />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - page) <= 1;
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showDots = prev && p - prev > 1;
                    return (
                      <span key={p} className="flex items-center gap-2">
                        {showDots && <span className="text-gray-400">...</span>}
                        <button
                          onClick={() => goToPage(p)}
                          className={`w-10 h-10 rounded-xl font-bold transition ${
                            p === page
                              ? 'bg-primary text-white shadow-lg scale-110'
                              : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-primary hover:text-primary'
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    );
                  })}

                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="w-10 h-10 rounded-xl bg-white border-2 border-gray-200 text-primary font-bold hover:bg-primary hover:text-white hover:border-primary transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FaChevronLeft />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const NewsCard = ({ news }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
      <div className="relative h-52 overflow-hidden bg-gray-100">
        <img
          src={news.imageUrl || '/default-news.jpg'}
          alt={news.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
          }}
        />
        {news.category && (
          <span className="absolute top-4 right-4 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            {news.category}
          </span>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <h3 className="font-black text-lg text-gray-800 mb-3 line-clamp-2 group-hover:text-primary transition-colors">
            {news.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-4 leading-relaxed">
            {news.excerpt || news.content}
          </p>
        </div>

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

export default News;