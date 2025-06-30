import React from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

interface ConfettiEffectProps {
	active: boolean;
	pieces?: number;
	className?: string;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
	active,
	pieces = 250,
	className,
}) => {
	const { width, height } = useWindowSize();

	if (!active) return null;

	return (
		<Confetti
			width={width}
			height={height}
			numberOfPieces={pieces}
			recycle={true}
			className={className} 
		/>
	);
};

export default ConfettiEffect;
