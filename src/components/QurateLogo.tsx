interface QurateLogoProps {
  className?: string;
}

export default function QurateLogo({ className = "" }: QurateLogoProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Q Icon with gold accent */}
      <svg
        viewBox="0 0 40 40"
        className="w-10 h-10"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Q circle */}
        <circle
          cx="20"
          cy="18"
          r="14"
          stroke="currentColor"
          strokeWidth="3"
          className="text-qurate-light"
          fill="none"
        />
        {/* Q tail - gold accent */}
        <path
          d="M26 26 L34 38"
          stroke="hsl(45, 93%, 47%)"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-qurate-gold"
        />
      </svg>
      
      {/* Text */}
      <div className="flex flex-col leading-none">
        <span className="text-qurate-light font-bold text-xl tracking-[0.2em]">
          URATE
        </span>
        <span className="text-qurate-muted text-[0.6rem] tracking-[0.35em] uppercase">
          Advisory
        </span>
      </div>
    </div>
  );
}
