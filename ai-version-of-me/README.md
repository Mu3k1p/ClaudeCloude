# AI Version of Me

A Discord bot that acts as an AI representation of you. It talks in your style, reasons from your documented values and goals, remembers what matters, and says so when it doesn't know something about you.

It never claims to literally be you, and it works with any AI provider you configure. No provider or model is baked into the code.

## What's in here

```text
ai-version-of-me/
├── bot.js            Discord bot: commands, context building, replies
├── memoryStore.js    Memory layer (JSON today, swappable for a database later)
├── aiClient.js       Connection to your AI provider (set up via .env)
├── personality.json  How the bot thinks and talks. Edit freely.
├── memories.json     What the bot knows about you. Edit freely.
├── package.json
├── .env.example      Template for your secrets
├── .gitignore
└── README.md
```

You need **Node.js 18 or newer** (`node -v` to check).

---

## 1. Create the Discord bot

1. Go to <https://discord.com/developers/applications> and click **New Application**. Name it, e.g. `AI Kobe`.
2. Open the **Bot** tab. Click **Reset Token** and copy the token. That's your `DISCORD_TOKEN`. Keep it secret.
3. Open **OAuth2 > URL Generator**.
   - Scopes: `bot`
   - Bot permissions: `View Channels`, `Send Messages`, `Read Message History`, `Add Reactions`
4. Open the generated URL and invite the bot to your server.

## 2. Enable the required intents

Still in the **Bot** tab, under **Privileged Gateway Intents**, turn on:

- **Message Content Intent** (required, or the bot can't read `!ask ...`)

Save. Without this the bot logs in but ignores every message.

## 3. Create the `.env` file

```bash
cp .env.example .env
```

Then open `.env` and fill in:

```text
DISCORD_TOKEN=your-bot-token
AI_API_KEY=your-ai-key
AI_API_URL=https://your-provider.example/v1/chat/completions
AI_MODEL=the-model-name
OWNER_ID=your-discord-user-id
```

To get your Discord user ID: Discord **Settings > Advanced > Developer Mode** on, then right-click your name and **Copy User ID**. Several admins? Separate IDs with commas.

`.env` is in `.gitignore`. Never commit it.

## 4. Add your AI API credentials

The bot speaks two common request formats. Pick the one your provider documents:

| `AI_API_FORMAT` | Request body | Where the reply is |
| --- | --- | --- |
| `chat_completions` (default) | `{ model, messages: [{role, content}] }` with the system prompt as the first message | `choices[0].message.content` |
| `messages` | `{ model, system, messages, max_tokens }` | `content[].text` |

How the key is sent is configurable too:

- Most providers: leave the defaults (`Authorization: Bearer <key>`).
- Providers that use a custom header: set `AI_AUTH_HEADER=x-api-key` and leave `AI_AUTH_PREFIX=` empty.
- Need a version header or similar? Put it in `AI_EXTRA_HEADERS` as JSON, e.g. `{"some-version":"2024-01-01"}`.

Local models work as well, as long as they expose one of those formats.

## 5. Start the bot

```bash
npm install
node bot.js
```

You should see `Logged in as AI Kobe#1234`. Try `!ping`, then `!ask what should I learn next?` or `@AI Kobe what do you think about this business idea?`. DMs to the bot work as questions too.

---

## 6. Add your personal information

### Personality (`personality.json`)

This controls how the bot talks and reasons: tone, communication style, traits, values, strengths, weaknesses, preferences, thinking style, decision making, humor and writing style. Change `name` and `creator_name` to yours.

The bot reloads this file automatically when you save it. No restart needed.

Tip: describe *how* you think, not catchphrases. "Looks at cost and time before anything else" teaches the bot far more than a list of phrases you say.

### Knowledge (`memories.json`)

Sections:

- `profile`: `education`, `work_experience`, `skills`, `places`, `languages`, `interests` (add any other list you like)
- `projects`: each with `name`, `description`, `status`, `goals`, `technologies`, `decisions`, `future_plans`, `access`
- `goals`: `short_term` and `long_term`
- `memories`: notes saved with `!remember` or learned automatically

Any list item can be a plain string (treated as **public**) or an object with an access level:

```json
"education": [
  { "text": "Studies computer science at X University", "access": "private" }
],
"goals": {
  "long_term": ["Start a tech company"],
  "short_term": [{ "text": "Finish the AI bot MVP this month", "access": "public" }]
}
```

To add or update a project, edit its entry in `projects`. Changes are picked up on the next message. If the JSON has a typo the bot logs an error and keeps using the last good version, so it won't crash.

### Access levels

| Level | Who sees it |
| --- | --- |
| `public` | Anyone talking to the bot |
| `private` | Only the owner. Never sent to the AI when a normal user asks, so it can't leak. |
| `internal` | Used by the AI to shape its reasoning, never quoted or shown |

Memories saved with `!remember` default to **private**.

## 7. Managing memories

These commands are owner-only. In a server channel the results go to your DMs so private info never shows up in public.

| Command | What it does |
| --- | --- |
| `!memory` | Summary of what's stored |
| `!memory <topic>` | Memories the bot would use for that topic |
| `!memories` | Full list with ids |
| `!remember <info>` | Save something (private by default) |
| `!remember public category:goal Wants to launch a SaaS by 2027` | Save with access level and category |
| `!forget <id>` | Delete a memory by id, e.g. `!forget mem_lx3k9a2b` |
| `!forget <text>` | Delete by text. If several match, it lists them so you can pick an id. |

Everyone can use `!help`, `!ask`, `!about` and `!ping`.

### Automatic memory

When **you** (the owner) talk to the bot and say something lasting, like a goal, a project decision or a preference, the bot may save it on its own. How it works:

- Only your messages count. Other users can't plant "facts" about you.
- A quick filter skips small talk before any extra AI call is made.
- The AI decides whether it's worth keeping and rewrites it as a short fact.
- Anything that looks sensitive (emails, phone numbers, addresses, passwords, card numbers) is dropped unless `ALLOW_SENSITIVE_MEMORY=true`.
- Near-duplicates are skipped.
- Saved as `AUTO_MEMORY_ACCESS` (private by default) and marked `auto` in `!memories`.

Turn it off with `AUTO_MEMORY=false`.

### Short-term and temporary memory

The last `SHORT_TERM_LIMIT` messages in each channel are kept in RAM so follow-up questions make sense. They're cleared after `SHORT_TERM_TTL_MINUTES` of silence or a restart, and they're never written to disk.

---

## How a question is answered

1. The bot reads your message.
2. It searches `memories.json` for items relevant to the question, filtered by who's asking.
3. It picks relevant projects.
4. It builds a system prompt: personality, those memories, projects, and the rules (don't claim to be you, don't invent memories, separate facts from guesses, push back on weak ideas).
5. It adds the recent conversation and sends everything to your AI provider.
6. It replies, and maybe saves a new memory if you shared something useful.

Only relevant memories are sent, never the whole file.

## Upgrading the memory system later

Everything in `bot.js` talks to memory through one object:

```js
const memory = new JsonMemoryStore(MEMORY_PATH);
```

To move to SQLite, Postgres, Supabase or a vector database, write a new class with the same methods (`search`, `getProjects`, `list`, `add`, `remove`, `findByText`, `isDuplicate`, all async). The contract is listed at the top of `memoryStore.js`. Then change that one line. A vector store would mainly replace `search()` with embedding similarity.

The same idea applies to other platforms later (web, Telegram, voice): the prompt building and memory logic can be moved out of the Discord handlers without rewriting them.

## Troubleshooting

- **Bot is online but ignores messages**: Message Content Intent isn't enabled.
- **"Missing settings in .env"**: a required value is empty. Check spelling.
- **"My brain (the AI API) is not responding"**: check the console. Usually a wrong URL, model name, key or `AI_API_FORMAT`.
- **Memory commands say owner-only**: `OWNER_ID` doesn't match your Discord user ID.
- **No DMs from the bot**: allow DMs from server members in your privacy settings.
