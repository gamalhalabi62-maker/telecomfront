import { useEffect, useState } from 'react';
import {
  FaNewspaper, FaEye, FaTrophy, FaUsers, FaFutbol,
  FaStar, FaCalendar, FaMedal, FaBullseye, FaAward,
} from 'react-icons/fa';
import { statisticAPI } from '../services/api';
import AnimatedCounter from './AnimatedCounter';

const iconMap = {
  trophy: <FaTrophy />,
  users: <FaUsers />,
  football: <FaFutbol />,
  newspaper: <FaNewspaper />,
  star: <FaStar />,
  calendar: <FaCalendar />,
  eye: <FaEye />,
  medal: <FaMedal />,
  target: <FaBullseye />,
  award: <FaAward />,
};

const colorMap = {
  primary: 'from-primary to-primary-light',
  secondary: 'from-secondary to-yellow-400',
  blue: 'from-blue-500 to-blue-700',
  green: 'from-green-500 to-green-700',
  red: 'from-red-500 to-red-700',
  orange: 'from-orange-500 to-orange-700',
  purple: 'from-purple-500 to-purple-700',
  pink: 'from-pink-500 to-pink-700',
  cyan: 'from-cyan-500 to-cyan-700',
  indigo: 'from-indigo-500 to-indigo-700',
};

const StatsSection = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await statisticAPI.getAll({ active: 'true' });
        setStats(data.statistics || []);
      } catch (error) {
        console.error(error);
        setStats([
          { _id: '1', icon: 'trophy', value: 45, label: 'بطولة', suffix: '', color: 'secondary' },
          { _id: '2', icon: 'users', value: 1200, label: 'عضو', suffix: '', color: 'primary' },
          { _id: '3', icon: 'football', value: 12, label: 'فريق رياضي', suffix: '', color: 'primary-light' },
          { _id: '4', icon: 'newspaper', value: 30, label: 'سنة خبرة', suffix: '', color: 'primary-dark' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <section className="bg-gradient-to-l from-primary-dark to-primary py-16">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4"></div>
                <div className="h-8 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-1/2 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (stats.length === 0) return null;

  return (
    <section className="bg-gradient-to-l from-primary-dark via-primary to-primary-dark py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="container-custom relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-2">
            أرقام <span className="text-secondary">تتحدث</span>
          </h2>
          <p className="text-gray-300">إحصائيات مباشرة من الموقع</p>
        </div>

        <div className={`grid grid-cols-2 md:grid-cols-${Math.min(stats.length, 4)} gap-6`}>
          {stats.map((stat, i) => {
            const icon = iconMap[stat.icon] || iconMap.trophy;
            const gradient = colorMap[stat.color] || colorMap.primary;

            return (
              <div
                key={stat._id}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center hover:bg-white/20 transition group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white text-2xl group-hover:scale-110 transition shadow-lg`}>
                  {icon}
                </div>

                <div className="text-4xl md:text-5xl font-black text-white mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>

                <div className="text-gray-200 font-bold">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;