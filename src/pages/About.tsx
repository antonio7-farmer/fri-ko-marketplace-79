import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, ShoppingBag, MessageCircle, Sprout, Heart, Shield } from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky-header bg-white border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            <span>Natrag</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#22C55E] rounded-full mb-4">
            <Sprout size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Frisko.hr</h1>
          <p className="text-xl text-gray-600">
            Povezujemo lokalne poljoprivrednike s potrošačima
          </p>
        </div>

        {/* Mission */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Naša misija</h2>
          <p className="text-gray-700 leading-relaxed">
            Frisko.hr je platforma koja omogućava direktnu vezu između hrvatskih OPG-ova i lokalnih potrošača.
            Naša misija je podržati lokalne proizvođače, promovirati svježu i kvalitetnu hranu te omogućiti
            potrošačima lak pristup autentičnim lokalnim proizvodima.
          </p>
        </section>

        {/* How it Works */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kako funkcionira</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-[#22C55E] font-bold text-lg">1</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Pregledaj lokalne proizvode</h3>
                <p className="text-gray-600">
                  Pretražuj proizvode na karti prema svojoj lokaciji ili pregledaj popis svih OPG-ova.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-[#22C55E] font-bold text-lg">2</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Rezerviraj proizvode</h3>
                <p className="text-gray-600">
                  Odaberi proizvode koje želiš kupiti i napravi rezervaciju direktno s proizvođačem.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-[#22C55E] font-bold text-lg">3</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Preuzmi kod proizvođača</h3>
                <p className="text-gray-600">
                  Dogovori se s proizvođačem o preuzimanju ili dostavi tvoje narudžbe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Što nudimo</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="text-[#22C55E] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Pretraga na karti</h3>
                <p className="text-sm text-gray-600">Pronađi OPG-ove u svojoj blizini</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShoppingBag className="text-[#22C55E] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Svježi proizvodi</h3>
                <p className="text-sm text-gray-600">Direktno od proizvođača do stola</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle className="text-[#22C55E] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Direktna komunikacija</h3>
                <p className="text-sm text-gray-600">Razgovaraj s proizvođačima</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Heart className="text-[#22C55E] flex-shrink-0 mt-1" size={20} />
            <div>
                <h3 className="font-semibold text-gray-900 mb-1">Podrška lokalnoj zajednici</h3>
                <p className="text-sm text-gray-600">Pomozi lokalnim proizvođačima</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sprout className="text-[#22C55E] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Ekološki proizvodi</h3>
                <p className="text-sm text-gray-600">Kvaliteta i održivost</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="text-[#22C55E] flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Sigurna platforma</h3>
                <p className="text-sm text-gray-600">Zaštita podataka i privatnosti</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Kontakt</h2>
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
              <a href="mailto:info@frisko.hr" className="text-[#22C55E] hover:underline">
                info@frisko.hr
              </a>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Podrška</h3>
              <a href="mailto:support@frisko.hr" className="text-[#22C55E] hover:underline">
                support@frisko.hr
              </a>
            </div>
          </div>
        </section>

        {/* Version */}
        <section className="text-center text-sm text-gray-500">
          <p>Frisko.hr - verzija 1.0.0</p>
          <p className="mt-1">© 2025 Frisko.hr. Sva prava pridržana.</p>
        </section>
      </div>
    </div>
  );
};

export default About;
