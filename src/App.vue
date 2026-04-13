<template>
	<div :class="['typemateApp', { dark: isDark }]">
		<Logo v-show="appLoading" />
		<div :class="['editorShell', { loading: appLoading }]">
			<!-- Header bar -->
			<div class="shell-header">
				<div class="header-brand">
					<svg class="brand-icon" viewBox="0 0 80 100" fill="none">
						<path d="M48 4L12 56H36L28 96L68 40H44L48 4Z" fill="url(#brandGrad2)"/>
						<defs>
							<linearGradient id="brandGrad2" x1="12" y1="4" x2="68" y2="96" gradientUnits="userSpaceOnUse">
								<stop offset="0" stop-color="#FFD93D"/>
								<stop offset="0.5" stop-color="#FFAA00"/>
								<stop offset="1" stop-color="#FF6B00"/>
							</linearGradient>
						</defs>
					</svg>
					<span class="brand-name">Type<span class="brand-accent">Mate</span></span>
				</div>
				<div class="header-controls">
					<div :class="['modeToggle', { active: suggestionMode === 'word' }, { loading: suggestionLoading }]"
						@click="toggleSuggestionMode">
						<span class="toggle-indicator"></span>
						<span class="toggle-label">{{ suggestionLoading ? 'Loading...' : (suggestionMode === 'sentence' ? 'Sentence' : 'Word') }}</span>
					</div>
					<button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
						<svg v-if="!isDark" class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
							<path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<svg v-else class="theme-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
							<circle cx="12" cy="12" r="5"/>
							<line x1="12" y1="1" x2="12" y2="3" stroke-linecap="round"/><line x1="12" y1="21" x2="12" y2="23" stroke-linecap="round"/>
							<line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke-linecap="round"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke-linecap="round"/>
							<line x1="1" y1="12" x2="3" y2="12" stroke-linecap="round"/><line x1="21" y1="12" x2="23" y2="12" stroke-linecap="round"/>
							<line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke-linecap="round"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke-linecap="round"/>
						</svg>
					</button>
				</div>
			</div>

			<!-- Editor -->
			<VueEditor ref="vEditor" v-model="editorContent" :editor-toolbar="customToolbar" />

			<!-- AI Tools -->
			<QuickActions
				:loading="aiLoading"
				:loadingMessage="aiLoadingMessage"
				:error="aiError"
				:aiSuggestions="aiSuggestions"
				:usage="aiUsage"
				:activeTone="activeTone"
				@change-tone="handleChangeTone"
				@quick-action="handleQuickAction"
				@improve-grammar="handleImproveGrammar"
				@get-suggestions="handleGetSuggestions"
				@apply-suggestion="handleApplySuggestion"
				@clear-error="aiError = ''"
			/>

			<!-- Analytics footer -->
			<WritingAnalytics :stats="writingStats" :alwaysShow="true" />
		</div>

		<SuggestionOverlay :suggestions=suggestions :activeSuggestion=activeEditorState.suggestion
			:suggestionRect=suggestionRect :updateActiveSuggestion=updateActiveSuggestion />
	</div>
</template>

<script>
	import { VueEditor, Quill } from 'vue2-editor'
	import SuggestionOverlay from './components/Suggestion.vue'
	import Logo from './components/Logo.vue'
	import QuickActions from './components/QuickActions.vue'
	import WritingAnalytics from './components/WritingAnalytics.vue'
	import getSuggestions from './utils/suggestionService'
	import { changeTone, improveGrammar, getContextSuggestions, quickAction, analyzeWriting, getUsageStats } from './utils/aiService'

	let editor
	const fontList = ['Quicksand', 'Arial', 'Courier', 'Garamond', 'Tahoma', 'Times New Roman', 'Verdana']
	const fontNames = fontList.map(font => font.toLowerCase().replace(/\s/g, '-'))
	const fonts = Quill.import('formats/font')
	fonts.whitelist = fontNames
	Quill.register(fonts, true)

	let fontStyles = ''
	fontList.forEach(function (font) {
		const fontName = font.toLowerCase().replace(/\s/g, '-')
		fontStyles += `
			.ql-snow .ql-picker.ql-font .ql-picker-label[data-value=${fontName}]::before,
			.ql-snow .ql-picker.ql-font .ql-picker-item[data-value=${fontName}]::before {
				content: '${font}';
				font-family: '${font}', sans-serif;
			}
			.ql-font-${fontName} {
				font-family: '${font}', sans-serif;
			}
		`
	})

	const node = document.createElement('style')
	node.innerHTML = fontStyles
	document.body.appendChild(node)

	export default {
		name: 'App',
		data: () => ({
			appLoading: true,
			suggestionLoading: true,
			isDark: true,
			editorContent: '<p class="ql-font-quicksand"><span class="ql-font-quicksand">Hello There, Welcome to TypeMate \u2014 Your AI Writing Assistant!</span></p>',
			sentences: [],
			suggestions: [],
			suggestionMode: 'sentence',
			suggestionRect: { top: 0, left: 0 },
			activeEditorState: { suggestion: 0, index: 0 },
			aiLoading: false,
			aiLoadingMessage: 'Processing...',
			aiError: '',
			aiSuggestions: [],
			aiUsage: null,
			activeTone: '',
			writingStats: {
				wordCount: 0,
				charCount: 0,
				sentenceCount: 0,
				avgWordsPerSentence: 0,
				readabilityScore: 0,
				readabilityLabel: 'N/A',
				toneIndicator: 'neutral',
				readingTime: '0 sec'
			},
			customToolbar: [
				[{ font: fonts.whitelist }],
				[{ header: [false, 1, 2, 3, 4, 5, 6] }],
				['bold', 'italic', 'underline', 'strike'],
				[
					{ align: '' },
					{ align: 'center' },
					{ align: 'right' },
					{ align: 'justify' }
				],
				['blockquote', 'code-block'],
				[{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
				[{ indent: '-1' }, { indent: '+1' }],
				[{ color: [] }, { background: [] }],
				['link', 'image', 'video'],
				['clean']
			]
		}),
		async mounted () {
			const app = this

			const savedTheme = localStorage.getItem('typemate-theme')
			if (savedTheme === 'light') {
				this.isDark = false
			}
			this.updateFavicon()

			setTimeout(() => (app.appLoading = false), 2800)
			editor = app.$refs.vEditor.quill
			let suggestionService

			const res = await fetch('/sentences.json')
			const sentences = await res.json()
			this.sentences = sentences
			this.suggestionLoading = false

			editor.on('editor-change', async function (event, data) {
				const selection = editor.root.ownerDocument.getSelection()
				const text = editor.getText()

				if (selection.rangeCount > 0) {
					const rects = selection.getRangeAt(0).getClientRects()
					if (rects.length > 0) {
						app.suggestionRect = {
							top: (rects[0].top + rects[0].height) + 'px',
							left: rects[0].left + 'px'
						}
					}
				}

				if (event === 'selection-change') {
					clearTimeout(suggestionService)
					suggestionService = setTimeout(() => getSuggestions(app.sentences, text, data?.index, app.suggestionMode)
						.then((suggestionList) => {
							app.activeEditorState.index = data?.index
							app.suggestions = suggestionList
						}), 100)
				}
			})
		},
		watch: {
			editorContent: function (val) {
				this.writingStats = analyzeWriting(val)
				this.aiSuggestions = []
			},
			suggestions: function () {
				editor.keyboard.addBinding({ key: 'up', handler: this.suggestionUp })
				editor.keyboard.addBinding({ key: 'down', handler: this.suggestionDown })
				editor.keyboard.bindings[9].unshift({ key: 9, handler: this.acceptSuggestion })
				editor.keyboard.bindings[13].unshift({ key: 13, handler: this.acceptSuggestion })
			}
		},
		methods: {
			toggleTheme: function () {
				this.isDark = !this.isDark
				localStorage.setItem('typemate-theme', this.isDark ? 'dark' : 'light')
				this.updateFavicon()
			},
			updateFavicon: function () {
				const favicon = document.getElementById('favicon')
				const themeMeta = document.getElementById('theme-color-meta')
				if (favicon) {
					favicon.href = this.isDark ? '/img/icons/favicon-dark.svg' : '/img/icons/favicon-light.svg'
				}
				if (themeMeta) {
					themeMeta.content = this.isDark ? '#0B1120' : '#F5F1EB'
				}
			},
			suggestionUp: function () {
				if (!this.suggestions.length) return true
				this.activeEditorState.suggestion = Math.max(this.activeEditorState.suggestion - 1, 0)
			},
			suggestionDown: function () {
				if (!this.suggestions.length) return true
				this.activeEditorState.suggestion = Math.min(this.activeEditorState.suggestion + 1, this.suggestions.length - 1)
			},
			acceptSuggestion: function () {
				if (!this.suggestions.length) return true
				const suggestion = this.suggestions[this.activeEditorState.suggestion].value
				editor.insertText(this.activeEditorState.index, suggestion)
				editor.setSelection(this.activeEditorState.index + suggestion.length, 0)
				this.activeEditorState.suggestion = 0
			},
			updateActiveSuggestion: function (newSuggestion) {
				this.activeEditorState.suggestion = newSuggestion
				this.acceptSuggestion()
				this.suggestions = []
			},
			toggleSuggestionMode: function () {
				this.suggestionMode = this.suggestionMode === 'sentence' ? 'word' : 'sentence'
			},
			getSelectedText: function () {
				const selection = editor.getSelection()
				if (selection && selection.length > 0) {
					return { text: editor.getText(selection.index, selection.length), selection }
				}
				const text = editor.getText().trim()
				return text ? { text, selection: { index: 0, length: editor.getLength() - 1 } } : null
			},
			replaceText: function (newText, selection) {
				if (selection) {
					editor.deleteText(selection.index, selection.length)
					editor.insertText(selection.index, newText)
					editor.setSelection(selection.index, newText.length)
				}
			},
			updateUsage: function () {
				this.aiUsage = getUsageStats()
			},
			handleChangeTone: async function (tone) {
				const ctx = this.getSelectedText()
				if (!ctx) { this.aiError = 'No text to transform. Start writing first!'; return }
				this.aiLoading = true
				this.aiLoadingMessage = `Changing tone to ${tone}...`
				this.aiError = ''
				this.activeTone = tone
				try {
					const result = await changeTone(ctx.text, tone)
					this.replaceText(result, ctx.selection)
				} catch (e) {
					this.aiError = e.message
				} finally {
					this.aiLoading = false
					this.updateUsage()
				}
			},
			handleQuickAction: async function (action) {
				const ctx = this.getSelectedText()
				if (!ctx) { this.aiError = 'No text to transform. Start writing first!'; return }
				this.aiLoading = true
				this.aiLoadingMessage = `Making text ${action}...`
				this.aiError = ''
				try {
					const result = await quickAction(ctx.text, action)
					this.replaceText(result, ctx.selection)
				} catch (e) {
					this.aiError = e.message
				} finally {
					this.aiLoading = false
					this.updateUsage()
				}
			},
			handleImproveGrammar: async function () {
				const ctx = this.getSelectedText()
				if (!ctx) { this.aiError = 'No text to check. Start writing first!'; return }
				this.aiLoading = true
				this.aiLoadingMessage = 'Fixing grammar & improving clarity...'
				this.aiError = ''
				try {
					const result = await improveGrammar(ctx.text)
					this.replaceText(result, ctx.selection)
				} catch (e) {
					this.aiError = e.message
				} finally {
					this.aiLoading = false
					this.updateUsage()
				}
			},
			handleGetSuggestions: async function () {
				const ctx = this.getSelectedText()
				if (!ctx) { this.aiError = 'No text to analyze. Start writing first!'; return }
				this.aiLoading = true
				this.aiLoadingMessage = 'Getting AI suggestions...'
				this.aiError = ''
				try {
					this.aiSuggestions = await getContextSuggestions(ctx.text)
				} catch (e) {
					this.aiError = e.message
				} finally {
					this.aiLoading = false
					this.updateUsage()
				}
			},
			handleApplySuggestion: function (suggestion) {
				const selection = editor.getSelection()
				const index = selection ? selection.index + selection.length : editor.getLength() - 1
				editor.insertText(index, ' ' + suggestion)
				this.aiSuggestions = []
			}
		},
		components: { VueEditor, SuggestionOverlay, Logo, QuickActions, WritingAnalytics }
	}
</script>

<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');

	/* ===== DARK THEME (Thunderstrike - Default) ===== */
	.typemateApp {
		--accent: #FFAA00;
		--accentContrast: #0B1120;
		--accentHot: #FF6B00;
		--accentLight: #FFD93D;
		--purple: #FF8C00;
		--accentSoft: rgba(255, 170, 0, 0.08);
		--accentBorder: rgba(255, 170, 0, 0.2);
		--purpleSoft: rgba(255, 140, 0, 0.08);
		--purpleBorder: rgba(255, 140, 0, 0.2);
		--glowSoft: rgba(255, 170, 0, 0.1);
		--glowMedium: rgba(255, 170, 0, 0.2);
		--glowStrong: rgba(255, 170, 0, 0.35);
		--shadowLight: rgba(0, 0, 0, 0.25);
		--shadowMedium: rgba(0, 0, 0, 0.45);

		--bg: #0B1120;
		--surface: #111A2E;
		--surfaceElevated: #162036;
		--splashBg: #0B1120;

		--textPrimary: #EAE6DF;
		--textSecondary: #8E99AD;
		--textMuted: #4A5568;

		--border: rgba(234, 230, 223, 0.08);
		--borderStrong: rgba(234, 230, 223, 0.12);

		--toolbarBg: #111A2E;
		--toolbarIcon: #5E6B82;
		--toolbarIconHover: #FFAA00;

		--editorBg: #0D1526;
		--analyticsBar: #0F1729;

		--success: #34D399;
		--successSoft: rgba(52, 211, 153, 0.08);
		--successBorder: rgba(52, 211, 153, 0.2);
		--warning: #FFAA00;
		--warningSoft: rgba(255, 170, 0, 0.08);
		--error: #F87171;
		--errorSoft: rgba(248, 113, 113, 0.06);
		--errorBorder: rgba(248, 113, 113, 0.15);

		--headerBg: #111A2E;
		--headerBorder: rgba(255, 170, 0, 0.1);
	}

	/* ===== LIGHT THEME (Thunderstrike Light) ===== */
	.typemateApp:not(.dark) {
		--accent: #D97706;
		--accentContrast: #FFFFFF;
		--accentHot: #C2410C;
		--accentLight: #F59E0B;
		--purple: #EA580C;
		--accentSoft: rgba(217, 119, 6, 0.06);
		--accentBorder: rgba(217, 119, 6, 0.2);
		--purpleSoft: rgba(234, 88, 12, 0.06);
		--purpleBorder: rgba(234, 88, 12, 0.2);
		--glowSoft: rgba(217, 119, 6, 0.06);
		--glowMedium: rgba(217, 119, 6, 0.1);
		--glowStrong: rgba(217, 119, 6, 0.18);
		--shadowLight: rgba(0, 0, 0, 0.05);
		--shadowMedium: rgba(0, 0, 0, 0.08);

		--bg: #F5F1EB;
		--surface: #FFFEFA;
		--surfaceElevated: #F9F6F0;
		--splashBg: #F5F1EB;

		--textPrimary: #1C1917;
		--textSecondary: #57534E;
		--textMuted: #A8A29E;

		--border: rgba(28, 25, 23, 0.08);
		--borderStrong: rgba(28, 25, 23, 0.12);

		--toolbarBg: #FFFEFA;
		--toolbarIcon: #78716C;
		--toolbarIconHover: #D97706;

		--editorBg: #FFFEFA;
		--analyticsBar: #F9F6F0;

		--success: #059669;
		--successSoft: rgba(5, 150, 105, 0.06);
		--successBorder: rgba(5, 150, 105, 0.2);
		--warning: #D97706;
		--warningSoft: rgba(217, 119, 6, 0.06);
		--error: #DC2626;
		--errorSoft: rgba(220, 38, 38, 0.04);
		--errorBorder: rgba(220, 38, 38, 0.12);

		--headerBg: #FFFEFA;
		--headerBorder: rgba(217, 119, 6, 0.1);
	}

	/* ===== BASE RESET ===== */
	html, body {
		width: 100%;
		height: 100%;
		font-family: 'DM Sans', 'Quicksand', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;

		* {
			padding: 0;
			margin: 0;
			box-sizing: border-box;
		}
	}

	body {
		background: #0B1120;
		transition: background 0.4s ease;
	}

	/* ===== APP SHELL ===== */
	.typemateApp {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		overflow: hidden;
		background: var(--bg);
		transition: background 0.4s ease;

		/* Subtle vertical field lines */
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background-image:
				linear-gradient(rgba(255, 170, 0, 0.015) 1px, transparent 1px),
				linear-gradient(90deg, rgba(255, 170, 0, 0.015) 1px, transparent 1px);
			background-size: 50px 50px;
			pointer-events: none;
			z-index: 0;
		}

		&:not(.dark)::before {
			background-image:
				linear-gradient(rgba(217, 119, 6, 0.02) 1px, transparent 1px),
				linear-gradient(90deg, rgba(217, 119, 6, 0.02) 1px, transparent 1px);
		}

		/* Storm glow - top corner */
		&::after {
			content: '';
			position: absolute;
			width: 600px;
			height: 400px;
			border-radius: 50%;
			background: radial-gradient(ellipse, rgba(255, 170, 0, 0.05), rgba(255, 107, 0, 0.02) 40%, transparent 70%);
			top: -200px;
			right: -100px;
			pointer-events: none;
			z-index: 0;
			animation: stormGlow 10s ease-in-out infinite;
		}

		&:not(.dark)::after {
			background: radial-gradient(ellipse, rgba(217, 119, 6, 0.04), transparent 70%);
		}

		/* ===== EDITOR SHELL ===== */
		.editorShell {
			$duration: 0.45s;

			position: relative;
			width: min(96%, 1100px);
			height: 94%;
			display: flex;
			flex-direction: column;
			background: var(--surface);
			border: 1px solid var(--borderStrong);
			border-radius: 16px;
			box-shadow:
				0 4px 30px var(--shadowLight),
				0 0 1px var(--borderStrong);
			overflow: hidden;
			z-index: 1;
			transition: all $duration cubic-bezier(0.16, 1, 0.3, 1);
			transform: scale(1);
			opacity: 1;

			&.loading {
				transform: scale(0.92);
				opacity: 0;
				pointer-events: none;
			}

			/* ===== HEADER BAR ===== */
			.shell-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 10px 20px;
				background: var(--headerBg);
				border-bottom: 1px solid var(--headerBorder);
				flex-shrink: 0;

				.header-brand {
					display: flex;
					align-items: center;
					gap: 10px;

					.brand-icon {
						width: 20px;
						height: 25px;
						filter: drop-shadow(0 0 6px rgba(255, 170, 0, 0.35));
					}

					.brand-name {
						font-family: 'Orbitron', sans-serif;
						font-size: 17px;
						font-weight: 800;
						color: var(--textPrimary);
						letter-spacing: 2.5px;
						text-transform: uppercase;

						.brand-accent {
							color: #FFAA00;
							text-shadow: 0 0 14px rgba(255, 170, 0, 0.35), 0 0 4px rgba(255, 170, 0, 0.2);
						}
					}
				}

				.header-controls {
					display: flex;
					align-items: center;
					gap: 10px;

					.modeToggle {
						position: relative;
						padding: 5px 16px 5px 24px;
						background: var(--surfaceElevated);
						border: 1px solid var(--border);
						border-radius: 20px;
						cursor: pointer;
						user-select: none;
						transition: all 0.25s ease;

						.toggle-indicator {
							position: absolute;
							left: 8px;
							top: 50%;
							transform: translateY(-50%);
							width: 8px;
							height: 8px;
							border-radius: 50%;
							background: var(--accent);
							box-shadow: 0 0 8px var(--glowMedium);
							transition: all 0.25s ease;
						}

						.toggle-label {
							font-family: 'DM Sans', sans-serif;
							font-size: 12px;
							font-weight: 500;
							color: var(--textSecondary);
							transition: color 0.2s;
						}

						&:hover {
							border-color: var(--accent);
							box-shadow: 0 0 12px var(--glowSoft);
						}

						&.active .toggle-indicator {
							background: var(--accentHot);
							box-shadow: 0 0 8px rgba(255, 107, 0, 0.4);
						}

						&.loading {
							opacity: 0.5;
							pointer-events: none;
							.toggle-indicator {
								animation: indicatorPulse 1s ease-in-out infinite;
							}
						}
					}

					.theme-toggle {
						width: 36px;
						height: 36px;
						display: flex;
						align-items: center;
						justify-content: center;
						background: var(--surfaceElevated);
						border: 1px solid var(--border);
						border-radius: 10px;
						cursor: pointer;
						transition: all 0.25s ease;
						padding: 0;

						.theme-icon {
							width: 17px;
							height: 17px;
							color: var(--accent);
							transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
						}

						&:hover {
							border-color: var(--accent);
							box-shadow: 0 0 14px var(--glowMedium);
							background: var(--accentSoft);
							.theme-icon {
								transform: rotate(20deg) scale(1.1);
								filter: drop-shadow(0 0 4px var(--accent));
							}
						}
					}
				}
			}

			/* ===== QUILL EDITOR ===== */
			> .quillWrapper {
				position: relative;
				width: 100%;
				flex: 1;
				min-height: 0;
				background: var(--editorBg);
				display: flex;
				flex-direction: column;
				overflow: hidden;
				transition: background 0.4s ease;

				> .ql-toolbar {
					$radius: 8px;
					flex-shrink: 0;
					text-align: center;
					border: none !important;
					border-bottom: 1px solid var(--border) !important;
					padding: 10px 12px 8px !important;
					background: var(--toolbarBg);
					transition: all 0.4s ease;

					.ql-formats {
						margin-right: 6px !important;

						button {
							width: 28px !important;
							height: 28px !important;
							border-radius: 6px !important;
							transition: all 0.15s ease !important;

							&:hover {
								background: var(--accentSoft) !important;
								box-shadow: 0 0 8px var(--glowSoft) !important;
								.ql-stroke { stroke: var(--toolbarIconHover) !important; }
								.ql-fill { fill: var(--toolbarIconHover) !important; }
							}
						}

						.ql-stroke { stroke: var(--toolbarIcon) !important; transition: stroke 0.15s; }
						.ql-fill { fill: var(--toolbarIcon) !important; transition: fill 0.15s; }

						.ql-picker-label {
							color: var(--toolbarIcon) !important;
							border-radius: 6px !important;
							border-color: var(--border) !important;
							.ql-stroke { stroke: var(--toolbarIcon) !important; }
						}

						.ql-active {
							.ql-stroke { stroke: var(--accent) !important; }
							.ql-fill { fill: var(--accent) !important; }
						}
						.ql-active, button.ql-active {
							background: var(--accentSoft) !important;
							color: var(--accent) !important;
							box-shadow: 0 0 8px var(--glowSoft) !important;
						}
					}

					.ql-picker-options {
						border-radius: $radius !important;
						animation: showPicker 0.12s ease-in-out both;
						transform-origin: 50% 0;
						padding: 0 !important;
						background: var(--surface) !important;
						border: 1px solid var(--borderStrong) !important;
						box-shadow: 0 8px 30px var(--shadowMedium), 0 0 1px var(--borderStrong) !important;

						> span {
							min-width: 150px;
							padding: 7px 14px !important;
							background: var(--surface) !important;
							border-bottom: 1px solid var(--border) !important;
							border-left: none !important;
							border-right: none !important;
							border-top: none !important;
							color: var(--textPrimary) !important;
							font-size: 13px !important;
							font-family: 'DM Sans', sans-serif !important;
							cursor: pointer;
							transition: all 0.1s ease;

							&:hover {
								background: var(--accentSoft) !important;
								color: var(--accent) !important;
							}
							&:first-of-type {
								border-top-left-radius: $radius - 1 !important;
								border-top-right-radius: $radius - 1 !important;
							}
							&:last-of-type {
								border-bottom-left-radius: $radius - 1 !important;
								border-bottom-right-radius: $radius - 1 !important;
								border-bottom: none !important;
							}
						}
					}

					@keyframes showPicker {
						0% { transform: scaleY(0); opacity: 0; }
						100% { transform: scaleY(1); opacity: 1; }
					}
				}

				> .ql-container {
					flex: 1;
					min-height: 0;
					margin: 0;
					padding: 0;
					border: none !important;
					overflow-y: auto;

					.ql-editor {
						padding: 24px 32px;
						font-family: 'DM Sans', sans-serif;
						font-size: 15px;
						line-height: 1.8;
						color: var(--textPrimary);
						min-height: 100%;

						&.ql-blank::before {
							color: var(--textMuted);
							font-style: italic;
							font-family: 'DM Sans', sans-serif;
						}
					}
				}
			}
		}
	}

	@keyframes stormGlow {
		0%, 100% { opacity: 0.5; transform: translate(0, 0) scale(1); }
		50% { opacity: 1; transform: translate(-15px, 15px) scale(1.05); }
	}

	@keyframes indicatorPulse {
		0%, 100% { opacity: 0.4; }
		50% { opacity: 1; }
	}
</style>
