import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-700 mb-4">الصفحة غير موجودة</h2>
        <p className="text-gray-500 mb-8">عذراً، الصفحة التي تبحث عنها غير متوفرة</p>
        <Link to="/" className="btn-primary inline-block">
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
};

export default NotFound;