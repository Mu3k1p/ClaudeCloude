/**
 * memoryStore.js
 * -----------------------------------------------------------------------
 * The long-term memory layer.
 *
 * Right now everything lives in memories.json. The rest of the bot only
 * talks to this file through the methods listed below, so later you can
 * write a SqliteMemoryStore / PostgresMemoryStore / VectorMemoryStore with
 * the SAME method names and swap it in bot.js with one line.
 *
 * The contract every memory store must follow:
 *
 *   search(query, { access, limit })  -> [{ id, text, category, access, score }]
 *   getProjects(query, { access, limit }) -> [project]
 *   list({ access })                  -> [memory]
 *   add({ content, category, access, tags, source }) -> memory
 *   remove(id)                        -> removed memory or null
 *   findByText(text, { access })      -> [memory] (for !forget)
 *   isDuplicate(text)                 -> boolean
 *
 * All methods are async so a real database can be dropped in later.
 * -----------------------------------------------------------------------
 */

const fs = require('fs');
const path = require('path');

// The three access levels. Order matters only for readability.
const ACCESS = {
  PUBLIC: 'public', // safe for anyone on Discord
  PRIVATE: 'private', // only the owner may see or use it
  INTERNAL: 'internal', // the AI may use it for reasoning, but never shows it directly
};
const VALID_ACCESS = Object.values(ACCESS);

// Common words that do not help us find relevant memories.
const STOPWORDS = new Set(
  (
    'a an the and or but if then so to of in on at for with about from by is are was were be been ' +
    'do does did i me my you your he she they them we us our it its this that these those what which ' +
    'who whom how why when where can could would should will just like think know kobe ai bot please ' +
    'tell say any some much many more most very really get got have has had'
  ).split(' ')
);

/**
 * Turn a sentence into a list of useful lowercase keywords.
 * "What projects is Kobe working on?" -> ["projects", "project", "working", "work"]
 */
function keywords(text) {
  const words = String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^[.-]+|[.-]+$/g, ''))
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));

  // Very small "stemming" so "projects" also matches "project", etc.
  const out = new Set();
  for (const w of words) {
    out.add(w);
    if (w.endsWith('ing') && w.length > 5) out.add(w.slice(0, -3));
    if (w.endsWith('es') && w.length > 4) out.add(w.slice(0, -2));
    if (w.endsWith('s') && w.length > 3) out.add(w.slice(0, -1));
  }
  return [...out];
}

/** Score how well `text` matches the query keywords (0 = no match). */
function scoreText(queryWords, text) {
  const hay = keywords(text);
  if (!hay.length || !queryWords.length) return 0;
  const haySet = new Set(hay);
  let score = 0;
  for (const q of queryWords) {
    if (haySet.has(q)) score += 1;
    // partial matches, e.g. "cyber" vs "cybersecurity"
    else if (q.length >= 4 && hay.some((h) => h.startsWith(q) || q.startsWith(h))) score += 0.5;
  }
  return score;
}

/** Normalize a list entry that may be a string or {text, access}. */
function normalizeEntry(entry, defaultAccess = ACCESS.PUBLIC) {
  if (typeof entry === 'string') return { text: entry, access: defaultAccess };
  if (entry && typeof entry.text === 'string') {
    return { text: entry.text, access: VALID_ACCESS.includes(entry.access) ? entry.access : defaultAccess };
  }
  return null;
}

function newId() {
  return 'mem_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

class JsonMemoryStore {
  /**
   * @param {string} filePath path to memories.json
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.data = null;
    this.lastMtime = 0;
    // Writes are queued one after another so two saves never overlap.
    this.writeQueue = Promise.resolve();
  }

  /**
   * Load the JSON file. If you edit memories.json by hand while the bot is
   * running, the change is picked up automatically on the next request.
   */
  async load() {
    let stat;
    try {
      stat = await fs.promises.stat(this.filePath);
    } catch {
      // No file yet: start with an empty structure and create it.
      this.data = JsonMemoryStore.emptyData();
      await this._save();
      return this.data;
    }

    if (this.data && stat.mtimeMs === this.lastMtime) return this.data;

    const raw = await fs.promises.readFile(this.filePath, 'utf8');
    try {
      const parsed = JSON.parse(raw);
      this.data = { ...JsonMemoryStore.emptyData(), ...parsed };
      this.data.profile = this.data.profile || {};
      this.data.goals = { short_term: [], long_term: [], ...(this.data.goals || {}) };
      this.data.projects = Array.isArray(this.data.projects) ? this.data.projects : [];
      this.data.memories = Array.isArray(this.data.memories) ? this.data.memories : [];
      this.lastMtime = stat.mtimeMs;
    } catch (err) {
      // A typo in the JSON should not crash the bot. Keep the last good copy.
      console.error(`[memory] Could not parse ${path.basename(this.filePath)}: ${err.message}`);
      if (!this.data) this.data = JsonMemoryStore.emptyData();
    }
    return this.data;
  }

  static emptyData() {
    return {
      version: 1,
      profile: {},
      projects: [],
      goals: { short_term: [], long_term: [] },
      memories: [],
    };
  }

  /** Save to disk safely: write a temp file, then rename it over the real one. */
  async _save() {
    this.writeQueue = this.writeQueue.then(async () => {
      const tmp = this.filePath + '.tmp';
      await fs.promises.writeFile(tmp, JSON.stringify(this.data, null, 2) + '\n', 'utf8');
      await fs.promises.rename(tmp, this.filePath);
      const stat = await fs.promises.stat(this.filePath);
      this.lastMtime = stat.mtimeMs;
    });
    return this.writeQueue;
  }

  /**
   * Flatten profile, goals and memories into one searchable list.
   * Projects are handled separately by getProjects().
   */
  _allItems() {
    const items = [];
    const { profile, goals, memories } = this.data;

    for (const [section, list] of Object.entries(profile || {})) {
      if (!Array.isArray(list)) continue;
      list.forEach((entry, i) => {
        const e = normalizeEntry(entry);
        if (e) items.push({ id: `profile.${section}.${i}`, category: section, ...e });
      });
    }

    for (const [term, list] of Object.entries(goals || {})) {
      if (!Array.isArray(list)) continue;
      list.forEach((entry, i) => {
        const e = normalizeEntry(entry);
        if (e) items.push({ id: `goals.${term}.${i}`, category: `${term.replace('_', '-')} goal`, ...e });
      });
    }

    for (const m of memories || []) {
      items.push({
        id: m.id,
        text: m.content,
        category: m.category || 'general',
        access: VALID_ACCESS.includes(m.access) ? m.access : ACCESS.PRIVATE,
        tags: m.tags || [],
      });
    }
    return items;
  }

  /**
   * Find the memories most relevant to a question.
   * Only returns items whose access level is in `access`.
   * This is simple keyword matching. A vector store would replace it later.
   */
  async search(query, { access = [ACCESS.PUBLIC], limit = 8 } = {}) {
    await this.load();
    const q = keywords(query);
    if (!q.length) return [];

    return this._allItems()
      .filter((item) => access.includes(item.access))
      .map((item) => ({
        ...item,
        // category and tags count too, so "goals" finds goal items
        score: scoreText(q, `${item.category} ${(item.tags || []).join(' ')} ${item.text}`),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Return projects relevant to the question. If the question is about
   * projects in general ("what are you working on?"), return active ones.
   */
  async getProjects(query, { access = [ACCESS.PUBLIC], limit = 3 } = {}) {
    await this.load();
    const q = keywords(query);
    const allowed = this.data.projects.filter((p) =>
      access.includes(VALID_ACCESS.includes(p.access) ? p.access : ACCESS.PUBLIC)
    );

    const generalProjectQuestion = /\b(project|projects|working on|building|build)\b/i.test(query);

    const scored = allowed
      .map((p) => {
        const text = [p.name, p.description, p.status, ...(p.technologies || []), ...(p.goals || [])].join(' ');
        return { project: p, score: scoreText(q, text) };
      })
      .filter((x) => x.score > 0 || generalProjectQuestion)
      .sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map((x) => x.project);
  }

  /** List stored memories (the `memories` array, not the profile). */
  async list({ access = VALID_ACCESS } = {}) {
    await this.load();
    return this.data.memories.filter((m) => access.includes(m.access || ACCESS.PRIVATE));
  }

  /** Store a new memory. */
  async add({ content, category = 'general', access = ACCESS.PRIVATE, tags = [], source = 'manual' }) {
    await this.load();
    const memory = {
      id: newId(),
      content: String(content).trim(),
      category,
      access: VALID_ACCESS.includes(access) ? access : ACCESS.PRIVATE,
      tags,
      source, // "manual" (from !remember) or "auto" (from memory extraction)
      created_at: new Date().toISOString(),
    };
    this.data.memories.push(memory);
    await this._save();
    return memory;
  }

  /** Delete one memory by id. */
  async remove(id) {
    await this.load();
    const index = this.data.memories.findIndex((m) => m.id === id);
    if (index === -1) return null;
    const [removed] = this.data.memories.splice(index, 1);
    await this._save();
    return removed;
  }

  /** Find memories that match some text. Used by !forget. */
  async findByText(text, { access = VALID_ACCESS } = {}) {
    await this.load();
    const needle = text.toLowerCase().trim();
    const q = keywords(text);
    return this.data.memories
      .filter((m) => access.includes(m.access || ACCESS.PRIVATE))
      .map((m) => {
        const exact = m.content.toLowerCase().includes(needle);
        return { memory: m, score: exact ? 100 : scoreText(q, m.content) };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.memory);
  }

  /** True if a very similar memory already exists (avoids saving the same thing twice). */
  async isDuplicate(text) {
    await this.load();
    const q = keywords(text);
    if (!q.length) return true;
    return this._allItems().some((item) => {
      const other = keywords(item.text);
      if (!other.length) return false;
      const overlap = scoreText(q, item.text);
      // 80% of the words already exist in one item -> treat as duplicate
      return overlap / Math.max(q.length, other.length) >= 0.8;
    });
  }
}

module.exports = { JsonMemoryStore, ACCESS, VALID_ACCESS, keywords };
