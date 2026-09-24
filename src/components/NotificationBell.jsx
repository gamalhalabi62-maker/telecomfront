import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaBell, FaCheck, FaTrash, FaNewspaper, FaEnvelope,
  FaFutbol, FaVideo, FaUser, FaCog, FaCheckDouble,
} from 'react-icons/fa';
import { notificationAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
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

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasNew, setHasNew] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const { data } = await notificationAPI.getAll({ limit: 10 });
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user) return;

    fetchNotifications();

    const interval = setInterval(async () => {
      try {
        const { data } = await notificationAPI.getUnreadCount();

        setUnreadCount((prev) => {
          if (data.unreadCount > prev) {
            setHasNew(true);
            playNotificationSound();
            showBrowserNotification();
            fetchNotifications();
          }
          return data.unreadCount;
        });
      } catch (error) {  }
    }, 10000); 

    return () => clearInterval(interval);
  }, [user]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {  }
  };

  const showBrowserNotification = () => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    try {
      new Notification('🏆 نادي المصرية للاتصالات', {
        body: 'لديك إشعار جديد!',
        icon: '/logo.png',
        badge: '/logo.png',
        tag: 'telecom-club-notification',
      });
    } catch (e) {  }
  };

  useEffect(() => {
    if (user && 'Notification' in window && Notification.permission === 'default') {
      setTimeout(() => {
        Notification.requestPermission().catch(() => {});
      }, 3000);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    setHasNew(false);
    if (!isOpen) fetchNotifications();
  };

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await notificationAPI.delete(id);
      const deleted = notifications.find(n => n._id === id);
      setNotifications(notifications.filter(n => n._id !== id));
      if (deleted && !deleted.isRead) setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error(error);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationAPI.markAsRead(notification._id);
        setUnreadCount(Math.max(0, unreadCount - 1));
      } catch (error) {  }
    }

    setIsOpen(false);

    if (notification.link) {
      navigate(notification.link);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className={`relative w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition group ${
          hasNew ? 'animate-bounce' : ''
        }`}
        aria-label="الإشعارات"
      >
        <FaBell className={`text-white text-lg group-hover:scale-110 transition ${hasNew ? 'text-secondary' : ''}`} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}

        {hasNew && (
          <span className="absolute -top-1 -left-1 w-3 h-3 bg-secondary rounded-full animate-ping"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-14 left-0 md:right-0 md:left-auto w-[340px] md:w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden z-[100] animate-fade-in border-2 border-primary/10">
          {/* Header */}
          <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaBell />
              <h3 className="font-black">الإشعارات</h3>
              {unreadCount > 0 && (
                <span className="bg-secondary text-primary-dark text-xs font-black px-2 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full font-bold transition flex items-center gap-1"
              >
                <FaCheckDouble /> تعليم الكل
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-center py-12 px-4">
                <FaBell className="text-5xl text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-bold">لا توجد إشعارات</p>
                <p className="text-gray-400 text-xs mt-1">ستظهر هنا عند وجود جديد</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition relative ${
                    !notif.isRead ? 'bg-primary/5 border-r-4 border-r-primary' : ''
                  }`}
                >
                  <div className={`w-10 h-10 ${iconColors[notif.type] || iconColors.system} text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                    {iconMap[notif.type] || iconMap.system}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm line-clamp-1 ${!notif.isRead ? 'font-black text-primary' : 'font-bold text-gray-700'}`}>
                      {notif.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{notif.body}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {formatRelativeTime(notif.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                    {!notif.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center text-xs transition"
                        title="تعليم كمقروء"
                      >
                        <FaCheck />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notif._id, e)}
                      className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition"
                      title="حذف"
                    >
                      <FaTrash />
                    </button>
                  </div>

                  {!notif.isRead && (
                    <span className="absolute top-4 left-4 w-2 h-2 bg-secondary rounded-full"></span>
                  )}
                </div>
              ))
            )}
          </div>

          <Link
            to="/notifications"
            onClick={() => setIsOpen(false)}
            className="block text-center bg-gray-50 hover:bg-gray-100 py-3 text-primary font-black text-sm transition border-t"
          >
            عرض كل الإشعارات ←
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;