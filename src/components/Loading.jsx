const Loading = ({ fullScreen = true, size = 'md', text = 'جاري التحميل...' }) => {
  const sizes = {
    sm: { ball: 40, container: 'min-h-[120px]' },
    md: { ball: 60, container: 'min-h-[250px]' },
    lg: { ball: 80, container: 'min-h-[400px]' },
  };

  const { ball, container } = sizes[size] || sizes.md;

  const content = (
    <div className={`flex flex-col items-center justify-center ${container} gap-6`}>
      <div className="relative" style={{ width: ball * 2.5, height: ball * 1.5 }}>
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-primary/20 blur-md"
          style={{
            width: ball * 0.9,
            height: ball * 0.15,
            animation: 'shadow-pulse 1s ease-in-out infinite',
          }}
        ></div>

        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            width: ball,
            height: ball,
            bottom: 0,
            animation: `ball-bounce 1s cubic-bezier(0.45, 0, 0.55, 1) infinite`,
          }}
        >
          <svg
            viewBox="0 0 100 100"
            width={ball}
            height={ball}
            className="drop-shadow-lg"
            style={{
              animation: 'ball-spin 1s linear infinite',
            }}
          >
            <circle cx="50" cy="50" r="48" fill="white" stroke="#1a1a1a" strokeWidth="3" />

            <polygon
              points="50,25 65,38 60,58 40,58 35,38"
              fill="#1a1a1a"
            />

            <polygon points="50,5 62,15 58,28 42,28 38,15" fill="#1a1a1a" opacity="0.85" />
            <polygon points="90,35 82,50 68,45 70,28 82,20" fill="#1a1a1a" opacity="0.85" />
            <polygon points="85,80 72,82 65,68 78,55 90,62" fill="#1a1a1a" opacity="0.85" />
            <polygon points="15,80 10,62 22,55 35,68 28,82" fill="#1a1a1a" opacity="0.85" />
            <polygon points="10,35 18,20 30,28 32,45 18,50" fill="#1a1a1a" opacity="0.85" />
          </svg>
        </div>
      </div>

      {text && (
        <div className="flex items-center gap-2">
          <span className="text-primary font-black text-lg">{text}</span>
          <span className="flex gap-1">
            <span
              className="w-1.5 h-1.5 bg-primary rounded-full"
              style={{ animation: 'dot-pulse 1.4s ease-in-out infinite', animationDelay: '0s' }}
            ></span>
            <span
              className="w-1.5 h-1.5 bg-primary rounded-full"
              style={{ animation: 'dot-pulse 1.4s ease-in-out infinite', animationDelay: '0.2s' }}
            ></span>
            <span
              className="w-1.5 h-1.5 bg-primary rounded-full"
              style={{ animation: 'dot-pulse 1.4s ease-in-out infinite', animationDelay: '0.4s' }}
            ></span>
          </span>
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;