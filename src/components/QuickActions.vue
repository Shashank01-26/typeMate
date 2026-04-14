<template>
	<div class="quick-actions">
		<div class="actions-row">
			<div class="action-group">
				<span class="group-label">Tone</span>
				<button v-for="tone in tones" :key="tone.value"
					class="action-btn tone-btn"
					:class="{ active: activeTone === tone.value }"
					:disabled="loading"
					@click="$emit('change-tone', tone.value)">
					{{ tone.label }}
				</button>
			</div>
			<div class="divider"></div>
			<div class="action-group">
				<span class="group-label">Quick</span>
				<button v-for="action in actions" :key="action.value"
					class="action-btn quick-btn"
					:disabled="loading"
					@click="$emit('quick-action', action.value)">
					{{ action.label }}
				</button>
			</div>
			<div class="divider"></div>
			<div class="action-group">
				<span class="group-label">AI</span>
				<button class="action-btn grammar-btn" :disabled="loading"
					@click="$emit('improve-grammar')">
					Fix Grammar
				</button>
				<button class="action-btn suggest-btn" :disabled="loading"
					@click="$emit('get-suggestions')">
					Suggest
				</button>
			</div>
		</div>

		<div class="output-length-row">
			<span class="group-label">Output</span>
			<div class="slider-wrap">
				<input type="range" class="length-slider" min="0" max="3"
					:value="lengthIndex" @input="onSliderInput($event)">
				<div class="slider-labels">
					<span v-for="(l, i) in lengthLevels" :key="l.value"
						class="slider-label" :class="{ active: i === lengthIndex }"
						@click="setLength(i)">
						{{ l.label }}
					</span>
				</div>
			</div>
		</div>

		<div v-if="loading" class="loading-indicator">
			<div class="loading-bar">
				<div class="loading-bar-fill"></div>
			</div>
			<span class="loading-text">{{ loadingMessage }}</span>
		</div>

		<div v-if="error" class="error-message" @click="$emit('clear-error')">
			<span class="error-text">{{ error }}</span>
			<span class="dismiss">dismiss</span>
		</div>

		<div v-if="aiSuggestions.length > 0" class="ai-suggestions">
			<span class="suggestions-label">AI Suggestions</span>
			<div v-for="(suggestion, i) in aiSuggestions" :key="i"
				class="ai-suggestion-item" @click="$emit('apply-suggestion', suggestion)">
				<span class="suggestion-num">{{ i + 1 }}</span>
				{{ suggestion }}
			</div>
		</div>

		<div class="usage-bar" v-if="usage">
			<span class="usage-text">{{ usage.dailyUsed }} / {{ usage.dailyLimit }}</span>
			<div class="usage-track">
				<div class="usage-fill" :style="{ width: usagePercent + '%' }" :class="usageClass"></div>
			</div>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'QuickActions',
		props: {
			loading: Boolean,
			loadingMessage: { type: String, default: 'Processing...' },
			error: { type: String, default: '' },
			aiSuggestions: { type: Array, default: () => [] },
			usage: { type: Object, default: null },
			activeTone: { type: String, default: '' }
		},
		data () {
			return {
				tones: [
					{ label: 'Formal', value: 'formal' },
					{ label: 'Casual', value: 'casual' },
					{ label: 'Academic', value: 'academic' },
					{ label: 'Creative', value: 'creative' },
					{ label: 'Developer', value: 'developer' }
				],
				actions: [
					{ label: 'Concise', value: 'concise' },
					{ label: 'Professional', value: 'professional' },
					{ label: 'Simplify', value: 'simplify' },
					{ label: 'Expand', value: 'expand' }
				],
				lengthLevels: [
					{ label: 'Brief', value: 'brief' },
					{ label: 'Medium', value: 'medium' },
					{ label: 'Detailed', value: 'detailed' },
					{ label: 'Extensive', value: 'extensive' }
				],
				lengthIndex: 1
			}
		},
		methods: {
			onSliderInput (e) {
				this.lengthIndex = parseInt(e.target.value)
				this.$emit('length-change', this.lengthLevels[this.lengthIndex].value)
			},
			setLength (i) {
				this.lengthIndex = i
				this.$emit('length-change', this.lengthLevels[this.lengthIndex].value)
			}
		},
		computed: {
			usagePercent () {
				if (!this.usage) return 0
				return Math.min(100, (this.usage.dailyUsed / this.usage.dailyLimit) * 100)
			},
			usageClass () {
				if (this.usagePercent > 90) return 'critical'
				if (this.usagePercent > 70) return 'warning'
				return 'normal'
			}
		}
	}
</script>

<style lang="scss" scoped>
.quick-actions {
	width: 100%;
	padding: 10px 16px;
	background: var(--surfaceElevated);
	border-top: 1px solid var(--border);

	.actions-row {
		display: flex;
		align-items: center;
		gap: 10px;
		flex-wrap: wrap;

		.divider {
			width: 1px;
			height: 22px;
			background: var(--border);
			flex-shrink: 0;
		}

		.action-group {
			display: flex;
			align-items: center;
			gap: 5px;
			flex-wrap: wrap;

			.group-label {
				font-family: 'Outfit', sans-serif;
				font-size: 10px;
				font-weight: 700;
				color: var(--accent);
				text-transform: uppercase;
				letter-spacing: 2px;
				margin-right: 4px;
			}
		}
	}

	.action-btn {
		padding: 5px 14px;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: var(--surface);
		color: var(--textSecondary);
		font-family: 'DM Sans', sans-serif;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		position: relative;

		&:hover:not(:disabled) {
			border-color: var(--accent);
			color: var(--accent);
			background: var(--accentSoft);
			box-shadow: 0 0 12px var(--glowSoft);
			transform: translateY(-1px);
		}

		&:active:not(:disabled) {
			transform: translateY(0);
			background: var(--accent);
			color: var(--accentContrast);
			box-shadow: 0 0 20px var(--glowMedium);
		}

		&:disabled {
			opacity: 0.4;
			cursor: not-allowed;
		}

		&.active {
			background: var(--accent);
			color: var(--accentContrast);
			border-color: var(--accent);
			box-shadow: 0 0 16px var(--glowMedium), inset 0 0 8px rgba(255,255,255,0.1);
		}

		&.grammar-btn {
			border-color: var(--successBorder);
			color: var(--success);
			&:hover:not(:disabled) {
				background: var(--successSoft);
				box-shadow: 0 0 12px rgba(0, 220, 130, 0.15);
			}
		}

		&.suggest-btn {
			border-color: var(--purpleBorder);
			color: var(--purple);
			&:hover:not(:disabled) {
				background: var(--purpleSoft);
				box-shadow: 0 0 12px rgba(123, 97, 255, 0.15);
			}
		}
	}

	.output-length-row {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 10px;
		padding: 8px 0 2px;

		.group-label {
			font-family: 'Outfit', sans-serif;
			font-size: 10px;
			font-weight: 700;
			color: var(--accent);
			text-transform: uppercase;
			letter-spacing: 2px;
			flex-shrink: 0;
		}

		.slider-wrap {
			flex: 1;
			max-width: 320px;
			display: flex;
			flex-direction: column;
			gap: 4px;

			.length-slider {
				-webkit-appearance: none;
				appearance: none;
				width: 100%;
				height: 4px;
				border-radius: 4px;
				background: var(--border);
				outline: none;
				cursor: pointer;
				transition: background 0.2s;

				&::-webkit-slider-thumb {
					-webkit-appearance: none;
					appearance: none;
					width: 16px;
					height: 16px;
					border-radius: 50%;
					background: var(--accent);
					box-shadow: 0 0 10px var(--glowMedium), 0 0 3px var(--glowSoft);
					cursor: pointer;
					transition: all 0.2s ease;
					border: 2px solid var(--surface);
				}

				&::-webkit-slider-thumb:hover {
					transform: scale(1.2);
					box-shadow: 0 0 16px var(--glowMedium), 0 0 6px var(--glowSoft);
				}

				&::-moz-range-thumb {
					width: 16px;
					height: 16px;
					border-radius: 50%;
					background: var(--accent);
					box-shadow: 0 0 10px var(--glowMedium);
					cursor: pointer;
					border: 2px solid var(--surface);
				}

				&::-moz-range-track {
					height: 4px;
					border-radius: 4px;
					background: var(--border);
				}
			}

			.slider-labels {
				display: flex;
				justify-content: space-between;

				.slider-label {
					font-family: 'DM Sans', sans-serif;
					font-size: 10px;
					font-weight: 500;
					color: var(--textMuted);
					cursor: pointer;
					padding: 2px 4px;
					border-radius: 4px;
					transition: all 0.2s ease;

					&:hover {
						color: var(--textSecondary);
					}

					&.active {
						color: var(--accent);
						font-weight: 700;
						text-shadow: 0 0 8px var(--glowSoft);
					}
				}
			}
		}
	}

	.loading-indicator {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-top: 10px;
		padding: 8px 14px;
		background: var(--accentSoft);
		border-radius: 8px;
		border: 1px solid var(--accentBorder);

		.loading-bar {
			width: 40px;
			height: 3px;
			border-radius: 3px;
			background: var(--border);
			overflow: hidden;
			flex-shrink: 0;

			.loading-bar-fill {
				width: 40%;
				height: 100%;
				background: linear-gradient(90deg, var(--accent), var(--purple));
				border-radius: 3px;
				animation: loadingSlide 1s ease-in-out infinite;
			}
		}

		.loading-text {
			font-family: 'DM Sans', sans-serif;
			font-size: 12.5px;
			color: var(--textSecondary);
		}
	}

	.error-message {
		margin-top: 8px;
		padding: 8px 14px;
		background: var(--errorSoft);
		border: 1px solid var(--errorBorder);
		border-radius: 8px;
		font-family: 'DM Sans', sans-serif;
		font-size: 12.5px;
		color: var(--error);
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;

		.dismiss {
			font-size: 11px;
			color: var(--textMuted);
			opacity: 0.7;
		}
	}

	.ai-suggestions {
		margin-top: 10px;

		.suggestions-label {
			font-family: 'Outfit', sans-serif;
			font-size: 10px;
			font-weight: 700;
			color: var(--accent);
			text-transform: uppercase;
			letter-spacing: 2px;
		}

		.ai-suggestion-item {
			margin-top: 6px;
			padding: 8px 14px;
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: 8px;
			font-family: 'DM Sans', sans-serif;
			font-size: 13px;
			color: var(--textPrimary);
			cursor: pointer;
			transition: all 0.2s ease;
			display: flex;
			align-items: flex-start;
			gap: 10px;
			line-height: 1.5;

			.suggestion-num {
				flex-shrink: 0;
				width: 20px;
				height: 20px;
				border-radius: 5px;
				background: var(--accentSoft);
				color: var(--accent);
				font-size: 11px;
				font-weight: 600;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-top: 1px;
			}

			&:hover {
				border-color: var(--accent);
				box-shadow: 0 0 12px var(--glowSoft);
				transform: translateX(4px);
			}
		}
	}

	.usage-bar {
		margin-top: 10px;
		display: flex;
		align-items: center;
		gap: 10px;

		.usage-text {
			font-family: 'DM Sans', sans-serif;
			font-size: 10.5px;
			font-weight: 500;
			color: var(--textMuted);
			white-space: nowrap;
		}

		.usage-track {
			flex: 1;
			height: 3px;
			background: var(--border);
			border-radius: 3px;
			overflow: hidden;

			.usage-fill {
				height: 100%;
				border-radius: 3px;
				transition: width 0.4s ease;
				&.normal { background: var(--success); box-shadow: 0 0 6px rgba(0, 220, 130, 0.3); }
				&.warning { background: var(--warning); box-shadow: 0 0 6px rgba(255, 184, 0, 0.3); }
				&.critical { background: var(--error); box-shadow: 0 0 6px rgba(255, 75, 75, 0.3); }
			}
		}
	}

	@keyframes loadingSlide {
		0% { transform: translateX(-100%); }
		100% { transform: translateX(300%); }
	}
}
</style>
