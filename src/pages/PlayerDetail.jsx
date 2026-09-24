import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  FaArrowRight, FaFutbol, FaTrophy, FaBirthdayCake,
  FaRulerVertical, FaWeight, FaFlag, FaShieldAlt,
} from 'react-icons/fa';
import { playerAPI } from '../services/api';
import Loading from '../components/Loading';
import PlayerCard from '../components/PlayerCard';
import { getImageUrl, formatDate } from '../utils/formatDate';

const positionNames = {
  goalkeeper: 'حارس مرمى',
  defender: 'مدافع',
  midfielder: 'وسط',
  forward: 'مهاجم',
};

const PlayerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const { data } = await playerAPI.getById(id);
        setPlayer(data);
      } catch (err) {
        setError('اللاعب غير موجود');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [id]);

  if (loading) return <Loading />;

  if (error) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-4xl font-black text-primary mb-4">عذراً</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate('/team')} className="btn-primary">
          العودة للفريق
        </button>
      </div>
    );
  }

  const stats = player.stats || {};

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-primary">الرئيسية</Link>
            <span>›</span>
            <Link to="/team" className="hover:text-primary">الفريق</Link>
            <span>›</span>
            <span className="text-primary font-bold">{player.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white py-12 md:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Player Image */}
            <div className="md:col-span-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-8 border-secondary shadow-2xl bg-white/10 backdrop-blur-md">
                  {player.imageUrl ? (
                    <img
                      src={getImageUrl(player.imageUrl)}
                      alt={player.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/50 text-9xl font-black">{player.number}</span>
                    </div>
                  )}
                </div>
                {/* Number Badge */}
                <div className="absolute -bottom-4 right-1/2 translate-x-1/2 w-24 h-24 bg-secondary text-primary rounded-full flex items-center justify-center font-black text-4xl shadow-2xl border-4 border-white">
                  {player.number}
                </div>
                {/* Captain Badge */}
                {player.isCaptain && (
                  <div className="absolute -top-2 -right-2 bg-yellow-500 text-white px-4 py-2 rounded-full font-black text-sm shadow-lg flex items-center gap-1">
                    <FaTrophy /> القائد
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-2 text-center md:text-right">
              <span className="bg-secondary text-primary px-4 py-1.5 rounded-full text-sm font-black inline-block mb-4">
                {positionNames[player.position]}
              </span>
              <h1 className="text-4xl md:text-6xl font-black mb-4">
                {player.name}
              </h1>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start text-sm">
                <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                  <FaFlag /> {player.nationality}
                </span>
                {player.height && (
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <FaRulerVertical /> {player.height} سم
                  </span>
                )}
                {player.weight && (
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <FaWeight /> {player.weight} كجم
                  </span>
                )}
                {player.birthDate && (
                  <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full">
                    <FaBirthdayCake /> {formatDate(player.birthDate)}
                  </span>
                )}
              </div>

              {player.bio && (
                <p className="text-gray-200 mt-6 max-w-2xl leading-relaxed">
                  {player.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container-custom py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl md:text-3xl font-black text-primary mb-6 flex items-center gap-3">
            <span className="w-1 h-8 bg-secondary rounded"></span>
            إحصائيات اللاعب
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: 'المشاركات', value: stats.appearances || 0, icon: <FaShieldAlt />, color: 'bg-primary' },
              { label: 'الأهداف', value: stats.goals || 0, icon: <FaFutbol />, color: 'bg-green-500' },
              { label: 'صناعة الأهداف', value: stats.assists || 0, icon: <FaFutbol />, color: 'bg-blue-500' },
              { label: 'بطاقات صفراء', value: stats.yellowCards || 0, icon: <FaTrophy />, color: 'bg-yellow-500' },
              { label: 'بطاقات حمراء', value: stats.redCards || 0, icon: <FaTrophy />, color: 'bg-red-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                <div className={`w-12 h-12 ${stat.color} text-white rounded-full flex items-center justify-center mx-auto mb-3`}>
                  {stat.icon}
                </div>
                <p className="text-3xl font-black text-primary">{stat.value}</p>
                <p className="text-sm text-gray-600 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Players */}
      {player.related && player.related.length > 0 && (
        <section className="container-custom pb-12">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-black text-primary mb-6 flex items-center gap-3">
              <span className="w-1 h-8 bg-secondary rounded"></span>
              لاعبون في نفس المركز
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {player.related.map((p) => (
                <PlayerCard key={p._id} player={p} variant="compact" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back */}
      <div className="container-custom pb-16 text-center">
        <Link
          to="/team"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-dark transition shadow-lg"
        >
          <FaArrowRight /> العودة للفريق
        </Link>
      </div>
    </div>
  );
};

export default PlayerDetail;