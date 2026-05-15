# BankApp Web — Setup (Phase 4 livrée)

## 1. Installation

Depuis `C:\Users\Administrator\Desktop\bankapp\bankapp-web\` :

```bash
npm install
cp .env.example .env
```

Vérifie que `VITE_API_URL` pointe vers ton backend Laravel (par défaut `http://localhost:8000/api/v1`).

## 2. Lancer en dev

```bash
npm run dev
```

Vite démarre sur `http://localhost:5173`.

⚠️ Le backend Laravel doit être lancé en parallèle :
```bash
cd ../bankapp-api
php artisan serve
```

## 3. Build de production

```bash
npm run build
npm run preview
```

## 4. Stack

- **React 18** + **Vite 6** (build rapide)
- **Redux Toolkit + RTK Query** (cache HTTP automatique, optimistic updates)
- **React Router 6** (lazy routes via `React.lazy`)
- **Tailwind CSS 3** (dark mode `class`)
- **React Hook Form + Zod** (validation typée)
- **Axios** (interceptors token + 401)
- **lucide-react** (icônes)
- **react-hot-toast** (notifications)
- **recharts** (graphiques — Phase 5/6)

## 5. Ce qui est livré (Phase 4)

✅ Auth complète : login, register, logout, /me, useAuth hook
✅ Store Redux + RTK Query (auth, accounts, transactions, otp, admin)
✅ Axios + interceptors (Bearer Sanctum + redirection 401)
✅ Routing avec ProtectedRoute et RoleRoute (admin / client)
✅ 3 layouts : public, client, admin (Sidebar + Header dark-mode-aware)
✅ Dark mode complet (ThemeContext + persistance localStorage)
✅ UI : Button, Card, Input, Modal, Loader, Badge, EmptyState
✅ Pages publiques : Landing moderne, Login (avec démo creds), Register (validation forte)
✅ Stubs pour toutes les pages client et admin (à remplir Phase 5/6)
✅ Formatters : MAD, IBAN, dates, relatif

## 6. Ce qui arrive

- **Phase 5** : pages client complètes (dashboard avec graphes, comptes, virement OTP, historique avec filtres + pagination + export PDF, profil)
- **Phase 6** : pages admin (users, accounts, stats Recharts, audit)
- **Phase 7** : guide d'installation final + Docker Compose + checklist sécurité
