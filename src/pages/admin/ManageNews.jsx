import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFileAlt, FaImage, FaVideo, FaLayerGroup } from 'react-icons/fa';
import { newsAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { getImageUrl, getCategoryName } from '../../utils/formatDate';
import { getMediaPreviewImage, formatDuration } from '../../utils/mediaHelpers';

const MediaTypeIcon = ({ type }) => {
  const icons = {
    none: <FaFileAlt className="text-gray-500" />,
    image: <FaImage className="text-blue-500" />,
    video: <FaVideo className="text-red-500" />,
    both: <FaLayerGroup className="text-purple-500" />,
  };
  return icons[type] || icons.none;
};

const ManageNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      const { data } = await newsAPI.getAll({ limit: 100 });
      setNews(data.news);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الخبر؟')) return;
    try {
      await newsAPI.delete(id);
      setNews(news.filter(n => n._id !== id));
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-primary">إدارة الأخبار</h1>
        <Link to="/admin/news/create" className="btn-primary flex items-center gap-2">
          <FaPlus /> خبر جديد
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {news.length === 0 ? (
          <p className="text-center py-16 text-gray-500">لا توجد أخبار</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-4 text-right">المعاينة</th>
                  <th className="p-4 text-right">العنوان</th>
                  <th className="p-4 text-center">النوع</th>
                  <th className="p-4 text-right">التصنيف</th>
                  <th className="p-4 text-right">المشاهدات</th>
                  <th className="p-4 text-right">التاريخ</th>
                  <th className="p-4 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {news.map((item) => {
                  const preview = getMediaPreviewImage(item);
                  const duration = formatDuration(item.videoDuration);
                  return (
                    <tr key={item._id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {preview ? (
                            <img
                              src={getImageUrl(preview)}
                              alt={item.title}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <span className="text-gray-400 text-2xl">📰</span>
                          )}
                          {item.mediaType === 'video' || item.mediaType === 'both' ? (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <FaVideo className="text-white text-sm" />
                            </div>
                          ) : null}
                        </div>
                      </td>
                      <td className="p-4 font-bold text-primary max-w-xs truncate">{item.title}</td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-lg" title={item.mediaType}>
                          <MediaTypeIcon type={item.mediaType || 'none'} />
                        </div>
                        {duration && (
                          <span className="text-xs text-gray-500 block mt-1">{duration}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className="bg-primary-light text-white px-3 py-1 rounded-full text-xs">
                          {getCategoryName(item.category)}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="flex items-center gap-1">
                          <FaEye className="text-primary" /> {item.views || 0}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link to={`/news/${item._id}`} className="text-blue-600 hover:text-blue-800" title="عرض">
                            <FaEye />
                          </Link>
                          <Link to={`/admin/news/edit/${item._id}`} className="text-primary hover:text-primary-light" title="تعديل">
                            <FaEdit />
                          </Link>
                          <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800" title="حذف">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageNews;