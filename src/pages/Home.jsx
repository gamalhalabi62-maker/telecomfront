import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaNewspaper, FaFutbol, FaTrophy, FaUsers } from 'react-icons/fa';
import { newsAPI } from '../services/api';
import NewsCard from '../components/NewsCard';
import PopularNews from '../components/PopularNews';
import StatsSection from '../components/StatsSection';
import BreakingNewsTicker from '../components/BreakingNewsTicker';
import FeaturedSlider from '../components/FeaturedSlider';
import BreakingSection from '../components/BreakingSection';
import VideoBar from '../components/VideoBar';
import Loading from '../components/Loading';
import SecondDivisionSection from '../components/SecondDivisionSection';

const Home = () => {
  const [latestNews, setLatestNews] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [latestRes, featuredRes] = await Promise.all([
          newsAPI.getAll({ limit: 9 }),
          newsAPI.getFeatured(5),
        ]);
        setLatestNews(latestRes.data.news);
        setFeatured(featuredRes.data.news);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const otherNews = latestNews.slice(0, 6);

  const categories = [
    { slug: 'football', name: 'كرة القدم', icon: <FaFutbol />, color: 'from-green-500 to-green-700' },
    { slug: 'club', name: 'أخبار النادي', icon: <FaNewspaper />, color: 'from-primary to-primary-dark' },
    { slug: 'elections', name: 'الانتخابات', icon: <FaUsers />, color: 'from-orange-500 to-red-600' },
    { slug: 'academy', name: 'الأكاديمية', icon: <FaTrophy />, color: 'from-blue-500 to-blue-700' },
  ];

  if (loading) return <Loading />;

  return (
    <div>
      <BreakingNewsTicker />

      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>
        <div className="container-custom relative z-10 text-center">
          <h1 className="text-4xl md:text-7xl font-black mb-6 animate-slide-up">
            نادي <span className="">المصرية للاتصالات</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto animate-slide-up">
            نادٍ عريق يضم نخبة من الرياضيين. تابع آخر الأخبار والمباريات والفعاليات.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/news" className="btn-secondary">تصفح الأخبار</Link>
            <Link to="/contact" className="bg-white/10 backdrop-blur-md border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white hover:text-primary transition">
              انضم إلينا
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-custom py-12">
          <div className="flex items-center gap-3 mb-6">
            <span className="w-1 h-8 bg-secondary rounded"></span>
            <h2 className="text-2xl md:text-3xl font-black text-primary">
              الأخبار <span className="text-secondary">المميزة</span>
            </h2>
          </div>
          <FeaturedSlider news={featured} />
        </section>
      )}

      <BreakingSection />

      <section className="container-custom py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-2">
            تصفح حسب <span className="text-secondary">التصنيف</span>
          </h2>
          <p className="text-gray-500">اختر القسم الذي تريد متابعته</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/news?category=${cat.slug}`}
              className={`bg-gradient-to-br ${cat.color} text-white p-6 rounded-xl text-center hover:shadow-2xl hover:scale-105 transition-all duration-300 group`}
            >
              <div className="text-5xl mb-3 group-hover:scale-110 transition">{cat.icon}</div>
              <h3 className="font-black text-lg">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </section>

      <VideoBar />

      <section className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-2">
                <span className="w-1 h-8 bg-secondary rounded"></span>
                آخر الأخبار
              </h2>
              <Link to="/news" className="text-primary font-bold flex items-center gap-2 hover:text-secondary transition">
                عرض الكل <FaArrowLeft />
              </Link>
            </div>

            {otherNews.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center">
                <p className="text-gray-500">لا توجد أخبار حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherNews.map((item) => (
                  <NewsCard key={item._id} news={item} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <PopularNews />
          </div>
        </div>
      </section>

      <SecondDivisionSection />

      <StatsSection />

      <section className="container-custom py-16">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              كن جزءاً من <span className="text-secondary">عائلتنا</span>
            </h2>
            <p className="text-gray-200 mb-8 text-lg max-w-2xl mx-auto">
              انضم إلى نادي المصرية للاتصالات واستمتع بكل المزايا والخدمات الحصرية.
            </p>
            <Link to="/contact" className="btn-secondary inline-block text-lg px-10 py-4">
              سجل الآن
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;