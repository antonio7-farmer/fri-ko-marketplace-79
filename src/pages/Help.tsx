import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown, Mail, MessageCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    category: 'Početak',
    question: 'Kako se registrirati kao kupac?',
    answer: 'Kliknite na "Registracija" na početnoj stranici, odaberite "Kupac" i ispunite podatke. Nakon registracije možete odmah pregledavati i rezervirati proizvode.',
  },
  {
    category: 'Početak',
    question: 'Kako se registrirati kao prodavač (OPG)?',
    answer: 'Odaberite "Prodavač" pri registraciji. Trebat će te unijeti naziv OPG-a, lokaciju i osnovne podatke. Nakon registracije možete dodavati svoje proizvode.',
  },
  {
    category: 'Početak',
    question: 'Je li korištenje aplikacije besplatno?',
    answer: 'Da, korištenje aplikacije je besplatno za kupce i osnovni račun prodavača. Premium opcije za prodavače dostupne su uz nadoplatu.',
  },

  // For Buyers
  {
    category: 'Za kupce',
    question: 'Kako pregledavati proizvode?',
    answer: 'Proizvode možete pregledavati na nekoliko načina: na karti (Map), po popisu OPG-ova, ili pretraživanjem. Karta prikazuje OPG-ove u vašoj blizini.',
  },
  {
    category: 'Za kupce',
    question: 'Kako napraviti rezervaciju?',
    answer: 'Odaberite proizvod, unesite željenu količinu i pošaljite poruku proizvođaču. Proizvođač će potvrditi rezervaciju i dogovoriti se s vama o preuzimanju.',
  },
  {
    category: 'Za kupce',
    question: 'Kako kontaktirati prodavača?',
    answer: 'Kliknite na "Pošalji poruku" na profilu prodavača ili proizvoda. Sve poruke možete vidjeti u odjeljku "Poruke".',
  },
  {
    category: 'Za kupce',
    question: 'Kako dodati OPG u favorite?',
    answer: 'Na profilu OPG-a kliknite na ikonu srca. Sve favorite možete vidjeti u svom profilu pod "Moji favoriti".',
  },
  {
    category: 'Za kupce',
    question: 'Kako plaćam za proizvode?',
    answer: 'Plaćanje se dogovara direktno s proizvođačem - može biti gotovina pri preuzimanju ili drugi dogovoreni način. Frisko.hr ne procesira plaćanja.',
  },

  // For Sellers
  {
    category: 'Za prodavače',
    question: 'Kako dodati novi proizvod?',
    answer: 'U Dashboard-u kliknite "Dodaj proizvod". Unesite naziv, opis, cijenu, jedinicu mjere, kategoriju i dodajte sliku. Proizvod će biti vidljiv odmah.',
  },
  {
    category: 'Za prodavače',
    question: 'Kako urediti ili obrisati proizvod?',
    answer: 'U Dashboard-u kliknite na proizvod, zatim "Uredi" ili "Obriši". Promjene su vidljive odmah.',
  },
  {
    category: 'Za prodavače',
    question: 'Kako upravljati rezervacijama?',
    answer: 'Sve rezervacije možete vidjeti u odjeljku "Rezervacije". Možete ih potvrditi, odbiti ili označiti kao dovršene.',
  },
  {
    category: 'Za prodavače',
    question: 'Kako dodati slike proizvoda?',
    answer: 'Pri dodavanju proizvoda kliknite na "Dodaj sliku" i odaberite fotografiju s uređaja. Preporučene su fotografije visoke kvalitete.',
  },
  {
    category: 'Za prodavače',
    question: 'Kako postaviti lokaciju mog OPG-a?',
    answer: 'U postavkama profila ("Uredi profil") možete postaviti adresu koja će biti prikazana na karti. Kupci će vas lakše pronaći.',
  },

  // Account & Settings
  {
    category: 'Račun i postavke',
    question: 'Kako promijeniti lozinku?',
    answer: 'U profilu kliknite na "Promijeni lozinku", unesite trenutnu i novu lozinku.',
  },
  {
    category: 'Račun i postavke',
    question: 'Kako urediti svoj profil?',
    answer: 'Kliknite na ikonu postavki u profilu, zatim "Uredi profil". Možete promijeniti ime, profilnu sliku, bio i ostale podatke.',
  },
  {
    category: 'Račun i postavke',
    question: 'Mogu li obrisati svoj račun?',
    answer: 'Da, u postavkama profila dostupna je opcija za brisanje računa. Ova radnja je trajna i ne može se poništiti.',
  },
  {
    category: 'Račun i postavke',
    question: 'Zašto ne vidim sve funkcije?',
    answer: 'Neke funkcije su dostupne samo za prodavače ili samo za kupce. Provjerite da ste prijavljeni s ispravnom vrstom računa.',
  },

  // Troubleshooting
  {
    category: 'Rješavanje problema',
    question: 'Lokacija ne radi na karti',
    answer: 'Provjerite da ste dozvolili pristup lokaciji u postavkama preglednika ili telefona. Također možete ručno unijeti adresu.',
  },
  {
    category: 'Rješavanje problema',
    question: 'Ne vidim proizvode u mojoj blizini',
    answer: 'Moguće je da nema OPG-ova u vašoj blizini. Podesite filter udaljenosti na veću vrijednost ili pregledajte sve OPG-ove.',
  },
  {
    category: 'Rješavanje problema',
    question: 'Poruke se ne šalju',
    answer: 'Provjerite internet vezu. Ako problem traje, odjavite se i ponovno prijavite.',
  },
  {
    category: 'Rješavanje problema',
    question: 'Zaboravio sam lozinku',
    answer: 'Na stranici prijave kliknite "Zaboravili ste lozinku?". Unesite email i slijedite upute za resetiranje.',
  },
];

const Help = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Sve');

  const categories = ['Sve', ...Array.from(new Set(faqData.map(item => item.category)))];

  const filteredFAQ = selectedCategory === 'Sve'
    ? faqData
    : faqData.filter(item => item.category === selectedCategory);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky-header bg-white border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Natrag</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Pomoć i podrška</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Contact Support */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 mb-6 text-white">
          <h2 className="text-xl font-bold mb-2">Trebate dodatnu pomoć?</h2>
          <p className="mb-4 opacity-90">
            Naš tim je tu da vam pomogne. Kontaktirajte nas putem emaila ili pronađite odgovore u FAQ-u ispod.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@frisko.hr"
              className="inline-flex items-center gap-2 bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-50 transition-colors"
            >
              <Mail size={18} />
              <span className="font-medium">support@frisko.hr</span>
            </a>
            <a
              href="mailto:info@frisko.hr"
              className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
            >
              <MessageCircle size={18} />
              <span className="font-medium">info@frisko.hr</span>
            </a>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Često postavljana pitanja</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredFAQ.length} {filteredFAQ.length === 1 ? 'pitanje' : 'pitanja'}
            </p>
          </div>

          <div className="divide-y">
            {filteredFAQ.map((item, index) => (
              <div key={index} className="px-6 py-4">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-start justify-between gap-4 text-left"
                >
                  <div className="flex-1">
                    <div className="text-xs text-[#22C55E] font-medium mb-1">{item.category}</div>
                    <h3 className="font-semibold text-gray-900">{item.question}</h3>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`flex-shrink-0 text-gray-400 transition-transform ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="mt-3 text-gray-600 leading-relaxed">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Niste pronašli odgovor?</h3>
          <p className="text-sm text-blue-800 mb-3">
            Pošaljite nam email s opisom problema i javit ćemo vam se u najkraćem mogućem roku.
          </p>
          <a
            href="mailto:support@frisko.hr?subject=Pomoć - Frisko.hr"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Mail size={16} />
            Kontaktiraj podršku
          </a>
        </div>
      </div>
    </div>
  );
};

export default Help;
