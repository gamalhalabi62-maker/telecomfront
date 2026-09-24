import { FaFacebook, FaTwitter, FaWhatsapp, FaTelegram, FaLink, FaCheck } from 'react-icons/fa';
import { useState } from 'react';

const ShareButtons = ({ title, url }) => {
  const [copied, setCopied] = useState(false);
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const buttons = [
    { icon: <FaFacebook />, color: 'bg-blue-600 hover:bg-blue-700', url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, label: 'فيسبوك' },
    { icon: <FaTwitter />, color: 'bg-sky-500 hover:bg-sky-600', url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, label: 'تويتر' },
    { icon: <FaWhatsapp />, color: 'bg-green-500 hover:bg-green-600', url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, label: 'واتساب' },
    { icon: <FaTelegram />, color: 'bg-sky-600 hover:bg-sky-700', url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, label: 'تليجرام' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="font-bold text-gray-700">شارك:</span>
      {buttons.map((btn, i) => (
        <a
          key={i}
          href={btn.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn.color} text-white w-10 h-10 rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-md`}
          title={btn.label}
        >
          {btn.icon}
        </a>
      ))}
      <button
        onClick={handleCopy}
        className={`${copied ? 'bg-green-500' : 'bg-gray-700 hover:bg-gray-800'} text-white w-10 h-10 rounded-full flex items-center justify-center transition transform hover:scale-110 shadow-md`}
        title="نسخ الرابط"
      >
        {copied ? <FaCheck /> : <FaLink />}
      </button>
    </div>
  );
};

export default ShareButtons;