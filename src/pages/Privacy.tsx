import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/layout';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <PageLayout
      preset="standard"
      background="bg-gray-50"
      header={{
        show: true,
        className: 'border-b',
        children: (
          <div className="px-4 py-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              <span>Natrag</span>
            </button>
          </div>
        ),
      }}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politika privatnosti</h1>
        <p className="text-sm text-gray-600 mb-8">Zadnja izmjena: {new Date().toLocaleDateString('hr-HR')}</p>

        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Uvod</h2>
            <p className="text-gray-700">
              Frisko.hr ("mi", "nas", "naša") poštuje vašu privatnost i obvezuje se zaštiti vaše osobne podatke.
              Ova politika privatnosti objašnjava kako prikupljamo, koristimo i štitimo vaše podatke kada koristite našu aplikaciju.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Podaci koje prikupljamo</h2>
            <div className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-800 mb-2">2.1 Podaci koje vi pružate:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Ime i prezime</li>
                  <li>Email adresa</li>
                  <li>Telefonski broj (opcionalno)</li>
                  <li>Adresa ili lokacija (za prodavače)</li>
                  <li>Profilna slika (opcionalno)</li>
                  <li>Informacije o proizvodima (slike, opisi, cijene)</li>
                  <li>Poruke poslane putem naše chat funkcionalnosti</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-800 mb-2">2.2 Automatski prikupljeni podaci:</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Podaci o lokaciji (s vašim dopuštenjem)</li>
                  <li>Podaci o uređaju i pregledniku</li>
                  <li>IP adresa</li>
                  <li>Podaci o korištenju aplikacije</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Kako koristimo vaše podatke</h2>
            <p className="text-gray-700 mb-2">Vaše podatke koristimo za sljedeće svrhe:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Pružanje i održavanje naših usluga</li>
              <li>Povezivanje kupaca i prodavača</li>
              <li>Prikazivanje proizvoda i lokacija na karti</li>
              <li>Omogućavanje komunikacije između korisnika</li>
              <li>Upravljanje rezervacijama i narudžbama</li>
              <li>Poboljšanje korisničkog iskustva</li>
              <li>Slanje obavijesti o statusu narudžbi i poruka</li>
              <li>Zaštita od zloupotreba i prijevara</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Dijeljenje podataka s trećim stranama</h2>
            <p className="text-gray-700 mb-2">Vaši podaci mogu biti podijeljeni s:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li><strong>Supabase</strong> - Naš pružatelj usluga baze podataka i autentifikacije</li>
              <li><strong>OpenStreetMap / Nominatim</strong> - Za geocoding i prikaz karti</li>
              <li><strong>Drugi korisnici</strong> - Vaš profil i proizvodi su javno vidljivi drugim korisnicima</li>
            </ul>
            <p className="text-gray-700 mt-3">
              Ne prodajemo vaše osobne podatke trećim stranama u marketinške svrhe.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Zadržavanje podataka</h2>
            <p className="text-gray-700">
              Vaše podatke zadržavamo dok je vaš račun aktivan ili dok je potrebno za pružanje usluga.
              Možete zatražiti brisanje svog računa u bilo kojem trenutku.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Vaša prava (GDPR)</h2>
            <p className="text-gray-700 mb-2">U skladu s GDPR-om, imate sljedeća prava:</p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li><strong>Pravo pristupa</strong> - Možete zatražiti kopiju svojih podataka</li>
              <li><strong>Pravo ispravka</strong> - Možete ažurirati svoje podatke</li>
              <li><strong>Pravo na brisanje</strong> - Možete zatražiti brisanje svog računa</li>
              <li><strong>Pravo na prijenosivost</strong> - Možete zatražiti izvoz svojih podataka</li>
              <li><strong>Pravo prigovora</strong> - Možete prigovoriti obradi svojih podataka</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Sigurnost podataka</h2>
            <p className="text-gray-700">
              Poduzimamo odgovarajuće tehničke i organizacijske mjere za zaštitu vaših podataka od neovlaštenog pristupa,
              gubitka ili zloupotrebe. Koristimo enkripciju (HTTPS) za prijenos podataka i sigurne baze podataka za pohranu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Kolačići (Cookies)</h2>
            <p className="text-gray-700">
              Koristimo kolačiće i lokalnu pohranu preglednika za autentifikaciju i pohranu postavki.
              Ovi podaci ostaju na vašem uređaju i koriste se samo za funkcioniranje aplikacije.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Djeca</h2>
            <p className="text-gray-700">
              Naša usluga nije namijenjena osobama mlađim od 16 godina. Ne prikupljamo svjesno podatke od djece ispod te dobi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Izmjene politike privatnosti</h2>
            <p className="text-gray-700">
              Zadržavamo pravo izmjene ove politike privatnosti. Obavijestit ćemo vas o značajnim izmjenama putem email-a
              ili obavijesti u aplikaciji.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Kontakt</h2>
            <p className="text-gray-700">
              Za pitanja o ovoj politici privatnosti ili za ostvarivanje svojih prava, kontaktirajte nas na:
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Email:</strong> privacy@frisko.hr<br />
              <strong>Adresa:</strong> [Vaša adresa]
            </p>
          </section>
        </div>
      </div>
    </PageLayout>
  );
};

export default Privacy;
