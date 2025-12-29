import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Uvjeti korištenja</h1>
        <p className="text-sm text-gray-600 mb-8">Zadnja izmjena: {new Date().toLocaleDateString('hr-HR')}</p>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Prihvaćanje uvjeta</h2>
            <p className="text-gray-700">
              Pristupom i korištenjem Frisko.hr aplikacije ("Usluga"), prihvaćate ove Uvjete korištenja.
              Ako se ne slažete s ovim uvjetima, molimo ne koristite našu Uslugu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Opis usluge</h2>
            <p className="text-gray-700">
              Frisko.hr je platforma koja povezuje lokalne proizvođače (OPG-ove) s kupcima, omogućavajući:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
              <li>Prikaz i prodaju lokalnih poljoprivrednih proizvoda</li>
              <li>Pregledavanje proizvoda na karti prema lokaciji</li>
              <li>Rezervaciju proizvoda</li>
              <li>Direktnu komunikaciju između kupaca i prodavača</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Korisnički računi</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">3.1 Registracija:</h3>
                <p className="text-gray-700">
                  Za korištenje određenih funkcionalnosti, morate kreirati korisnički račun s točnim i potpunim informacijama.
                  Vi ste odgovorni za sigurnost svoje lozinke i svih aktivnosti na svom računu.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">3.2 Tipovi računa:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Kupac</strong> - Može pregledavati i rezervirati proizvode</li>
                  <li><strong>Prodavač (OPG)</strong> - Može prodavati proizvode i upravljati narudžbama</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">3.3 Brisanje računa:</h3>
                <p className="text-gray-700">
                  Možete zatražiti brisanje svog računa u bilo kojem trenutku putem postavki profila.
                  Brisanje računa je trajno i ne može se poništiti.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Obveze prodavača</h2>
            <p className="text-gray-700 mb-2">Ako ste prodavač, obvezujete se:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Pružati točne informacije o proizvodima (opisi, cijene, količine)</li>
              <li>Osigurati kvalitetu i sigurnost hrane u skladu s propisima</li>
              <li>Poštovati rezervacije i dogovorene rokove</li>
              <li>Održavati profesionalnu komunikaciju s kupcima</li>
              <li>Pravovremeno ažurirati dostupnost proizvoda</li>
              <li>Ispuniti sve zakonske obveze vezane uz prodaju hrane</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Obveze kupaca</h2>
            <p className="text-gray-700 mb-2">Ako ste kupac, obvezujete se:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Poštovati rezervacije i dogovorene termine</li>
              <li>Pravovremeno otkazati rezervacije koje ne možete ispuniti</li>
              <li>Održavati profesionalnu komunikaciju s prodavačima</li>
              <li>Ne zlouporabiti platformu za spam ili zlonamjerne svrhe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Zabranjena upotreba</h2>
            <p className="text-gray-700 mb-2">Zabranjeno je:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Objavljivati lažne, obmanjujuće ili zlonamjerne sadržaje</li>
              <li>Kršiti prava intelektualnog vlasništva</li>
              <li>Uznemiravanje drugih korisnika</li>
              <li>Koristiti automatizirane alate (botove) bez dopuštenja</li>
              <li>Prodavati ilegalne ili opasne proizvode</li>
              <li>Manipulirati cijenama ili lažno predstavljati proizvode</li>
              <li>Prikupljati podatke drugih korisnika bez dopuštenja</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Sadržaj korisnika</h2>
            <p className="text-gray-700">
              Vi zadržavate vlasništvo nad sadržajem koji objavljujete (slike, opisi proizvoda, poruke).
              Međutim, dajete nam ograničenu licencu za korištenje tog sadržaja u svrhu pružanja Usluge.
              Ne objavljujte sadržaj koji krši prava trećih strana ili koji je neprikladan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Plaćanje i transakcije</h2>
            <p className="text-gray-700">
              Trenutno Frisko.hr ne procesira plaćanja direktno. Sve financijske transakcije odvijaju se direktno
              između kupaca i prodavača. Nismo odgovorni za probleme s plaćanjima ili ispunjenjem narudžbi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Ograničenje odgovornosti</h2>
            <p className="text-gray-700 mb-3">
              Frisko.hr je platforma za povezivanje kupaca i prodavača. Ne provjeravamo kvalitetu proizvoda niti
              jamčimo za ispunjenje dogovora između korisnika.
            </p>
            <p className="text-gray-700">
              Koristite Uslugu na vlastitu odgovornost. Ne odgovaramo za:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4 mt-2">
              <li>Kvalitetu, sigurnost ili zakonitost proizvoda</li>
              <li>Ispunjenje rezervacija ili narudžbi</li>
              <li>Sporove između korisnika</li>
              <li>Gubitak podataka ili prekide u radu usluge</li>
              <li>Štetu prouzročenu uporabom ili nemogućnošću korištenja Usluge</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Rješavanje sporova</h2>
            <p className="text-gray-700">
              Sporove između korisnika rješavaju sami korisnici. Frisko.hr može ponuditi pomoć u komunikaciji,
              ali nije obvezan posredovati u sporovima. Za ozbiljne prijavne slučajeve, zadržavamo pravo suspendiranja ili
              brisanja računa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Intelektualno vlasništvo</h2>
            <p className="text-gray-700">
              Sva prava na Frisko.hr aplikaciju, uključujući dizajn, logotip i kod, vlasništvo su Frisko.hr.
              Zabranjeno je kopiranje, modificiranje ili distribucija naše platforme bez pisanog dopuštenja.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Izmjene uvjeta</h2>
            <p className="text-gray-700">
              Zadržavamo pravo izmjene ovih Uvjeta korištenja. Obavijestit ćemo vas o značajnim izmjenama putem
              email-a ili obavijesti u aplikaciji. Nastavak korištenja nakon izmjena znači prihvaćanje novih uvjeta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">13. Prekid usluge</h2>
            <p className="text-gray-700">
              Zadržavamo pravo suspendirati ili prekinuti vaš pristup Usluzi ako kršite ove Uvjete ili ako
              vaša aktivnost ugrožava sigurnost ili integritet platforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">14. Mjerodavno pravo</h2>
            <p className="text-gray-700">
              Ovi Uvjeti se tumače i provode u skladu sa zakonima Republike Hrvatske.
              Svaki spor bit će riješen pred nadležnim sudovima u Hrvatskoj.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">15. Kontakt</h2>
            <p className="text-gray-700">
              Za pitanja o ovim Uvjetima korištenja, kontaktirajte nas na:
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Email:</strong> info@frisko.hr<br />
              <strong>Adresa:</strong> [Vaša adresa]
            </p>
          </section>

          <section className="bg-gray-50 p-4 rounded-lg mt-6">
            <p className="text-sm text-gray-600">
              Korištenjem Frisko.hr aplikacije, potvrđujete da ste pročitali, razumjeli i prihvatili ove Uvjete korištenja.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
