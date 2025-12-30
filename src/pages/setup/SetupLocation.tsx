import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { initializeLeafletIcons } from '@/lib/leaflet';

// Initialize Leaflet icons
initializeLeafletIcons();

// Custom green marker icon
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface Position {
  lat: number;
  lng: number;
}

interface DraggableMarkerProps {
  position: Position;
  setPosition: (position: Position) => void;
}

function DraggableMarker({ position, setPosition }: DraggableMarkerProps) {
  const map = useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
      map.flyTo(e.latlng, map.getZoom());
    }
  });

  const eventHandlers = useMemo(
    () => ({
      dragend(e: L.DragEndEvent) {
        const marker = e.target;
        const pos = marker.getLatLng();
        setPosition({
          lat: pos.lat,
          lng: pos.lng
        });
      }
    }),
    [setPosition]
  );

  return (
    <Marker
      position={[position.lat, position.lng]}
      icon={greenIcon}
      draggable={true}
      eventHandlers={eventHandlers}
    />
  );
}

const SetupLocation = () => {
  const [position, setPosition] = useState<Position>({ lat: 45.8150, lng: 15.9819 }); // Default: Zagreb
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Reverse geocoding to get address
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.lat}&lon=${position.lng}`
        );
        const data = await response.json();
        if (data.display_name) {
          setAddress(data.display_name);
        }
      } catch (error) {
      }
    };

    const debounce = setTimeout(fetchAddress, 500);
    return () => clearTimeout(debounce);
  }, [position]);

  const handleSave = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast.error('Morate biti prijavljeni');
        setLoading(false);
        return;
      }

      // Check if profile exists first
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        toast.error('Profil nije pronađen. Molimo pokušajte ponovno registrirati.');
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          location_lat: position.lat,
          location_lng: position.lng,
          location_address: address
        })
        .eq('id', user.id);

      if (error) {
        toast.error('Greška pri spremanju lokacije: ' + error.message);
        setLoading(false);
        return;
      }

      // Success - navigate to next step
      navigate('/setup/profile');

    } catch (error) {
      toast.error('Došlo je do neočekivane greške');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <button
            onClick={() => navigate('/register/seller')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Natrag
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Postavite lokaciju</h1>
              <p className="text-base text-gray-600">Gdje kupci mogu preuzeti proizvode?</p>
            </div>
            <div className="bg-[#E8F5E9] p-3 rounded-lg">
              <MapPin size={32} className="text-[#22C55E]" />
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#22C55E] rounded-full"></div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Korak 1 od 2</p>
        </div>

        {/* Map Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Povucite pin na vašu lokaciju</h2>
            <p className="text-sm text-gray-600">Ova lokacija će biti vidljiva kupcima na karti</p>
          </div>

          {/* Map Container */}
          <div className="h-96 rounded-xl overflow-hidden border-2 border-[#E5E7EB] mb-4">
            <MapContainer
              center={[position.lat, position.lng]}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <DraggableMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>

          {/* Coordinates Display */}
          <div className="bg-[#E8F5E9] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Koordinate:</span>
              <span className="text-sm text-gray-900 font-mono">
                {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </span>
            </div>
            {address && (
              <div className="flex items-center gap-2 pt-2 border-t border-[#22C55E]/20">
                <MapPin size={16} className="text-[#22C55E] flex-shrink-0" />
                <span className="text-sm text-gray-700 line-clamp-2">{address}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/register/seller')}
            className="px-6 py-4 border-2 border-[#E5E7EB] bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Natrag
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-[#22C55E] text-white py-4 rounded-xl font-semibold hover:bg-[#16A34A] disabled:opacity-50 transition-all"
          >
            {loading ? 'Spremanje...' : 'Nastavi na profil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupLocation;
