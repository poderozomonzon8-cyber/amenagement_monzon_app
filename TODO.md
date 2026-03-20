# Supabase Migration & Auth Fix Steps

**Status:**
- [x] .env.local keys
- [x] anima-supabase-adapter hooks (REMOVED - Anima traces cleaned)
- [x] NotificationContext import
- [x] QueryClientProvider
- [x] Mobile ServiceSelector bottom panel
- [ ] **Supabase Auth Fix** (current)
  - [ ] AuthContext pure Supabase (no localStorage/guest)
  - [ ] Role from profiles table
  - [ ] Logout redirect /login
- [ ] supabase-schema-correct.sql
- [ ] Test UserManagerPanel data
- [x] Dev server + Vercel config (chunk warning fixed)
- [x] **Anima cleanup** - All references removed (manifest.json icons updated, adapter.ts deleted)

**Next:** AuthContext edits → test login/logout → schema → full test.

