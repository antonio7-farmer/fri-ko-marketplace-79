import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const RegisterBuyer = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Ime i prezime je obavezno';
    }

    if (!email.trim()) {
      newErrors.email = 'Email je obavezan';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Unesite ispravnu email adresu';
    }

    if (!password) {
      newErrors.password = 'Lozinka je obavezna';
    } else if (password.length < 6) {
      newErrors.password = 'Lozinka mora imati najmanje 6 znakova';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Potvrdite lozinku';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Lozinke se ne podudaraju';
    }

    if (!agreeTerms) {
      newErrors.terms = 'Morate prihvatiti uvjete korištenja';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    const redirectUrl = `${window.location.origin}/`;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: name,
          role: 'buyer',
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/register')}
        className="mb-6 flex items-center text-[#6B7280] hover:text-[#1F2937] transition-all duration-200"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Natrag
      </button>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Registracija kupca</h1>
          <p className="text-base text-[#6B7280]">Kreirajte svoj račun</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Ime i prezime
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ivan Horvat"
              className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 text-base text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all duration-200"
            />
            {errors.name && (
              <p className="text-sm text-[#DC2626] mt-1">{errors.name}</p>
            )}
          </div>

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
              className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 text-base text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all duration-200"
            />
            {errors.email && (
              <p className="text-sm text-[#DC2626] mt-1">{errors.email}</p>
            )}
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
            {errors.password && (
              <p className="text-sm text-[#DC2626] mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Potvrdite lozinku
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 pr-12 text-base text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1F2937] transition-all duration-200"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-[#DC2626] mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div>
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-[#E5E7EB] text-[#22C55E] focus:ring-[#22C55E] focus:ring-2"
              />
              <span className="ml-3 text-sm text-[#6B7280]">
                Slažem se s{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:underline">
                  uvjetima korištenja
                </a>
                {' '}i{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:underline">
                  politikom privatnosti
                </a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-sm text-[#DC2626] mt-1">{errors.terms}</p>
            )}
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
            {loading ? 'Registracija...' : 'Registriraj se'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-[#6B7280] mt-6">
          Već imate račun?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#22C55E] font-semibold hover:underline"
          >
            Prijavite se
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterBuyer;
