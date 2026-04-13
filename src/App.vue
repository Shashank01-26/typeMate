<template>
	<div :class="['typemateApp', { dark: isDark }]">
		<Logo v-show="appLoading" />
		<div :class="['editorShell', { loading: appLoading }]">
			<!-- Header bar -->
			<div class="shell-header">
				<div class="header-brand">
					<svg class="brand-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
						<path d="M44 8L56 20L24 52L8 56L12 40L44 8Z" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M36 16L48 28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
					</svg>
					<span class="brand-name">TypeMate</span>
				</div>
				<div class="header-controls">
					<div :class="['modeToggle', { flip: suggestionMode === 'word' }, { loading: suggestionLoading }]"
						@click="toggleSuggestionMode">
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
			isDark: false,
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

			// Restore theme preference
			const savedTheme = localStorage.getItem('typemate-theme')
			if (savedTheme === 'dark') {
				this.isDark = true
			}

			setTimeout(() => (app.appLoading = false), 2600)
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
	/* ===== FONTS ===== */
	@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@500&display=swap');

	/* ===== LIGHT THEME (Warm Study) ===== */
	.typemateApp {
		--accent: #B8860B;
		--accentWarm: #C4A882;
		--accentSoft: rgba(184, 134, 11, 0.08);
		--accentBorder: rgba(184, 134, 11, 0.25);
		--shadowAccent: rgba(184, 134, 11, 0.15);
		--shadowLight: rgba(0, 0, 0, 0.06);
		--shadowMedium: rgba(0, 0, 0, 0.1);

		--bg: #F5F0E8;
		--bgGrain: rgba(0, 0, 0, 0.015);
		--surface: #FFFDF8;
		--surfaceElevated: #FBF8F2;
		--splashBg: #F5F0E8;

		--textPrimary: #2C2418;
		--textSecondary: #5C4E3C;
		--textMuted: #9B8E7B;

		--border: rgba(44, 36, 24, 0.1);
		--borderStrong: rgba(44, 36, 24, 0.18);

		--toolbarBg: #FFFDF8;
		--toolbarIcon: #5C4E3C;
		--toolbarIconHover: #B8860B;

		--editorBg: #FFFDF8;
		--editorShadow: inset 0 0 12px 0px rgba(44, 36, 24, 0.08);

		--analyticsBar: #F9F5EE;

		--success: #5A8A3C;
		--successSoft: rgba(90, 138, 60, 0.08);
		--successBorder: rgba(90, 138, 60, 0.25);
		--warning: #C4882B;
		--warningSoft: rgba(196, 136, 43, 0.08);
		--error: #B54A3C;
		--errorSoft: rgba(181, 74, 60, 0.06);
		--errorBorder: rgba(181, 74, 60, 0.2);

		--headerBg: #FFFDF8;
		--headerBorder: rgba(44, 36, 24, 0.08);

		--toggleBg: var(--accent);
		--toggleText: white;
	}

	/* ===== DARK THEME (Warm Evening) ===== */
	.typemateApp.dark {
		--accent: #D4A745;
		--accentWarm: #C4A882;
		--accentSoft: rgba(212, 167, 69, 0.1);
		--accentBorder: rgba(212, 167, 69, 0.25);
		--shadowAccent: rgba(212, 167, 69, 0.12);
		--shadowLight: rgba(0, 0, 0, 0.15);
		--shadowMedium: rgba(0, 0, 0, 0.3);

		--bg: #1C1914;
		--bgGrain: rgba(255, 255, 255, 0.01);
		--surface: #262219;
		--surfaceElevated: #2C271E;
		--splashBg: #1C1914;

		--textPrimary: #E8E0D2;
		--textSecondary: #B5A998;
		--textMuted: #786D5E;

		--border: rgba(232, 224, 210, 0.08);
		--borderStrong: rgba(232, 224, 210, 0.14);

		--toolbarBg: #262219;
		--toolbarIcon: #B5A998;
		--toolbarIconHover: #D4A745;

		--editorBg: #22201A;
		--editorShadow: inset 0 0 12px 0px rgba(0, 0, 0, 0.3);

		--analyticsBar: #232019;

		--success: #7AAF56;
		--successSoft: rgba(122, 175, 86, 0.1);
		--successBorder: rgba(122, 175, 86, 0.2);
		--warning: #D4A745;
		--warningSoft: rgba(212, 167, 69, 0.1);
		--error: #D46B5C;
		--errorSoft: rgba(212, 107, 92, 0.08);
		--errorBorder: rgba(212, 107, 92, 0.2);

		--headerBg: #262219;
		--headerBorder: rgba(232, 224, 210, 0.06);

		--toggleBg: var(--accent);
		--toggleText: #1C1914;
	}

	/* ===== BASE RESET ===== */
	html, body {
		width: 100%;
		height: 100%;
		font-family: 'Source Sans 3', 'Quicksand', Helvetica, Arial, sans-serif;
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
		background: #F5F0E8;
		transition: background 0.35s ease;
	}

	.typemateApp.dark ~ body,
	.typemateApp.dark {
		body { background: #1C1914; }
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
		transition: background 0.35s ease;

		/* Subtle grain texture on background */
		&::before {
			content: '';
			position: absolute;
			inset: 0;
			background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
			pointer-events: none;
			z-index: 0;
		}

		/* ===== EDITOR SHELL ===== */
		.editorShell {
			$duration: 0.4s;

			position: relative;
			width: min(96%, 1100px);
			height: 94%;
			display: flex;
			flex-direction: column;
			background: var(--surface);
			border: 1px solid var(--borderStrong);
			border-radius: 16px;
			box-shadow:
				0 4px 24px var(--shadowLight),
				0 1px 4px var(--shadowLight);
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
						width: 24px;
						height: 24px;
						color: var(--accent);
					}

					.brand-name {
						font-family: 'Cormorant Garamond', Georgia, serif;
						font-size: 20px;
						font-weight: 600;
						color: var(--textPrimary);
						letter-spacing: 0.5px;
					}
				}

				.header-controls {
					display: flex;
					align-items: center;
					gap: 12px;

					.modeToggle {
						padding: 4px 16px;
						background: var(--accent);
						color: var(--toggleText);
						border-radius: 6px;
						font-family: 'Source Sans 3', sans-serif;
						font-size: 12px;
						font-weight: 600;
						letter-spacing: 0.5px;
						cursor: pointer;
						user-select: none;
						transition: all 0.2s ease;

						&:hover {
							box-shadow: 0 2px 10px var(--shadowAccent);
							transform: translateY(-1px);
						}
						&:active {
							transform: translateY(0);
						}
						&.loading {
							opacity: 0.6;
							pointer-events: none;
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
							width: 18px;
							height: 18px;
							color: var(--accent);
							transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
						}

						&:hover {
							background: var(--accentSoft);
							border-color: var(--accent);
							box-shadow: 0 2px 10px var(--shadowAccent);
							.theme-icon {
								transform: rotate(25deg) scale(1.1);
							}
						}
					}
				}
			}

			/* ===== QUILL EDITOR OVERRIDES ===== */
			> .quillWrapper {
				position: relative;
				width: 100%;
				flex: 1;
				min-height: 0;
				background: var(--editorBg);
				display: flex;
				flex-direction: column;
				overflow: hidden;
				transition: background 0.35s ease;

				> .ql-toolbar {
					$radius: 8px;
					flex-shrink: 0;
					text-align: center;
					border: none !important;
					border-bottom: 1px solid var(--border) !important;
					padding: 12px 12px 10px !important;
					background: var(--toolbarBg);
					transition: background 0.35s ease, border-color 0.35s ease;

					/* Style all toolbar buttons */
					.ql-formats {
						margin-right: 8px !important;

						button {
							width: 30px !important;
							height: 30px !important;
							border-radius: 6px !important;
							transition: all 0.15s ease !important;

							&:hover {
								background: var(--accentSoft) !important;
								.ql-stroke { stroke: var(--toolbarIconHover) !important; }
								.ql-fill { fill: var(--toolbarIconHover) !important; }
							}
						}

						.ql-stroke {
							stroke: var(--toolbarIcon) !important;
							transition: stroke 0.15s ease;
						}
						.ql-fill {
							fill: var(--toolbarIcon) !important;
							transition: fill 0.15s ease;
						}
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
						.ql-active,
						button.ql-active {
							background: var(--accentSoft) !important;
							color: var(--accent) !important;
						}
					}

					.ql-picker-options {
						border-radius: $radius !important;
						animation: showPicker 0.12s ease-in-out both;
						transform-origin: 50% 0;
						padding: 0 !important;
						background: var(--surface) !important;
						border: 1px solid var(--borderStrong) !important;
						box-shadow: 0 8px 30px var(--shadowMedium) !important;

						> span {
							min-width: 150px;
							padding: 8px 16px !important;
							background: var(--surface) !important;
							border-bottom: 1px solid var(--border) !important;
							border-left: none !important;
							border-right: none !important;
							border-top: none !important;
							color: var(--textPrimary) !important;
							font-size: 13px !important;
							font-family: 'Source Sans 3', sans-serif !important;
							cursor: pointer;
							transition: all 0.1s ease;

							&:hover {
								background: var(--accentSoft) !important;
								color: var(--accent) !important;
							}
							&:active {
								background: var(--accent) !important;
								color: white !important;
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
						font-family: 'Source Sans 3', sans-serif;
						font-size: 15.5px;
						line-height: 1.75;
						color: var(--textPrimary);
						min-height: 100%;

						&.ql-blank::before {
							color: var(--textMuted);
							font-style: italic;
							font-family: 'Cormorant Garamond', Georgia, serif;
						}
					}
				}
			}
		}
	}
</style>
