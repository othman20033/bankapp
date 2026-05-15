import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Smartphone,
  Zap,
  Lock,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Sécurité bancaire',
    text: 'OTP par email et SMS, chiffrement, audit complet de chaque opération.',
  },
  {
    icon: Zap,
    title: 'Virements instantanés',
    text: 'Effectuez vos virements en quelques secondes, avec confirmation OTP.',
  },
  {
    icon: BarChart3,
    title: 'Statistiques claires',
    text: 'Visualisez vos dépenses et revenus avec des graphiques modernes.',
  },
  {
    icon: Smartphone,
    title: 'Mobile-first',
    text: 'Une interface responsive, parfaite sur téléphone, tablette et bureau.',
  },
  {
    icon: Lock,
    title: 'Vos données protégées',
    text: 'Hash bcrypt, transactions immuables, conformité RGPD.',
  },
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-white dark:from-primary-950/30 dark:via-slate-950 dark:to-slate-950" />
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-medium mb-5">
              🇲🇦 Banque digitale au Maroc
            </span>
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Votre banque,
              <span className="block bg-gradient-to-r from-primary-700 to-primary-400 bg-clip-text text-transparent">
                réinventée pour le digital.
              </span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Gérez vos comptes, vos virements et votre épargne en quelques clics.
              Une expérience moderne, rapide et sécurisée — entièrement en ligne.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn-primary text-base px-6 py-3">
                Ouvrir mon compte <ArrowRight className="size-4" />
              </Link>
              <Link to="/login" className="btn-secondary text-base px-6 py-3">
                Me connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl lg:text-3xl font-bold mb-2">Pourquoi BankApp ?</h2>
        <p className="text-slate-500 mb-10">Tout ce dont vous avez besoin pour gérer votre argent au quotidien.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-card-hover transition-shadow">
              <div className="size-11 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 flex items-center justify-center mb-4">
                <f.icon className="size-5" />
              </div>
              <h3 className="text-base font-semibold mb-1.5">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="card bg-gradient-to-br from-primary-700 to-primary-900 text-white p-10 lg:p-14 text-center border-0">
          <h2 className="text-2xl lg:text-3xl font-bold mb-3">
            Prêt à passer à la banque nouvelle génération ?
          </h2>
          <p className="text-primary-100 mb-6 max-w-xl mx-auto">
            Inscrivez-vous gratuitement et créez votre premier compte en moins de 2 minutes.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-primary-50 font-semibold px-6 py-3 rounded-lg transition-colors">
            Commencer maintenant <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
