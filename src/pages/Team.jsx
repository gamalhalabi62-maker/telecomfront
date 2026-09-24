import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUsers, FaShieldAlt, FaFutbol, FaRunning,
  FaChevronRight, FaChevronLeft, FaTrophy,
} from 'react-icons/fa';
import { playerAPI } from '../services/api';
import Loading from '../components/Loading';
import { getImageUrl } from '../utils/formatDate';

const positionNames = {
  goalkeeper: 'حارس مرمى',
  defender: 'مدافع',
  midfielder: 'وسط',
  forward: 'مهاجم',
};

const positionColors = {
  goalkeeper: {
    from: '#FBC02D',
    to: '#7B1FA2',
    glow: 'rgba(123, 31, 162, 0.6)',
    shadow: 'rgba(74, 20, 140, 0.5)',
  },
  defender: {
    from: '#6A1B9A',
    to: '#311B92',
    glow: 'rgba(106, 27, 154, 0.6)',
    shadow: 'rgba(49, 27, 146, 0.5)',
  },
  midfielder: {
    from: '#8E24AA',
    to: '#4A148C',
    glow: 'rgba(142, 36, 170, 0.6)',
    shadow: 'rgba(74, 20, 140, 0.5)',
  },
  forward: {
    from: '#9C27B0',
    to: '#1A237E',
    glow: 'rgba(156, 39, 176, 0.6)',
    shadow: 'rgba(26, 35, 126, 0.5)',
  },
};


const PlayerSliderCard = ({ player }) => {
  const cardRef = useRef(null);
  const navigate = useNavigate();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinProgress, setSpinProgress] = useState(0);

  const positionStyle = positionColors[player.position];

  const handleMouseMove = (e) => {
    if (!cardRef.current || isSpinning) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const tiltX = ((y - centerY) / centerY) * -12;
    const tiltY = ((x - centerX) / centerX) * 12;

    setTilt({ x: tiltX, y: tiltY });
    setGlowPos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlowPos({ x: 50, y: 50 });
    setIsHovered(false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (isSpinning) return;

    setIsSpinning(true);
    setTilt({ x: 0, y: 0 });

    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      setSpinProgress(eased * 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setTimeout(() => {
          navigate(`/team/${player._id}`);
        }, 100);
      }
    };

    requestAnimationFrame(animate);
  };

  return (
    <div
      className="flex-shrink-0 w-[280px] md:w-[320px] snap-center"
      style={{ perspective: '1500px' }}
    >
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => !isSpinning && setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="relative h-[440px] md:h-[500px] rounded-3xl overflow-hidden cursor-pointer"
        style={{
          transform: isSpinning
            ? `rotateY(${spinProgress}deg) scale(${isHovered ? 1.05 : 1})`
            : `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale(${isHovered ? 1.05 : 1})`,
          transformStyle: 'preserve-3d',
          background: `linear-gradient(135deg, ${positionStyle.from}, ${positionStyle.to})`,
          boxShadow: isHovered
            ? `0 30px 60px -15px ${positionStyle.shadow}, 0 0 40px ${positionStyle.glow}`
            : `0 20px 40px -15px ${positionStyle.shadow}`,
          transition: isSpinning
            ? 'box-shadow 0.3s ease-out'
            : 'transform 0.3s ease-out, box-shadow 0.3s ease-out',
        }}
      >
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.7 : 0.4,
            background: `radial-gradient(circle at ${glowPos.x}% ${glowPos.y}%, ${positionStyle.glow} 0%, transparent 60%)`,
            backfaceVisibility: 'hidden',
          }}
        ></div>

        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full blur-3xl"></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
              backgroundSize: '20px 20px',
            }}
          ></div>
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{
            transform: isSpinning
              ? 'translateZ(-80px)'
              : `translateZ(-80px) translateY(${tilt.x * 0.5}px)`,
            transition: 'transform 0.3s ease-out',
            backfaceVisibility: 'hidden',
          }}
        >
          <span
            className="text-[22rem] md:text-[26rem] font-black leading-none opacity-[0.12]"
            style={{ color: 'white', fontFamily: 'Impact, sans-serif' }}
          >
            {player.number}
          </span>
        </div>

        <div
          className="absolute inset-0 flex items-end justify-center pt-24"
          style={{
            transform: isSpinning
              ? 'translateZ(40px)'
              : `translateZ(40px) translateX(${tilt.y * 0.8}px) translateY(${tilt.x * 0.5}px)`,
            transition: 'transform 0.3s ease-out',
            backfaceVisibility: 'hidden',
          }}
        >
          {player.imageUrl ? (
            <img
              src={getImageUrl(player.imageUrl)}
              alt={player.name}
              className="h-[88%] object-contain object-bottom"
              style={{
                filter: isHovered
                  ? `drop-shadow(0 25px 35px rgba(0,0,0,0.6)) drop-shadow(0 0 30px ${positionStyle.glow}) brightness(1.05)`
                  : `drop-shadow(0 15px 20px ${positionStyle.shadow})`,
                transition: 'filter 0.3s ease-out',
              }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : (
            <div className="flex items-center justify-center h-full opacity-30">
              <FaUsers className="text-white text-[10rem]" />
            </div>
          )}
        </div>

        {player.isCaptain && (
          <div
            className="absolute top-5 left-5 bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-900 px-3 py-2 rounded-full text-xs font-black shadow-xl flex items-center gap-1.5 z-30"
            style={{
              transform: isSpinning
                ? 'translateZ(80px)'
                : `translateZ(80px) translateY(${tilt.x * 0.3}px)`,
              transition: 'transform 0.3s ease-out',
              animation: isSpinning ? 'none' : 'float 3s ease-in-out infinite',
              backfaceVisibility: 'hidden',
            }}
          >
            <FaTrophy className="text-xs" /> القائد
          </div>
        )}

        <div
          className="absolute top-5 right-5 bg-white/25 backdrop-blur-lg text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/30 z-30"
          style={{
            transform: isSpinning
              ? 'translateZ(60px)'
              : `translateZ(60px) translateY(${tilt.x * 0.4}px)`,
            transition: 'transform 0.3s ease-out',
            backfaceVisibility: 'hidden',
          }}
        >
          {positionNames[player.position]}
        </div>

        <div
          className="absolute top-1/2 right-4 -translate-y-1/2 z-20"
          style={{
            transform: isSpinning
              ? 'translateZ(100px) translateY(-50%)'
              : `translateZ(100px) translateY(-50%) translateX(${tilt.y * 1.2}px) rotateZ(${isHovered ? -8 : 0}deg)`,
            transition: 'transform 0.4s ease-out',
            backfaceVisibility: 'hidden',
          }}
        >
          <div
            className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center font-black text-3xl md:text-4xl text-white shadow-2xl border-2 border-white/40"
            style={{
              background: `linear-gradient(135deg, ${positionStyle.from}, ${positionStyle.to})`,
              boxShadow: `0 15px 30px ${positionStyle.shadow}, inset 0 0 20px rgba(255,255,255,0.2)`,
            }}
          >
            {player.number}
          </div>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 p-6 z-20"
          style={{
            transform: isSpinning ? 'translateZ(50px)' : 'translateZ(50px)',
            background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.8) 60%, transparent 100%)',
            backfaceVisibility: 'hidden',
          }}
        >
          <h3 className="text-white font-black text-xl md:text-2xl mb-2 line-clamp-1">
            {player.name}
          </h3>

          <div className="flex items-center justify-between text-xs">
            <span className="text-white/80 flex items-center gap-1">
              🌍 {player.nationality}
            </span>
            {player.stats?.goals > 0 && (
              <span className="text-yellow-300 font-black flex items-center gap-1">
                <FaFutbol /> {player.stats.goals}
              </span>
            )}
          </div>

          <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: isHovered && !isSpinning ? '100%' : '0%',
                background: `linear-gradient(to left, #FBC02D, ${positionStyle.from})`,
              }}
            ></div>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            border: `2px solid ${positionStyle.from}`,
            boxShadow: `inset 0 0 40px ${positionStyle.glow}`,
            backfaceVisibility: 'hidden',
          }}
        ></div>

        {isHovered && !isSpinning && (
          <div
            className="absolute w-2 h-2 bg-white rounded-full pointer-events-none"
            style={{
              left: `${glowPos.x}%`,
              top: `${glowPos.y}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: `0 0 20px 8px ${positionStyle.glow}`,
              animation: 'pulse-glow 1.5s ease-in-out infinite',
              backfaceVisibility: 'hidden',
            }}
          ></div>
        )}

        {isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center z-40">
            <div className="bg-white/20 backdrop-blur-lg px-6 py-3 rounded-full text-white font-black">
              جاري الفتح...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


const PlayerSectionSlider = ({ title, icon, players }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const isAtStart = Math.abs(scrollLeft) < 10;
    const isAtEnd = Math.abs(scrollLeft) + clientWidth >= scrollWidth - 10;
    setCanScrollRight(!isAtStart);
    setCanScrollLeft(!isAtEnd);
  };

  useEffect(() => {
    checkScrollButtons();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScrollButtons);
      return () => ref.removeEventListener('scroll', checkScrollButtons);
    }
  }, [players]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 340;
      scrollRef.current.scrollBy({
        left: direction === 'next' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (players.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-md text-center mb-12">
        <FaUsers className="text-5xl text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-bold">لا يوجد لاعبون في هذا القسم</p>
      </div>
    );
  }

  return (
    <div className="mb-16">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg">
            {icon}
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-primary flex items-center gap-3">
              {title}
              <span className="bg-secondary text-primary text-sm px-3 py-1 rounded-full font-bold">
                {players.length}
              </span>
            </h2>
            <p className="text-gray-500 text-sm">💡 اضغط على لاعب للدخول • اسحب للاستكشاف</p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => scroll('prev')}
            disabled={!canScrollRight}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              canScrollRight
                ? 'bg-white shadow-lg hover:bg-primary hover:text-white hover:scale-110'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="السابق"
          >
            <FaChevronRight />
          </button>
          <button
            onClick={() => scroll('next')}
            disabled={!canScrollLeft}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
              canScrollLeft
                ? 'bg-white shadow-lg hover:bg-primary hover:text-white hover:scale-110'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
            aria-label="التالي"
          >
            <FaChevronLeft />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-hide snap-x snap-mandatory px-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {players.map((player) => (
          <PlayerSliderCard key={player._id} player={player} />
        ))}
      </div>

      <div className="flex md:hidden justify-center gap-3 mt-4">
        <button
          onClick={() => scroll('prev')}
          disabled={!canScrollRight}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            canScrollRight ? 'bg-primary text-white' : 'bg-gray-100 text-gray-300'
          }`}
        >
          <FaChevronRight />
        </button>
        <button
          onClick={() => scroll('next')}
          disabled={!canScrollLeft}
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            canScrollLeft ? 'bg-primary text-white' : 'bg-gray-100 text-gray-300'
          }`}
        >
          <FaChevronLeft />
        </button>
      </div>
    </div>
  );
};


const Team = () => {
  const [grouped, setGrouped] = useState({
    goalkeeper: [],
    defender: [],
    midfielder: [],
    forward: [],
  });
  const [stats, setStats] = useState({ totalPlayers: 0, totalGoals: 0 });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, statsRes] = await Promise.all([
          playerAPI.getByPosition(),
          playerAPI.getStats(),
        ]);
        setGrouped(playersRes.data);
        setStats(statsRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const sections = [
    { key: 'all', label: 'جميع اللاعبين', icon: <FaUsers /> },
    { key: 'goalkeeper', label: 'حراس المرمى', icon: <FaShieldAlt /> },
    { key: 'defender', label: 'المدافعون', icon: <FaShieldAlt /> },
    { key: 'midfielder', label: 'لاعبو الوسط', icon: <FaRunning /> },
    { key: 'forward', label: 'المهاجمون', icon: <FaFutbol /> },
  ];

  const allPlayers = [
    ...grouped.goalkeeper,
    ...grouped.defender,
    ...grouped.midfielder,
    ...grouped.forward,
  ];

  if (loading) return <Loading />;

  return (
    <div className="bg-gray-50 min-h-screen overflow-x-hidden">
      {/* Hero Header */}
      <section className="bg-gradient-to-l from-primary via-primary-light to-primary-dark text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="container-custom text-center relative z-10">
          <div className="flex justify-center mb-4">
  <img
    src="/logo.jpeg"
    alt="نادي المصرية للاتصالات"
    className="w-28 h-28 md:w-36 md:h-36 object-contain drop-shadow-2xl animate-float"
  />
</div>
          <h1 className="text-4xl md:text-7xl font-black mb-4">
            فريق <span className="text-secondary">النادي</span>
          </h1>
          <p className="text-gray-200 text-lg">تعرف على نجوم الفريق الأول</p>

          <div className="flex justify-center gap-8 mt-8 flex-wrap">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-secondary">{stats.totalPlayers}</p>
              <p className="text-sm text-gray-300 font-bold mt-1">لاعب</p>
            </div>
            <div className="w-px bg-white/30"></div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-secondary">{stats.totalGoals}</p>
              <p className="text-sm text-gray-300 font-bold mt-1">هدف</p>
            </div>
            <div className="w-px bg-white/30"></div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-black text-secondary">4</p>
              <p className="text-sm text-gray-300 font-bold mt-1">مراكز</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white shadow-md sticky top-20 z-20">
        <div className="container-custom py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {sections.map((sec) => (
              <button
                key={sec.key}
                onClick={() => setActiveSection(sec.key)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                  activeSection === sec.key
                    ? 'bg-gradient-to-l from-primary to-primary-dark text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {sec.icon}
                {sec.label}
                {sec.key !== 'all' && grouped[sec.key]?.length > 0 && (
                  <span className={`px-2 rounded-full text-xs ${
                    activeSection === sec.key ? 'bg-white/30' : 'bg-primary/10 text-primary'
                  }`}>
                    {grouped[sec.key].length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container-custom py-12">
        {activeSection !== 'all' && (
          <PlayerSectionSlider
            title={sections.find(s => s.key === activeSection)?.label}
            icon={sections.find(s => s.key === activeSection)?.icon}
            players={grouped[activeSection] || []}
          />
        )}

        {activeSection === 'all' && (
          <>
            {grouped.goalkeeper.length > 0 && (
              <PlayerSectionSlider title="حراس المرمى" icon={<FaShieldAlt />} players={grouped.goalkeeper} />
            )}
            {grouped.defender.length > 0 && (
              <PlayerSectionSlider title="المدافعون" icon={<FaShieldAlt />} players={grouped.defender} />
            )}
            {grouped.midfielder.length > 0 && (
              <PlayerSectionSlider title="لاعبو الوسط" icon={<FaRunning />} players={grouped.midfielder} />
            )}
            {grouped.forward.length > 0 && (
              <PlayerSectionSlider title="المهاجمون" icon={<FaFutbol />} players={grouped.forward} />
            )}
          </>
        )}

        {allPlayers.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-md">
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-bold mb-2">لا يوجد لاعبون حالياً</p>
            <p className="text-gray-400 text-sm">سيتم إضافة اللاعبين قريباً</p>
          </div>
        )}
      </section>

      <section className="container-custom pb-16">
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4">
              انضم إلى <span className="text-secondary">فريقنا</span>
            </h2>
            <p className="text-gray-200 mb-8 text-lg max-w-2xl mx-auto">
              كن جزءاً من عائلة نادي المصرية للاتصالات
            </p>
            <Link to="/contact" className="btn-secondary inline-block text-lg px-10 py-4">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;