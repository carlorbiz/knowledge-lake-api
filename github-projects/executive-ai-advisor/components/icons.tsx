
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

export const BotIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2a2 2 0 0 1 2 2v2a2 2 0 0 1-4 0V4a2 2 0 0 1 2-2zm0 18a2 2 0 0 1-2-2v-2a2 2 0 0 1 4 0v2a2 2 0 0 1-2 2zm8-10a2 2 0 0 1-2 2h-2a2 2 0 0 1 0-4h2a2 2 0 0 1 2 2zm-18 0a2 2 0 0 1 2-2h2a2 2 0 0 1 0 4H4a2 2 0 0 1-2-2zm13.66 4.34a2 2 0 0 1 0-2.82l1.41-1.42a2 2 0 0 1 2.82 2.82l-1.41 1.42a2 2 0 0 1-2.82 0zM4.93 17.07a2 2 0 0 1 0 2.82l-1.42 1.42a2 2 0 0 1-2.82-2.82l1.42-1.42a2 2 0 0 1 2.82 0zm0-10.34a2 2 0 0 1 2.82 0l1.42-1.41a2 2 0 0 1-2.82-2.82L4.93 3.93a2 2 0 0 1 0 2.82zm11.31 10.34a2 2 0 0 1-2.82 0l-1.42 1.41a2 2 0 0 1 2.82 2.82l1.42-1.42a2 2 0 0 1 0-2.82zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z"/>
    </svg>
);
