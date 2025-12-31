import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag, Tractor, ChevronRight } from 'lucide-react';
import { PageLayout } from '@/components/layout';
import { classNames } from '@/lib/theme';

const Register = () => {
  const navigate = useNavigate();

  return (
    <PageLayout preset="auth" background="bg-[#F3F4F6]" header={{ show: false }}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/login')}
        className="mb-6 flex items-center text-[#6B7280] hover:text-[#1F2937] transition-all duration-200"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Natrag
      </button>

      {/* Card */}
      <div className={`${classNames.card} shadow-lg p-8`}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1F2937] mb-2">Pridružite se</h1>
          <p className="text-base text-[#6B7280]">Odaberite tip računa</p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Buyer Option */}
          <button
            onClick={() => navigate('/register/buyer')}
            className="w-full border-2 border-[#E5E7EB] rounded-xl p-6 hover:border-[#22C55E] hover:bg-[#E8F5E9] transition-all duration-200 text-left group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#E8F5E9] rounded-full flex items-center justify-center mr-4 group-hover:bg-[#22C55E] transition-all duration-200">
                <ShoppingBag className="w-6 h-6 text-[#22C55E] group-hover:text-white transition-all duration-200" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1F2937]">Kupac</h3>
                <p className="text-sm text-[#6B7280]">
                  Pregledajte i rezervirajte proizvode s lokalnih OPG-ova
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#22C55E] transition-all duration-200" />
            </div>
          </button>

          {/* Seller Option */}
          <button
            onClick={() => navigate('/register/seller')}
            className="w-full border-2 border-[#E5E7EB] rounded-xl p-6 hover:border-[#22C55E] hover:bg-[#E8F5E9] transition-all duration-200 text-left group"
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-[#FFF8E1] rounded-full flex items-center justify-center mr-4 group-hover:bg-[#22C55E] transition-all duration-200">
                <Tractor className="w-6 h-6 text-[#F59E0B] group-hover:text-white transition-all duration-200" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#1F2937]">Imam OPG</h3>
                <p className="text-sm text-[#6B7280]">Prodajte svoje proizvode lokalno</p>
              </div>
              <ChevronRight className="w-5 h-5 text-[#9CA3AF] group-hover:text-[#22C55E] transition-all duration-200" />
            </div>
          </button>
        </div>
      </div>
    </PageLayout>
  );
};

export default Register;
