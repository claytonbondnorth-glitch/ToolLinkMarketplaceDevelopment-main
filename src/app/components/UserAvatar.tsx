import { useState } from 'react';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  className?: string;
  alt?: string;
}

export default function UserAvatar({ src, name = '', className = '', alt }: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const fallbackText = name?.trim()?.charAt(0)?.toUpperCase() ?? 'U';
  const resolvedSrc = src && !hasError ? src : '';

  if (resolvedSrc) {
    return (
      <img
        src={resolvedSrc}
        alt={alt ?? name}
        className={className}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center bg-muted text-muted-foreground border border-border ${className}`}>
      <span className="text-sm font-semibold">{fallbackText}</span>
    </div>
  );
}
