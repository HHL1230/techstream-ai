
import React from 'react';

interface IconProps {
  className?: string;
}

export const HeartIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.664l1.318-1.346a4.5 4.5 0 116.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path>
  </svg>
);

export const CommentIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
  </svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
  </svg>
);

export const RssIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 5c7.732 0 14 6.268 14 14M6 13a7 7 0 017 7m-6 0a1 1 0 100-2 1 1 0 000 2z"></path>
  </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M10 3a1 1 0 011 1v1.5a.5.5 0 001 0V4a1 1 0 012 0v1.5a.5.5 0 001 0V4a1 1 0 012 0v1.5a.5.5 0 001 0V4a1 1 0 011-1 .5.5 0 000-1 1 1 0 01-1-1h-1.5a.5.5 0 000 1H16a1 1 0 010 2h-1.5a.5.5 0 00-1 0H16a1 1 0 010 2h-1.5a.5.5 0 00-1 0H16a1 1 0 110 2h-1.5a.5.5 0 00-1 0H16a1 1 0 110 2h-1.5a.5.5 0 00-1 0V16a1 1 0 11-2 0v-1.5a.5.5 0 00-1 0V16a1 1 0 11-2 0v-1.5a.5.5 0 00-1 0V16a1 1 0 11-2 0v-1.5a.5.5 0 00-1 0V16a1 1 0 11-1-1 .5.5 0 000 1 1 1 0 011 1h1.5a.5.5 0 000-1H4a1 1 0 010-2h1.5a.5.5 0 001 0H4a1 1 0 010-2h1.5a.5.5 0 001 0H4a1 1 0 110-2h1.5a.5.5 0 001 0H4a1 1 0 110-2h1.5a.5.5 0 001 0V4a1 1 0 011-1z" />
    </svg>
);

export const TranslateIcon: React.FC<IconProps> = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m4 13-4-4L5 19m11-1-4-4m4 4v-4m-4 4h-4m3-10h4M3 19h4"></path>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5h6m-3-2v4"></path>
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);
