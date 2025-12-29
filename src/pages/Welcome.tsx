import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#E8F5E9] flex flex-col items-center justify-center p-6">
      {/* Logo/Icon */}
      <div className="w-24 h-24 bg-[#22C55E] rounded-full flex items-center justify-center mb-8 shadow-lg">
        <Leaf className="w-12 h-12 text-white" />
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <img src="/logo.png" alt="Friško.hr" className="h-12 mx-auto mb-2" />
        <p className="text-base text-[#6B7280]">Svježe s polja, direktno do vas</p>
      </div>

      {/* Buttons */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-[#22C55E] text-white py-4 rounded-xl font-semibold text-base hover:bg-[#16A34A] transition-all duration-200 shadow-lg hover:shadow-md"
        >
          Prijavi se
        </button>
        <button
          onClick={() => navigate('/register')}
          className="w-full bg-white border-2 border-[#22C55E] text-[#22C55E] py-4 rounded-xl font-semibold text-base hover:bg-[#E8F5E9] transition-all duration-200"
        >
          Registriraj se
        </button>
      </div>
    </div>
  );
};

export default Welcome;
