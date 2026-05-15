import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Phone, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useRegisterMutation } from '@/features/auth/authApi';
import { useAuth } from '@/hooks/useAuth';
import { extractErrorMessage } from '@/utils/errors';

const schema = z
  .object({
    first_name: z.string().min(2, 'Trop court'),
    last_name: z.string().min(2, 'Trop court'),
    email: z.string().email('Email invalide'),
    phone: z
      .string()
      .regex(/^\+?[0-9 ]{8,20}$/, 'Numéro invalide')
      .optional()
      .or(z.literal('')),
    password: z
      .string()
      .min(8, 'Au moins 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[a-z]/, 'Au moins une minuscule')
      .regex(/[0-9]/, 'Au moins un chiffre')
      .regex(/[^A-Za-z0-9]/, 'Au moins un symbole'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [registerUser, { isLoading }] = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isAuthenticated) navigate(isAdmin ? '/admin' : '/app', { replace: true });
  }, [isAuthenticated, isAdmin, navigate]);

  const onSubmit = async (data) => {
    try {
      await registerUser(data).unwrap();
      toast.success('Compte créé avec succès 🎉');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <div className="card w-full max-w-lg p-8">
        <h1 className="text-2xl font-bold mb-1">Ouvrir un compte</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Créez votre espace BankApp en quelques secondes.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prénom"
              leftIcon={User}
              placeholder="Othmane"
              error={errors.first_name?.message}
              {...register('first_name')}
            />
            <Input
              label="Nom"
              leftIcon={User}
              placeholder="Bennani"
              error={errors.last_name?.message}
              {...register('last_name')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            leftIcon={Mail}
            placeholder="vous@exemple.com"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Téléphone"
            type="tel"
            leftIcon={Phone}
            placeholder="+212 6XX XX XX XX"
            hint="Pour recevoir vos codes de sécurité par SMS"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Mot de passe"
            type="password"
            leftIcon={Lock}
            placeholder="8+ chars, maj, min, chiffre, symbole"
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirmer le mot de passe"
            type="password"
            leftIcon={Lock}
            error={errors.password_confirmation?.message}
            {...register('password_confirmation')}
          />

          <Button type="submit" loading={isLoading} icon={UserPlus} className="w-full">
            Créer mon compte
          </Button>
        </form>

        <p className="mt-6 text-sm text-center text-slate-500">
          Déjà client ?{' '}
          <Link to="/login" className="text-primary-600 hover:underline font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
