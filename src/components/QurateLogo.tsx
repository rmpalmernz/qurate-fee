import qurateLogo from '@/assets/qurate-logo.svg';

interface QurateLogoProps {
  className?: string;
}

export default function QurateLogo({ className = "" }: QurateLogoProps) {
  return (
    <img 
      src={qurateLogo} 
      alt="Qurate Advisory" 
      className={`h-10 w-auto ${className}`}
    />
  );
}
