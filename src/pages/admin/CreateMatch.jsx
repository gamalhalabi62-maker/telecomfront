import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaSave, FaTimes, FaFutbol, FaTrophy,
  FaPlus, FaTrash,
} from 'react-icons/fa';
import { matchAPI } from '../../services/api';

const CreateMatch = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    opponent: '',
    opponentLogo: '',
    competition: 'league',
    competitionName: '',
    round: '',
    date: '',
    time: '20:00',
    venue: 'home',
    stadium: '',
    status: 'upcoming',
    ourScore: '',
    opponentScore: '',
    minute: 0,
    featured: false,
    lineup: '',
    notes: '',
  });

  const [events, setEvents] = useState([]);

  const competitions = [
    { value: 'league', label: 'الدوري المصري' },
    { value: 'cup', label: 'كأس مصر' },
    { value: 'friendly', label: 'مباراة ودية' },
    { value: 'african', label: 'البطولات الأفريقية' },
    { value: 'arab', label: 'البطولات العربية' },
    { value: 'other', label: 'أخرى' },
  ];

  const statuses = [
    { value: 'upcoming', label: 'قادمة', emoji: '📅' },
    { value: 'live', label: 'مباشر الآن', emoji: '🔴' },
    { value: 'finished', label: 'انتهت', emoji: '✅' },
    { value: 'postponed', label: 'مؤجلة', emoji: '⏸️' },
    { value: 'cancelled', label: 'ملغاة', emoji: '❌' },
  ];

  const eventTypes = [
    { value: 'goal', label: 'هدف', emoji: '⚽' },
    { value: 'own_goal', label: 'هدف عكسي', emoji: '⚽' },
    { value: 'penalty', label: 'ضربة جزاء', emoji: '⚽' },
    { value: 'yellow_card', label: 'بطاقة صفراء', emoji: '🟨' },
    { value: 'red_card', label: 'بطاقة حمراء', emoji: '🟥' },
    { value: 'substitution', label: 'تبديل', emoji: '🔄' },
    { value: 'var', label: 'VAR', emoji: '📺' },
  ];

  const addEvent = () => {
    setEvents([...events, {
      minute: '',
      type: 'goal',
      player: '',
      team: 'us',
      description: '',
    }]);
  };

  const updateEvent = (index, field, value) => {
    const newEvents = [...events];
    newEvents[index][field] = value;
    setEvents(newEvents);
  };

  const removeEvent = (index) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.opponent || !formData.date) {
      setError('اسم الفريق والتاريخ مطلوبان');
      return;
    }

    setLoading(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}:00`);

      const data = {
        opponent: formData.opponent,
        opponentLogo: formData.opponentLogo,
        competition: formData.competition,
        competitionName: formData.competitionName,
        round: formData.round,
        date: dateTime.toISOString(),
        venue: formData.venue,
        stadium: formData.stadium,
        status: formData.status,
        ourScore: formData.ourScore,
        opponentScore: formData.opponentScore,
        minute: formData.minute,
        featured: formData.featured,
        lineup: formData.lineup,
        notes: formData.notes,
        events: events.map(ev => ({
          ...ev,
          minute: Number(ev.minute) || 0,
        })),
      };

      await matchAPI.create(data);
      navigate('/admin/matches');
    } catch (err) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء إضافة المباراة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white text-xl">
              <FaFutbol />
            </div>
            <h1 className="text-3xl font-black text-primary">إضافة مباراة جديدة</h1>
          </div>
          <button
            onClick={() => navigate('/admin/matches')}
            className="text-gray-500 hover:text-primary transition font-bold flex items-center gap-2"
          >
            <FaTimes /> إغلاق
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border-r-4 border-red-500 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              المعلومات الأساسية
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-bold text-gray-700 mb-2">الفريق المنافس *</label>
                <input
                  type="text"
                  value={formData.opponent}
                  onChange={(e) => setFormData({ ...formData, opponent: e.target.value })}
                  required
                  className="input-field"
                  placeholder="مثال: الأهلي، الزمالك..."
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">رابط شعار المنافس (اختياري)</label>
                <input
                  type="text"
                  value={formData.opponentLogo}
                  onChange={(e) => setFormData({ ...formData, opponentLogo: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/logo.png"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">البطولة *</label>
                <select
                  value={formData.competition}
                  onChange={(e) => setFormData({ ...formData, competition: e.target.value })}
                  className="input-field"
                >
                  {competitions.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">اسم البطولة (اختياري)</label>
                <input
                  type="text"
                  value={formData.competitionName}
                  onChange={(e) => setFormData({ ...formData, competitionName: e.target.value })}
                  className="input-field"
                  placeholder="مثال: الدوري المصري الممتاز"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">الدور / الجولة</label>
                <input
                  type="text"
                  value={formData.round}
                  onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                  className="input-field"
                  placeholder="مثال: الجولة 5"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">الملعب / الأرض</label>
                <select
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  className="input-field"
                >
                  <option value="home">🏠 على أرضنا</option>
                  <option value="away">✈️ خارج الأرض</option>
                  <option value="neutral">🌐 ملعب محايد</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block font-bold text-gray-700 mb-2">اسم الملعب (اختياري)</label>
                <input
                  type="text"
                  value={formData.stadium}
                  onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
                  className="input-field"
                  placeholder="مثال: ستاد القاهرة الدولي"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              التاريخ والحالة
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-bold text-gray-700 mb-2">التاريخ *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">الوقت *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  required
                  className="input-field"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">حالة المباراة *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>{s.emoji} {s.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              نتيجة المباراة
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block font-bold text-gray-700 mb-2">أهدافنا</label>
                <input
                  type="number"
                  min="0"
                  value={formData.ourScore}
                  onChange={(e) => setFormData({ ...formData, ourScore: e.target.value })}
                  className="input-field text-center text-2xl font-black"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">أهداف المنافس</label>
                <input
                  type="number"
                  min="0"
                  value={formData.opponentScore}
                  onChange={(e) => setFormData({ ...formData, opponentScore: e.target.value })}
                  className="input-field text-center text-2xl font-black"
                  placeholder="0"
                />
              </div>

              {formData.status === 'live' && (
                <div>
                  <label className="block font-bold text-gray-700 mb-2">الدقيقة الحالية</label>
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={formData.minute}
                    onChange={(e) => setFormData({ ...formData, minute: e.target.value })}
                    className="input-field text-center text-2xl font-black"
                    placeholder="45"
                  />
                </div>
              )}

              <div className="flex items-end">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-gray-50 rounded-lg w-full">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="font-bold text-gray-700">⭐ مباراة مميزة</span>
                </label>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              💡 اترك النتيجة فارغة إذا كانت المباراة لم تبدأ بعد
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-secondary">
              <h2 className="text-lg font-black text-primary flex items-center gap-2">
                <span className="w-1 h-6 bg-secondary rounded"></span>
                أحداث المباراة (اختياري)
              </h2>
              <button
                type="button"
                onClick={addEvent}
                className="bg-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2 text-sm"
              >
                <FaPlus /> إضافة حدث
              </button>
            </div>

            {events.length === 0 ? (
              <p className="text-center text-gray-500 py-6">
                لا توجد أحداث. اضغط "إضافة حدث" لإضافة هدف أو بطاقة.
              </p>
            ) : (
              <div className="space-y-4">
                {events.map((event, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">الدقيقة</label>
                        <input
                          type="number"
                          min="0"
                          max="120"
                          value={event.minute}
                          onChange={(e) => updateEvent(index, 'minute', e.target.value)}
                          className="input-field text-center"
                          placeholder="45"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-600 mb-1 block">النوع</label>
                        <select
                          value={event.type}
                          onChange={(e) => updateEvent(index, 'type', e.target.value)}
                          className="input-field"
                        >
                          {eventTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-600 mb-1 block">الفريق</label>
                        <select
                          value={event.team}
                          onChange={(e) => updateEvent(index, 'team', e.target.value)}
                          className="input-field"
                        >
                          <option value="us">لنا</option>
                          <option value="opponent">علينا</option>
                        </select>
                      </div>

                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeEvent(index)}
                          className="w-full bg-red-500 text-white p-3 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2 text-sm font-bold"
                        >
                          <FaTrash /> حذف
                        </button>
                      </div>

                      <div className="md:col-span-3">
                        <label className="text-xs font-bold text-gray-600 mb-1 block">اسم اللاعب</label>
                        <input
                          type="text"
                          value={event.player}
                          onChange={(e) => updateEvent(index, 'player', e.target.value)}
                          className="input-field"
                          placeholder="اسم اللاعب"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="text-xs font-bold text-gray-600 mb-1 block">وصف (اختياري)</label>
                        <input
                          type="text"
                          value={event.description}
                          onChange={(e) => updateEvent(index, 'description', e.target.value)}
                          className="input-field"
                          placeholder="تفاصيل إضافية"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <h2 className="text-lg font-black text-primary mb-4 pb-2 border-b-2 border-secondary flex items-center gap-2">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              معلومات إضافية
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block font-bold text-gray-700 mb-2">التشكيلة (اختياري)</label>
                <textarea
                  value={formData.lineup}
                  onChange={(e) => setFormData({ ...formData, lineup: e.target.value })}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="اكتب التشكيلة الأساسية..."
                ></textarea>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-2">ملاحظات (اختياري)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  className="input-field resize-none"
                  placeholder="ملاحظات إضافية عن المباراة..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              <FaSave /> {loading ? 'جاري الحفظ...' : 'إضافة المباراة'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/matches')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition flex items-center gap-2"
            >
              <FaTimes /> إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateMatch;