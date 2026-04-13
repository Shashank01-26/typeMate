<template>
	<div class="suggestion" :style="{top: suggestionRect.top, left: suggestionRect.left, transform: `scaleY(${suggestions.length > 0 ? 1 : 0})`}">
		<span v-for="(suggestion, index) in suggestions" :key="index" :class="index === activeSuggestion ? 'active' : ''"
			@click.stop="() => updateActiveSuggestion(index)">{{ suggestion.display }}</span>
	</div>
</template>

<script>
	export default {
		name: 'Suggestion',
		props: ['suggestions', 'activeSuggestion', 'suggestionRect', 'updateActiveSuggestion'],
		mounted () {
		}
	}
</script>

<style lang="scss">
.suggestion {
	$radius: 8px;

	position: fixed;
	background: var(--accent);
	border-radius: $radius;
	border: 1px solid var(--accent);
	display: flex;
	box-shadow: 0 8px 30px var(--shadowAccent), 0 2px 8px var(--shadowLight);
	flex-direction: column;
	transform-origin: 50% 0;
	user-select: none;
	transition: all 0.15s ease-out;
	z-index: 100;
	backdrop-filter: blur(10px);

	> span {
		min-width: 180px;
		padding: 8px 16px;
		background: var(--surface);
		border-bottom: 1px solid var(--border);
		color: var(--textPrimary);
		font-family: 'Source Sans 3', sans-serif;
		font-size: 13.5px;
		cursor: pointer;
		transition: all 0.12s ease;

		&:hover {
			background: var(--accentSoft);
			color: var(--accent);
		}
		&:active {
			background: var(--accent);
			color: white;
		}

		&.active {
			background: var(--accent);
			color: white;
		}

		&:first-of-type {
			border-top-left-radius: $radius - 1;
			border-top-right-radius: $radius - 1;
		}
		&:last-of-type {
			border-bottom-left-radius: $radius - 1;
			border-bottom-right-radius: $radius - 1;
			border-bottom: none;
		}
	}
}
</style>
