import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { consumeRedirectPath } from '@/lib/navigation';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      // Get safe redirect path (validates to prevent open redirect)
      const redirectPath = consumeRedirectPath('/');

      toast.success('Dobrodošli!');
      navigate(redirectPath);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-[#6B7280] hover:text-[#1F2937] transition-all duration-200"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Natrag
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Dobrodošli natrag</h1>
          <p className="text-base text-[#6B7280]">Prijavite se na svoj račun</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.com"
              required
              className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 text-base text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Lozinka
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 pr-12 text-base text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-all duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-[#22C55E] font-medium hover:underline"
            >
              Zaboravili ste lozinku?
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-lg p-3">
              <p className="text-sm text-[#DC2626]">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#22C55E] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-md"
          >
            {loading ? 'Prijava...' : 'Prijavi se'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[#6B7280] mt-6">
          Nemate račun?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#22C55E] font-semibold hover:underline"
          >
            Registrirajte se
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
