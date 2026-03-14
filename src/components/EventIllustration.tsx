import type { EventType } from "@/data/events";

const EventIllustration = ({ type, color }: { type: EventType | string; color: string }) => {
  if (type === "Study Jam") return (
    <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-30">
      <rect x="120" y="50" width="70" height="90" rx="4" fill="white" fillOpacity="0.2" transform="rotate(-8, 155, 95)" />
      <rect x="210" y="50" width="70" height="90" rx="4" fill="white" fillOpacity="0.15" transform="rotate(5, 245, 95)" />
      {[0,1,2,3,4].map(i => <rect key={`l${i}`} x="130" y={65 + i * 14} width={40 - i * 4} height="3" rx="1.5" fill="white" fillOpacity="0.15" transform="rotate(-8, 155, 95)" />)}
      {[0,1,2,3,4].map(i => <rect key={`r${i}`} x="220" y={65 + i * 14} width={40 - i * 3} height="3" rx="1.5" fill="white" fillOpacity="0.12" transform="rotate(5, 245, 95)" />)}
      <circle cx="320" cy="50" r="6" fill="white" fillOpacity="0.15" />
      <circle cx="80" cy="140" r="4" fill="white" fillOpacity="0.1" />
      <circle cx="350" cy="140" r="8" fill="white" fillOpacity="0.08" />
      <text x="90" y="70" fontSize="18" fill="white" fillOpacity="0.12" fontFamily="serif">✦</text>
      <text x="340" y="100" fontSize="14" fill="white" fillOpacity="0.1" fontFamily="serif">✦</text>
    </svg>
  );

  if (type === "Hackathon") return (
    <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-30">
      <polygon points="200,30 220,80 200,70 180,80" fill="white" fillOpacity="0.2" />
      <line x1="100" y1="120" x2="160" y2="120" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
      <line x1="160" y1="120" x2="160" y2="160" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
      <line x1="240" y1="100" x2="300" y2="100" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
      <line x1="300" y1="100" x2="300" y2="150" stroke="white" strokeOpacity="0.1" strokeWidth="2" />
      <text x="320" y="60" fontSize="32" fill="white" fillOpacity="0.08" fontFamily="monospace" fontWeight="bold">24</text>
    </svg>
  );

  if (type === "Workshop") return (
    <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-30">
      <text x="80" y="90" fontSize="60" fill="white" fillOpacity="0.1" fontFamily="monospace" fontWeight="bold">{`{`}</text>
      <text x="300" y="140" fontSize="60" fill="white" fillOpacity="0.1" fontFamily="monospace" fontWeight="bold">{`}`}</text>
      {[0,1,2,3].map(i => <rect key={i} x={140} y={60 + i * 22} width={80 + (i % 2) * 40} height="4" rx="2" fill="white" fillOpacity="0.08" />)}
      <circle cx="340" cy="60" r="12" fill="white" fillOpacity="0.06" />
      <circle cx="60" cy="160" r="8" fill="white" fillOpacity="0.06" />
    </svg>
  );

  if (type === "Session") return (
    <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-30">
      {[[100,80],[140,60],[180,80],[130,120],[170,110]].map(([cx,cy], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r="10" fill="white" fillOpacity="0.12" />
          <circle cx={cx} cy={cy - 14} r="6" fill="white" fillOpacity="0.1" />
        </g>
      ))}
      <line x1="100" y1="80" x2="140" y2="60" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" />
      <line x1="140" y1="60" x2="180" y2="80" stroke="white" strokeOpacity="0.06" strokeWidth="1.5" />
      <text x="300" y="120" fontSize="28" fill="white" fillOpacity="0.06">📍</text>
    </svg>
  );

  if (type === "Bootcamp") return (
    <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full opacity-30">
      <polygon points="200,40 210,70 230,75 215,95 220,125 200,110 180,125 185,95 170,75 190,70" fill="white" fillOpacity="0.1" />
      <rect x="195" y="110" width="10" height="50" rx="3" fill="white" fillOpacity="0.15" />
      <polygon points="185,160 200,145 215,160" fill="white" fillOpacity="0.1" />
      {[[60,40],[320,60],[80,140],[350,100],[280,30]].map(([x,y], i) => (
        <circle key={i} cx={x} cy={y} r={2 + (i % 3)} fill="white" fillOpacity={0.1 + (i % 3) * 0.03} />
      ))}
      <text x="330" y="160" fontSize="28" fill="white" fillOpacity="0.06" fontFamily="monospace" fontWeight="bold">3</text>
    </svg>
  );

  return null;
};

export default EventIllustration;
