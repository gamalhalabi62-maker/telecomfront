import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaSortAmountDown, FaTimes, FaFilter, FaSpinner } from 'react-icons/fa';
import { newsAPI } from '../services/api';
import NewsCard from '../components/NewsCard';
import PopularNews from '../components/PopularNews';
import { NewsCardSkeleton } from '../components/NewsSkeleton';

const News = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('latest');
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);

  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const categories = [
    { value: '', label: 'الكل' },
    { value: 'football', label: 'كرة القدم' },
    { value: 'club', label: 'أخبار النادي' },
    { value: 'elections', label: 'الانتخابات' },
    { value: 'academy', label: 'الأكاديمية' },
    { value: 'general', label: 'عام' },
  ];

  // جلب الأخبار
  const fetchNews = useCallback(async (pageNum = 1, reset = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pageNum, limit: 9, sort };
      if (category) params.category = category;
      if (search) params.search = search;

      const { data } = await newsAPI.getAll(params);

      if (reset || pageNum === 1) {
        setNews(data.news);
      } else {
        setNews((prev) => [...prev, ...data.news]);
      }

      setTotal(data.total);
      setHasMore(pageNum < data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, search, sort]);

  // إعادة الجلب عند تغيير الفلاتر
  useEffect(() => {
    setPage(1);
    setNews([]);
    fetchNews(1, true);
  }, [category, search, sort, fetchNews]);

  // Infinite Scroll
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    observerRef.current = observer;

    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore]);

  // جلب الصفحة التالية
  useEffect(() => {
    if (page > 1) {
      fetchNews(page, false);
    }
  }, [page, fetchNews]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    if (cat) setSearchParams({ category: cat });
    else setSearchParams({});
  };

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
        </div>
        <div className="container-custom text-center relative z-10">
          <h1 className="text-4xl md:text-7xl font-black mb-4">
            آخر <span className="text-secondary">الأخبار</span>
          </h1>
          <p className="text-gray-200 text-lg md:text-xl">
            تابع جميع أخبار النادي والفعاليات لحظة بلحظة
          </p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search & Filter */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 sticky top-24 z-20">
              <form onSubmit={handleSearch} className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="ابحث في الأخبار..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="input-field pr-12"
                  />
                  {searchInput && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 hover:text-primary"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
                <button type="submit" className="btn-primary px-8">بحث</button>
              </form>

              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div className="hidden md:flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value || 'all'}
                      onClick={() => handleCategoryChange(cat.value)}
                      className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                        category === cat.value
                          ? 'bg-primary text-white shadow-lg scale-105'
                          : 'bg-gray-100 text-gray-700 hover:bg-primary-light hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowFilter(!showFilter)}
                  className="md:hidden bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                  <FaFilter /> فلترة
                </button>

                <div className="flex items-center gap-2">
                  <FaSortAmountDown className="text-primary" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border-2 border-gray-200 rounded-lg px-3 py-2 text-sm font-bold focus:border-primary focus:outline-none cursor-pointer"
                  >
                    <option value="latest">الأحدث</option>
                    <option value="popular">الأكثر قراءة</option>
                    <option value="oldest">الأقدم</option>
                  </select>
                </div>
              </div>

              {showFilter && (
                <div className="md:hidden mt-4 flex flex-wrap gap-2 animate-fade-in">
                  {categories.map((cat) => (
                    <button
                      key={cat.value || 'all'}
                      onClick={() => { handleCategoryChange(cat.value); setShowFilter(false); }}
                      className={`px-4 py-2 rounded-full font-bold text-sm transition ${
                        category === cat.value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {total > 0 && (
                <p className="text-sm text-gray-500 mt-4 border-t pt-4">
                  📊 عرض <strong className="text-primary">{news.length}</strong> من <strong className="text-primary">{total}</strong> خبر
                </p>
              )}
            </div>

            {/* News Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(6)].map((_, i) => <NewsCardSkeleton key={i} />)}
              </div>
            ) : news.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl shadow-md">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-500 text-lg font-bold mb-2">لا توجد أخبار مطابقة</p>
                <p className="text-gray-400 text-sm mb-6">حاول تعديل البحث أو الفلاتر</p>
                <button
                  onClick={() => { clearSearch(); handleCategoryChange(''); }}
                  className="btn-primary"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {news.map((item, i) => (
                    <div key={item._id} style={{ animationDelay: `${(i % 9) * 0.05}s` }}>
                      <NewsCard news={item} />
                    </div>
                  ))}
                </div>

                {/* Load More Indicator */}
                <div ref={loadMoreRef} className="py-12 text-center">
                  {loadingMore && (
                    <div className="inline-flex items-center gap-3 text-primary font-bold">
                      <FaSpinner className="animate-spin text-2xl" />
                      جاري تحميل المزيد...
                    </div>
                  )}
                  {!hasMore && news.length > 0 && (
                    <p className="text-gray-400 font-bold">
                      ✨ لقد شاهدت جميع الأخبار
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <PopularNews />
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;