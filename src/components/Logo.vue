<template>
	<div class="splash-screen">
		<div class="splash-bg">
			<div class="bg-grain"></div>
			<div class="bg-circle bg-circle-1"></div>
			<div class="bg-circle bg-circle-2"></div>
			<div class="bg-circle bg-circle-3"></div>
		</div>
		<div class="splash-content">
			<div class="pen-icon">
				<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path class="pen-body" d="M44 8L56 20L24 52L8 56L12 40L44 8Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
					<path class="pen-line" d="M36 16L48 28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
					<path class="pen-dot" d="M12 52L8 56" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
				</svg>
			</div>
			<h1 class="splash-title">
				<span class="letter" style="animation-delay: 0.3s">T</span>
				<span class="letter" style="animation-delay: 0.36s">y</span>
				<span class="letter" style="animation-delay: 0.42s">p</span>
				<span class="letter" style="animation-delay: 0.48s">e</span>
				<span class="letter accent" style="animation-delay: 0.54s">M</span>
				<span class="letter accent" style="animation-delay: 0.6s">a</span>
				<span class="letter accent" style="animation-delay: 0.66s">t</span>
				<span class="letter accent" style="animation-delay: 0.72s">e</span>
			</h1>
			<p class="splash-sub">Your AI writing companion</p>
			<div class="splash-loader">
				<div class="loader-track">
					<div class="loader-fill"></div>
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
	animation: splashFadeOut 0.5s ease-in 2.2s forwards;

	.splash-bg {
		position: absolute;
		inset: 0;
		background: var(--splashBg);
		overflow: hidden;

		.bg-grain {
			position: absolute;
			inset: -50%;
			width: 200%;
			height: 200%;
			background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
			opacity: 0.4;
		}

		.bg-circle {
			position: absolute;
			border-radius: 50%;
			opacity: 0.08;

			&-1 {
				width: 500px;
				height: 500px;
				background: var(--accent);
				top: -150px;
				right: -100px;
				animation: floatCircle 6s ease-in-out infinite;
			}
			&-2 {
				width: 350px;
				height: 350px;
				background: var(--accentWarm);
				bottom: -80px;
				left: -50px;
				animation: floatCircle 8s ease-in-out infinite reverse;
			}
			&-3 {
				width: 200px;
				height: 200px;
				background: var(--accent);
				top: 40%;
				left: 30%;
				animation: floatCircle 5s ease-in-out infinite 1s;
			}
		}
	}

	.splash-content {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16px;
	}

	.pen-icon {
		width: 72px;
		height: 72px;
		color: var(--accent);
		animation: penDraw 0.8s ease-out 0.1s both;

		svg {
			width: 100%;
			height: 100%;
		}

		.pen-body {
			stroke-dasharray: 200;
			stroke-dashoffset: 200;
			animation: drawStroke 1s ease-out 0.15s forwards;
		}

		.pen-line {
			stroke-dasharray: 30;
			stroke-dashoffset: 30;
			animation: drawStroke 0.5s ease-out 0.7s forwards;
		}

		.pen-dot {
			opacity: 0;
			animation: dotAppear 0.3s ease-out 1s forwards;
		}
	}

	.splash-title {
		font-family: 'Cormorant Garamond', Georgia, serif;
		font-size: 52px;
		font-weight: 600;
		letter-spacing: 2px;
		color: var(--textPrimary);
		display: flex;

		.letter {
			display: inline-block;
			opacity: 0;
			transform: translateY(20px);
			animation: letterReveal 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;

			&.accent {
				color: var(--accent);
			}
		}
	}

	.splash-sub {
		font-family: 'Source Sans 3', sans-serif;
		font-size: 15px;
		font-weight: 300;
		letter-spacing: 3px;
		text-transform: uppercase;
		color: var(--textMuted);
		opacity: 0;
		animation: fadeInUp 0.5s ease-out 0.9s forwards;
	}

	.splash-loader {
		margin-top: 24px;
		opacity: 0;
		animation: fadeInUp 0.4s ease-out 1.1s forwards;

		.loader-track {
			width: 160px;
			height: 2px;
			background: var(--border);
			border-radius: 2px;
			overflow: hidden;

			.loader-fill {
				width: 0%;
				height: 100%;
				background: linear-gradient(90deg, var(--accent), var(--accentWarm));
				border-radius: 2px;
				animation: loaderProgress 1.2s cubic-bezier(0.4, 0, 0.2, 1) 1.2s forwards;
			}
		}
	}
}

@keyframes drawStroke {
	to { stroke-dashoffset: 0; }
}
@keyframes dotAppear {
	to { opacity: 1; }
}
@keyframes penDraw {
	0% { opacity: 0; transform: scale(0.7) rotate(-10deg); }
	100% { opacity: 1; transform: scale(1) rotate(0); }
}
@keyframes letterReveal {
	to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeInUp {
	from { opacity: 0; transform: translateY(10px); }
	to { opacity: 1; transform: translateY(0); }
}
@keyframes loaderProgress {
	to { width: 100%; }
}
@keyframes splashFadeOut {
	0% { opacity: 1; }
	100% { opacity: 0; pointer-events: none; visibility: hidden; }
}
@keyframes floatCircle {
	0%, 100% { transform: translate(0, 0); }
	50% { transform: translate(20px, -20px); }
}
</style>
