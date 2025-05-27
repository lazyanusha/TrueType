import React, { useEffect, useState } from "react";

const Snowflake = ({ style }: { style: React.CSSProperties }) => (
	<div
		style={{
			position: "fixed",
			top: 0,
			left: 0,
			width: 8,
			height: 8,
			background: "white",
			borderRadius: "50%",
			opacity: 0.8,
			pointerEvents: "none",
			filter: "drop-shadow(0 0 4px white)",
			...style,
		}}
		className="snowflake"
	/>
);

const Snowing = () => {
	const [snowflakes, setSnowflakes] = useState<
		{ id: number; style: React.CSSProperties }[]
	>([]);

	useEffect(() => {
		const numFlakes = 260;

		const flakes = [];
		for (let i = 0; i < numFlakes; i++) {
			flakes.push({
				id: i,
				style: {
					left: Math.random() * window.innerWidth,
					animationDelay: `${Math.random() * 15}s`,
					animationDuration: `${5 + Math.random() * 10}s`,
					width: 5 + Math.random() * 8,
					height: 5 + Math.random() * 8,
					opacity: 0.6 + Math.random() * 0.4,
				},
			});
		}
		setSnowflakes(flakes);
	}, []);

	return (
		<>
			{snowflakes.map(({ id, style }) => (
				<Snowflake key={id} style={style} />
			))}
			<style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10px);
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          100% {
            transform: translateY(100vh);
            opacity: 0;
          }
        }

        .snowflake {
          animation-name: fall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          animation-fill-mode: forwards;
          animation-direction: normal;
        }
      `}</style>
		</>
	);
};

export default Snowing;
