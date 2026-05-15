import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Save, KeyRound, User, Mail, Phone, Lock } from 'lucide-react';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from '@/features/auth/authApi';
import { extractErrorMessage } from '@/utils/errors';
import { formatDate } from '@/utils/formatters';

const profileSchema = z.object({
  first_name: z.string().min(2, 'Trop court'),
  last_name: z.string().min(2, 'Trop court'),
  phone: z
    .string()
    .regex(/^\+?[0-9 ]{8,20}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Requis'),
    password: z
      .string()
      .min(8, 'Au moins 8 caractères')
      .regex(/[A-Z]/, 'Une majuscule')
      .regex(/[a-z]/, 'Une minuscule')
      .regex(/[0-9]/, 'Un chiffre')
      .regex(/[^A-Za-z0-9]/, 'Un symbole'),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['password_confirmation'],
  });

export default function ProfilePage() {
  const { user } = useAuth();
  const [updateProfile, { isLoading: savingProfile }] = useUpdateProfileMutation();
  const [changePassword, { isLoading: changingPassword }] = useChangePasswordMutation();

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name ?? '',
      last_name: user?.last_name ?? '',
      phone: user?.phone ?? '',
    },
  });

  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data) => {
    try {
      await updateProfile(data).unwrap();
      toast.success('Profil mis à jour ✅');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const onChangePassword = async (data) => {
    try {
      await changePassword(data).unwrap();
      toast.success('Mot de passe modifié 🔐');
      passwordForm.reset();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Gérez vos informations personnelles et votre sécurité.
        </p>
      </div>

      {/* En-tête utilisateur */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="size-16 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 text-white text-2xl font-semibold flex items-center justify-center">
            {user?.first_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{user?.full_name}</h2>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Membre depuis le {formatDate(user?.created_at)}
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Édition profil */}
        <Card title="Informations personnelles">
          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Prénom"
                leftIcon={User}
                error={profileForm.formState.errors.first_name?.message}
                {...profileForm.register('first_name')}
              />
              <Input
                label="Nom"
                leftIcon={User}
                error={profileForm.formState.errors.last_name?.message}
                {...profileForm.register('last_name')}
              />
            </div>
            <Input
              label="Email"
              type="email"
              leftIcon={Mail}
              value={user?.email}
              disabled
              hint="L'email ne peut pas être modifié."
            />
            <Input
              label="Téléphone"
              type="tel"
              leftIcon={Phone}
              hint="Utilisé pour les codes OTP par SMS."
              error={profileForm.formState.errors.phone?.message}
              {...profileForm.register('phone')}
            />
            <Button type="submit" loading={savingProfile} icon={Save}>
              Enregistrer
            </Button>
          </form>
        </Card>

        {/* Changement mot de passe */}
        <Card title="Sécurité" subtitle="Modifier mon mot de passe">
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <Input
              label="Mot de passe actuel"
              type="password"
              leftIcon={Lock}
              autoComplete="current-password"
              error={passwordForm.formState.errors.current_password?.message}
              {...passwordForm.register('current_password')}
            />
            <Input
              label="Nouveau mot de passe"
              type="password"
              leftIcon={KeyRound}
              autoComplete="new-password"
              hint="8+ chars, maj, min, chiffre, symbole"
              error={passwordForm.formState.errors.password?.message}
              {...passwordForm.register('password')}
            />
            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              leftIcon={KeyRound}
              autoComplete="new-password"
              error={passwordForm.formState.errors.password_confirmation?.message}
              {...passwordForm.register('password_confirmation')}
            />
            <Button type="submit" loading={changingPassword} icon={KeyRound}>
              Modifier le mot de passe
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
