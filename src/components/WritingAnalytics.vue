<template>
	<div class="writing-analytics" v-if="stats.wordCount > 0 || alwaysShow">
		<div class="analytics-grid">
			<div class="stat-item">
				<span class="stat-value">{{ stats.wordCount }}</span>
				<span class="stat-label">Words</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{{ stats.charCount }}</span>
				<span class="stat-label">Characters</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{{ stats.sentenceCount }}</span>
				<span class="stat-label">Sentences</span>
			</div>
			<div class="stat-item">
				<span class="stat-value">{{ stats.readingTime }}</span>
				<span class="stat-label">Read Time</span>
			</div>
			<div class="stat-item">
				<span class="stat-value" :class="readabilityClass">{{ stats.readabilityScore }}</span>
				<span class="stat-label">Readability</span>
			</div>
			<div class="stat-item">
				<span class="stat-value tone-badge" :class="'tone-' + stats.toneIndicator">{{ stats.toneIndicator }}</span>
				<span class="stat-label">Tone</span>
			</div>
		</div>
		<div class="readability-bar">
			<div class="bar-track">
				<div class="bar-fill" :style="{ width: stats.readabilityScore + '%' }" :class="readabilityClass"></div>
			</div>
			<span class="bar-label">{{ stats.readabilityLabel }}</span>
		</div>
	</div>
</template>

<script>
	export default {
		name: 'WritingAnalytics',
		props: {
			stats: {
				type: Object,
				required: true
			},
			alwaysShow: {
				type: Boolean,
				default: false
			}
		},
		computed: {
			readabilityClass () {
				if (this.stats.readabilityScore >= 60) return 'good'
				if (this.stats.readabilityScore >= 40) return 'moderate'
				return 'difficult'
			}
		}
	}
</script>

<style lang="scss" scoped>
.writing-analytics {
  width: 100%;
  padding: 8px 16px;
  background: #f8f7ff;
  border-top: 1px solid rgba(var(--colorAccentRGB), 0.15);

  .analytics-grid {
    display: flex;
    justify-content: space-around;
    gap: 8px;
    margin-bottom: 6px;

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;

      .stat-value {
        font-size: 14px;
        font-weight: 600;
        color: #333;
        text-transform: capitalize;

        &.good { color: #22c55e; }
        &.moderate { color: #f59e0b; }
        &.difficult { color: #ef4444; }
      }

      .tone-badge {
        font-size: 11px;
        padding: 1px 8px;
        border-radius: 999px;
        color: white;

        &.tone-formal { background: #6366f1; }
        &.tone-casual { background: #f59e0b; }
        &.tone-neutral { background: #94a3b8; }
      }

      .stat-label {
        font-size: 10px;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }
  }

  .readability-bar {
    display: flex;
    align-items: center;
    gap: 8px;

    .bar-track {
      flex: 1;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;

      .bar-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease;

        &.good { background: #22c55e; }
        &.moderate { background: #f59e0b; }
        &.difficult { background: #ef4444; }
      }
    }

    .bar-label {
      font-size: 10px;
      color: #666;
      white-space: nowrap;
    }
  }
}
</style>
