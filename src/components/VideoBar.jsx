import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaVideo, FaArrowLeft, FaChevronRight, FaChevronLeft } from 'react-icons/fa';
import { videoAPI } from '../services/api';
import VideoCard from './VideoCard';
import VideoModal from './VideoModal';

const VideoBar = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data } = await videoAPI.getFeatured(6);
        setVideos(data.videos);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 350;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (loading || videos.length === 0) return null;

  return (
    <>
      <section className="container-custom py-12">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white text-xl shadow-lg">
              <FaVideo />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-primary">
                 <span className="text-secondary">فيديوهات</span>
              </h2>
              <p className="text-gray-500 text-sm">اضغط لتشغيل الفيديو مباشرة</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition"
              aria-label="السابق"
            >
              <FaChevronRight />
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition"
              aria-label="التالي"
            >
              <FaChevronLeft />
            </button>
            <Link
              to="/videos"
              className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-secondary transition ml-4"
            >
              عرض الكل <FaArrowLeft />
            </Link>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        >
          {videos.map((video) => (
            <div key={video._id} className="flex-shrink-0 w-72 snap-start">
              <VideoCard
                video={video}
                variant="compact"
                onPlay={(v) => setSelectedVideo(v)}
              />
            </div>
          ))}
        </div>

        <div className="text-center mt-6 md:hidden">
          <Link to="/videos" className="btn-primary inline-flex items-center gap-2">
            عرض كل الفيديوهات <FaArrowLeft />
          </Link>
        </div>
      </section>

      {selectedVideo && (
        <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
      )}
    </>
  );
};

export default VideoBar;