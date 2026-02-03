import { forwardRef } from 'react';
import qurateLogo from '@/assets/qurate-logo-white.svg';

interface QurateLogoProps {
  className?: string;
}

const QurateLogo = forwardRef<HTMLAnchorElement, QurateLogoProps>(
  ({ className = "" }, ref) => {
    return (
      <a
        ref={ref}
        href="https://www.qurate.com.au"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <img
          src={qurateLogo}
          alt="Qurate Advisory"
          className={`h-14 md:h-16 w-auto ${className}`}
        />
      </a>
    );
  }
);

QurateLogo.displayName = 'QurateLogo';

export default QurateLogo;
