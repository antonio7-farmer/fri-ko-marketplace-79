import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { PageLayout } from '@/components/layout';
import { classNames } from '@/lib/theme';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword.length < 6) {
      setError('Lozinka mora imati najmanje 6 znakova');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Lozinke se ne podudaraju');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (updateError) throw updateError;

      toast.success('Lozinka je uspješno promijenjena!');
      navigate('/profile');

    } catch (err: any) {
      setError(err.message || 'Greška pri promjeni lozinke');
      setLoading(false);
    }
  };

  return (
    <PageLayout
      preset="form"
      header={{
        show: true,
        className: 'border-b border-[#E5E7EB]',
        children: (
          <div className="px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/profile')}
              className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
            >
              <ArrowLeft size={24} className="text-[#1F2937]" />
            </button>
            <h1 className="text-xl font-bold text-[#1F2937]">Promijeni lozinku</h1>
            <div className="w-10" />
          </div>
        ),
      }}
    >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">Nova lozinka</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="Unesite novu lozinku"
                  className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-all"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <p className="text-xs text-[#6B7280] mt-1">Najmanje 6 znakova</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">Potvrdi lozinku</label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Ponovite novu lozinku"
                className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="flex-1 py-3 border-2 border-[#E5E7EB] text-[#6B7280] rounded-xl font-semibold hover:bg-gray-50 transition-all"
            >
              Odustani
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#22C55E] text-white py-3 rounded-xl font-semibold hover:bg-[#16A34A] disabled:opacity-50 transition-all"
            >
              {loading ? 'Spremanje...' : 'Promijeni lozinku'}
            </button>
          </div>
        </form>
    </PageLayout>
  );
};

export default ChangePassword;
