# Rifa International — Admin panel (frontend/admin)

Staff-only app. React 19 + Vite + Tailwind CSS v4, separate from the public site in `frontend/customer`.

## Commands

```bash
npm run dev      # http://localhost:5174 (proxies /api → http://localhost:8000)
npm run build
npm run lint     # must pass with zero errors before a story is done
npm run format
```

## Folder map

```
src/
├── main.jsx, router.jsx     entry and all routes (see the comment above the router)
├── admin/                   Root, AuthProvider (useAuth), RequireAuth, AdminLayout, SidebarNav, navItems,
│                            useUnreadMessages
├── pages/                   AuthLayout, LoginPage, ForgotPasswordPage, ResetPasswordPage, PlaceholderPage, StatusPages
├── components/ui|form/      copied from frontend/customer (Button, Alert, Spinner, Logo, FormField, TextInput …)
├── lib/                     api.js (fetch + CSRF + ApiError), cn.js, formStyles.js, nav.js (safeNext)
└── styles/index.css         Tailwind + design tokens (same as the public site)
```

## Rules

- **API**: everything goes through `src/lib/api.js` (`apiGet/apiPost/apiPatch/apiDelete`). Never call `fetch` directly.
  Contract: `backend/docs/api.md` (Admin sections). Field names are snake_case; messages shown to users should be
  the server's own messages.
- **Auth**: read the signed-in admin with `useAuth()`. Protected routes sit under `RequireAuth`
  (`roles={['super_admin']}` limits a route). Any 401 sends the person to `/login?next=…&expired=1` automatically.
- **Redirects**: use `safeNext()` for any `?next=` value.
- **Styling**: Tailwind classes with the design tokens only (no hex values, no inline styles), `cn()` for conditions,
  lucide-react icons. Admin screens use dense 14px text (`text-sm`); tables 14px.
- **Components**: one per file, PascalCase, default export. If you copy a component from `frontend/customer`, keep
  the two copies in step for visible changes (colours, focus rings).
- **Accessibility**: labelled controls, visible focus (global ring), buttons for actions and links for navigation,
  errors announced with `role="alert"`.
- **Git** is handled manually by the project owner — do not run git commands.

## Execution protocol (Jira project RI)

1. Read the story; move it to **In Progress**.
2. Build only what it asks for, reusing existing components.
3. Test at 375 / 768 / 1280 px and with the keyboard; run `npm run lint` and `npm run build`.
4. Move the story to **Done** (status only).
