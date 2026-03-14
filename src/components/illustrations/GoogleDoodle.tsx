export const DoodleGraduationCap = ({ className = '', size = 80 }: { className?: string; size?: number }) => (
  <svg width={size} height={size*0.8} viewBox="0 0 100 80" className={className} fill="none">
    <ellipse cx="50" cy="45" rx="30" ry="8" fill="#4285F4" opacity="0.15"/>
    <rect x="32" y="22" width="36" height="4" rx="2" fill="#4285F4" opacity="0.8" transform="rotate(-5 50 24)"/>
    <polygon points="50,8 20,24 50,28 80,24" fill="#EA4335" opacity="0.85"/>
    <rect x="74" y="23" width="3" height="18" rx="1.5" fill="#FBBC04" opacity="0.8"/>
    <circle cx="75.5" cy="44" r="5" fill="#34A853" opacity="0.8"/>
    <line x1="75.5" y1="49" x2="75.5" y2="58" stroke="#FBBC04" strokeWidth="1.5" opacity="0.7"/>
    <line x1="72" y1="58" x2="79" y2="58" stroke="#FBBC04" strokeWidth="1.5" opacity="0.7"/>
    <text x="15" y="18" fontSize="10" opacity="0.4">✦</text>
    <text x="78" y="15" fontSize="8" opacity="0.3">✦</text>
  </svg>
);

export const DoodleCalendar = ({ className = '', size = 80 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" className={className} fill="none">
    <rect x="8" y="16" width="64" height="56" rx="8" fill="white" stroke="#4285F4" strokeWidth="2" opacity="0.9"/>
    <rect x="8" y="16" width="64" height="18" rx="8" fill="#4285F4" opacity="0.9"/>
    <rect x="8" y="26" width="64" height="8" fill="#4285F4" opacity="0.9"/>
    <line x1="24" y1="8" x2="24" y2="24" stroke="#EA4335" strokeWidth="3" strokeLinecap="round"/>
    <line x1="56" y1="8" x2="56" y2="24" stroke="#EA4335" strokeWidth="3" strokeLinecap="round"/>
    <circle cx="34" cy="54" r="7" fill="#FBBC04" opacity="0.85"/>
    <text x="34" y="58" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">14</text>
  </svg>
);

export const DoodleSkillTree = ({ className = '', size = 100 }: { className?: string; size?: number }) => (
  <svg width={size} height={size*1.2} viewBox="0 0 100 120" className={className} fill="none">
    <rect x="46" y="75" width="8" height="40" rx="4" fill="#FBBC04" opacity="0.6"/>
    <line x1="50" y1="75" x2="20" y2="50" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="50" y1="75" x2="80" y2="50" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="50" y1="65" x2="30" y2="40" stroke="#34A853" strokeWidth="2" strokeLinecap="round"/>
    <line x1="50" y1="65" x2="70" y2="40" stroke="#34A853" strokeWidth="2" strokeLinecap="round"/>
    <line x1="50" y1="55" x2="50" y2="30" stroke="#34A853" strokeWidth="2.5" strokeLinecap="round"/>
    {[[50,28,'#4285F4'],[20,48,'#EA4335'],[80,48,'#FBBC04'],[30,38,'#34A853'],[70,38,'#4285F4'],[50,15,'#EA4335']].map(([cx,cy,fill]) => (
      <circle key={`${cx}-${cy}`} cx={cx as number} cy={cy as number} r="7" fill={fill as string} opacity="0.85"/>
    ))}
    <text x="5" y="25" fontSize="10" opacity="0.4">✦</text>
    <text x="82" y="20" fontSize="8" opacity="0.3">✦</text>
  </svg>
);

export const DoodleTrophy = ({ className = '', size = 80 }: { className?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" className={className} fill="none">
    <path d="M25 15 L55 15 L55 40 Q55 58 40 62 Q25 58 25 40 Z" fill="#FBBC04" opacity="0.9"/>
    <rect x="34" y="62" width="12" height="8" rx="2" fill="#FBBC04" opacity="0.7"/>
    <rect x="26" y="70" width="28" height="5" rx="2.5" fill="#FBBC04" opacity="0.8"/>
    <path d="M25 22 Q12 22 12 32 Q12 42 25 42" stroke="#EA4335" strokeWidth="3" fill="none"/>
    <path d="M55 22 Q68 22 68 32 Q68 42 55 42" stroke="#EA4335" strokeWidth="3" fill="none"/>
    <text x="40" y="42" textAnchor="middle" fontSize="18" fill="white" opacity="0.9">★</text>
  </svg>
);

export const DoodleLightbulb = ({ className = '', size = 60 }: { className?: string; size?: number }) => (
  <svg width={size} height={size*1.3} viewBox="0 0 60 78" className={className} fill="none">
    <circle cx="30" cy="26" r="20" fill="#FBBC04" opacity="0.85"/>
    <rect x="23" y="44" width="14" height="5" rx="2" fill="#FBBC04" opacity="0.7"/>
    <rect x="24" y="49" width="12" height="5" rx="2" fill="#FBBC04" opacity="0.6"/>
    <rect x="25" y="54" width="10" height="4" rx="2" fill="#FBBC04" opacity="0.5"/>
    {[0,45,90,135,180,225,270,315].map(deg => (
      <line key={deg}
        x1={30 + Math.cos(deg*Math.PI/180)*22}
        y1={26 + Math.sin(deg*Math.PI/180)*22}
        x2={30 + Math.cos(deg*Math.PI/180)*28}
        y2={26 + Math.sin(deg*Math.PI/180)*28}
        stroke="#FBBC04" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    ))}
    <path d="M26 30 Q30 22 34 30" stroke="white" strokeWidth="1.5" fill="none" opacity="0.7"/>
  </svg>
);
