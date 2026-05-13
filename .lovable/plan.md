## Phased delivery plan

I'll split this into 4 phases. After each, you can preview and confirm before I move on. This avoids breaking your published app.

---

### Phase 1 — News (Currents API) + Floating Chatbot + UI polish
**Goal:** ship the two pure-frontend/server-fn changes first since they don't need Cloud.

- **News (server function, not Edge Function):** Our stack is TanStack Start, so I'll create `src/lib/news.functions.ts` that calls `https://api.currentsapi.services/v1/latest-news` using `process.env.NEWS_API_KEY`. I'll request that secret from you at the start of this phase.
- **Categorized news section:** Tabs for **Technology**, **Schemes**, **Crops**, **Market/Rates**, **Weather**. Each tab fetches with the appropriate Currents `keywords` + `category` filter. Falls back to the existing AI-generated news if the API fails or rate-limits.
- **Floating chatbot widget:** Replace the inline `#chat` section with a fixed bottom-right floating button (sprout/chat icon). Clicking opens a 380×560 chat window with the existing messages, input, and language logic — no logic changes, just a new shell. Remove `#chat` from the navbar.
- **UI refresh:** New color tokens in `src/styles.css` (deeper agri green + warm accent), better hero with subtle motion, refined card shadows, improved spacing/typography. Branding "AgriGuard" preserved.

> Note: The user asked for a Supabase Edge Function. In our TanStack Start template that would be the wrong tool — server functions are the correct equivalent and avoid a separate deployment + CORS layer. Same outcome, better fit.

---

### Phase 2 — Lovable Cloud + Auth (email/password + Google)
- Enable Lovable Cloud.
- Create `profiles` table (id → auth.users, display_name, avatar_url, language, theme), trigger to auto-create on signup, RLS so users only edit their own row.
- Pages: `/login`, `/signup`, `/reset-password`, `_authenticated` layout.
- Navbar shows user avatar dropdown when signed in (Profile, Settings, Sign out) or "Sign in" button when out.
- Google OAuth enabled in Cloud.

---

### Phase 3 — Profile pictures + Settings page
- Storage bucket `avatars` (public read, owner write) via SQL migration.
- `/settings` route (under `_authenticated`) with tabs: **Profile** (avatar upload + display name), **Preferences** (language, theme/dark mode), **Account** (email, password change, sign out, delete account).
- Avatar shown in navbar dropdown.

---

### Phase 4 — Polish & verify
- Re-test news, chatbot, auth flows, avatar upload end-to-end.
- Ensure mobile layout works for the floating chat window.
- Suggest publishing.

---

### Why phased?
Doing all four at once means ~30+ file changes touching auth context, routing, schema, storage, and existing components simultaneously. A single subtle bug (e.g. SSR loader hitting an auth-protected fn) breaks the whole preview and is hard to bisect. Phasing keeps your published app safe.

**If you'd rather I just do everything in one go**, say "do it all" and I'll proceed — just know iteration will be slower if something breaks.

**Otherwise, reply "Phase 1" (or "go") and I'll start with news + floating chat + UI, and request your Currents API key.**