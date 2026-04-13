<template>
	<div class="writing-analytics" v-if="stats.wordCount > 0 || alwaysShow">
		<div class="analytics-grid">
			<div class="stat-item" v-for="stat in displayStats" :key="stat.label">
				<span class="stat-value" :class="stat.class || ''">{{ stat.value }}</span>
				<span class="stat-label">{{ stat.label }}</span>
			</div>
		</div>
		<div class="readability-row">
			<div class="readability-bar">
				<div class="bar-track">
					<div class="bar-fill" :style="{ width: stats.readabilityScore + '%' }" :class="readabilityClass"></div>
				</div>
			</div>
			<span class="readability-label" :class="readabilityClass">{{ stats.readabilityLabel }}</span>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'WritingAnalytics',
		props: {
			stats: { type: Object, required: true },
			alwaysShow: { type: Boolean, default: false }
		},
		computed: {
			readabilityClass () {
				if (this.stats.readabilityScore >= 60) return 'good'
				if (this.stats.readabilityScore >= 40) return 'moderate'
				return 'difficult'
			},
			displayStats () {
				return [
					{ value: this.stats.wordCount, label: 'Words' },
					{ value: this.stats.charCount, label: 'Chars' },
					{ value: this.stats.sentenceCount, label: 'Sentences' },
					{ value: this.stats.readingTime, label: 'Read' },
					{ value: this.stats.readabilityScore, label: 'Score', class: this.readabilityClass },
					{ value: this.stats.toneIndicator, label: 'Tone', class: 'tone tone-' + this.stats.toneIndicator }
				]
			}
		}
	}
</script>

<style lang="scss" scoped>
.writing-analytics {
	width: 100%;
	padding: 8px 20px 6px;
	background: var(--analyticsBar);
	border-top: 1px solid var(--border);

	.analytics-grid {
		display: flex;
		justify-content: space-between;
		gap: 4px;
		margin-bottom: 5px;

		.stat-item {
			display: flex;
			align-items: center;
			gap: 5px;

			.stat-value {
				font-family: 'Outfit', sans-serif;
				font-size: 13px;
				font-weight: 600;
				color: var(--textPrimary);
				text-transform: capitalize;

				&.good { color: var(--success); text-shadow: 0 0 8px rgba(0, 220, 130, 0.3); }
				&.moderate { color: var(--warning); text-shadow: 0 0 8px rgba(255, 184, 0, 0.3); }
				&.difficult { color: var(--error); text-shadow: 0 0 8px rgba(255, 75, 75, 0.3); }

				&.tone {
					font-family: 'DM Sans', sans-serif;
					font-size: 11px;
					padding: 1px 10px;
					border-radius: 4px;
					font-weight: 500;
				}
				&.tone-formal {
					background: var(--accentSoft);
					color: var(--accent);
				}
				&.tone-casual {
					background: var(--warningSoft);
					color: var(--warning);
				}
				&.tone-neutral {
					background: var(--border);
					color: var(--textMuted);
				}
			}

			.stat-label {
				font-family: 'DM Sans', sans-serif;
				font-size: 10px;
				font-weight: 500;
				color: var(--textMuted);
				text-transform: uppercase;
				letter-spacing: 0.8px;
			}
		}
	}

	.readability-row {
		display: flex;
		align-items: center;
		gap: 10px;

		.readability-bar {
			flex: 1;
			.bar-track {
				height: 3px;
				background: var(--border);
				border-radius: 3px;
				overflow: hidden;

				.bar-fill {
					height: 100%;
					border-radius: 3px;
					transition: width 0.4s ease;
					&.good { background: var(--success); box-shadow: 0 0 6px rgba(0, 220, 130, 0.3); }
					&.moderate { background: var(--warning); box-shadow: 0 0 6px rgba(255, 184, 0, 0.3); }
					&.difficult { background: var(--error); box-shadow: 0 0 6px rgba(255, 75, 75, 0.3); }
				}
			}
		}

		.readability-label {
			font-family: 'Outfit', sans-serif;
			font-size: 10px;
			font-weight: 600;
			letter-spacing: 0.5px;
			white-space: nowrap;
			text-transform: uppercase;

			&.good { color: var(--success); }
			&.moderate { color: var(--warning); }
			&.difficult { color: var(--error); }
		}
	}
}
</style>
