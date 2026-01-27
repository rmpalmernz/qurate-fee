import qurateLogo from '@/assets/qurate-logo-white.svg';

interface QurateLogoProps {
  className?: string;
}

export default function QurateLogo({ className = "" }: QurateLogoProps) {
  return (
    <img 
      src={qurateLogo} 
      alt="Qurate Advisory" 
      className={`h-12 w-auto ${className}`}
    />
  );
}
