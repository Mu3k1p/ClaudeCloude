/**
 * aiClient.js
 * -----------------------------------------------------------------------
 * Talks to whatever AI provider you configure in .env.
 * No provider or model is hard-coded here. You choose:
 *
 *   AI_API_URL     where to send the request
 *   AI_API_KEY     your key
 *   AI_MODEL       the model name
 *   AI_API_FORMAT  "chat_completions" (default) or "messages"
 *
 * Those two formats cover most AI APIs available today. If yours needs
 * something different, add a new format in buildBody() and readReply().
 * -----------------------------------------------------------------------
 */

class AIClient {
  constructor(env = process.env) {
    this.url = env.AI_API_URL;
    this.apiKey = env.AI_API_KEY;
    this.model = env.AI_MODEL;
    this.format = (env.AI_API_FORMAT || 'chat_completions').trim().toLowerCase();
    this.authHeader = env.AI_AUTH_HEADER || 'Authorization';
    // Note: an empty AI_AUTH_PREFIX is allowed (for "x-api-key" style headers)
    // .env files trim trailing spaces, so "Bearer " arrives as "Bearer". Add the space back.
    const prefix = env.AI_AUTH_PREFIX !== undefined ? env.AI_AUTH_PREFIX.trim() : 'Bearer';
    this.authPrefix = prefix ? prefix + ' ' : '';
    this.maxTokens = Number(env.AI_MAX_TOKENS) || 700;
    this.temperature = env.AI_TEMPERATURE !== undefined && env.AI_TEMPERATURE !== '' ? Number(env.AI_TEMPERATURE) : 0.7;
    this.timeoutMs = Number(env.AI_TIMEOUT_MS) || 60000;

    this.extraHeaders = {};
    if (env.AI_EXTRA_HEADERS) {
      try {
        this.extraHeaders = JSON.parse(env.AI_EXTRA_HEADERS);
      } catch {
        console.warn('[ai] AI_EXTRA_HEADERS is not valid JSON, ignoring it.');
      }
    }

    if (!['chat_completions', 'messages'].includes(this.format)) {
      throw new Error(`Unknown AI_API_FORMAT "${this.format}". Use "chat_completions" or "messages".`);
    }
  }

  /** Returns a list of missing settings so bot.js can show a clear error. */
  missingConfig() {
    const missing = [];
    if (!this.url) missing.push('AI_API_URL');
    if (!this.apiKey) missing.push('AI_API_KEY');
    if (!this.model) missing.push('AI_MODEL');
    return missing;
  }

  /**
   * Send a conversation to the AI.
   * @param {string} system   the system prompt (personality + memories + rules)
   * @param {Array<{role:'user'|'assistant', content:string}>} messages
   * @param {object} [opts]   { maxTokens, temperature }
   * @returns {Promise<string>} the AI's text reply
   */
  async chat(system, messages, opts = {}) {
    const headers = {
      'Content-Type': 'application/json',
      [this.authHeader]: `${this.authPrefix}${this.apiKey}`,
      ...this.extraHeaders,
    };

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    let res;
    try {
      res = await fetch(this.url, {
        method: 'POST',
        headers,
        body: JSON.stringify(this.buildBody(system, messages, opts)),
        signal: controller.signal,
      });
    } catch (err) {
      throw new Error(err.name === 'AbortError' ? 'AI request timed out' : `AI request failed: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }

    const bodyText = await res.text();
    if (!res.ok) {
      // Only log a short slice. Never log headers, since they contain the key.
      throw new Error(`AI API returned ${res.status}: ${bodyText.slice(0, 300)}`);
    }

    let json;
    try {
      json = JSON.parse(bodyText);
    } catch {
      throw new Error('AI API returned something that is not JSON');
    }

    const reply = this.readReply(json);
    if (!reply) throw new Error('AI API returned an empty reply');
    return reply.trim();
  }

  /** Build the request body for the chosen format. */
  buildBody(system, messages, opts) {
    const maxTokens = opts.maxTokens || this.maxTokens;
    const temperature = opts.temperature !== undefined ? opts.temperature : this.temperature;

    if (this.format === 'messages') {
      // System prompt is a separate field in this format.
      return { model: this.model, system, messages, max_tokens: maxTokens, temperature };
    }

    // chat_completions: system prompt is the first message.
    return {
      model: this.model,
      messages: [{ role: 'system', content: system }, ...messages],
      max_tokens: maxTokens,
      temperature,
    };
  }

  /** Pull the text out of the provider's response. */
  readReply(json) {
    if (this.format === 'messages') {
      if (!Array.isArray(json.content)) return '';
      return json.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('\n');
    }
    const content = json?.choices?.[0]?.message?.content;
    // Some providers return content as an array of parts.
    if (Array.isArray(content)) return content.map((p) => p.text || '').join('');
    return content || '';
  }
}

module.exports = { AIClient };
