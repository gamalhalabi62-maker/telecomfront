import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaCalendar, FaEye, FaUser, FaArrowRight, FaClock, FaFolder } from 'react-icons/fa';
import { newsAPI } from '../services/api';
import Loading from '../components/Loading';
import ReadingProgress from '../components/ReadingProgress';
import ShareButtons from '../components/ShareButtons';
import RelatedNews from '../components/RelatedNews';
import Toast from '../components/Toast';
import { formatDate, getImageUrl, getCategoryName } from '../utils/formatDate';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const { data } = await newsAPI.getById(id);
        setNews(data);
      } catch (err) {
        setError('الخبر غير موجود');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [id]);

  const getReadingTime = (content = '') => {
    const words = content.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-4xl font-black text-primary mb-4">عذراً</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/news')} className="btn-primary">
          العودة للأخبار
        </button>
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <ReadingProgress />

      <article className="bg-gray-50 min-h-screen">
        {/* Breadcrumb Bar */}
        <div className="bg-white border-b border-gray-200">
          <div className="container-custom py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-500">
              <Link to="/" className="hover:text-primary transition">الرئيسية</Link>
              <span>›</span>
              <Link to="/news" className="hover:text-primary transition">الأخبار</Link>
              <span>›</span>
              <span className="text-primary font-bold">{getCategoryName(news.category)}</span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="container-custom py-8 md:py-12">
          <div className="max-w-4xl mx-auto">
            {/* Article Card */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Category + Date Bar */}
              <div className="p-6 md:p-8 border-b border-gray-100">
                <div className="flex items-center gap-4 flex-wrap text-sm">
                  <span className="flex items-center gap-2 text-primary font-bold">
                    <FaFolder />
                    {getCategoryName(news.category)}
                  </span>
                  <span className="text-gray-300">|</span>
                  <span className="flex items-center gap-2 text-gray-500">
                    <FaCalendar />
                    {formatDate(news.createdAt)}
                  </span>
                </div>
              </div>

              {/* Title */}
              <div className="px-6 md:px-8 pt-6 md:pt-8">
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight mb-6">
                  {news.title}
                </h1>
              </div>

              {/* Image */}
              <div className="px-6 md:px-8 pb-6">
                <div className="rounded-lg overflow-hidden shadow-md">
                  <img
                    src={getImageUrl(news.imageUrl)}
                    alt={news.title}
                    className="w-full h-auto object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/1200x600/4A148C/FFFFFF?text=Telecom+Egypt';
                    }}
                  />
                </div>
              </div>

              {/* Meta Info Bar */}
              <div className="px-6 md:px-8 py-4 border-y border-gray-100 bg-gray-50">
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span className="flex items-center gap-2 text-gray-700">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-xs">
                      <FaUser />
                    </div>
                    <span className="font-bold">{news.author?.name || 'الإدارة'}</span>
                  </span>

                  <span className="flex items-center gap-2 text-gray-500">
                    <FaClock className="text-primary" />
                    {getReadingTime(news.content)} دقيقة قراءة
                  </span>

                  <span className="flex items-center gap-2 text-gray-500">
                    <FaEye className="text-primary" />
                    {news.views || 0} مشاهدة
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 md:p-8">
                {/* Excerpt */}
                {news.excerpt && (
                  <div className="mb-8 p-5 bg-primary/5 border-r-4 border-primary rounded-lg">
                    <p className="text-lg font-bold text-gray-800 leading-relaxed">
                      {news.excerpt}
                    </p>
                  </div>
                )}

                {/* Main Text */}
                <div className="news-content text-gray-800">
                  {news.content}
                </div>

                {/* Share */}
                <div className="mt-10 pt-6 border-t border-gray-200">
                  <p className="font-bold text-gray-700 mb-4">شارك الخبر:</p>
                  <ShareButtons title={news.title} url={window.location.href} />
                </div>
              </div>
            </div>

            {/* Back to News */}
            <div className="mt-8 text-center">
              <Link
                to="/news"
                className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition shadow-lg"
              >
                <FaArrowRight /> العودة لجميع الأخبار
              </Link>
            </div>

            {/* Related News */}
            {news.related && news.related.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1 h-8 bg-secondary rounded"></span>
                  <h2 className="text-2xl md:text-3xl font-black text-primary">
                    أخبار <span className="text-secondary">ذات صلة</span>
                  </h2>
                </div>
                <RelatedNews news={news.related} currentId={news._id} />
              </div>
            )}
          </div>
        </div>
      </article>
    </>
  );
};

export default NewsDetail;