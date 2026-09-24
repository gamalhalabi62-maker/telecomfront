import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaNewspaper, FaPlus, FaEye, FaEdit, FaVideo, FaUsers,
  FaFutbol, FaTrophy, FaChartBar, FaEnvelope, FaBell,
  FaCheckCircle, FaExclamationTriangle, FaVoteYea, FaUserCheck, FaUserTimes,
} from 'react-icons/fa';
import {
  newsAPI, videoAPI, playerAPI, matchAPI,
  statisticAPI, messageAPI, notificationAPI, electionAPI,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Loading from '../../components/Loading';
import { getImageUrl } from '../../utils/formatDate';  

const Dashboard = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [stats, setStats] = useState({
    total: 0, views: 0, recent: [],
    videosCount: 0, recentVideos: [],
    playersCount: 0,
    matchesCount: 0, upcomingCount: 0, liveCount: 0, finishedCount: 0,
    wins: 0, draws: 0, losses: 0,
    recentMatches: [],
    statsCount: 0,
    messagesCount: 0, newMessagesCount: 0, recentMessages: [],
    unreadNotifications: 0,
    election: {
      totalMembers: 0,
      attending: 0,
      notAttending: 0,
      registered: 0,
      pending: 0,
      attendingWorking: 0,
      attendingRetired: 0,
      workingTotal: 0,
      retiredTotal: 0,
    },
  });

  const [loading, setLoading] = useState(true);
  const [hasErrors, setHasErrors] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          newsRes,
          videosRes,
          playersRes,
          matchesRes,
          matchStatsRes,
          statisticsRes,
          messagesRes,
          notificationsRes,
          electionRes,
        ] = await Promise.allSettled([
          newsAPI.getAll({ limit: 5 }),
          videoAPI.getAll({ limit: 5 }),
          playerAPI.getAll(),
          matchAPI.getAll({ limit: 5 }),
          matchAPI.getStats(),
          statisticAPI.getAll(),
          messageAPI.getAll({ limit: 5 }),
          notificationAPI.getUnreadCount(),
          electionAPI.getStats(),
        ]);

        const newsData = newsRes.status === 'fulfilled' ? newsRes.value.data : { news: [], total: 0 };
        const videosData = videosRes.status === 'fulfilled' ? videosRes.value.data : { videos: [], total: 0 };
        const playersData = playersRes.status === 'fulfilled' ? playersRes.value.data : { players: [] };
        const matchesData = matchesRes.status === 'fulfilled' ? matchesRes.value.data : { matches: [] };
        const matchStatsData = matchStatsRes.status === 'fulfilled' ? matchStatsRes.value.data : {};
        const statisticsData = statisticsRes.status === 'fulfilled' ? statisticsRes.value.data : { statistics: [] };
        const messagesData = messagesRes.status === 'fulfilled' ? messagesRes.value.data : { messages: [], stats: {} };
        const notificationsData = notificationsRes.status === 'fulfilled' ? notificationsRes.value.data : { unreadCount: 0 };
        const electionData = electionRes.status === 'fulfilled' ? electionRes.value.data : {};

        const errors = [newsRes, videosRes, playersRes, matchesRes, matchStatsRes, statisticsRes, messagesRes, notificationsRes]
          .filter(r => r.status === 'rejected');

        if (errors.length > 0) {
          console.warn('بعض الطلبات فشلت:', errors);
          setHasErrors(true);
        }

        const totalViews = newsData.news?.reduce((sum, n) => sum + (n.views || 0), 0) || 0;

        setStats({
          total: newsData.total || 0,
          views: totalViews,
          recent: newsData.news || [],
          videosCount: videosData.total || 0,
          recentVideos: videosData.videos || [],
          playersCount: playersData.players?.length || 0,
          matchesCount: matchStatsData.total || 0,
          upcomingCount: matchStatsData.upcoming || 0,
          liveCount: matchStatsData.live || 0,
          finishedCount: (matchStatsData.wins || 0) + (matchStatsData.draws || 0) + (matchStatsData.losses || 0),
          wins: matchStatsData.wins || 0,
          draws: matchStatsData.draws || 0,
          losses: matchStatsData.losses || 0,
          recentMatches: matchesData.matches || [],
          statsCount: statisticsData.statistics?.length || 0,
          messagesCount: messagesData.stats?.total || 0,
          newMessagesCount: messagesData.stats?.new || 0,
          recentMessages: messagesData.messages || [],
          unreadNotifications: notificationsData.unreadCount || 0,
          election: {
            totalMembers: electionData.totalMembers || 0,
            attending: electionData.attending || 0,
            notAttending: electionData.notAttending || 0,
            registered: electionData.registered || 0,
            pending: electionData.pending || 0,
            attendingWorking: electionData.attendingWorking || 0,
            attendingRetired: electionData.attendingRetired || 0,
            workingTotal: electionData.workingTotal || 0,
            retiredTotal: electionData.retiredTotal || 0,
          },
        });
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (hasErrors && !loading) {
      toast.warning('بعض البيانات لم تُحمّل بنجاح');
    }
  }, [hasErrors, loading]);

  if (loading) return <Loading />;

  const getMatchStatusBadge = (status) => {
    const badges = {
      upcoming: { text: 'قادمة', color: 'bg-blue-100 text-blue-700' },
      live: { text: 'مباشر', color: 'bg-red-100 text-red-700 animate-pulse' },
      finished: { text: 'انتهت', color: 'bg-gray-100 text-gray-700' },
      postponed: { text: 'مؤجلة', color: 'bg-yellow-100 text-yellow-700' },
      cancelled: { text: 'ملغاة', color: 'bg-gray-200 text-gray-600' },
    };
    return badges[status] || badges.upcoming;
  };

  const subjectNames = {
    inquiry: 'استفسار',
    complaint: 'شكوى',
    suggestion: 'اقتراح',
    membership: 'انضمام',
    sponsorship: 'رعاية',
    other: 'أخرى',
  };

  const electionAttendanceRate = stats.election.totalMembers > 0
    ? Math.round((stats.election.registered / stats.election.totalMembers) * 100)
    : 0;

  return (
    <div className="container-custom py-8">
      <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-8 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="logo"
              className="w-20 h-20 object-contain drop-shadow-xl animate-float"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div>
              <h1 className="text-2xl md:text-3xl font-black mb-1">مرحباً، {user?.name} 👋</h1>
              <p className="text-gray-200 text-sm">لوحة تحكم نادي المصرية للاتصالات</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {stats.newMessagesCount > 0 && (
              <Link
                to="/admin/messages"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl px-4 py-2 flex items-center gap-2 transition border border-white/20"
              >
                <FaEnvelope className="text-secondary" />
                <span className="text-sm font-bold">
                  {stats.newMessagesCount} رسالة جديدة
                </span>
              </Link>
            )}
            {stats.unreadNotifications > 0 && (
              <Link
                to="/notifications"
                className="bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-xl px-4 py-2 flex items-center gap-2 transition border border-white/20"
              >
                <FaBell className="text-secondary" />
                <span className="text-sm font-bold">
                  {stats.unreadNotifications} إشعار
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <FaNewspaper />, label: 'الأخبار', value: stats.total, color: 'bg-primary', link: '/admin/news' },
          { icon: <FaVideo />, label: 'الفيديوهات', value: stats.videosCount, color: 'bg-primary-light', link: '/admin/videos' },
          { icon: <FaUsers />, label: 'اللاعبين', value: stats.playersCount, color: 'bg-primary-dark', link: '/admin/players' },
          { icon: <FaFutbol />, label: 'المباريات', value: stats.matchesCount, color: 'bg-secondary', link: '/admin/matches' },
          { icon: <FaTrophy />, label: 'الأرقام', value: stats.statsCount, color: 'bg-secondary', link: '/admin/statistics' },
          { icon: <FaEnvelope />, label: 'الرسائل', value: stats.messagesCount, color: 'bg-primary-light', link: '/admin/messages', badge: stats.newMessagesCount },
          { icon: <FaEye />, label: 'المشاهدات', value: stats.views, color: 'bg-primary', link: '#' },
          { icon: <FaVoteYea />, label: 'مسجلي الانتخابات', value: stats.election.registered, color: 'bg-secondary', link: '/admin/elections', badge: stats.election.attending },
        ].map((stat, i) => (
          <Link
            key={i}
            to={stat.link}
            className="bg-white p-5 rounded-xl shadow-md flex items-center gap-4 hover:shadow-xl transition cursor-pointer group relative"
          >
            <div className={`w-14 h-14 ${stat.color} text-white rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition flex-shrink-0`}>
              {stat.icon}
            </div>
            <div className="flex-1">
              <p className="text-gray-500 text-xs">{stat.label}</p>
              <p className="text-2xl font-black text-primary">{stat.value}</p>
            </div>

            {stat.badge > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
                {stat.badge > 99 ? '99+' : stat.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="bg-gradient-to-l from-secondary via-yellow-400 to-secondary text-primary p-6 rounded-2xl mb-8 relative overflow-hidden shadow-xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-secondary text-2xl shadow-lg">
                <FaVoteYea />
              </div>
              <div>
                <h2 className="text-2xl font-black">انتخابات الجمعية العمومية</h2>
                <p className="text-primary/70 text-sm font-bold">متابعة تسجيلات الحضور</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/admin/elections"
                className="bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:bg-primary-dark transition flex items-center gap-2 shadow-lg"
              >
                <FaChartBar /> إدارة الانتخابات
              </Link>
              <Link
                to="/admin/elections/upload"
                className="bg-white text-primary px-5 py-2.5 rounded-lg font-bold hover:bg-gray-100 transition flex items-center gap-2 shadow-lg"
              >
                <FaPlus /> رفع أعضاء
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white">
              <p className="text-3xl font-black text-primary">{stats.election.totalMembers}</p>
              <p className="text-xs text-primary/70 font-bold mt-1">إجمالي الأعضاء</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white">
              <p className="text-3xl font-black text-green-600 flex items-center justify-center gap-1">
                <FaUserCheck className="text-lg" /> {stats.election.attending}
              </p>
              <p className="text-xs text-primary/70 font-bold mt-1">سيحضر</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white">
              <p className="text-3xl font-black text-red-600 flex items-center justify-center gap-1">
                <FaUserTimes className="text-lg" /> {stats.election.notAttending}
              </p>
              <p className="text-xs text-primary/70 font-bold mt-1">لن يحضر</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white">
              <p className="text-3xl font-black text-gray-600">{stats.election.pending}</p>
              <p className="text-xs text-primary/70 font-bold mt-1">لم يسجل بعد</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center border-2 border-white">
              <p className="text-3xl font-black text-primary">{electionAttendanceRate}%</p>
              <p className="text-xs text-primary/70 font-bold mt-1">نسبة التسجيل</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-2 border-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-primary text-sm">👷 الحضور من العاملين</span>
                <span className="font-black text-primary">{stats.election.attendingWorking} / {stats.election.workingTotal}</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${stats.election.workingTotal > 0 ? (stats.election.attendingWorking / stats.election.workingTotal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border-2 border-white">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-primary text-sm">👴 الحضور من المعاش</span>
                <span className="font-black text-primary">{stats.election.attendingRetired} / {stats.election.retiredTotal}</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2.5">
                <div
                  className="bg-purple-600 h-2.5 rounded-full transition-all"
                  style={{ width: `${stats.election.retiredTotal > 0 ? (stats.election.attendingRetired / stats.election.retiredTotal) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-l from-primary to-primary-dark text-white p-6 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-primary text-2xl">
              <FaFutbol className="ball-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-black">إحصائيات الفريق</h2>
              <p className="text-gray-300 text-sm">نتائج المباريات الرسمية</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition">
              <p className="text-3xl font-black text-green-400">{stats.wins}</p>
              <p className="text-xs text-gray-200 font-bold mt-1">فوز</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition">
              <p className="text-3xl font-black text-yellow-400">{stats.draws}</p>
              <p className="text-xs text-gray-200 font-bold mt-1">تعادل</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition">
              <p className="text-3xl font-black text-red-400">{stats.losses}</p>
              <p className="text-xs text-gray-200 font-bold mt-1">خسارة</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition">
              <p className="text-3xl font-black text-blue-400">{stats.upcomingCount}</p>
              <p className="text-xs text-gray-200 font-bold mt-1">قادمة</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition">
              <p className="text-3xl font-black text-red-300 flex items-center justify-center gap-2">
                {stats.liveCount > 0 && <span className="w-2 h-2 bg-red-400 rounded-full live-dot"></span>}
                {stats.liveCount}
              </p>
              <p className="text-xs text-gray-200 font-bold mt-1">مباشر</p>
            </div>
            <div className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 hover:bg-white/20 transition">
              <p className="text-3xl font-black text-gray-200">{stats.finishedCount}</p>
              <p className="text-xs text-gray-200 font-bold mt-1">منتهية</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-black text-primary mb-4 flex items-center gap-3">
          <span className="w-1 h-6 bg-secondary rounded"></span>
          إجراءات سريعة
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/news/create" className="btn-primary flex items-center gap-2">
            <FaPlus /> خبر جديد
          </Link>
          <Link to="/admin/videos/create" className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2">
            <FaPlus /> فيديو جديد
          </Link>
          <Link to="/admin/players/create" className="bg-primary-light text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition flex items-center gap-2">
            <FaPlus /> لاعب جديد
          </Link>
          <Link to="/admin/matches/create" className="bg-primary-dark text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition flex items-center gap-2">
            <FaPlus /> مباراة جديدة
          </Link>
          <Link to="/admin/elections" className="bg-secondary text-primary px-6 py-3 rounded-lg font-bold hover:bg-secondary-light transition flex items-center gap-2">
            <FaVoteYea /> إدارة الانتخابات
          </Link>
          <Link to="/admin/messages" className="bg-primary-light text-white px-6 py-3 rounded-lg font-bold hover:bg-primary transition flex items-center gap-2 relative">
            <FaEnvelope /> الرسائل
            {stats.newMessagesCount > 0 && (
              <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {stats.newMessagesCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.recentMessages.length > 0 && (
          <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-primary flex items-center gap-3">
                <span className="w-1 h-6 bg-secondary rounded"></span>
                آخر الرسائل
                {stats.newMessagesCount > 0 && (
                  <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                    {stats.newMessagesCount} جديدة
                  </span>
                )}
              </h2>
              <Link to="/admin/messages" className="text-primary text-sm font-bold hover:text-secondary">
                عرض الكل ←
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.recentMessages.slice(0, 4).map((msg) => (
                <Link
                  key={msg._id}
                  to="/admin/messages"
                  className={`p-4 rounded-lg border-2 hover:shadow-md transition ${
                    msg.status === 'new'
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-black text-xs">
                      {msg.senderName?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-primary text-sm truncate">{msg.senderName}</p>
                      <p className="text-xs text-gray-500">
                        {subjectNames[msg.subject] || msg.subject}
                      </p>
                    </div>
                    {msg.status === 'new' && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{msg.content}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-xl shadow-md lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-primary flex items-center gap-3">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              آخر المباريات
            </h2>
            <Link to="/admin/matches" className="text-primary text-sm font-bold hover:text-secondary">
              عرض الكل ←
            </Link>
          </div>

          {stats.recentMatches.length === 0 ? (
            <div className="text-center py-8">
              <FaFutbol className="text-5xl text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">لا توجد مباريات بعد</p>
              <Link to="/admin/matches/create" className="btn-primary inline-flex items-center gap-2 mt-4">
                <FaPlus /> أضف أول مباراة
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="p-3 text-right text-xs font-bold">المنافس</th>
                    <th className="p-3 text-right text-xs font-bold">البطولة</th>
                    <th className="p-3 text-right text-xs font-bold">النتيجة</th>
                    <th className="p-3 text-right text-xs font-bold">التاريخ</th>
                    <th className="p-3 text-right text-xs font-bold">الحالة</th>
                    <th className="p-3 text-right text-xs font-bold">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentMatches.map((match) => {
                    const badge = getMatchStatusBadge(match.status);
                    const isFinished = match.status === 'finished';
                    const result = isFinished && match.ourScore !== null && match.opponentScore !== null
                      ? (match.ourScore > match.opponentScore ? 'W' : match.ourScore < match.opponentScore ? 'L' : 'D')
                      : null;

                    return (
                      <tr key={match._id} className="border-t hover:bg-gray-50 transition">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                              {match.opponentLogo ? (
                                <img
                                  src={getImageUrl(match.opponentLogo)}
                                  alt={match.opponent}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.style.display = 'none'; }}
                                />
                              ) : (
                                <span className="text-primary font-black text-xs">
                                  {match.opponent.charAt(0)}
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-sm text-primary truncate max-w-[150px]">
                              {match.opponent}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-gray-600">
                            {match.competitionName || match.competition}
                          </span>
                        </td>
                        <td className="p-3">
                          {isFinished || match.status === 'live' ? (
                            <div className="flex items-center gap-2">
                              <span className={`font-black ${match.ourScore > match.opponentScore ? 'text-green-600' : match.ourScore < match.opponentScore ? 'text-red-600' : 'text-gray-600'}`}>
                                {match.ourScore} - {match.opponentScore}
                              </span>
                              {result && (
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                                  result === 'W' ? 'bg-green-500' : result === 'L' ? 'bg-red-500' : 'bg-yellow-500'
                                }`}>
                                  {result}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">لم تبدأ</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="text-xs text-gray-500">
                            {new Date(match.date).toLocaleDateString('ar-EG')}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`${badge.color} px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1`}>
                            {match.status === 'live' && <span className="w-1.5 h-1.5 bg-red-500 rounded-full live-dot"></span>}
                            {badge.text}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Link
                              to={`/matches/${match._id}`}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              title="عرض"
                            >
                              <FaEye />
                            </Link>
                            <Link
                              to={`/admin/matches/edit/${match._id}`}
                              className="text-primary hover:text-primary-light text-sm"
                              title="تعديل"
                            >
                              <FaEdit />
                            </Link>
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

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-primary flex items-center gap-3">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              آخر الأخبار
            </h2>
            <Link to="/admin/news" className="text-primary text-sm font-bold hover:text-secondary">
              عرض الكل ←
            </Link>
          </div>
          {stats.recent.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد أخبار</p>
          ) : (
            <div className="space-y-3">
              {stats.recent.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary truncate text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <Link to={`/admin/news/edit/${item._id}`} className="text-primary hover:text-secondary font-bold ml-3 text-sm">
                    تعديل
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-black text-primary flex items-center gap-3">
              <span className="w-1 h-6 bg-secondary rounded"></span>
              آخر الفيديوهات
            </h2>
            <Link to="/admin/videos" className="text-primary text-sm font-bold hover:text-secondary">
              عرض الكل ←
            </Link>
          </div>
          {stats.recentVideos.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا توجد فيديوهات</p>
          ) : (
            <div className="space-y-3">
              {stats.recentVideos.map((item) => (
                <div key={item._id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-primary truncate text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <Link to={`/admin/videos/edit/${item._id}`} className="text-primary hover:text-secondary font-bold ml-3 text-sm">
                    تعديل
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;