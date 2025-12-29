import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Store, Map } from 'lucide-react';

interface Profile {
  id: string;
  display_name: string;
  bio: string | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  working_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
  markets: { name: string; days: string }[] | null;
  sales_points: { address: string; note: string }[] | null;
}

interface AboutSectionProps {
  opg: Profile;
}

const DAYS_MAP: Record<string, string> = {
  monday: 'Ponedjeljak',
  tuesday: 'Utorak',
  wednesday: 'Srijeda',
  thursday: 'Četvrtak',
  friday: 'Petak',
  saturday: 'Subota',
  sunday: 'Nedjelja',
};

const ORDERED_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const AboutSection = ({ opg }: AboutSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 space-y-8">
      {/* Bio */}
      <div>
        <h3 className="text-lg font-semibold text-[#1F2937] mb-3">O nama</h3>
        {opg.bio ? (
          <p className="text-[#6B7280] leading-relaxed whitespace-pre-wrap">{opg.bio}</p>
        ) : (
          <p className="text-[#6B7280] italic">Opis još nije dodan.</p>
        )}
      </div>

      {/* Location Info */}
      {opg.location_address && (
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
            <MapPin size={20} className="text-[#22C55E]" />
            Lokacija OPG-a
          </h3>
          <div className="bg-[#E8F5E9] rounded-xl p-4 transition-all hover:shadow-md">
            <div className="flex items-center gap-3">
              <MapPin size={24} className="text-[#22C55E] flex-shrink-0" />
              <div>
                <p className="font-semibold text-[#1F2937]">{opg.location_address}</p>
                <button
                  onClick={() => navigate(`/map?opg=${opg.id}`)}
                  className="text-[#22C55E] text-sm font-semibold hover:underline mt-1 block"
                >
                  Prikaži na karti →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Working Hours */}
      {opg.working_hours && (
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937] mb-4 flex items-center gap-2">
            <Clock size={20} className="text-[#22C55E]" />
            Radno vrijeme
          </h3>
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-100">
            {ORDERED_DAYS.map((dayKey) => {
              const dayData = opg.working_hours![dayKey];
              if (!dayData) return null;

              return (
                <div key={dayKey} className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0 border-dashed">
                  <span className="text-[#6B7280] font-medium w-32">{DAYS_MAP[dayKey]}</span>
                  {dayData.closed ? (
                    <span className="text-red-500 font-semibold">Zatvoreno</span>
                  ) : (
                    <span className="font-semibold text-[#1F2937]">
                      {dayData.open} - {dayData.close}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Markets and Sales Points */}
      {(opg.markets?.length || 0) > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
            <Store size={20} className="text-[#22C55E]" />
            Naše tržnice
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {opg.markets!.map((market, idx) => (
              <div key={idx} className="bg-white border border-[#E5E7EB] rounded-xl p-3 shadow-sm">
                <p className="font-bold text-[#1F2937]">{market.name}</p>
                <p className="text-sm text-[#22C55E] font-medium">{market.days}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {(opg.sales_points?.length || 0) > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
            <Map size={20} className="text-[#22C55E]" />
            Prodajna mjesta
          </h3>
          <div className="space-y-3">
            {opg.sales_points!.map((point, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                <MapPin size={18} className="text-[#6B7280] mt-0.5" />
                <div>
                  <p className="font-medium text-[#1F2937] text-sm">{point.address}</p>
                  {point.note && <p className="text-xs text-[#6B7280] mt-0.5">{point.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AboutSection;
