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
      temperature: 0.7
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

// --- AI Feature Functions ---

export async function changeTone (text, tone) {
  const toneDescriptions = {
    formal: 'Rewrite this text in a formal, professional tone. Use proper grammar, avoid contractions, and maintain a business-appropriate style.',
    casual: 'Rewrite this text in a casual, friendly tone. Use natural language, contractions are fine, keep it conversational.',
    academic: 'Rewrite this text in an academic tone. Use precise vocabulary, formal structure, and scholarly phrasing.',
    creative: 'Rewrite this text in a creative, engaging tone. Use vivid language, varied sentence structure, and expressive phrasing.'
  }

  const prompt = toneDescriptions[tone] || `Rewrite this text in a ${tone} tone.`

  return callGroq([
    { role: 'system', content: 'You are a writing assistant. Return ONLY the rewritten text, no explanations or labels.' },
    { role: 'user', content: `${prompt}\n\nText:\n${text}` }
  ], 1024)
}

export async function improveGrammar (text) {
  return callGroq([
    { role: 'system', content: 'You are a grammar and clarity expert. Fix grammar, spelling, punctuation, and improve clarity. Return ONLY the corrected text, no explanations.' },
    { role: 'user', content: `Fix grammar and improve clarity:\n\n${text}` }
  ], 1024)
}

export async function getContextSuggestions (text) {
  const result = await callGroq([
    { role: 'system', content: 'You are a writing assistant. Based on the text provided, suggest 3 possible ways to continue or improve it. Return each suggestion on a new line, prefixed with a number (1. 2. 3.). Keep each suggestion under 50 words.' },
    { role: 'user', content: `Suggest continuations or improvements for:\n\n${text}` }
  ], 512)

  return result
    .split('\n')
    .filter(line => /^\d+\./.test(line.trim()))
    .map(line => line.replace(/^\d+\.\s*/, '').trim())
    .filter(s => s.length > 0)
}

export async function quickAction (text, action) {
  const actions = {
    concise: 'Make this text more concise. Remove unnecessary words and redundancy while keeping the core meaning. Return ONLY the rewritten text.',
    professional: 'Rewrite this text to sound more professional and polished. Return ONLY the rewritten text.',
    simplify: 'Simplify this text. Use shorter sentences, simpler words, and make it easier to understand. Return ONLY the rewritten text.',
    expand: 'Expand this text with more detail and supporting points while maintaining the original meaning. Return ONLY the expanded text.'
  }

  const instruction = actions[action] || `${action}. Return ONLY the modified text.`

  return callGroq([
    { role: 'system', content: 'You are a writing assistant. Follow the instruction precisely. Return ONLY the modified text, no explanations.' },
    { role: 'user', content: `${instruction}\n\nText:\n${text}` }
  ], 1024)
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

  // Simple tone detection based on word patterns
  const formalWords = ['therefore', 'however', 'furthermore', 'consequently', 'regarding', 'hereby', 'pursuant', 'accordingly']
  const casualWords = ['hey', 'cool', 'awesome', 'gonna', 'wanna', 'stuff', 'things', 'pretty', 'really', 'super', 'totally']

  const lowerWords = words.map(w => w.toLowerCase())
  const formalCount = lowerWords.filter(w => formalWords.includes(w)).length
  const casualCount = lowerWords.filter(w => casualWords.includes(w)).length

  let toneIndicator = 'neutral'
  if (formalCount > casualCount && formalCount >= 2) toneIndicator = 'formal'
  else if (casualCount > formalCount && casualCount >= 2) toneIndicator = 'casual'

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
