import React from 'react';
export const GoogleArrowUp = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 13l5-5 5 5z" fill="currentColor" />
    </svg>
);

export const GoogleArrowRight = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M7 5l5 5-5 5z" fill="currentColor" />
    </svg>
);

export const GoogleArrowLeft = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M13 5l-5 5 5 5z" fill="currentColor" />
    </svg>
);

export const GoogleArrowDown = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M5 7l5 5 5-5z" fill="currentColor" />
    </svg>
);

export const Folder = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <path
            d="M2 4a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4z"
            fill="#3b82f6"
        />
    </svg>
);




export const TechIconPattern = () => {
    const SmallCircle = ({ cx, cy }) => (
        <circle cx={cx} cy={cy} r="1" fill="currentColor" />
    );

    const SmallSquare = ({ x, y, rotation = 0 }) => (
        <rect x={x} y={y} width="2" height="2" fill="currentColor" transform={`rotate(${rotation} ${x + 1} ${y + 1})`} />
    );

    return (
        <div className="absolute inset-0 w-full max-w-[calc(100vh*100)] pointer-events-none">
            <svg width="100%" height="100%" className="text-gray-300 opacity-40">
                <defs>
                    <pattern id="techPattern" x="0" y="0" width="180" height="180" patternUnits="userSpaceOnUse">
                        {/* Envelope/Email Icon - tilted */}
                        <g transform="translate(15, 25) rotate(-8)">
                            <path d="M2 4 L12 4 L12 14 L2 14 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <path d="M2 4 L7 9 L12 4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="13" cy="2" r="1.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
                        </g>

                        {/* Play Button - rotated */}
                        <g transform="translate(85, 15) rotate(12)">
                            <rect x="0" y="0" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <path d="M5 4 L5 10 L10 7 Z" fill="currentColor" />
                        </g>

                        {/* Chat Bubbles - tilted */}
                        <g transform="translate(48, 8) rotate(-5)">
                            <rect x="0" y="0" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="3" cy="4" r="0.8" fill="currentColor" />
                            <circle cx="6" cy="4" r="0.8" fill="currentColor" />
                            <circle cx="9" cy="4" r="0.8" fill="currentColor" />
                        </g>

                        {/* Gauge/Analytics Icon */}
                        <g transform="translate(125, 22) rotate(15)">
                            <circle cx="7" cy="10" r="6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            <path d="M7 10 L10 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </g>

                        {/* Text Lines Icon - rotated */}
                        <g transform="translate(5, 58) rotate(7)">
                            <rect x="0" y="0" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <line x1="3" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="3" y1="7" x2="10" y2="7" stroke="currentColor" strokeWidth="1.5" />
                        </g>

                        {/* Network/Users Icon - tilted */}
                        <g transform="translate(70, 52) rotate(-10)">
                            <circle cx="3" cy="2" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="11" cy="2" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="7" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <line x1="4.5" y1="3.5" x2="6" y2="6.5" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="9.5" y1="3.5" x2="8" y2="6.5" stroke="currentColor" strokeWidth="1.5" />
                        </g>

                        {/* Power Button */}
                        <g transform="translate(138, 55) rotate(-12)">
                            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <line x1="6" y1="2" x2="6" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </g>

                        {/* Folder Icon - tilted */}
                        <g transform="translate(42, 85) rotate(8)">
                            <path d="M2 3 L6 3 L8 5 L14 5 L14 12 L2 12 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </g>

                        {/* Monitor/Desktop - rotated */}
                        <g transform="translate(110, 78) rotate(-7)">
                            <rect x="0" y="0" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <line x1="3" y1="13" x2="11" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            <line x1="7" y1="10" x2="7" y2="13" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="7" cy="5" r="0.8" fill="currentColor" />
                            <circle cx="7" cy="7" r="0.8" fill="currentColor" />
                        </g>

                        {/* Card/List Icon - tilted */}
                        <g transform="translate(8, 115) rotate(-15)">
                            <rect x="0" y="0" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <line x1="3" y1="3" x2="13" y2="3" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="3" y1="6" x2="8" y2="6" stroke="currentColor" strokeWidth="1.5" />
                        </g>

                        {/* Chat Icon - rotated */}
                        <g transform="translate(75, 118) rotate(10)">
                            <path d="M2 2 L12 2 L12 9 L8 9 L5 12 L5 9 L2 9 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="5" cy="5.5" r="0.8" fill="currentColor" />
                            <circle cx="7" cy="5.5" r="0.8" fill="currentColor" />
                            <circle cx="9" cy="5.5" r="0.8" fill="currentColor" />
                        </g>

                        {/* Robot Icon - tilted */}
                        <g transform="translate(145, 108) rotate(-5)">
                            <rect x="2" y="3" width="8" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="4.5" cy="6" r="0.8" fill="currentColor" />
                            <circle cx="7.5" cy="6" r="0.8" fill="currentColor" />
                            <line x1="6" y1="0" x2="6" y2="3" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="6" cy="0" r="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
                        </g>

                        {/* Phone/Mobile Icon */}
                        <g transform="translate(28, 142) rotate(12)">
                            <rect x="0" y="0" width="10" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <line x1="3" y1="13" x2="7" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </g>

                        {/* Settings/Gear Icon */}
                        <g transform="translate(98, 145) rotate(-8)">
                            <circle cx="6" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="6" cy="6" r="1.5" fill="currentColor" />
                            <line x1="6" y1="0" x2="6" y2="2" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="6" y1="10" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="0" y1="6" x2="2" y2="6" stroke="currentColor" strokeWidth="1.5" />
                            <line x1="10" y1="6" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" />
                        </g>

                        {/* Additional tilted icons for more chaos */}
                        <g transform="translate(155, 140) rotate(18)">
                            <rect x="0" y="0" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" fill="none" />
                            <circle cx="3" cy="4" r="0.8" fill="currentColor" />
                            <circle cx="6" cy="4" r="0.8" fill="currentColor" />
                            <circle cx="9" cy="4" r="0.8" fill="currentColor" />
                        </g>

                        {/* Random scattered decorative elements */}
                        <SmallCircle cx="35" cy="18" />
                        <SmallCircle cx="63" cy="38" />
                        <SmallCircle cx="120" cy="48" />
                        <SmallCircle cx="52" cy="98" />
                        <SmallCircle cx="88" cy="108" />
                        <SmallCircle cx="22" cy="135" />
                        <SmallCircle cx="145" cy="72" />
                        <SmallCircle cx="168" cy="95" />
                        <SmallCircle cx="12" cy="88" />

                        <SmallSquare x="58" y="25" rotation={25} />
                        <SmallSquare x="105" y="42" rotation={-15} />
                        <SmallSquare x="25" y="75" rotation={35} />
                        <SmallSquare x="92" y="130" rotation={-20} />
                        <SmallSquare x="155" y="28" rotation={12} />
                        <SmallSquare x="38" y="165" rotation={-8} />
                        <SmallSquare x="128" y="125" rotation={30} />

                        {/* Small sparkle/star shapes - randomly placed */}
                        <g transform="translate(112, 35) rotate(20)">
                            <line x1="0" y1="-2" x2="0" y2="2" stroke="currentColor" strokeWidth="1" />
                            <line x1="-2" y1="0" x2="2" y2="0" stroke="currentColor" strokeWidth="1" />
                        </g>
                        <g transform="translate(55, 68) rotate(-15)">
                            <line x1="0" y1="-2" x2="0" y2="2" stroke="currentColor" strokeWidth="1" />
                            <line x1="-2" y1="0" x2="2" y2="0" stroke="currentColor" strokeWidth="1" />
                        </g>
                        <g transform="translate(168, 118) rotate(45)">
                            <line x1="0" y1="-2" x2="0" y2="2" stroke="currentColor" strokeWidth="1" />
                            <line x1="-2" y1="0" x2="2" y2="0" stroke="currentColor" strokeWidth="1" />
                        </g>
                        <g transform="translate(15, 162) rotate(-25)">
                            <line x1="0" y1="-2" x2="0" y2="2" stroke="currentColor" strokeWidth="1" />
                            <line x1="-2" y1="0" x2="2" y2="0" stroke="currentColor" strokeWidth="1" />
                        </g>
                        <g transform="translate(135, 8) rotate(10)">
                            <line x1="0" y1="-2" x2="0" y2="2" stroke="currentColor" strokeWidth="1" />
                            <line x1="-2" y1="0" x2="2" y2="0" stroke="currentColor" strokeWidth="1" />
                        </g>

                        {/* More random dots for organic feel */}
                        <SmallCircle cx="78" cy="15" />
                        <SmallCircle cx="102" cy="88" />
                        <SmallCircle cx="165" cy="158" />
                        <SmallCircle cx="42" cy="55" />
                        <SmallCircle cx="118" cy="162" />
                    </pattern>
                </defs>

                <rect width="100%" height="100%" fill="url(#techPattern)" />
            </svg>
        </div>
    );
};