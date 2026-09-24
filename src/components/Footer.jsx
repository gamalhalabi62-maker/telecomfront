import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-primary-dark text-white mt-16">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo size="md" showText={true} />
            </div>
            <p className="text-gray-300 leading-relaxed mt-4">
              الموقع الرسمي لنادي المصرية للاتصالات. تابع آخر الأخبار والمباريات والفعاليات.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-secondary">روابط سريعة</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-secondary transition">الرئيسية</a></li>
              <li><a href="/news" className="text-gray-300 hover:text-secondary transition">الأخبار</a></li>
              <li><a href="/team" className="text-gray-300 hover:text-secondary transition">الفريق</a></li>
              <li><a href="/matches" className="text-gray-300 hover:text-secondary transition">المباريات</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-secondary transition">اتصل بنا</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-secondary">تواصل معنا</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-gray-300">
                <FaMapMarkerAlt className="text-secondary" />
                <span>مدينة نصر، القاهرة</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <FaPhone className="text-secondary" />
                <span dir="ltr">+20 1025713589</span>
              </li>
              <li className="flex items-center gap-3 text-gray-300">
                <FaEnvelope className="text-secondary" />
                <span>info@teclub.com</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4 text-secondary">تابعنا</h4>
            <div className="flex gap-4">
              {[
                { icon: <FaFacebook />, href: '#' },
                { icon: <FaTwitter />, href: '#' },
                { icon: <FaInstagram />, href: '#' },
                { icon: <FaYoutube />, href: '#' },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center hover:bg-secondary hover:text-primary transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-primary-light mt-8 pt-6 text-center text-gray-400">
          <p>© 2026 نادي المصرية للاتصالات. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;