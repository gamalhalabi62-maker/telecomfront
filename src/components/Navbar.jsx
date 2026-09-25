import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  FaBars, FaTimes, FaUser, FaSignOutAlt, FaEnvelope,
  FaBell, FaVoteYea, FaTrophy, FaHome, FaNewspaper,
  FaFutbol, FaVideo, FaUsers, FaCalendarAlt, FaHeadset,
  FaChevronDown, FaCog, FaShieldAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const navLinks = [
    { to: '/', label: 'الرئيسية', icon: <FaHome /> },
    { to: '/news', label: 'الأخبار', icon: <FaNewspaper /> },
    { to: '/second-division', label: 'الدوري الثاني', icon: <FaTrophy />, highlight: true },
    { to: '/matches', label: 'المباريات', icon: <FaCalendarAlt /> },
    { to: '/videos', label: 'الفيديوهات', icon: <FaVideo /> },
    { to: '/team', label: 'الفريق', icon: <FaUsers /> },
    { to: '/elections', label: 'الانتخابات', icon: <FaVoteYea /> },
    { to: '/contact', label: 'اتصل بنا', icon: <FaHeadset /> },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = () => {
    setUserMenuOpen(false);
    setIsOpen(false);
    logout();
    navigate('/');
  };

  return (
    <>
      <nav
        className={`bg-primary text-white shadow-lg sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? 'shadow-2xl backdrop-blur-md bg-primary/95' : ''
        }`}
      >
        <div className="container-custom">
          <div className={`flex justify-between items-center transition-all duration-300 ${
            scrolled ? 'h-16' : 'h-20'
          }`}>

            <Logo size={scrolled ? 'sm' : 'md'} />

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `relative group px-3 xl:px-4 py-2 rounded-lg font-bold text-sm xl:text-base transition-all duration-200 flex items-center gap-2 ${
                      isActive
                        ? 'text-secondary bg-white/10'
                        : link.highlight
                        ? 'text-secondary/90 hover:text-secondary hover:bg-white/5'
                        : 'text-white/90 hover:text-secondary hover:bg-white/5'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className="text-xs xl:text-sm">{link.icon}</span>
                      <span>{link.label}</span>
                      {link.highlight && !isActive && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                      )}
                      {isActive && (
                        <span className="absolute bottom-0 right-3 left-3 h-0.5 bg-secondary rounded-full"></span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <NotificationBell />

                  <Link
                    to="/my-messages"
                    className="relative w-10 h-10 bg-white/10 hover:bg-secondary hover:text-primary rounded-full flex items-center justify-center transition-all duration-200 group"
                    title="رسائلي"
                  >
                    <FaEnvelope className="text-base group-hover:scale-110 transition" />
                  </Link>

                  {isStaff && (
                    <Link
                      to="/admin"
                      className="bg-secondary text-primary px-4 py-2 rounded-lg font-bold hover:bg-secondary/90 hover:shadow-lg transition-all duration-200 text-sm flex items-center gap-2"
                    >
                      <FaShieldAlt className="text-xs" />
                      لوحة التحكم
                    </Link>
                  )}

                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all duration-200"
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-secondary to-secondary/80 text-primary rounded-full flex items-center justify-center font-black text-sm shadow-md">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm hidden xl:inline max-w-[100px] truncate">
                        {user.name}
                      </span>
                      <FaChevronDown
                        className={`text-xs transition-transform duration-200 ${
                          userMenuOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute left-0 top-full mt-2 w-56 bg-white text-primary rounded-xl shadow-2xl overflow-hidden animate-fade-in border border-gray-100">
                        <div className="p-4 bg-gradient-to-l from-primary to-primary-dark text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center font-black text-lg">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-200 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        <div className="py-2">
                          <Link
                            to="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-sm font-bold"
                          >
                            <FaUser className="text-primary" />
                            حسابي
                          </Link>

                          <Link
                            to="/my-messages"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-sm font-bold"
                          >
                            <FaEnvelope className="text-primary" />
                            رسائلي
                          </Link>

                          <Link
                            to="/notifications"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-sm font-bold"
                          >
                            <FaBell className="text-primary" />
                            الإشعارات
                          </Link>

                          {isStaff && (
                            <Link
                              to="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-sm font-bold"
                            >
                              <FaCog className="text-primary" />
                              لوحة التحكم
                            </Link>
                          )}
                        </div>

                        <div className="border-t border-gray-100 py-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition text-sm font-bold text-red-600"
                          >
                            <FaSignOutAlt />
                            تسجيل خروج
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="text-white hover:text-secondary transition font-bold text-sm px-3 py-2"
                  >
                    إنشاء حساب
                  </Link>
                  <Link
                    to="/login"
                    className="bg-secondary text-primary px-5 py-2.5 rounded-lg font-bold hover:bg-secondary/90 hover:shadow-lg transition-all duration-200 text-sm"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-2">
              {user && <NotificationBell />}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition text-xl"
                aria-label="Toggle menu"
              >
                {isOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-primary text-white z-50 lg:hidden transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } overflow-y-auto`}
      >
        <div className="sticky top-0 bg-primary border-b border-white/10 p-4 flex items-center justify-between z-10">
          <Logo size="sm" />
          <button
            onClick={() => setIsOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/10 transition text-xl"
            aria-label="Close menu"
          >
            <FaTimes />
          </button>
        </div>

        {user && (
          <div className="p-4 bg-gradient-to-l from-primary-light to-primary">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-secondary text-primary rounded-full flex items-center justify-center font-black text-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-200 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4">
          <p className="text-xs font-black text-secondary mb-3 px-2">القائمة الرئيسية</p>
          <div className="space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-3 rounded-lg font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-secondary text-primary'
                      : 'hover:bg-white/10'
                  }`
                }
              >
                <span className="text-sm">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </div>

          {user && (
            <>
              <p className="text-xs font-black text-secondary mb-3 px-2 mt-6">حسابي</p>
              <div className="space-y-1">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg font-bold hover:bg-white/10 transition"
                >
                  <FaUser className="text-sm" />
                  الملف الشخصي
                </Link>
                <Link
                  to="/my-messages"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg font-bold hover:bg-white/10 transition"
                >
                  <FaEnvelope className="text-sm" />
                  رسائلي
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 py-3 px-3 rounded-lg font-bold hover:bg-white/10 transition"
                >
                  <FaBell className="text-sm" />
                  الإشعارات
                </Link>
                {isStaff && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 py-3 px-3 rounded-lg font-bold bg-secondary text-primary hover:bg-secondary/90 transition"
                  >
                    <FaShieldAlt className="text-sm" />
                    لوحة التحكم
                  </Link>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-bold transition"
              >
                <FaSignOutAlt />
                تسجيل خروج
              </button>
            </>
          )}

          {!user && (
            <div className="mt-6 space-y-2">
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="block bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-lg font-bold text-center transition"
              >
                إنشاء حساب
              </Link>
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="block bg-secondary text-primary py-3 px-4 rounded-lg font-bold text-center hover:bg-secondary/90 transition"
              >
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;