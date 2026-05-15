import { useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useLoginMutation } from '@/features/auth/authApi';
import { useAuth } from '@/hooks/useAuth';
import { extractErrorMessage } from '@/utils/errors';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const { isAuthenticated, isAdmin } = useAuth();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname;
      navigate(from || (isAdmin ? '/admin' : '/app'), { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate, location]);

  useEffect(() => {
    if (params.get('session_expired')) {
      toast.error('Votre session a expiré. Reconnectez-vous.');
    }
  }, [params]);

  const onSubmit = async (data) => {
    try {
      await login(data).unwrap();
      toast.success('Bienvenue 👋');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <h1 className="text-2xl font-bold mb-1">Connexion</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Accédez à votre espace BankApp en toute sécurité.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            leftIcon={Mail}
            placeholder="vous@exemple.com"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Mot de passe"
            type="password"
            leftIcon={Lock}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" loading={isLoading} icon={LogIn} className="w-full">
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-500">
          Pas encore client ?{' '}
          <Link to="/register" className="text-primary-600 hover:underline font-medium">
            Ouvrir un compte
          </Link>
        </p>

      </div>
    </div>
  );
}
