import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaEnvelope, FaBell } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin, isStaff } = useAuth();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: 'الرئيسية' },
    { to: '/news', label: 'الأخبار' },
    { to: '/videos', label: 'الفيديوهات' },
    { to: '/team', label: 'الفريق' },
    { to: '/matches', label: 'المباريات' },
    { to: '/contact', label: 'اتصل بنا' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary text-white shadow-2xl sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20">
          <Logo size="md" />

          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-bold transition-colors duration-300 hover:text-secondary ${
                    isActive ? 'text-secondary border-b-2 border-secondary pb-1' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                <NotificationBell />

                <Link
                  to="/my-messages"
                  className="relative w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition group"
                  title="رسائلي"
                >
                  <FaEnvelope className="text-white text-lg group-hover:scale-110 transition" />
                </Link>

                {isStaff && (
                  <Link
                    to="/admin"
                    className="bg-secondary text-primary px-4 py-2 rounded-lg font-bold hover:bg-secondary-light transition"
                  >
                    لوحة التحكم
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="flex items-center gap-2 hover:text-secondary transition"
                  title="حسابي"
                >
                  <div className="w-9 h-9 bg-secondary text-primary rounded-full flex items-center justify-center font-black">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-sm hidden xl:inline">{user.name}</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="text-secondary hover:text-white transition"
                  title="تسجيل خروج"
                >
                  <FaSignOutAlt size={20} />
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="text-white hover:text-secondary transition font-bold"
                >
                  إنشاء حساب
                </Link>
                <Link
                  to="/login"
                  className="bg-secondary text-primary px-6 py-2 rounded-lg font-bold hover:bg-secondary-light transition"
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
              className="text-2xl"
            >
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="lg:hidden py-4 border-t border-primary-light animate-fade-in">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block py-3 px-4 font-bold hover:bg-primary-light rounded-lg ${
                    isActive ? 'bg-primary-light text-secondary' : ''
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="mt-4 px-4">
              {user ? (
                <>
                  <Link
                    to="/my-messages"
                    onClick={() => setIsOpen(false)}
                    className="block bg-white/10 text-white px-4 py-3 rounded-lg font-bold text-center mb-2"
                  >
                    📬 رسائلي
                  </Link>
                  <Link
                    to="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="block bg-white/10 text-white px-4 py-3 rounded-lg font-bold text-center mb-2"
                  >
                    🔔 الإشعارات
                  </Link>
                  {isStaff && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="block bg-secondary text-primary px-4 py-3 rounded-lg font-bold text-center mb-2"
                    >
                      لوحة التحكم
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-lg font-bold"
                  >
                    تسجيل خروج ({user.name})
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    onClick={() => setIsOpen(false)}
                    className="block bg-white/10 text-white px-4 py-3 rounded-lg font-bold text-center mb-2"
                  >
                    إنشاء حساب
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="block bg-secondary text-primary px-4 py-3 rounded-lg font-bold text-center"
                  >
                    تسجيل الدخول
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;