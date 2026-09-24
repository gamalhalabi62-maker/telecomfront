import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { videoAPI } from '../../services/api';
import Loading from '../../components/Loading';
import { getImageUrl, getCategoryName } from '../../utils/formatDate';

const ManageVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      const { data } = await videoAPI.getAll({ limit: 100 });
      setVideos(data.videos);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) return;
    try {
      await videoAPI.delete(id);
      setVideos(videos.filter(v => v._id !== id));
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black text-primary">إدارة الفيديوهات</h1>
        <Link to="/admin/videos/create" className="btn-primary flex items-center gap-2">
          <FaPlus /> فيديو جديد
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {videos.length === 0 ? (
          <p className="text-center py-16 text-gray-500">لا توجد فيديوهات</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary text-white">
                <tr>
                  <th className="p-4 text-right">المصغرة</th>
                  <th className="p-4 text-right">العنوان</th>
                  <th className="p-4 text-right">التصنيف</th>
                  <th className="p-4 text-right">المشاهدات</th>
                  <th className="p-4 text-right">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((item) => (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="w-20 h-12 bg-black rounded overflow-hidden">
                        {item.thumbnailUrl && (
                          <img
                            src={getImageUrl(item.thumbnailUrl)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-primary max-w-xs truncate">{item.title}</td>
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
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Link to={`/videos/${item._id}`} className="text-blue-600 hover:text-blue-800">
                          <FaEye />
                        </Link>
                        <Link to={`/admin/videos/edit/${item._id}`} className="text-primary hover:text-primary-light">
                          <FaEdit />
                        </Link>
                        <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800">
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageVideos;