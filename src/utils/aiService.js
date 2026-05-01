const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.1-8b-instant'

// --- Rate Limiting & Usage Tracking ---

const RATE_LIMIT = {
  maxPerMinute: 25, // stay under 30 RPM free limit
  maxPerDay: 14000, // stay under 14,400/day free limit
  windowMs: 60 * 1000
}

const usageState = {
  minuteRequests: [],
  dailyCount: 0,
  dailyResetDate: new Date().toDateString()
}

function getApiKey () {
  return process.env.VUE_APP_GROQ_API_KEY || ''
}

function checkRateLimit () {
  const now = Date.now()

  // Reset daily counter if new day
  const today = new Date().toDateString()
  if (usageState.dailyResetDate !== today) {
    usageState.dailyCount = 0
    usageState.dailyResetDate = today
  }

  // Clean old minute window entries
  usageState.minuteRequests = usageState.minuteRequests.filter(
    ts => now - ts < RATE_LIMIT.windowMs
  )

  if (usageState.minuteRequests.length >= RATE_LIMIT.maxPerMinute) {
    const oldestInWindow = usageState.minuteRequests[0]
    const waitMs = RATE_LIMIT.windowMs - (now - oldestInWindow)
    return { allowed: false, reason: `Rate limit reached. Try again in ${Math.ceil(waitMs / 1000)}s.` }
  }

  if (usageState.dailyCount >= RATE_LIMIT.maxPerDay) {
    return { allowed: false, reason: 'Daily API limit reached. Limits reset at midnight.' }
  }

  return { allowed: true }
}

function recordRequest () {
  usageState.minuteRequests.push(Date.now())
  usageState.dailyCount++
}

export function getUsageStats () {
  const now = Date.now()
  const recentRequests = usageState.minuteRequests.filter(
    ts => now - ts < RATE_LIMIT.windowMs
  )
  return {
    minuteUsed: recentRequests.length,
    minuteLimit: RATE_LIMIT.maxPerMinute,
    dailyUsed: usageState.dailyCount,
    dailyLimit: RATE_LIMIT.maxPerDay
  }
}

// --- Core API Call ---

async function callGroq (messages, maxTokens = 512) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('API key not configured. Add VUE_APP_GROQ_API_KEY to your .env file.')
  }

  const rateCheck = checkRateLimit()
  if (!rateCheck.allowed) {
    throw new Error(rateCheck.reason)
  }

  recordRequest()

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: maxTokens,
      temperature: 0.2
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('API rate limit exceeded. Please wait a moment and try again.')
    }
    throw new Error(error.error?.message || `API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

// --- Output Length Presets ---

const LENGTH_PRESETS = {
  basic: { maxTokens: 256, guidance: 'Keep the output minimal — only the essential correction or change, nothing more.' },
  medium: { maxTokens: 512, guidance: '' },
  brief: { maxTokens: 384, guidance: 'Keep the output concise and to the point while preserving all key meaning.' },
  detailed: { maxTokens: 1024, guidance: 'Provide a thorough output with full context and supporting detail.' }
}

function getLengthConfig (lengthLevel) {
  return LENGTH_PRESETS[lengthLevel] || LENGTH_PRESETS.medium
}

// --- AI Feature Functions ---

export async function changeTone (text, tone, lengthLevel = 'medium', customPrompt = '') {
  const { maxTokens } = getLengthConfig(lengthLevel)

  if (tone === 'custom') {
    return callGroq([
      {
        role: 'system',
        content: `${customPrompt}\n\nReturn ONLY the refined text. No explanations, headings, or commentary.`
      },
      { role: 'user', content: text }
    ], maxTokens)
  }

  const toneDescriptions = {
    formal: 'formal and professional',
    casual: 'casual and conversational',
    academic: 'academic and scholarly',
    creative: 'creative and expressive',
    developer: 'technically precise and developer-focused — direct, unambiguous, with clear logical flow'
  }

  const toneLabel = toneDescriptions[tone] || tone

  return callGroq([
    {
      role: 'system',
      content: `You are a text refinement assistant. Your only task is to improve the user's input based on the selected tone, while strictly preserving its original meaning and intent.

Rules:
- Do NOT answer the user's input. Only refine it.
- Do NOT add new information, assumptions, or context.
- Preserve the original meaning exactly. No reinterpretation.
- Keep the output concise and close to the original length.
- Avoid over-polishing or making the text sound unnatural.
- Maintain the original structure as much as possible.
- Do not expand short inputs into long outputs.
- If the input is already clear, return it with minimal or no changes.
- Apply only subtle tone adjustments. Do not exaggerate tone or dramatically change wording.
- Return ONLY the refined text. No explanations, headings, or commentary.`
    },
    {
      role: 'user',
      content: `Tone: ${toneLabel}\nInput: ${text}`
    }
  ], maxTokens)
}

export async function improveGrammar (text, lengthLevel = 'medium') {
  const { maxTokens } = getLengthConfig(lengthLevel)

  return callGroq([
    {
      role: 'system',
      content: `You are a grammar correction assistant. Fix grammar, spelling, and punctuation errors in the user's input while preserving the original meaning, voice, and structure.

Rules:
- Return ONLY the corrected text as a single output. No lists, no variants, no options.
- Do not answer or respond to the input — only correct it.
- Do not add, remove, or reinterpret content.
- Do not include explanations, annotations, or change summaries.
- Keep the output the same length and structure as the input.
- If the input has no errors, return it unchanged.`
    },
    {
      role: 'user',
      content: text
    }
  ], maxTokens)
}

export async function getContextSuggestions (text, lengthLevel = 'medium') {
  const { maxTokens, guidance } = getLengthConfig(lengthLevel)
  const lengthHint = guidance ? ` ${guidance}` : ''

  const result = await callGroq([
    { role: 'system', content: `You are a context-aware writing assistant. Analyze the provided text and generate exactly 3 distinct suggestions: possible continuations, refinements, or next directions the writing could take. Format: one suggestion per line, numbered (1. 2. 3.). Each suggestion must be under 50 words. Do not include any other text, headers, or commentary.${lengthHint}` },
    { role: 'user', content: `Based on the following text, suggest 3 ways to continue or improve it:\n\n${text}` }
  ], maxTokens)

  return result
    .split('\n')
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(s => s.length > 0)
}

export async function quickAction (text, action, lengthLevel = 'medium') {
  const { maxTokens, guidance } = getLengthConfig(lengthLevel)

  const actions = {
    concise: 'Make the following text more concise. Eliminate redundancy, filler words, and unnecessary qualifiers while preserving the core meaning and key details.',
    professional: 'Rewrite the following text to sound polished and professional. Use confident, clear language appropriate for a business or workplace context.',
    simplify: 'Simplify the following text for maximum readability. Use shorter sentences, common vocabulary, and straightforward structure. Aim for easy comprehension without losing important meaning.',
    expand: 'Expand the following text with additional detail, supporting points, and context. Maintain the original meaning and tone while enriching the content.'
  }

  const instruction = actions[action] || `${action}.`
  const lengthHint = guidance ? ` ${guidance}` : ''

  return callGroq([
    { role: 'system', content: `You are a precise writing assistant. Execute the given instruction exactly as specified. Output ONLY the modified text. Do not include explanations, labels, preambles, or commentary.${lengthHint}` },
    { role: 'user', content: `${instruction}\n\nText:\n${text}` }
  ], maxTokens)
}

// --- Writing Analytics (local, no API call) ---

export function analyzeWriting (text) {
  const plainText = text.replace(/<[^>]*>/g, '').trim()

  if (!plainText) {
    return {
      wordCount: 0,
      charCount: 0,
      sentenceCount: 0,
      avgWordsPerSentence: 0,
      readabilityScore: 0,
      readabilityLabel: 'N/A',
      toneIndicator: 'neutral',
      readingTime: '0 sec'
    }
  }

  const words = plainText.split(/\s+/).filter(w => w.length > 0)
  const wordCount = words.length
  const charCount = plainText.length
  const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const sentenceCount = Math.max(sentences.length, 1)
  const avgWordsPerSentence = Math.round((wordCount / sentenceCount) * 10) / 10

  // Syllable count approximation
  function countSyllables (word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '')
    if (word.length <= 3) return 1
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
    word = word.replace(/^y/, '')
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? matches.length : 1
  }

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0)

  // Flesch Reading Ease
  const flesch = Math.round(
    206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount)
  )
  const readabilityScore = Math.max(0, Math.min(100, flesch))

  let readabilityLabel
  if (readabilityScore >= 80) readabilityLabel = 'Very Easy'
  else if (readabilityScore >= 60) readabilityLabel = 'Easy'
  else if (readabilityScore >= 40) readabilityLabel = 'Moderate'
  else if (readabilityScore >= 20) readabilityLabel = 'Difficult'
  else readabilityLabel = 'Very Difficult'

  // Multi-signal tone detection
  const lowerText = plainText.toLowerCase()
  const lowerWords = words.map(w => w.toLowerCase().replace(/[^a-z']/g, ''))

  const formalWords = new Set([
    'therefore', 'however', 'furthermore', 'consequently', 'regarding',
    'hereby', 'pursuant', 'accordingly', 'nevertheless', 'notwithstanding',
    'whereas', 'moreover', 'henceforth', 'thereby', 'wherein', 'thus',
    'shall', 'ought', 'requisite', 'sufficient', 'additional', 'provide',
    'ensure', 'appropriate', 'subsequent', 'prior', 'facilitate',
    'implement', 'significant', 'demonstrate', 'establish', 'constitute',
    'acknowledge', 'approximately', 'concerning', 'pertaining',
    'respectively', 'comprehensive', 'considerable', 'substantial',
    'preliminary', 'fundamental', 'previously', 'particularly',
    'specifically', 'necessarily', 'essentially', 'indicate', 'obtain',
    'require', 'utilize', 'commence', 'terminate', 'endeavor'
  ])
  const casualWords = new Set([
    'hey', 'cool', 'awesome', 'gonna', 'wanna', 'stuff', 'things',
    'pretty', 'really', 'super', 'totally', 'kinda', 'sorta', 'gotta',
    'yeah', 'yep', 'nope', 'ok', 'okay', 'lol', 'btw', 'omg', 'tbh',
    'dunno', 'cuz', 'cause', 'literally', 'basically', 'actually',
    'honestly', 'maybe', 'guess', 'figured', 'bunch', 'tons', 'huge',
    'crazy', 'insane', 'sick', 'epic', 'dude', 'guys', 'folks',
    'anyway', 'anyways', 'whatever', 'tho', 'though', 'right',
    'wow', 'nice', 'great', 'love', 'hate', 'bad', 'good', 'fun',
    'boring', 'weird', 'like', 'just', 'so', 'very', 'bit'
  ])

  let formalScore = 0
  let casualScore = 0

  // Signal 1: keyword matches
  for (const w of lowerWords) {
    if (formalWords.has(w)) formalScore += 2
    if (casualWords.has(w)) casualScore += 2
  }

  // Signal 2: contractions = casual
  const contractions = (lowerText.match(/\b\w+n't\b|\b\w+'re\b|\b\w+'ve\b|\b\w+'ll\b|\b\w+'d\b|\bi'm\b|\blet's\b/g) || []).length
  casualScore += contractions * 1.5

  // Signal 3: exclamation marks = casual, semicolons = formal
  casualScore += (plainText.match(/!/g) || []).length * 1
  formalScore += (plainText.match(/;/g) || []).length * 1.5

  // Signal 4: average word length (longer = more formal)
  const avgWordLen = lowerWords.reduce((s, w) => s + w.length, 0) / Math.max(lowerWords.length, 1)
  if (avgWordLen > 5.5) formalScore += 2
  else if (avgWordLen < 4) casualScore += 2

  // Signal 5: long sentences = formal
  if (avgWordsPerSentence > 20) formalScore += 2
  else if (avgWordsPerSentence < 10) casualScore += 1.5

  // Signal 6: questions = casual
  const questionCount = (plainText.match(/\?/g) || []).length
  if (questionCount >= 2) casualScore += 1.5

  let toneIndicator = 'neutral'
  const gap = Math.abs(formalScore - casualScore)
  if (gap >= 2) {
    toneIndicator = formalScore > casualScore ? 'formal' : 'casual'
  }

  // Reading time
  const minutes = wordCount / 200
  const readingTime = minutes < 1
    ? `${Math.ceil(minutes * 60)} sec`
    : `${Math.round(minutes * 10) / 10} min`

  return {
    wordCount,
    charCount,
    sentenceCount,
    avgWordsPerSentence,
    readabilityScore,
    readabilityLabel,
    toneIndicator,
    readingTime
  }
}
