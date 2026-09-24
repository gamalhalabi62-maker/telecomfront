import { useEffect, useState, useRef, useCallback } from 'react';
import { FaSearch, FaVideo, FaSpinner, FaFilter, FaTimes } from 'react-icons/fa';
import { videoAPI } from '../services/api';
import VideoCard from '../components/VideoCard';
import VideoModal from '../components/VideoModal';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [category, setCategory] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const loadMoreRef = useRef(null);

  const categories = [
    { value: '', label: 'الكل' },
    { value: 'highlights', label: 'الملخصات' },
    { value: 'interviews', label: 'المقابلات' },
    { value: 'training', label: 'التدريبات' },
    { value: 'events', label: 'الفعاليات' },
    { value: 'general', label: 'عام' },
  ];

  const fetchVideos = useCallback(async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const params = { page: pageNum, limit: 12 };
      if (category) params.category = category;
      if (search) params.search = search;

      const { data } = await videoAPI.getAll(params);

      if (pageNum === 1) setVideos(data.videos);
      else setVideos((prev) => [...prev, ...data.videos]);

      setTotal(data.total);
      setHasMore(pageNum < data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, search]);

  useEffect(() => {
    setPage(1);
    setVideos([]);
    fetchVideos(1);
  }, [category, search, fetchVideos]);

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
    return () => observer.disconnect();
  }, [loading, loadingMore, hasMore]);

  useEffect(() => {
    if (page > 1) fetchVideos(page);
  }, [page, fetchVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
  };

  return (
    <div>
      <section className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl animate-float"></div>
        </div>
        <div className="container-custom text-center relative z-10">
          <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary text-4xl shadow-2xl">
            <FaVideo />
          </div>
          <h1 className="text-4xl md:text-7xl font-black mb-4">
            <span className="text-secondary">فيديوهات النادي</span>
          </h1>
          <p className="text-gray-200 text-lg">اضغط على أي فيديو لتشغيله مباشرة</p>
        </div>
      </section>

      <div className="container-custom py-12">
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 sticky top-24 z-20">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <FaSearch className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث في الفيديوهات..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-field pr-12"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400 hover:text-primary transition"
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
                  onClick={() => setCategory(cat.value)}
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
          </div>

          {showFilter && (
            <div className="md:hidden mt-4 flex flex-wrap gap-2 animate-fade-in">
              {categories.map((cat) => (
                <button
                  key={cat.value || 'all'}
                  onClick={() => { setCategory(cat.value); setShowFilter(false); }}
                  className={`px-4 py-2 rounded-full font-bold text-sm ${
                    category === cat.value ? 'bg-primary text-white' : 'bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {total > 0 && (
            <p className="text-sm text-gray-500 mt-4 border-t pt-4">
              📹 <strong className="text-primary">{total}</strong> فيديو متاح
            </p>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md">
                <div className="skeleton aspect-video"></div>
                <div className="p-5 space-y-3">
                  <div className="skeleton h-5 w-full rounded"></div>
                  <div className="skeleton h-5 w-3/4 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <FaVideo className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-bold mb-2">لا توجد فيديوهات</p>
            <p className="text-gray-400 text-sm mb-6">حاول تغيير الفلاتر أو البحث</p>
            <button
              onClick={() => { clearSearch(); setCategory(''); }}
              className="btn-primary"
            >
              إعادة تعيين الفلاتر
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <VideoCard
                  key={video._id}
                  video={video}
                  onPlay={(v) => setSelectedVideo(v)}
                />
              ))}
            </div>

            <div ref={loadMoreRef} className="py-12 text-center">
              {loadingMore && (
                <div className="inline-flex items-center gap-3 text-primary font-bold">
                  <FaSpinner className="animate-spin text-2xl" />
                  جاري التحميل...
                </div>
              )}
              {!hasMore && videos.length > 0 && (
                <p className="text-gray-400 font-bold">✨ لقد شاهدت جميع الفيديوهات</p>
              )}
            </div>
          </>
        )}
      </div>

      {selectedVideo && (
        <VideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </div>
  );
};

export default Videos;