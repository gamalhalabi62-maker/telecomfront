import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBell, FaCheck, FaTrash, FaNewspaper, FaEnvelope,
  FaFutbol, FaVideo, FaUser, FaCog, FaCheckDouble,
} from 'react-icons/fa';
import { notificationAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import Loading from '../components/Loading';
import { formatRelativeTime } from '../utils/formatDate';

const iconMap = {
  news: <FaNewspaper />,
  message: <FaEnvelope />,
  match: <FaFutbol />,
  video: <FaVideo />,
  membership: <FaUser />,
  system: <FaCog />,
};

const iconColors = {
  news: 'bg-blue-500',
  message: 'bg-secondary',
  match: 'bg-green-500',
  video: 'bg-purple-500',
  membership: 'bg-orange-500',
  system: 'bg-gray-500',
};

const Notifications = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      const { data } = await notificationAPI.getAll({ limit: 50 });
      setNotifications(data.notifications);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('تم تعليم كل الإشعارات كمقروءة');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDeleteAll = async () => {
    if (!window.confirm('هل أنت متأكد من حذف كل الإشعارات؟')) return;
    try {
      await notificationAPI.deleteAll();
      setNotifications([]);
      toast.success('تم حذف كل الإشعارات');
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationAPI.delete(id);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationAPI.markAsRead(notification._id);
      } catch (error) { /* silent */ }
    }
    if (notification.link) navigate(notification.link);
  };

  const filtered = filter === 'all'
    ? notifications
    : filter === 'unread'
      ? notifications.filter(n => !n.isRead)
      : notifications.filter(n => n.isRead);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white py-12">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary text-3xl shadow-xl relative">
                <FaBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black">الإشعارات</h1>
                <p className="text-gray-200 text-sm mt-1">
                  {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'كل الإشعارات مقروءة'}
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="bg-secondary text-primary px-4 py-2 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2 text-sm"
                  >
                    <FaCheckDouble /> تعليم الكل كمقروء
                  </button>
                )}
                <button
                  onClick={handleDeleteAll}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition flex items-center gap-2 text-sm"
                >
                  <FaTrash /> حذف الكل
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container-custom py-8">
        {/* Filter */}
        {notifications.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-4 mb-6">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[
                { key: 'all', label: `الكل (${notifications.length})` },
                { key: 'unread', label: `غير مقروءة (${unreadCount})` },
                { key: 'read', label: `مقروءة (${notifications.length - unreadCount})` },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition ${
                    filter === f.key
                      ? 'bg-primary text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <FaBell className="text-6xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-bold mb-2">
              {notifications.length === 0 ? 'لا توجد إشعارات' : 'لا توجد إشعارات بهذه الحالة'}
            </p>
            <p className="text-gray-400 text-sm">ستظهر هنا عند وجود جديد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((notif) => (
              <div
                key={notif._id}
                onClick={() => handleClick(notif)}
                className={`group flex items-start gap-4 p-5 rounded-2xl shadow-md hover:shadow-xl cursor-pointer transition-all border-r-4 ${
                  !notif.isRead
                    ? 'bg-white border-primary'
                    : 'bg-white border-gray-200 opacity-80'
                }`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 ${iconColors[notif.type] || iconColors.system} text-white rounded-xl flex items-center justify-center text-xl flex-shrink-0 shadow-md group-hover:scale-110 transition`}>
                  {iconMap[notif.type] || iconMap.system}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`${!notif.isRead ? 'font-black text-primary' : 'font-bold text-gray-700'} text-base`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 bg-secondary rounded-full"></span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notif.body}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {formatRelativeTime(notif.createdAt)}
                  </p>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => handleDelete(notif._id, e)}
                  className="w-8 h-8 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
                  title="حذف"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;