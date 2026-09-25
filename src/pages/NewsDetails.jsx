import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FaArrowRight, FaClock, FaUser, FaTag, FaNewspaper,
  FaFacebook, FaTwitter, FaWhatsapp, FaLink, FaShare,
} from 'react-icons/fa';
import { filgoalAPI } from '../services/api';
import Loading from '../components/Loading';

const NewsDetails = () => {
  const { id } = useParams();
  const [news, setNews] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const cachedRes = await filgoalAPI.getNewsById(id);
        if (cachedRes.data.news?.content?.length > 100) {
          setNews(cachedRes.data.news);
          setLoading(false);
        } else {
          const detailsRes = await filgoalAPI.getNewsDetails(id);
          setNews(detailsRes.data.news);
          setLoading(false);
        }

        const relatedRes = await filgoalAPI.getNews(5);
        setRelated(
          (relatedRes.data.news || []).filter(
            (n) => n.filgoalArticleId !== Number(id)
          )
        );
      } catch (err) {
        console.error(err);
        setError('فشل تحميل الخبر');
        setLoading(false);
      }
    };

    if (id) fetchNews();
  }, [id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  if (loading) return <Loading />;

  if (error || !news) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center bg-white rounded-2xl shadow-md p-12 max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-full mb-4 text-red-500 text-3xl">
            <FaNewspaper />
          </div>
          <h2 className="text-2xl font-black text-primary mb-2">
            {error || 'الخبر غير موجود'}
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            ربما تم حذف الخبر أو الرابط غير صحيح
          </p>
          <Link
            to="/second-division"
            className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition"
          >
            <FaArrowRight />
            العودة للبطولة
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = news.publishedAt
    ? new Date(news.publishedAt)
    : null;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10 py-10">
          <div className="flex items-center gap-2 text-xs text-gray-300 mb-6">
            <Link to="/" className="hover:text-secondary transition">
              الرئيسية
            </Link>
            <span>/</span>
            <Link to="/second-division" className="hover:text-secondary transition">
              دوري المحترفين المصري
            </Link>
            <span>/</span>
            <span className="text-white font-bold truncate max-w-[200px]">
              {news.title}
            </span>
          </div>

          <div className="inline-flex items-center gap-2 bg-secondary text-primary px-3 py-1.5 rounded-full text-xs font-black mb-4">
            <FaNewspaper />
            بطولة
          </div>

          <h1 className="text-2xl md:text-4xl font-black mb-6 leading-relaxed max-w-4xl">
            {news.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200">
            {publishedDate && (
              <div className="flex items-center gap-2">
                <FaClock className="text-secondary" />
                <span>
                  {publishedDate.toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}

            {news.author && (
              <div className="flex items-center gap-2">
                <FaUser className="text-secondary" />
                <span>{news.author}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <article className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              {news.imageUrl && (
                <div className="aspect-video overflow-hidden bg-gray-100">
                  <img
                    src={news.imageUrl}
                    alt={news.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="p-6 md:p-8">
                {news.content ? (
                  <div
                    className="prose prose-lg max-w-none text-gray-700 leading-loose news-content"
                    dangerouslySetInnerHTML={{ __html: news.content }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">محتوى الخبر غير متاح حالياً</p>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-dark transition"
                    >
                      اقرأ الخبر الأصلي على FilGoal
                      <FaArrowRight className="rotate-180" />
                    </a>
                  </div>
                )}

                {news.tags && news.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <FaTag className="text-gray-400" />
                      {news.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-bold text-gray-600 flex items-center gap-2">
                      <FaShare />
                      شارك الخبر:
                    </span>

                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
                      aria-label="Share on Facebook"
                    >
                      <FaFacebook />
                    </a>

                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(news.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition"
                      aria-label="Share on Twitter"
                    >
                      <FaTwitter />
                    </a>

                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(news.title + ' ' + window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition"
                      aria-label="Share on WhatsApp"
                    >
                      <FaWhatsapp />
                    </a>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('تم نسخ الرابط!');
                      }}
                      className="w-10 h-10 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center hover:bg-gray-300 transition"
                      aria-label="Copy link"
                    >
                      <FaLink />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/second-division"
                className="inline-flex items-center gap-2 bg-white text-primary px-5 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition"
              >
                <FaArrowRight />
                العودة للبطولة
              </Link>
            </div>
          </article>

          <aside className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-24">
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <span className="w-1 h-6 bg-secondary rounded"></span>
                <h3 className="font-black text-primary">أخبار ذات صلة</h3>
              </div>

              {related.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  لا توجد أخبار أخرى
                </p>
              ) : (
                <div className="p-3 space-y-3">
                  {related.slice(0, 4).map((n) => (
                    <Link
                      key={n._id}
                      to={`/news/${n.filgoalArticleId}`}
                      className="group flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      {n.imageUrl && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={n.imageUrl}
                            alt={n.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs text-primary line-clamp-3 group-hover:text-secondary transition">
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-gray-400 mt-1 inline-block">
                          {n.publishedAt
                            ? new Date(n.publishedAt).toLocaleDateString('ar-EG', {
                                day: '2-digit',
                                month: 'short',
                              })
                            : 'الآن'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .news-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }
        .news-content p {
          margin-bottom: 1rem;
          line-height: 2;
          font-size: 1.0625rem;
        }
        .news-content h2, .news-content h3 {
          font-weight: 900;
          color: #1a1a1a;
          margin: 1.5rem 0 1rem;
        }
        .news-content a {
          color: #c00020;
          font-weight: 700;
          text-decoration: underline;
        }
        .news-content ul, .news-content ol {
          padding-right: 1.5rem;
          margin-bottom: 1rem;
        }
        .news-content li {
          margin-bottom: 0.5rem;
          line-height: 1.8;
        }
        .news-content blockquote {
          border-right: 4px solid #c00020;
          padding: 0.5rem 1rem;
          background: #f9f9f9;
          margin: 1rem 0;
          border-radius: 0.5rem;
        }
        .news-content iframe {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 0.75rem;
          margin: 1.5rem 0;
        }
      `}</style>
    </div>
  );
};

export default NewsDetails;