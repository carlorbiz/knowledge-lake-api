import React from 'react';

export const MicIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5.4-3c0 3-2.54 5.1-5.4 5.1S6.6 14 6.6 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.6z" />
  </svg>
);

export const SendIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

export const PlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
);

export const AureliaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <defs>
        <linearGradient id="aureliaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor: 'rgb(129 140 248)', stopOpacity:1}} />
          <stop offset="100%" style={{stopColor: 'rgb(79 70 229)', stopOpacity:1}} />
        </linearGradient>
      </defs>
      {/* Stylized AI advisor avatar - elegant female silhouette with flowing design */}
      <circle cx="12" cy="12" r="10" fill="url(#aureliaGradient)" opacity="0.15"/>
      <circle cx="12" cy="9" r="3.5" fill="url(#aureliaGradient)"/>
      <path fill="url(#aureliaGradient)" d="M12 13.5c-4 0-7 2-7 4.5v1.5c0 .5.5 1 1 1h12c.5 0 1-.5 1-1V18c0-2.5-3-4.5-7-4.5z"/>
      {/* Decorative sparkle elements for AI/intelligence theme */}
      <circle cx="7" cy="7" r="1" fill="rgb(129 140 248)" opacity="0.6"/>
      <circle cx="17" cy="7" r="1" fill="rgb(129 140 248)" opacity="0.6"/>
      <circle cx="8" cy="16" r="0.7" fill="rgb(79 70 229)" opacity="0.5"/>
      <circle cx="16" cy="16" r="0.7" fill="rgb(79 70 229)" opacity="0.5"/>
    </svg>
);


export const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0V4a2 2 0 0 1 2-2zm0 18a2 2 0 0 1-2-2v-2a2 2 0 0 1 4 0v2a2 2 0 0 1-2 2zm8-10a2 2 0 0 1-2 2h-2a2 2 0 0 1 0-4h2a2 2 0 0 1 2 2zm-18 0a2 2 0 0 1 2-2h2a2 2 0 0 1 0 4H4a2 2 0 0 1-2-2zm13.66 4.34a2 2 0 0 1 0-2.82l1.41-1.42a2 2 0 0 1 2.82 2.82l-1.41 1.42a2 2 0 0 1-2.82 0zM4.93 17.07a2 2 0 0 1 0 2.82l-1.42 1.42a2 2 0 0 1-2.82-2.82l1.42-1.42a2 2 0 0 1 2.82 0zm0-10.34a2 2 0 0 1 2.82 0l1.42-1.41a2 2 0 0 1-2.82-2.82L4.93 3.93a2 2 0 0 1 0 2.82zm11.31 10.34a2 2 0 0 1-2.82 0l-1.42 1.41a2 2 0 0 1 2.82 2.82l1.42-1.42a2 2 0 0 1 0-2.82zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
    </svg>
);

export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const PaperclipIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
    </svg>
);

export const MenuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const PlayCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
    </svg>
);

export const StopCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.563A.562.562 0 0 1 9 14.437V9.564Z" />
    </svg>
);

export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
    </svg>
);