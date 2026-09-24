import { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaEye, FaClock, FaUser, FaArrowRight, FaCalendar,
  FaFolder, FaPlay, FaPause, FaVolumeUp, FaVolumeMute,
  FaExpand, FaExternalLinkAlt, FaRedo,
} from 'react-icons/fa';
import { videoAPI } from '../services/api';
import Loading from '../components/Loading';
import VideoCard from '../components/VideoCard';
import ShareButtons from '../components/ShareButtons';
import { formatDate, getImageUrl, getCategoryName } from '../utils/formatDate';

const VideoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const { data } = await videoAPI.getById(id);
        setVideo(data);
      } catch (err) {
        setError('الفيديو غير موجود');
      } finally {
        setLoading(false);
      }
    };
    fetchVideo();
  }, [id]);

  useEffect(() => {
    if (video && videoRef.current) {
      const timer = setTimeout(() => {
        videoRef.current?.play()
          .then(() => {
            setIsPlaying(true);
            setHasStarted(true);
          })
          .catch((err) => {
            console.log('Autoplay prevented:', err.message);
            setIsPlaying(false);
          });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [video]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoType = (url) => {
    if (!url) return 'video/mp4';
    const ext = url.split('.').pop().toLowerCase();
    const types = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      ogv: 'video/ogg',
      mov: 'video/quicktime',
      m4v: 'video/mp4',
    };
    return types[ext] || 'video/mp4';
  };

  const handleBigPlay = () => {
    if (videoRef.current) {
      videoRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setHasStarted(true);
        })
        .catch((err) => {
          console.error('Play failed:', err);
        });
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
        setHasStarted(true);
      }
    }
  };

  const handleRetry = () => {
    setVideoError(false);
    setHasStarted(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  const videoSrc = video ? encodeURI(getImageUrl(video.videoUrl)) : '';
  const posterSrc = video?.thumbnailUrl
    ? encodeURI(getImageUrl(video.thumbnailUrl))
    : undefined;

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-4xl font-black text-primary mb-4">عذراً</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/videos')} className="btn-primary">
          العودة للفيديوهات
        </button>
      </div>
    );
  }

  return (
    <article className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link to="/" className="hover:text-primary transition">الرئيسية</Link>
            <span>›</span>
            <Link to="/videos" className="hover:text-primary transition">الفيديوهات</Link>
            <span>›</span>
            <span className="text-primary font-bold">{getCategoryName(video.category)}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
              {videoError ? (
                <div className="aspect-video flex flex-col items-center justify-center text-white p-6 text-center bg-gradient-to-br from-red-900/30 to-black">
                  <div className="text-6xl mb-4">⚠️</div>
                  <h3 className="text-2xl font-bold mb-2">تعذّر تشغيل الفيديو</h3>
                  <p className="text-gray-300 mb-6 text-sm max-w-md">
                    قد تكون الصيغة غير مدعومة أو الملف غير متوفر. جرّب فتحه في نافذة جديدة.
                  </p>
                  <div className="flex gap-3 flex-wrap justify-center">
                    <button
                      onClick={handleRetry}
                      className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-light transition flex items-center gap-2"
                    >
                      <FaRedo /> إعادة المحاولة
                    </button>
                    <a
                      href={videoSrc}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2"
                    >
                      <FaExternalLinkAlt /> فتح في نافذة جديدة
                    </a>
                  </div>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    controls
                    preload="auto"
                    poster={posterSrc}
                    className="w-full aspect-video"
                    controlsList="nodownload"
                    playsInline
                    onClick={handleVideoClick}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onError={(e) => {
                      console.error('❌ Video Error:', e.target.error);
                      console.error('❌ Video URL:', e.target.currentSrc || e.target.src);
                      setVideoError(true);
                    }}
                  >
                    <source src={videoSrc} type={getVideoType(video.videoUrl)} />
                    متصفحك لا يدعم عرض الفيديو
                  </video>

                  {!hasStarted && (
                    <div
                      onClick={handleBigPlay}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm cursor-pointer transition-opacity duration-300 hover:bg-black/50 z-10"
                    >
                      <div className="relative">
                        {/* Ring Animation */}
                        <div className="absolute inset-0 bg-secondary/30 rounded-full animate-ping"></div>
                        <div className="relative w-24 h-24 md:w-32 md:h-32 bg-secondary rounded-full flex items-center justify-center shadow-2xl transform transition-transform hover:scale-110 pulse-ring">
                          <FaPlay className="text-primary text-4xl md:text-5xl mr-[-6px]" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 flex gap-2 z-20">
                    {video.isFeatured && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                        ⭐ مميز
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                  <FaFolder /> {getCategoryName(video.category)}
                </span>
                {video.duration > 0 && (
                  <span className="bg-secondary text-primary px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                    <FaClock /> {formatDuration(video.duration)}
                  </span>
                )}
                <span className="bg-gray-100 text-gray-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                  <FaEye /> {video.views || 0} مشاهدة
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-primary mb-6 leading-tight">
                {video.title}
              </h1>

              <div className="flex flex-wrap gap-4 md:gap-6 pb-6 mb-6 border-b-2 border-gray-100">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                    <FaUser />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">الناشر</p>
                    <p className="font-bold text-sm">{video.author?.name || 'الإدارة'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-10 h-10 bg-secondary text-primary rounded-full flex items-center justify-center">
                    <FaCalendar />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">التاريخ</p>
                    <p className="font-bold text-sm">{formatDate(video.createdAt)}</p>
                  </div>
                </div>
              </div>

              {video.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-black text-primary mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-secondary rounded"></span>
                    الوصف
                  </h2>
                  <div className="bg-gray-50 rounded-xl p-5 border-r-4 border-secondary">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                      {video.description}
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t">
                <ShareButtons title={video.title} url={window.location.href} />
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/videos"
                  className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition shadow-lg"
                >
                  <FaArrowRight /> العودة لجميع الفيديوهات
                </Link>
              </div>
            </div>

            {video.related && video.related.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <span className="w-1 h-8 bg-secondary rounded"></span>
                  <h2 className="text-2xl font-black text-primary">
                    فيديوهات <span className="text-secondary">ذات صلة</span>
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {video.related.map((item) => (
                    <VideoCard key={item._id} video={item} variant="compact" />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center gap-3 mb-5 pb-4 border-b-2 border-secondary">
                <span className="text-2xl">🎬</span>
                <h3 className="text-xl font-black text-primary">فيديوهات أخرى</h3>
              </div>
              {video.related && video.related.length > 0 ? (
                <div className="space-y-4">
                  {video.related.map((item) => (
                    <Link
                      key={item._id}
                      to={`/videos/${item._id}`}
                      className="flex gap-3 group"
                    >
                      <div className="flex-shrink-0 relative w-32">
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative">
                          {item.thumbnailUrl ? (
                            <img
                              src={getImageUrl(item.thumbnailUrl)}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/128x72/4A148C/FFFFFF?text=V';
                              }}
                            />
                          ) : (
                            <video
                              src={getImageUrl(item.videoUrl)}
                              className="w-full h-full object-cover"
                              muted
                            />
                          )}
                          {item.duration > 0 && (
                            <span className="absolute bottom-1 left-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                              {formatDuration(item.duration)}
                            </span>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40">
                            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                              <FaPlay className="text-primary text-xs mr-[-2px]" />
                            </div>
                          </div>
                        </div>
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
              ) : (
                <p className="text-center text-gray-500 py-8">لا توجد فيديوهات أخرى</p>
              )}

              <Link
                to="/videos"
                className="block text-center mt-6 pt-6 border-t text-primary font-bold hover:text-secondary transition"
              >
                عرض كل الفيديوهات ←
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default VideoDetail;