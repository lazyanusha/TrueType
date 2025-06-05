import React from "react";

const NUM_BUBBLES = 30;

// Some pastel bubble colors
const COLORS = [
  "rgba(135, 206, 250, 0.6)",  // Light Sky Blue
  "rgba(255, 182, 193, 0.6)",  // Light Pink
  "rgba(144, 238, 144, 0.6)",  // Light Green
  "rgba(255, 255, 224, 0.6)",  // Light Yellow
  "rgba(221, 160, 221, 0.6)",  // Plum
];

const getRandom = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const FloatingBubbles: React.FC = () => {
  const bubbles = React.useMemo(() => {
    return Array.from({ length: NUM_BUBBLES }).map(() => {
      const size = getRandom(20, 60);
      const startX = getRandom(0, 100);
      const startY = getRandom(100, 120);
      const endY = getRandom(-20, -50);
      const duration = getRandom(15000, 25000);
      const delay = getRandom(0, 25000);
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      return { size, startX, startY, endY, duration, delay, color };
    });
  }, []);

  return (
    <>
      <style>{`
        @keyframes bubbleFloatPop {
          0% {
            transform: translateY(var(--start-y)) scale(1);
            opacity: 0.4;
          }
          80% {
            transform: translateY(calc(var(--start-y) + (var(--end-y) - var(--start-y)) * 0.8)) scale(1);
            opacity: 0.8;
          }
          90% {
            transform: translateY(calc(var(--start-y) + (var(--end-y) - var(--start-y)) * 0.9)) scale(1);
            opacity: 1;
          }
          95% {
            transform: translateY(calc(var(--start-y) + (var(--end-y) - var(--start-y)) * 0.95)) scale(1.8);
            opacity: 0.6;
          }
          100% {
            transform: translateY(var(--end-y)) scale(0);
            opacity: 0;
          }
        }

        .bubble {
          position: absolute;
          border-radius: 50%;
          box-shadow:
            inset -5px -5px 10px rgba(255, 255, 255, 0.6),
            inset 5px 5px 10px rgba(0, 191, 255, 0.3);
          filter: drop-shadow(0 0 3px rgba(135, 206, 250, 0.5));
          animation-name: bubbleFloatPop;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-fill-mode: forwards;
          cursor: default;
          pointer-events: none;
          background: var(--bubble-color);
          background: radial-gradient(
            circle at 30% 30%,
            rgba(255 255 255 / 0.8),
            var(--bubble-color),
            rgba(0 0 0 / 0)
          );
        }
      `}</style>

      {bubbles.map(({ size, startX, startY, endY, duration, delay, color }, i) => {
        const bubbleStyle: React.CSSProperties = {
          width: size,
          height: size,
          left: `${startX}vw`,
          bottom: `${startY}vh`,
          animationDuration: `${duration}ms`,
          animationDelay: `${delay}ms`,
          "--start-y": `${startY}vh`,
          "--end-y": `${endY}vh`,
          "--bubble-color": color,
        } as React.CSSProperties;

        return <div key={i} className="bubble" style={bubbleStyle} />;
      })}
    </>
  );
};

export default FloatingBubbles;
