# 🏦 BankApp — Application de gestion bancaire en ligne

Application web fullstack pour la gestion bancaire en ligne, conçue comme un projet de fin d'études fintech moderne.

**Stack** : Laravel 12 (API REST) · React 18 (SPA) · MySQL 8 · Sanctum · Tailwind CSS

---

## 📂 Structure du projet

```
bankapp/
├── backend/            # Backend Laravel 12 (API REST)
├── frontend/           # Frontend React 18 + Vite + Redux Toolkit
└── README.md           # Vous êtes ici
```

---

## 🚀 Installation

### Prérequis
- PHP ≥ 8.2 + Composer
- Node.js ≥ 18 + npm
- MySQL 8 (local — port 3306)
- Git

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Créer la base `bankapp` dans MySQL puis configurer DB_* dans .env
php artisan migrate --seed
php artisan serve   # http://localhost:8000
```

### Frontend (React)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev   # http://localhost:5173
```



---

## 🧩 Fonctionnalités

### Côté client
- ✅ Inscription / Connexion sécurisées (Sanctum + rate limiting)
- ✅ Dashboard avec KPIs et graphique 30 jours (Recharts)
- ✅ Gestion multi-comptes (courant / épargne)
- ✅ Dépôts / Retraits avec validation de solde et plafonds
- ✅ Virements avec **workflow OTP par email + SMS** au-delà de 1000 MAD
- ✅ Historique filtrable (type, compte, dates, recherche) + pagination
- ✅ **Export PDF** des relevés (dompdf)
- ✅ Édition profil + changement mot de passe
- ✅ Dark mode complet
- ✅ Responsive mobile / tablette / desktop

### Côté admin
- ✅ Dashboard statistiques (KPIs + graphes Recharts)
- ✅ Gestion utilisateurs (suspendre / réactiver)
- ✅ Gestion comptes (bloquer avec motif / activer)
- ✅ Stats avancées (volume, count, répartition par type)
- ✅ **Journal d'audit** complet et immuable (qui, quoi, quand, où — IP, user-agent)

---

## 🔐 Garanties de sécurité bancaire

| Garantie | Implémentation |
|---|---|
| Atomicité opérations | `DB::transaction` autour de chaque débit/crédit |
| Anti race-condition | `lockForUpdate()` sur les comptes (ordre id asc → pas de deadlock) |
| Précision décimale | `DECIMAL(15,2)` + `bcadd`/`bcsub`/`bccomp` — jamais de `float` |
| Immuabilité historique | Modèle `Transaction` bloque `update`/`delete` via `booted()` |
| OTP fort | Hashé en BDD, 5 min TTL, max 5 tentatives, invalidation des précédents |
| Brute-force login | `RateLimiter` (5 tentatives / min / IP) |
| Mots de passe | bcrypt 12 rounds + politique forte (maj, min, chiffre, symbole, ≥8) |
| Validation côté serveur | `FormRequest` partout, jamais de confiance au client |
| Validation côté client | `react-hook-form` + `zod` (typage) |
| CORS strict | Whitelist `FRONTEND_URL` + `supports_credentials` |
| Audit complet | `audit_logs` polymorphique (IP, user-agent, snapshots) |
| Autorisation | `AccountPolicy` + middleware `role:admin` + ownership check |
| Tokens révocables | Sanctum `currentAccessToken()->delete()` au logout |
| Révocation cascadée | Changement mot de passe → révoque tous les autres tokens |
| Soft validation IBAN | Regex serveur `BK\d{18,}` |

---

## 🧪 Tests

```bash
cd backend
php artisan test
```

Couverture : invariants critiques du `TransactionService` (atomicité, fonds insuffisants, compte bloqué, immuabilité), flux d'auth complet.

---

## 📚 Architecture

### Backend (Laravel)
- **Pattern Service Layer** : controllers thin → services business → models
- **Repositories implicites** : Eloquent + scopes (`active()`, `ownedBy()`, `forAccount()`)
- **Enums PHP 8.1+** typés partout (statuts, rôles, types)
- **Resources** pour la sérialisation API
- **Form Requests** pour la validation
- **Policies** pour l'autorisation fine

### Frontend (React)
- **Redux Toolkit + RTK Query** : cache HTTP auto + invalidation par tags
- **Axios partagé** : token Sanctum auto + 401 → redirect login
- **Routing protégé** : `ProtectedRoute` + `RoleRoute` (admin)
- **Lazy loading** des pages client/admin
- **Context** dark mode + persistance localStorage
- **React Hook Form + Zod** pour les formulaires
- **Recharts** pour la dataviz

### Modèle de données

```
users (1) ─── (*) accounts (1) ─── (*) transactions
  │                                       │ (source / target)
  ├─── (*) otp_codes                     │
  └─── (*) audit_logs (polymorphic)      │
                                          │
                              transactions est APPEND-ONLY
                              (immuable : pas d'UPDATE/DELETE possible)
```

