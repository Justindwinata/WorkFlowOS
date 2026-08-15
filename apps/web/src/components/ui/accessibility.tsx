'use client';

import React from 'react';

interface SkipLinkProps {
  targetId?: string;
}

export function SkipToContent({ targetId = 'main-content' }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[1000] focus:px-4 focus:py-2 focus:bg-primary focus:text-on-primary focus:rounded-md"
    >
      Lewati ke konten utama
    </a>
  );
}

interface HeadingProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4';
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const headingClasses: Record<string, string> = {
  h1: 'text-3xl font-bold text-foreground',
  h2: 'text-2xl font-semibold text-foreground',
  h3: 'text-xl font-medium text-foreground',
  h4: 'text-lg font-medium text-foreground',
};

export function Heading({ as: Tag = 'h1', children, className = '', id }: HeadingProps) {
  return (
    <Tag id={id} className={`${headingClasses[Tag]} ${className}`}>
      {children}
    </Tag>
  );
}