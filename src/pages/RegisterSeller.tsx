import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

type Tier = 'free' | 'farmer';

const RegisterSeller = () => {
  const navigate = useNavigate();
  const [opgName, setOpgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tier, setTier] = useState<Tier>('free');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!opgName.trim()) {
      newErrors.opgName = 'Naziv OPG-a je obavezan';
    }

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

    const redirectUrl = `${window.location.origin}/setup/location`;

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: opgName,
          role: tier === 'farmer' ? 'farmer' : 'seller',
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
    } else {
      // Show success message - user needs to confirm email first
      setRegistrationComplete(true);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] p-6 pb-12">
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
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Registracija OPG-a</h1>
          <p className="text-base text-[#6B7280]">Kreirajte svoj prodajni račun</p>
        </div>

        {/* Form or Success Message */}
        {registrationComplete ? (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-[#22C55E]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Registracija započeta!</h2>
              <p className="text-[#6B7280] mb-4">
                Poslali smo vam email s linkom za potvrdu na adresu <strong>{email}</strong>
              </p>
              <p className="text-sm text-[#6B7280]">
                Kliknite na link u emailu da dovršite registraciju i postavite svoj profil.
              </p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-[#22C55E] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#16A34A] transition-all duration-200 shadow-lg hover:shadow-md"
            >
              Idi na prijavu
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* OPG Name */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Naziv OPG-a
            </label>
            <input
              type="text"
              value={opgName}
              onChange={(e) => setOpgName(e.target.value)}
              placeholder="OPG Horvat"
              className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 text-base text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition-all duration-200"
            />
            {errors.opgName && (
              <p className="text-sm text-[#DC2626] mt-1">{errors.opgName}</p>
            )}
          </div>

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

          {/* Tier Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Odaberite paket
            </label>

            {/* Free Tier */}
            <label
              className={`relative block border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                tier === 'free'
                  ? 'border-[#22C55E] bg-[#E8F5E9]'
                  : 'border-[#E5E7EB] hover:border-[#22C55E]'
              }`}
            >
              <input
                type="radio"
                name="tier"
                value="free"
                checked={tier === 'free'}
                onChange={() => setTier('free')}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#1F2937]">Free</span>
                    <span className="text-xs font-medium text-[#22C55E] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                      BESPLATNO
                    </span>
                  </div>
                  <div className="text-sm text-[#6B7280]">
                    <p>• Max 2 proizvoda</p>
                  </div>
                </div>
                {tier === 'free' && (
                  <div className="w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </label>

            {/* Farmer Tier */}
            <label
              className={`relative block border-2 rounded-xl p-4 cursor-pointer transition-all duration-200 ${
                tier === 'farmer'
                  ? 'border-[#22C55E] bg-[#E8F5E9]'
                  : 'border-[#E5E7EB] hover:border-[#22C55E]'
              }`}
            >
              <input
                type="radio"
                name="tier"
                value="farmer"
                checked={tier === 'farmer'}
                onChange={() => setTier('farmer')}
                className="sr-only"
              />
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-[#1F2937]">Farmer</span>
                    <span className="text-xs font-medium text-[#F59E0B] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                      10€/mjesec
                    </span>
                  </div>
                  <div className="text-sm text-[#6B7280]">
                    <p>• Neograničeno proizvoda</p>
                    <p>• Istaknuti profil na vrhu</p>
                    <p>• Verified badge</p>
                  </div>
                </div>
                {tier === 'farmer' && (
                  <div className="w-6 h-6 bg-[#22C55E] rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </label>
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
            {loading ? 'Registracija...' : 'Nastavi na postavljanje profila'}
          </button>
        </form>
        )}

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

export default RegisterSeller;
