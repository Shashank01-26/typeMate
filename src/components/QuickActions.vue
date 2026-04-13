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
					<span class="btn-icon">{{ tone.icon }}</span>
					{{ tone.label }}
				</button>
			</div>
			<div class="divider"></div>
			<div class="action-group">
				<span class="group-label">Quick Actions</span>
				<button v-for="action in actions" :key="action.value"
					class="action-btn quick-btn"
					:disabled="loading"
					@click="$emit('quick-action', action.value)">
					<span class="btn-icon">{{ action.icon }}</span>
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

		<div v-if="loading" class="loading-indicator">
			<div class="loading-dots">
				<span></span><span></span><span></span>
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
					{ label: 'Formal', value: 'formal', icon: '\u2727' },
					{ label: 'Casual', value: 'casual', icon: '\u263A' },
					{ label: 'Academic', value: 'academic', icon: '\u2736' },
					{ label: 'Creative', value: 'creative', icon: '\u270E' }
				],
				actions: [
					{ label: 'Concise', value: 'concise', icon: '\u2702' },
					{ label: 'Professional', value: 'professional', icon: '\u2606' },
					{ label: 'Simplify', value: 'simplify', icon: '\u25CB' },
					{ label: 'Expand', value: 'expand', icon: '\u2295' }
				]
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
		gap: 12px;
		flex-wrap: wrap;

		.divider {
			width: 1px;
			height: 24px;
			background: var(--border);
			flex-shrink: 0;
		}

		.action-group {
			display: flex;
			align-items: center;
			gap: 5px;
			flex-wrap: wrap;

			.group-label {
				font-family: 'Cormorant Garamond', Georgia, serif;
				font-size: 12px;
				font-weight: 600;
				color: var(--textMuted);
				text-transform: uppercase;
				letter-spacing: 1.5px;
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
		font-family: 'Source Sans 3', sans-serif;
		font-size: 12.5px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		white-space: nowrap;
		display: inline-flex;
		align-items: center;
		gap: 4px;

		.btn-icon {
			font-size: 11px;
			opacity: 0.7;
		}

		&:hover:not(:disabled) {
			background: var(--accentSoft);
			border-color: var(--accent);
			color: var(--accent);
			transform: translateY(-1px);
			box-shadow: 0 2px 8px var(--shadowLight);
		}

		&:active:not(:disabled) {
			transform: translateY(0);
			background: var(--accent);
			color: white;
		}

		&:disabled {
			opacity: 0.45;
			cursor: not-allowed;
		}

		&.active {
			background: var(--accent);
			color: white;
			border-color: var(--accent);
			box-shadow: 0 2px 8px var(--shadowAccent);
		}

		&.grammar-btn {
			border-color: var(--successBorder);
			color: var(--success);
			&:hover:not(:disabled) {
				background: var(--successSoft);
				border-color: var(--success);
			}
		}

		&.suggest-btn {
			border-color: var(--accentBorder);
			color: var(--accent);
			&:hover:not(:disabled) {
				background: var(--accentSoft);
				border-color: var(--accent);
			}
		}
	}

	.loading-indicator {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 10px;
		padding: 8px 14px;
		background: var(--accentSoft);
		border-radius: 8px;
		border: 1px solid var(--accentBorder);

		.loading-dots {
			display: flex;
			gap: 4px;
			span {
				width: 6px;
				height: 6px;
				border-radius: 50%;
				background: var(--accent);
				animation: dotBounce 1.2s ease-in-out infinite;
				&:nth-child(2) { animation-delay: 0.15s; }
				&:nth-child(3) { animation-delay: 0.3s; }
			}
		}

		.loading-text {
			font-family: 'Source Sans 3', sans-serif;
			font-size: 13px;
			color: var(--textSecondary);
			font-style: italic;
		}
	}

	.error-message {
		margin-top: 8px;
		padding: 8px 14px;
		background: var(--errorSoft);
		border: 1px solid var(--errorBorder);
		border-radius: 8px;
		font-family: 'Source Sans 3', sans-serif;
		font-size: 13px;
		color: var(--error);
		cursor: pointer;
		display: flex;
		justify-content: space-between;
		align-items: center;
		transition: opacity 0.2s;

		.dismiss {
			font-size: 11px;
			color: var(--textMuted);
			text-decoration: underline;
			text-underline-offset: 2px;
		}
	}

	.ai-suggestions {
		margin-top: 10px;

		.suggestions-label {
			font-family: 'Cormorant Garamond', Georgia, serif;
			font-size: 12px;
			font-weight: 600;
			color: var(--textMuted);
			text-transform: uppercase;
			letter-spacing: 1.5px;
		}

		.ai-suggestion-item {
			margin-top: 6px;
			padding: 8px 14px;
			background: var(--surface);
			border: 1px solid var(--border);
			border-radius: 8px;
			font-family: 'Source Sans 3', sans-serif;
			font-size: 13.5px;
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
				border-radius: 50%;
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
				background: var(--accentSoft);
				border-color: var(--accent);
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
			font-family: 'Source Sans 3', sans-serif;
			font-size: 11px;
			font-weight: 500;
			color: var(--textMuted);
			white-space: nowrap;
			letter-spacing: 0.5px;
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
				&.normal { background: var(--success); }
				&.warning { background: var(--warning); }
				&.critical { background: var(--error); }
			}
		}
	}

	@keyframes dotBounce {
		0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
		40% { transform: scale(1); opacity: 1; }
	}
}
</style>
