<template>
	<div class="splash-screen">
		<div class="splash-bg">
			<!-- Animated grid lines -->
			<div class="grid-overlay"></div>
			<!-- Floating electric orbs -->
			<div class="orb orb-1"></div>
			<div class="orb orb-2"></div>
			<div class="orb orb-3"></div>
			<!-- Scan line effect -->
			<div class="scan-line"></div>
		</div>
		<div class="splash-content">
			<!-- Lightning bolt icon -->
			<div class="bolt-container">
				<svg class="bolt-svg" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path class="bolt-path" d="M48 4L12 56H36L28 96L68 40H44L48 4Z" stroke="url(#boltGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path class="bolt-fill" d="M48 4L12 56H36L28 96L68 40H44L48 4Z" fill="url(#boltGrad)" opacity="0"/>
					<defs>
						<linearGradient id="boltGrad" x1="12" y1="4" x2="68" y2="96" gradientUnits="userSpaceOnUse">
							<stop offset="0" stop-color="#00D4FF"/>
							<stop offset="1" stop-color="#7B61FF"/>
						</linearGradient>
					</defs>
				</svg>
				<div class="bolt-glow"></div>
			</div>

			<h1 class="splash-title">
				<span class="letter" style="animation-delay: 0.4s">T</span>
				<span class="letter" style="animation-delay: 0.46s">y</span>
				<span class="letter" style="animation-delay: 0.52s">p</span>
				<span class="letter" style="animation-delay: 0.58s">e</span>
				<span class="letter accent" style="animation-delay: 0.64s">M</span>
				<span class="letter accent" style="animation-delay: 0.7s">a</span>
				<span class="letter accent" style="animation-delay: 0.76s">t</span>
				<span class="letter accent" style="animation-delay: 0.82s">e</span>
			</h1>
			<p class="splash-sub">
				<span class="sub-line"></span>
				<span class="sub-text">AI-Powered Writing</span>
				<span class="sub-line"></span>
			</p>
			<div class="splash-loader">
				<div class="loader-track">
					<div class="loader-fill"></div>
					<div class="loader-spark"></div>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.splash-screen {
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	justify-content: center;
	align-items: center;
	animation: splashFadeOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) 2.4s forwards;

	.splash-bg {
		position: absolute;
		inset: 0;
		background: var(--splashBg);
		overflow: hidden;

		.grid-overlay {
			position: absolute;
			inset: 0;
			background-image:
				linear-gradient(rgba(0, 212, 255, 0.03) 1px, transparent 1px),
				linear-gradient(90deg, rgba(0, 212, 255, 0.03) 1px, transparent 1px);
			background-size: 60px 60px;
			animation: gridPulse 4s ease-in-out infinite;
		}

		.orb {
			position: absolute;
			border-radius: 50%;
			filter: blur(60px);

			&-1 {
				width: 300px;
				height: 300px;
				background: radial-gradient(circle, rgba(0, 212, 255, 0.15), transparent 70%);
				top: -80px;
				right: 10%;
				animation: orbFloat 6s ease-in-out infinite;
			}
			&-2 {
				width: 250px;
				height: 250px;
				background: radial-gradient(circle, rgba(123, 97, 255, 0.12), transparent 70%);
				bottom: -60px;
				left: 15%;
				animation: orbFloat 8s ease-in-out infinite reverse;
			}
			&-3 {
				width: 150px;
				height: 150px;
				background: radial-gradient(circle, rgba(0, 212, 255, 0.1), transparent 70%);
				top: 45%;
				left: 40%;
				animation: orbFloat 5s ease-in-out infinite 1s;
			}
		}

		.scan-line {
			position: absolute;
			width: 100%;
			height: 2px;
			background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.15), transparent);
			top: -2px;
			animation: scanDown 2.5s ease-in-out 0.3s forwards;
		}
	}

	.splash-content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 20px;
	}

	.bolt-container {
		position: relative;
		width: 80px;
		height: 100px;
		animation: boltEntry 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both;

		.bolt-svg {
			width: 100%;
			height: 100%;
			position: relative;
			z-index: 1;

			.bolt-path {
				stroke-dasharray: 300;
				stroke-dashoffset: 300;
				animation: drawBolt 0.8s ease-out 0.2s forwards;
			}
			.bolt-fill {
				animation: fillBolt 0.4s ease-out 0.9s forwards;
			}
		}

		.bolt-glow {
			position: absolute;
			inset: -20px;
			border-radius: 50%;
			background: radial-gradient(circle, rgba(0, 212, 255, 0.25), transparent 60%);
			opacity: 0;
			animation: glowPulse 0.3s ease-out 0.9s forwards, glowBreathe 2s ease-in-out 1.2s infinite;
		}
	}

	.splash-title {
		font-family: 'Outfit', sans-serif;
		font-size: 56px;
		font-weight: 700;
		letter-spacing: 3px;
		color: var(--textPrimary);
		display: flex;

		.letter {
			display: inline-block;
			opacity: 0;
			transform: translateY(30px) scale(0.8);
			animation: letterZap 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;

			&.accent {
				background: linear-gradient(135deg, #00D4FF, #7B61FF);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
			}
		}
	}

	.splash-sub {
		display: flex;
		align-items: center;
		gap: 12px;
		opacity: 0;
		animation: fadeInUp 0.5s ease-out 1s forwards;

		.sub-text {
			font-family: 'DM Sans', sans-serif;
			font-size: 13px;
			font-weight: 400;
			letter-spacing: 4px;
			text-transform: uppercase;
			color: var(--textMuted);
		}

		.sub-line {
			width: 30px;
			height: 1px;
			background: linear-gradient(90deg, transparent, var(--accent), transparent);
		}
	}

	.splash-loader {
		margin-top: 12px;
		opacity: 0;
		animation: fadeInUp 0.4s ease-out 1.2s forwards;

		.loader-track {
			width: 180px;
			height: 2px;
			background: var(--border);
			border-radius: 2px;
			overflow: visible;
			position: relative;

			.loader-fill {
				width: 0%;
				height: 100%;
				background: linear-gradient(90deg, #00D4FF, #7B61FF);
				border-radius: 2px;
				animation: loaderProgress 1.2s cubic-bezier(0.4, 0, 0.2, 1) 1.3s forwards;
				box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
			}

			.loader-spark {
				position: absolute;
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: #00D4FF;
				top: -2px;
				left: 0%;
				box-shadow: 0 0 12px rgba(0, 212, 255, 0.8), 0 0 4px rgba(0, 212, 255, 1);
				animation: sparkMove 1.2s cubic-bezier(0.4, 0, 0.2, 1) 1.3s forwards;
				opacity: 0;
			}
		}
	}
}

@keyframes drawBolt {
	to { stroke-dashoffset: 0; }
}
@keyframes fillBolt {
	to { opacity: 0.2; }
}
@keyframes boltEntry {
	0% { opacity: 0; transform: scale(0.5) translateY(20px); }
	100% { opacity: 1; transform: scale(1) translateY(0); }
}
@keyframes glowPulse {
	to { opacity: 1; }
}
@keyframes glowBreathe {
	0%, 100% { opacity: 0.5; transform: scale(1); }
	50% { opacity: 1; transform: scale(1.1); }
}
@keyframes letterZap {
	0% { opacity: 0; transform: translateY(30px) scale(0.8); }
	60% { opacity: 1; transform: translateY(-3px) scale(1.02); }
	100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes fadeInUp {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes loaderProgress {
	to { width: 100%; }
}
@keyframes sparkMove {
	0% { left: 0%; opacity: 1; }
	100% { left: calc(100% - 6px); opacity: 1; }
}
@keyframes splashFadeOut {
	0% { opacity: 1; transform: scale(1); }
	100% { opacity: 0; transform: scale(1.03); pointer-events: none; visibility: hidden; }
}
@keyframes orbFloat {
	0%, 100% { transform: translate(0, 0); }
	50% { transform: translate(15px, -15px); }
}
@keyframes gridPulse {
	0%, 100% { opacity: 0.5; }
	50% { opacity: 1; }
}
@keyframes scanDown {
	0% { top: -2px; opacity: 0; }
	10% { opacity: 1; }
	100% { top: 100%; opacity: 0; }
}
</style>
