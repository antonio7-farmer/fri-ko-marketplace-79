import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import {
  Search,
  SlidersHorizontal,
  X,
  Check,
  BadgeCheck,
  Star,
  MapPin,
  ArrowRight
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PageLayout } from '@/components/layout';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom green marker
const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Custom gold marker for Farmer tier
const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface OPGLocation {
  id: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  rating: number | null;
  verified: boolean | null;
  role: string;
  location_lat: number;
  location_lng: number;
  location_address: string | null;
  products_categories: string[];
}

interface UserLocation {
  lat: number;
  lng: number;
}

const categories = [
  { value: 'all', label: 'Sve' },
  { value: 'voce', label: 'Voće' },
  { value: 'povrce', label: 'Povrće' },
  { value: 'meso', label: 'Meso' },
  { value: 'jaja', label: 'Jaja' },
  { value: 'mlijecni', label: 'Mliječni' },
  { value: 'ostalo', label: 'Ostalo' }
];

// Map controller component - handles flying to selected OPG
function MapController({ selectedOPG }: { selectedOPG: OPGLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedOPG) {
      map.flyTo([selectedOPG.location_lat, selectedOPG.location_lng], 15);
    }
  }, [selectedOPG, map]);

  return null;
}

const MapView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [opgLocations, setOpgLocations] = useState<OPGLocation[]>([]);
  const [selectedOPG, setSelectedOPG] = useState<OPGLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOPGLocations();
    getUserLocation();
  }, []);

  useEffect(() => {
    const opgId = searchParams.get('opg');
    if (opgId && opgLocations.length > 0) {
      const opg = opgLocations.find(o => o.id === opgId);
      if (opg) {
        setSelectedOPG(opg);
      }
    }
  }, [searchParams, opgLocations]);

  const fetchOPGLocations = async () => {
    const { data } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        avatar_url,
        cover_url,
        rating,
        verified,
        role,
        location_lat,
        location_lng,
        location_address,
        products (category)
      `)
      .in('role', ['seller', 'farmer'])
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null);

    const processedData = data?.map(opg => ({
      ...opg,
      location_lat: Number(opg.location_lat),
      location_lng: Number(opg.location_lng),
      products_categories: [...new Set(opg.products?.map((p: any) => p.category) || [])]
    })) as OPGLocation[];

    setOpgLocations(processedData || []);
    setLoading(false);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Location access denied - silent fail
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
    }
  };

  const filteredOPGs = useMemo(() => {
    let filtered = opgLocations;

    if (searchQuery) {
      filtered = filtered.filter(opg =>
        opg.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(opg =>
        opg.products_categories?.includes(activeCategory)
      );
    }

    return filtered;
  }, [opgLocations, searchQuery, activeCategory]);

  const calculateDistance = (from: UserLocation, to: OPGLocation) => {
    const R = 6371;
    const dLat = (to.location_lat - from.lat) * Math.PI / 180;
    const dLon = (to.location_lng - from.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.location_lat * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E]"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full max-w-full relative overflow-hidden">
      {/* Search Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-white shadow-md max-w-full">
        <div className="p-4 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Traži OPG-ove..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22C55E] text-[#1F2937]"
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${
                showFilters ? 'bg-[#22C55E] text-white' : 'hover:bg-[#E8F5E9] text-[#1F2937]'
              }`}
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* Category Filter Chips */}
          {showFilters && (
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                    activeCategory === cat.value
                      ? 'bg-[#22C55E] text-white'
                      : 'bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#E8F5E9]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0 max-w-full">
        <MapContainer
          center={[45.8150, 15.9819]}
          zoom={10}
          style={{ height: '100%', width: '100%', maxWidth: '100vw' }}
          zoomControl={true}
        >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <MapController selectedOPG={selectedOPG} />
        {userLocation && (
          <Circle
            center={[userLocation.lat, userLocation.lng]}
            radius={100}
            pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.3 }}
          />
        )}
        {filteredOPGs.map((opg) => (
          <Marker
            key={opg.id}
            position={[opg.location_lat, opg.location_lng]}
            icon={opg.role === 'farmer' ? goldIcon : greenIcon}
            eventHandlers={{
              click: () => setSelectedOPG(opg)
            }}
          />
        ))}
        </MapContainer>
      </div>

      {/* Bottom Sheet - Selected OPG */}
      {selectedOPG && (
        <div className="absolute bottom-20 left-0 right-0 z-[1000] bg-white rounded-t-3xl shadow-2xl animate-fade-in max-w-full">
          <div className="p-6">
            {/* Handle Bar */}
            <div className="w-12 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-4" />

            {/* OPG Card Content */}
            <div className="flex gap-4 mb-4">
              {/* Image */}
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img
                  src={selectedOPG.cover_url || '/placeholder.svg'}
                  alt={selectedOPG.display_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                {selectedOPG.verified && (
                  <div className="absolute top-2 right-2 bg-[#22C55E] rounded-full p-1">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-[#1F2937] text-lg flex items-center gap-2">
                      {selectedOPG.display_name}
                      {selectedOPG.verified && (
                        <BadgeCheck size={18} className="text-[#22C55E]" />
                      )}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{(selectedOPG.rating || 0).toFixed(1)}</span>
                      <span>•</span>
                      <span className="text-[#22C55E] font-semibold">Otvoreno</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOPG(null)}
                    className="p-1 hover:bg-[#F3F4F6] rounded-lg transition-all"
                  >
                    <X size={20} className="text-[#6B7280]" />
                  </button>
                </div>

                {/* Distance */}
                {userLocation && (
                  <div className="flex items-center gap-1 text-sm text-[#6B7280] mb-2">
                    <MapPin size={14} className="text-[#6B7280]" />
                    <span>{calculateDistance(userLocation, selectedOPG)} km od vas</span>
                  </div>
                )}

                {/* Categories */}
                {selectedOPG.products_categories?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedOPG.products_categories.slice(0, 3).map((cat) => (
                      <span key={cat} className="bg-[#E8F5E9] text-[#22C55E] px-2 py-1 rounded-full text-xs font-medium">
                        {getCategoryLabel(cat)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate(`/opg/${selectedOPG.id}`)}
              className="w-full bg-[#22C55E] text-white py-3 rounded-xl font-semibold hover:bg-[#16A34A] transition-all flex items-center justify-center gap-2"
            >
              Pogledaj ponudu
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className={`absolute bottom-0 left-0 right-0 z-[999] max-w-full ${selectedOPG ? 'hidden' : ''}`}>
        <BottomNav />
      </div>
    </div>
  );
};

export default MapView;
