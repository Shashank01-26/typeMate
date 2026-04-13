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
			<div class="action-group">
				<span class="group-label">Quick Actions</span>
				<button v-for="action in actions" :key="action.value"
					class="action-btn quick-btn"
					:disabled="loading"
					@click="$emit('quick-action', action.value)">
					{{ action.label }}
				</button>
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
			<span class="loading-dot"></span>
			<span class="loading-text">{{ loadingMessage }}</span>
		</div>

		<div v-if="error" class="error-message" @click="$emit('clear-error')">
			{{ error }}
			<span class="dismiss">dismiss</span>
		</div>

		<div v-if="aiSuggestions.length > 0" class="ai-suggestions">
			<span class="suggestions-label">AI Suggestions:</span>
			<div v-for="(suggestion, i) in aiSuggestions" :key="i"
				class="ai-suggestion-item" @click="$emit('apply-suggestion', suggestion)">
				{{ suggestion }}
			</div>
		</div>

		<div class="usage-bar" v-if="usage">
			<span class="usage-text">{{ usage.dailyUsed }}/{{ usage.dailyLimit }} daily calls</span>
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
					{ label: 'Creative', value: 'creative' }
				],
				actions: [
					{ label: 'Concise', value: 'concise' },
					{ label: 'Professional', value: 'professional' },
					{ label: 'Simplify', value: 'simplify' },
					{ label: 'Expand', value: 'expand' }
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
  padding: 8px 12px;
  background: white;
  border-top: 1px solid rgba(var(--colorAccentRGB), 0.1);

  .actions-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .action-group {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;

      .group-label {
        font-size: 10px;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-right: 4px;
        font-weight: 600;
      }
    }
  }

  .action-btn {
    padding: 4px 12px;
    border: 1px solid rgba(var(--colorAccentRGB), 0.3);
    border-radius: 999px;
    background: white;
    color: #555;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.15s ease;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background: rgba(var(--colorAccentRGB), 0.08);
      border-color: var(--colorAccent);
      color: var(--colorAccent);
    }

    &:active:not(:disabled) {
      background: var(--colorAccent);
      color: white;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &.active {
      background: var(--colorAccent);
      color: white;
      border-color: var(--colorAccent);
    }

    &.grammar-btn {
      border-color: #22c55e;
      color: #16a34a;
      &:hover:not(:disabled) { background: #f0fdf4; }
    }

    &.suggest-btn {
      border-color: #6366f1;
      color: #4f46e5;
      &:hover:not(:disabled) { background: #eef2ff; }
    }
  }

  .loading-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    padding: 6px 12px;
    background: rgba(var(--colorAccentRGB), 0.05);
    border-radius: 8px;

    .loading-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--colorAccent);
      animation: pulse 0.8s ease-in-out infinite alternate;
    }

    .loading-text {
      font-size: 12px;
      color: #666;
    }
  }

  .error-message {
    margin-top: 6px;
    padding: 6px 12px;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    font-size: 12px;
    color: #dc2626;
    cursor: pointer;
    display: flex;
    justify-content: space-between;

    .dismiss {
      color: #999;
      text-decoration: underline;
    }
  }

  .ai-suggestions {
    margin-top: 8px;

    .suggestions-label {
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .ai-suggestion-item {
      margin-top: 4px;
      padding: 6px 12px;
      background: #f8f7ff;
      border: 1px solid rgba(var(--colorAccentRGB), 0.15);
      border-radius: 8px;
      font-size: 13px;
      color: #333;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(var(--colorAccentRGB), 0.1);
        border-color: var(--colorAccent);
      }
    }
  }

  .usage-bar {
    margin-top: 8px;
    display: flex;
    align-items: center;
    gap: 8px;

    .usage-text {
      font-size: 10px;
      color: #999;
      white-space: nowrap;
    }

    .usage-track {
      flex: 1;
      height: 3px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;

      .usage-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease;

        &.normal { background: #22c55e; }
        &.warning { background: #f59e0b; }
        &.critical { background: #ef4444; }
      }
    }
  }

  @keyframes pulse {
    0% { opacity: 0.3; transform: scale(0.8); }
    100% { opacity: 1; transform: scale(1); }
  }
}
</style>
