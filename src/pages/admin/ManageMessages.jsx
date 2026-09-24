import { useEffect, useState } from 'react';
import {
  FaEnvelope, FaSearch, FaFilter, FaEye, FaCheck, FaTrash,
  FaWhatsapp, FaSave, FaTimes, FaCheckCircle, FaHourglass,
  FaArchive, FaEnvelopeOpen,
} from 'react-icons/fa';
import { messageAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import { formatRelativeTime } from '../../utils/formatDate';

const subjectNames = {
  inquiry: 'استفسار',
  complaint: 'شكوى',
  suggestion: 'اقتراح',
  membership: 'انضمام',
  sponsorship: 'رعاية',
  other: 'أخرى',
};

const statusConfig = {
  new: { text: 'جديدة', color: 'bg-blue-100 text-blue-700', icon: <FaHourglass /> },
  read: { text: 'مقروءة', color: 'bg-yellow-100 text-yellow-700', icon: <FaEnvelopeOpen /> },
  replied: { text: 'تم الرد', color: 'bg-green-100 text-green-700', icon: <FaCheckCircle /> },
  archived: { text: 'مؤرشفة', color: 'bg-gray-100 text-gray-700', icon: <FaArchive /> },
};

const ManageMessages = () => {
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, read: 0, replied: 0, archived: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchMessages = async () => {
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const { data } = await messageAPI.getAll(params);
      setMessages(data.messages);
      setStats(data.stats);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [statusFilter, search]);

  const handleOpen = async (message) => {
    setSelectedMessage(message);
    setAdminNotes(message.adminNotes || '');

    if (message.status === 'new') {
      try {
        await messageAPI.updateStatus(message._id, { status: 'read' });
        setMessages(messages.map(m => m._id === message._id ? { ...m, status: 'read' } : m));
        setStats({ ...stats, new: stats.new - 1, read: stats.read + 1 });
      } catch (error) { /* silent */ }
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedMessage) return;
    setSaving(true);
    try {
      await messageAPI.updateStatus(selectedMessage._id, {
        status: selectedMessage.status === 'new' ? 'read' : selectedMessage.status,
        adminNotes,
      });
      toast.success('تم حفظ الملاحظات');
    } catch (error) {
      toast.error('حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkReplied = async () => {
    if (!selectedMessage) return;
    try {
      await messageAPI.updateStatus(selectedMessage._id, {
        status: 'replied',
        adminNotes,
      });
      toast.success('تم تعليم الرسالة كـ "تم الرد"');
      setSelectedMessage({ ...selectedMessage, status: 'replied' });
      fetchMessages();
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleArchive = async () => {
    if (!selectedMessage) return;
    try {
      await messageAPI.updateStatus(selectedMessage._id, { status: 'archived' });
      toast.success('تم أرشفة الرسالة');
      setSelectedMessage({ ...selectedMessage, status: 'archived' });
      fetchMessages();
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الرسالة؟')) return;
    try {
      await messageAPI.delete(id);
      toast.success('تم حذف الرسالة');
      setMessages(messages.filter(m => m._id !== id));
      setSelectedMessage(null);
    } catch (error) {
      toast.error('حدث خطأ');
    }
  };

  // فتح واتساب
  const openWhatsApp = (phone, name) => {
    if (!phone) {
      toast.error('لا يوجد رقم واتساب لهذا المستخدم');
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`مرحباً ${name}،\n\nشكراً لتواصلك مع نادي المصرية للاتصالات.\n\n`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  if (loading) return <Loading />;

  return (
    <div className="container-custom py-8">
      <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-6 md:p-8 rounded-2xl mb-6">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl">
            <FaEnvelope />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black">إدارة الرسائل</h1>
            <p className="text-gray-200 text-sm">تواصل مع المستخدمين</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-white">{stats.total}</p>
            <p className="text-xs text-gray-200">إجمالي</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-blue-300">{stats.new}</p>
            <p className="text-xs text-gray-200">جديدة</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-yellow-300">{stats.read}</p>
            <p className="text-xs text-gray-200">مقروءة</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-300">{stats.replied}</p>
            <p className="text-xs text-gray-200">تم الرد</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-gray-300">{stats.archived}</p>
            <p className="text-xs text-gray-200">مؤرشفة</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <FaSearch className="absolute top-1/2 -translate-y-1/2 right-4 text-gray-400" />
            <input
              type="text"
              placeholder="ابحث بالاسم، الإيميل، أو المحتوى..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pr-12"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="">كل الحالات</option>
            <option value="new">جديدة</option>
            <option value="read">مقروءة</option>
            <option value="replied">تم الرد</option>
            <option value="archived">مؤرشفة</option>
          </select>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-md">
          <FaEnvelope className="text-6xl text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-bold">لا توجد رسائل</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {messages.map((msg) => {
            const statusInfo = statusConfig[msg.status] || statusConfig.new;

            return (
              <div
                key={msg._id}
                onClick={() => handleOpen(msg)}
                className={`bg-white rounded-xl shadow-md p-5 cursor-pointer hover:shadow-xl transition border-r-4 ${
                  msg.status === 'new' ? 'border-r-blue-500' :
                  msg.status === 'read' ? 'border-r-yellow-500' :
                  msg.status === 'replied' ? 'border-r-green-500' :
                  'border-r-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-black">
                      {msg.senderName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-black text-primary">{msg.senderName}</h3>
                      <p className="text-xs text-gray-500" dir="ltr">{msg.senderEmail}</p>
                    </div>
                  </div>
                  <span className={`${statusInfo.color} px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                    {statusInfo.icon} {statusInfo.text}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-xs font-bold text-secondary">
                    {subjectNames[msg.subject] || msg.subject}
                  </span>
                  {msg.subjectText && (
                    <span className="text-xs text-gray-600 mr-2">- {msg.subjectText}</span>
                  )}
                </div>

                <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                  {msg.content}
                </p>

                <div className="flex justify-between items-center text-xs text-gray-400">
                  <span>{formatRelativeTime(msg.createdAt)}</span>
                  {msg.senderPhone && (
                    <span className="flex items-center gap-1 text-green-600 font-bold">
                      <FaWhatsapp /> واتساب متوفر
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedMessage && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4"
          onClick={() => setSelectedMessage(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black">تفاصيل الرسالة</h2>
                <p className="text-xs text-gray-200 mt-1">
                  {formatRelativeTime(selectedMessage.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="w-10 h-10 bg-white/10 hover:bg-red-500 rounded-full flex items-center justify-center transition"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-black text-lg">
                    {selectedMessage.senderName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-black text-primary">{selectedMessage.senderName}</p>
                    <p className="text-xs text-gray-500" dir="ltr">{selectedMessage.senderEmail}</p>
                  </div>
                </div>

                {selectedMessage.senderPhone && (
                  <div className="mt-3 pt-3 border-t flex justify-between items-center">
                    <span className="text-sm text-gray-600" dir="ltr">
                      📱 {selectedMessage.senderPhone}
                    </span>
                    <button
                      onClick={() => openWhatsApp(selectedMessage.senderPhone, selectedMessage.senderName)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition"
                    >
                      <FaWhatsapp /> تواصل عبر واتساب
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs font-bold text-gray-500 mb-1">الموضوع:</p>
                <p className="font-black text-primary text-lg">
                  {subjectNames[selectedMessage.subject] || selectedMessage.subject}
                  {selectedMessage.subjectText && ` - ${selectedMessage.subjectText}`}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-xs font-bold text-gray-500 mb-2">الرسالة:</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">
                  {selectedMessage.content}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
                  📝 ملاحظاتك (داخلية):
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="اكتب ملاحظاتك عن الرد..."
                ></textarea>
                <button
                  onClick={handleSaveNotes}
                  disabled={saving}
                  className="mt-2 bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition text-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <FaSave /> {saving ? 'جاري الحفظ...' : 'حفظ الملاحظات'}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t flex flex-wrap gap-2">
              {selectedMessage.status !== 'replied' && (
                <button
                  onClick={handleMarkReplied}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 flex-1 justify-center"
                >
                  <FaCheck /> تم الرد
                </button>
              )}
              {selectedMessage.status !== 'archived' && (
                <button
                  onClick={handleArchive}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2 flex-1 justify-center"
                >
                  <FaArchive /> أرشفة
                </button>
              )}
              <button
                onClick={() => handleDelete(selectedMessage._id)}
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold transition flex items-center gap-2"
              >
                <FaTrash /> حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMessages;