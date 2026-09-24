import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaPlus, FaEye, FaClock, FaCheckCircle, FaHourglass, FaArchive } from 'react-icons/fa';
import { messageAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import { formatRelativeTime } from '../utils/formatDate';

const subjectNames = {
  inquiry: 'استفسار',
  complaint: 'شكوى',
  suggestion: 'اقتراح',
  membership: 'انضمام للنادي',
  sponsorship: 'رعاية',
  other: 'أخرى',
};

const statusConfig = {
  new: { text: 'جديدة', icon: <FaHourglass />, color: 'bg-blue-100 text-blue-700 border-blue-300' },
  read: { text: 'مقروءة', icon: <FaEye />, color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
  replied: { text: 'تم الرد', icon: <FaCheckCircle />, color: 'bg-green-100 text-green-700 border-green-300' },
  archived: { text: 'مؤرشفة', icon: <FaArchive />, color: 'bg-gray-100 text-gray-700 border-gray-300' },
};

const MyMessages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data } = await messageAPI.getMy();
        setMessages(data.messages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  const filtered = filter === 'all'
    ? messages
    : messages.filter(m => m.status === filter);

  const stats = {
    total: messages.length,
    new: messages.filter(m => m.status === 'new').length,
    replied: messages.filter(m => m.status === 'replied').length,
  };

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
        </div>
        <div className="container-custom relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 text-center md:text-right">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center text-primary text-3xl shadow-xl">
                <FaEnvelope />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black">رسائلي</h1>
                <p className="text-gray-200 text-sm mt-1">تابع رسائلك وردود الإدارة</p>
              </div>
            </div>

            <Link
              to="/contact"
              className="bg-secondary text-primary px-6 py-3 rounded-lg font-black hover:bg-secondary-light transition flex items-center gap-2 shadow-lg"
            >
              <FaPlus /> رسالة جديدة
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-2xl">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <p className="text-2xl md:text-3xl font-black text-secondary">{stats.total}</p>
              <p className="text-xs text-gray-200 font-bold">إجمالي</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <p className="text-2xl md:text-3xl font-black text-blue-300">{stats.new}</p>
              <p className="text-xs text-gray-200 font-bold">جديدة</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center">
              <p className="text-2xl md:text-3xl font-black text-green-300">{stats.replied}</p>
              <p className="text-xs text-gray-200 font-bold">تم الرد</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container-custom py-12">
        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-md p-4 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'new', label: 'جديدة' },
              { key: 'read', label: 'مقروءة' },
              { key: 'replied', label: 'تم الرد' },
              { key: 'archived', label: 'مؤرشفة' },
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

        {/* Messages */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <FaEnvelope className="text-6xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-bold mb-2">
              {messages.length === 0 ? 'لا توجد رسائل بعد' : 'لا توجد رسائل بهذه الحالة'}
            </p>
            <p className="text-gray-400 text-sm mb-6">تواصل مع الإدارة لأي استفسار</p>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              <FaPlus /> أرسل رسالتك الأولى
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((msg) => {
              const statusInfo = statusConfig[msg.status] || statusConfig.new;

              return (
                <div
                  key={msg._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6"
                >
                  {/* Header */}
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {msg.subject === 'inquiry' && '❓'}
                        {msg.subject === 'complaint' && '⚠️'}
                        {msg.subject === 'suggestion' && '💡'}
                        {msg.subject === 'membership' && '🎫'}
                        {msg.subject === 'sponsorship' && '🤝'}
                        {msg.subject === 'other' && '📝'}
                      </span>
                      <div>
                        <h3 className="font-black text-primary text-lg">
                          {msg.subjectText || subjectNames[msg.subject]}
                        </h3>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <FaClock /> {formatRelativeTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span className={`${statusInfo.color} px-3 py-1.5 rounded-full text-xs font-bold border-2 flex items-center gap-1.5`}>
                      {statusInfo.icon}
                      {statusInfo.text}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line line-clamp-3">
                      {msg.content}
                    </p>
                  </div>

                  {/* Admin Notes */}
                  {msg.adminNotes && (
                    <div className="bg-green-50 border-r-4 border-green-500 rounded-lg p-4">
                      <p className="text-xs font-bold text-green-700 mb-1">📝 رد الإدارة:</p>
                      <p className="text-sm text-green-800">{msg.adminNotes}</p>
                    </div>
                  )}

                  {/* Footer */}
                  {msg.repliedAt && (
                    <p className="text-xs text-gray-400 mt-4 pt-4 border-t">
                      ✅ تم الرد بتاريخ {new Date(msg.repliedAt).toLocaleDateString('ar-EG')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMessages;