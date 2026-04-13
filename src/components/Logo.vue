<template>
	<div class="splash-screen">
		<div class="splash-bg">
			<!-- Storm clouds / atmosphere -->
			<div class="storm-layer"></div>
			<div class="storm-cloud cloud-1"></div>
			<div class="storm-cloud cloud-2"></div>
			<!-- The lightning flash (full screen) -->
			<div class="lightning-flash"></div>
			<!-- Electric field lines -->
			<div class="field-lines">
				<div class="field-line" v-for="n in 6" :key="n" :style="{ left: (n * 16) + '%', animationDelay: (n * 0.12) + 's' }"></div>
			</div>
		</div>

		<div class="splash-content">
			<!-- Main lightning bolt with strike animation -->
			<div class="bolt-stage">
				<svg class="bolt-main" viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
					<!-- Outer glow bolt -->
					<path class="bolt-glow-path" d="M72 4L20 88H52L40 156L104 64H68L72 4Z"
						stroke="#FFAA00" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0"/>
					<!-- Main bolt stroke -->
					<path class="bolt-stroke" d="M72 4L20 88H52L40 156L104 64H68L72 4Z"
						stroke="url(#thunderGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
					<!-- Bolt fill -->
					<path class="bolt-fill" d="M72 4L20 88H52L40 156L104 64H68L72 4Z"
						fill="url(#thunderGrad)" opacity="0"/>
					<!-- Hot core -->
					<path class="bolt-core" d="M72 4L20 88H52L40 156L104 64H68L72 4Z"
						fill="white" opacity="0"/>
					<defs>
						<linearGradient id="thunderGrad" x1="20" y1="4" x2="104" y2="156" gradientUnits="userSpaceOnUse">
							<stop offset="0" stop-color="#FFF7D6"/>
							<stop offset="0.3" stop-color="#FFAA00"/>
							<stop offset="0.7" stop-color="#FF8C00"/>
							<stop offset="1" stop-color="#FF6B00"/>
						</linearGradient>
					</defs>
				</svg>
				<!-- Radial impact glow -->
				<div class="impact-glow"></div>
				<!-- Spark particles -->
				<div class="sparks">
					<span class="spark" v-for="n in 8" :key="n"
						:style="{ '--angle': (n * 45) + 'deg', '--dist': (30 + Math.random() * 40) + 'px', animationDelay: (0.85 + n * 0.03) + 's' }"></span>
				</div>
			</div>

			<!-- Brand reveal -->
			<h1 class="splash-title">
				<span class="letter" style="animation-delay: 0.95s">T</span>
				<span class="letter" style="animation-delay: 1s">y</span>
				<span class="letter" style="animation-delay: 1.05s">p</span>
				<span class="letter" style="animation-delay: 1.1s">e</span>
				<span class="letter accent" style="animation-delay: 1.15s">M</span>
				<span class="letter accent" style="animation-delay: 1.2s">a</span>
				<span class="letter accent" style="animation-delay: 1.25s">t</span>
				<span class="letter accent" style="animation-delay: 1.3s">e</span>
			</h1>

			<p class="splash-tagline">
				<span class="tag-bolt">&#x26A1;</span>
				<span class="tag-text">AI-Powered Writing</span>
				<span class="tag-bolt">&#x26A1;</span>
			</p>

			<!-- Charging bar -->
			<div class="charge-bar">
				<div class="charge-track">
					<div class="charge-fill"></div>
					<div class="charge-glow"></div>
				</div>
				<span class="charge-label">Charging</span>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'SplashLogo'
	}
</script>

<style lang="scss" scoped>
.splash-screen {
	position: fixed;
	inset: 0;
	z-index: 1000;
	display: flex;
	justify-content: center;
	align-items: center;
	animation: splashOut 0.7s cubic-bezier(0.4, 0, 0.2, 1) 2.5s forwards;

	.splash-bg {
		position: absolute;
		inset: 0;
		background: var(--splashBg);
		overflow: hidden;

		.storm-layer {
			position: absolute;
			inset: 0;
			background:
				radial-gradient(ellipse at 30% 20%, rgba(255, 170, 0, 0.04) 0%, transparent 50%),
				radial-gradient(ellipse at 70% 80%, rgba(255, 107, 0, 0.03) 0%, transparent 50%);
		}

		.storm-cloud {
			position: absolute;
			border-radius: 50%;
			filter: blur(80px);

			&.cloud-1 {
				width: 500px;
				height: 250px;
				background: radial-gradient(ellipse, rgba(255, 170, 0, 0.08), transparent 70%);
				top: -60px;
				left: 20%;
				animation: cloudDrift 10s ease-in-out infinite;
			}
			&.cloud-2 {
				width: 400px;
				height: 200px;
				background: radial-gradient(ellipse, rgba(255, 140, 0, 0.06), transparent 70%);
				top: -40px;
				right: 15%;
				animation: cloudDrift 12s ease-in-out infinite reverse;
			}
		}

		.lightning-flash {
			position: absolute;
			inset: 0;
			background: rgba(255, 230, 160, 0.15);
			opacity: 0;
			animation: flashBang 0.15s ease-out 0.8s forwards, flashBang2 0.08s ease-out 0.5s forwards;
		}

		.field-lines {
			position: absolute;
			inset: 0;

			.field-line {
				position: absolute;
				top: 0;
				width: 1px;
				height: 100%;
				background: linear-gradient(180deg,
					transparent 0%,
					rgba(255, 170, 0, 0.06) 30%,
					rgba(255, 170, 0, 0.02) 70%,
					transparent 100%);
				opacity: 0;
				animation: fieldFadeIn 1.5s ease-out forwards;
			}
		}
	}

	.splash-content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 18px;
	}

	/* ===== LIGHTNING BOLT ===== */
	.bolt-stage {
		position: relative;
		width: 120px;
		height: 160px;

		.bolt-main {
			width: 100%;
			height: 100%;
			position: relative;
			z-index: 2;
			filter: drop-shadow(0 0 12px rgba(255, 170, 0, 0.4));

			.bolt-stroke {
				stroke-dasharray: 500;
				stroke-dashoffset: 500;
				animation: strikeDown 0.5s cubic-bezier(0.7, 0, 0.3, 1) 0.3s forwards;
			}

			.bolt-glow-path {
				animation: boltOuterGlow 0.2s ease-out 0.75s forwards;
				filter: blur(4px);
			}

			.bolt-fill {
				animation: boltFillIn 0.25s ease-out 0.78s forwards;
			}

			.bolt-core {
				animation: coreFlash 0.12s ease-out 0.8s forwards, coreFade 0.6s ease-out 0.92s forwards;
			}
		}

		.impact-glow {
			position: absolute;
			bottom: -10px;
			left: 50%;
			transform: translateX(-50%) scale(0);
			width: 180px;
			height: 80px;
			border-radius: 50%;
			background: radial-gradient(ellipse, rgba(255, 170, 0, 0.4), rgba(255, 107, 0, 0.1) 50%, transparent 70%);
			z-index: 1;
			animation: impactBurst 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.82s forwards;
		}

		.sparks {
			position: absolute;
			bottom: 20px;
			left: 50%;
			z-index: 3;

			.spark {
				position: absolute;
				width: 4px;
				height: 4px;
				border-radius: 50%;
				background: #FFD93D;
				box-shadow: 0 0 6px #FFAA00, 0 0 2px white;
				opacity: 0;
				animation: sparkFly 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
				--angle: 0deg;
				--dist: 40px;
			}
		}
	}

	/* ===== TITLE ===== */
	.splash-title {
		font-family: 'Orbitron', sans-serif;
		font-size: 48px;
		font-weight: 900;
		letter-spacing: 6px;
		color: var(--textPrimary);
		display: flex;
		text-transform: uppercase;

		.letter {
			display: inline-block;
			opacity: 0;
			transform: translateY(24px);
			animation: letterStrike 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;

			&.accent {
				color: #FFAA00;
				text-shadow: 0 0 24px rgba(255, 170, 0, 0.5), 0 0 8px rgba(255, 170, 0, 0.3), 0 0 2px rgba(255, 217, 61, 0.4);
			}
		}
	}

	.splash-tagline {
		display: flex;
		align-items: center;
		gap: 10px;
		opacity: 0;
		animation: fadeInUp 0.5s ease-out 1.4s forwards;

		.tag-text {
			font-family: 'DM Sans', sans-serif;
			font-size: 12px;
			font-weight: 500;
			letter-spacing: 4px;
			text-transform: uppercase;
			color: var(--textMuted);
		}

		.tag-bolt {
			font-size: 10px;
			color: #FFAA00;
			opacity: 0.6;
		}
	}

	/* ===== CHARGE BAR ===== */
	.charge-bar {
		margin-top: 8px;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		opacity: 0;
		animation: fadeInUp 0.4s ease-out 1.5s forwards;

		.charge-track {
			width: 200px;
			height: 3px;
			background: rgba(255, 170, 0, 0.1);
			border-radius: 3px;
			position: relative;
			overflow: visible;

			.charge-fill {
				width: 0%;
				height: 100%;
				background: linear-gradient(90deg, #FF6B00, #FFAA00, #FFD93D);
				border-radius: 3px;
				animation: chargeUp 1s cubic-bezier(0.4, 0, 0.2, 1) 1.6s forwards;
				box-shadow: 0 0 8px rgba(255, 170, 0, 0.5), 0 0 2px rgba(255, 200, 0, 0.8);
			}

			.charge-glow {
				position: absolute;
				width: 12px;
				height: 12px;
				border-radius: 50%;
				background: #FFD93D;
				top: -4.5px;
				left: 0%;
				box-shadow: 0 0 16px rgba(255, 170, 0, 0.9), 0 0 4px white;
				animation: chargeGlowMove 1s cubic-bezier(0.4, 0, 0.2, 1) 1.6s forwards;
				opacity: 0;
			}
		}

		.charge-label {
			font-family: 'Outfit', sans-serif;
			font-size: 10px;
			font-weight: 600;
			letter-spacing: 3px;
			text-transform: uppercase;
			color: rgba(255, 170, 0, 0.5);
			animation: chargeLabelPulse 0.8s ease-in-out 1.6s 2;
		}
	}
}

/* ===== KEYFRAMES ===== */
@keyframes strikeDown {
	0% { stroke-dashoffset: 500; }
	100% { stroke-dashoffset: 0; }
}
@keyframes boltOuterGlow {
	0% { opacity: 0; }
	50% { opacity: 0.6; }
	100% { opacity: 0.2; }
}
@keyframes boltFillIn {
	0% { opacity: 0; }
	40% { opacity: 0.5; }
	100% { opacity: 0.35; }
}
@keyframes coreFlash {
	0% { opacity: 0; }
	100% { opacity: 0.7; }
}
@keyframes coreFade {
	100% { opacity: 0; }
}
@keyframes impactBurst {
	0% { transform: translateX(-50%) scale(0); opacity: 1; }
	60% { transform: translateX(-50%) scale(1.2); opacity: 0.6; }
	100% { transform: translateX(-50%) scale(1.5); opacity: 0; }
}
@keyframes sparkFly {
	0% {
		opacity: 1;
		transform: translate(0, 0) scale(1);
	}
	100% {
		opacity: 0;
		transform: translate(
			calc(cos(var(--angle)) * var(--dist)),
			calc(sin(var(--angle)) * var(--dist) - 20px)
		) scale(0);
	}
}
@keyframes flashBang {
	0% { opacity: 0; }
	30% { opacity: 1; }
	100% { opacity: 0; }
}
@keyframes flashBang2 {
	0% { opacity: 0; }
	50% { opacity: 0.5; }
	100% { opacity: 0; }
}
@keyframes letterStrike {
	0% { opacity: 0; transform: translateY(24px); }
	60% { opacity: 1; transform: translateY(-2px); }
	100% { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
	from { opacity: 0; transform: translateY(8px); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes chargeUp {
	to { width: 100%; }
}
@keyframes chargeGlowMove {
	0% { left: 0%; opacity: 1; }
	100% { left: calc(100% - 12px); opacity: 1; }
}
@keyframes chargeLabelPulse {
	0%, 100% { color: rgba(255, 170, 0, 0.3); }
	50% { color: rgba(255, 170, 0, 0.7); }
}
@keyframes cloudDrift {
	0%, 100% { transform: translateX(0); }
	50% { transform: translateX(30px); }
}
@keyframes fieldFadeIn {
	0% { opacity: 0; }
	100% { opacity: 1; }
}
@keyframes splashOut {
	0% { opacity: 1; }
	100% { opacity: 0; pointer-events: none; visibility: hidden; }
}
</style>
