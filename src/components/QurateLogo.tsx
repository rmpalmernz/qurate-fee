import qurateLogo from '@/assets/qurate-logo-white.svg';

interface QurateLogoProps {
  className?: string;
}

export default function QurateLogo({ className = "" }: QurateLogoProps) {
  return (
    <a 
      href="https://www.qurate.com.au" 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-block"
    >
      <img 
        src={qurateLogo} 
        alt="Qurate Advisory" 
        className={`h-12 w-auto ${className}`}
      />
    </a>
  );
}
