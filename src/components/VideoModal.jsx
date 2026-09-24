import { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { getImageUrl } from '../utils/formatDate';

const VideoModal = ({ video, onClose }) => {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // منع التمرير

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  if (!video) return null;

  const getVideoType = (url) => {
    if (!url) return 'video/mp4';
    const ext = url.split('.').pop().toLowerCase();
    const types = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      mov: 'video/quicktime',
      m4v: 'video/mp4',
    };
    return types[ext] || 'video/mp4';
  };

  const videoSrc = encodeURI(getImageUrl(video.videoUrl));
  const posterSrc = video.thumbnailUrl
    ? encodeURI(getImageUrl(video.thumbnailUrl))
    : undefined;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/10 hover:bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center transition z-10 backdrop-blur-md"
        aria-label="إغلاق"
      >
        <FaTimes className="text-xl" />
      </button>

      <div
        className="w-full max-w-6xl animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-black rounded-2xl overflow-hidden shadow-2xl">
          <video
            src={videoSrc}
            controls
            autoPlay
            preload="auto"
            poster={posterSrc}
            className="w-full aspect-video"
            controlsList="nodownload"
            playsInline
          >
            <source src={videoSrc} type={getVideoType(video.videoUrl)} />
            متصفحك لا يدعم عرض الفيديو
          </video>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-b-2xl p-4 md:p-6 mt-2">
          <h3 className="text-lg md:text-2xl font-black text-primary mb-2 line-clamp-2">
            {video.title}
          </h3>
          {video.description && (
            <p className="text-gray-600 text-sm line-clamp-2 mb-3">
              {video.description}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>👁️ {video.views || 0} مشاهدة</span>
            <span>📅 {new Date(video.createdAt).toLocaleDateString('ar-EG')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;