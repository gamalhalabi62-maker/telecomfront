import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', showText = true, linkTo = '/', className = '' }) => {
  const sizes = {
    xs: { img: 'w-8 h-8', title: 'text-sm', subtitle: 'text-xs' },
    sm: { img: 'w-10 h-10', title: 'text-base', subtitle: 'text-xs' },
    md: { img: 'w-14 h-14', title: 'text-xl', subtitle: 'text-xs' },
    lg: { img: 'w-20 h-20', title: 'text-2xl', subtitle: 'text-sm' },
    xl: { img: 'w-32 h-32', title: 'text-4xl', subtitle: 'text-lg' },
  };

  const currentSize = sizes[size] || sizes.md;

  const content = (
    <div className={`flex items-center gap-3 ${className}`}>
      <img
        src="/logo.jpeg"
        alt="نادي المصرية للاتصالات"
        className={`${currentSize.img} object-contain drop-shadow-md transition-transform duration-300 hover:scale-110`}
      />
      {showText && (
        <div className="hidden md:block">
          <h1 className={`font-black ${currentSize.title} leading-tight`}>
            المصرية للاتصالات
          </h1>
          <p className={`text-secondary ${currentSize.subtitle} font-bold tracking-wider`}>
            TELECOM EGYPT CLUB
          </p>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return <Link to={linkTo}>{content}</Link>;
  }

  return content;
};

export default Logo;