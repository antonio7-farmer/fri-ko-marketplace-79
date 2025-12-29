import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, MapPin, Star, Heart, X, Grid3x3, List, Sprout, Store } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import BottomNav from '@/components/BottomNav';

interface OPG {
  id: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  rating: number;
  verified: boolean;
  role: string;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  bio: string | null;
}

// Helper function to calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const OPGsList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [allOPGs, setAllOPGs] = useState<OPG[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Filters
  const [maxDistance, setMaxDistance] = useState<number>(50);
  const [minRating, setMinRating] = useState<number>(0);
  const [opgType, setOPGType] = useState<'all' | 'farmer' | 'seller'>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  useEffect(() => {
    const init = async () => {
      const currentUser = await checkAuth();
      await getUserLocation(currentUser);
      fetchOPGs();
    };
    init();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      fetchFavorites(user.id);
    }
    return user;
  };

  const getUserLocation = async (currentUser: User | null) => {
    const getGeoPosition = () => {
      return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation not supported'));
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (position) => resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }),
          (error) => reject(error)
        );
      });
    };

    try {
      const position = await getGeoPosition();
      setUserLocation(position);
    } catch (error) {
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('location_lat, location_lng')
          .eq('id', currentUser.id)
          .single();

        if (profile?.location_lat && profile?.location_lng) {
          setUserLocation({
            lat: Number(profile.location_lat),
            lng: Number(profile.location_lng)
          });
          return;
        }
      }

      // Default fallback (Zagreb)
      setUserLocation({ lat: 45.815, lng: 15.9819 });
    }
  };

  const fetchOPGs = async () => {
    setLoading(true);

    const { data: opgs } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        avatar_url,
        cover_url,
        rating,
        verified,
        role,
        location_address,
        location_lat,
        location_lng,
        bio
      `)
      .in('role', ['seller', 'farmer'])
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null);

    setAllOPGs(opgs || []);
    setLoading(false);
  };

  const fetchFavorites = async (userId: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('seller_id')
      .eq('user_id', userId);

    if (data) {
      setFavorites(data.map(f => f.seller_id));
    }
  };

  const toggleFavorite = async (opgId: string) => {
    if (!user) {
      toast.error('Morate biti prijavljeni za spremanje favorita');
      navigate('/login');
      return;
    }

    const isFavorite = favorites.includes(opgId);

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('seller_id', opgId);
      setFavorites(prev => prev.filter(id => id !== opgId));
      toast.success('Uklonjeno iz favorita');
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, seller_id: opgId });
      setFavorites(prev => [...prev, opgId]);
      toast.success('Dodano u favorite');
    }
  };

  // Filter and search OPGs
  const filteredOPGs = useMemo(() => {
    let filtered = allOPGs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(opg =>
        opg.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opg.location_address?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (opgType !== 'all') {
      filtered = filtered.filter(opg => opg.role === opgType);
    }

    // Verified filter
    if (verifiedOnly) {
      filtered = filtered.filter(opg => opg.verified);
    }

    // Rating filter
    filtered = filtered.filter(opg => opg.rating >= minRating);

    // Distance filter
    if (userLocation) {
      filtered = filtered
        .map(opg => ({
          ...opg,
          distance: calculateDistance(
            userLocation.lat,
            userLocation.lng,
            Number(opg.location_lat),
            Number(opg.location_lng)
          )
        }))
        .filter(opg => opg.distance <= maxDistance)
        .sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  }, [allOPGs, searchQuery, opgType, verifiedOnly, minRating, maxDistance, userLocation]);

  const resetFilters = () => {
    setMaxDistance(50);
    setMinRating(0);
    setOPGType('all');
    setVerifiedOnly(false);
  };

  return (
    <div className="min-h-screen bg-[#E8F5E9] pb-20">
      {/* Header */}
      <div className="sticky-header bg-white shadow-sm z-10">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-[#1F2937] mb-4">OPG-ovi</h1>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] w-5 h-5" />
            <input
              type="text"
              placeholder="Pretraži OPG-ove..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22C55E] text-[#1F2937]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* View Mode & Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showFilters
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#F3F4F6] text-[#1F2937]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="font-medium">Filtriraj</span>
            </button>

            <div className="flex bg-[#F3F4F6] rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list' ? 'bg-white shadow' : ''
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid' ? 'bg-white shadow' : ''
                }`}
              >
                <Grid3x3 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="border-t border-[#E5E7EB] p-4 space-y-4 bg-[#F9FAFB]">
            {/* Distance Filter */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Udaljenost: {maxDistance} km
              </label>
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Minimalna ocjena: {minRating}+
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-[#22C55E]"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Tip OPG-a
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setOPGType('all')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    opgType === 'all'
                      ? 'bg-[#22C55E] text-white'
                      : 'bg-white text-[#1F2937] border border-[#E5E7EB]'
                  }`}
                >
                  Svi
                </button>
                <button
                  onClick={() => setOPGType('farmer')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    opgType === 'farmer'
                      ? 'bg-[#22C55E] text-white'
                      : 'bg-white text-[#1F2937] border border-[#E5E7EB]'
                  }`}
                >
                  Farmeri
                </button>
                <button
                  onClick={() => setOPGType('seller')}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    opgType === 'seller'
                      ? 'bg-[#22C55E] text-white'
                      : 'bg-white text-[#1F2937] border border-[#E5E7EB]'
                  }`}
                >
                  Prodavači
                </button>
              </div>
            </div>

            {/* Verified Filter */}
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[#1F2937]">
                Samo verificirani
              </label>
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`w-12 h-6 rounded-full transition-all ${
                  verifiedOnly ? 'bg-[#22C55E]' : 'bg-[#D1D5DB]'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    verifiedOnly ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Reset Filters */}
            <button
              onClick={resetFilters}
              className="w-full py-2 text-sm text-[#22C55E] font-medium"
            >
              Resetuj filtere
            </button>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="px-4 py-3 bg-white border-b border-[#E5E7EB]">
        <p className="text-sm text-[#6B7280]">
          Pronađeno <span className="font-semibold text-[#1F2937]">{filteredOPGs.length}</span> OPG-ova
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E]"></div>
        </div>
      )}

      {/* OPGs List */}
      {!loading && (
        <div className={`pt-6 p-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}`}>
          {filteredOPGs.length === 0 ? (
            <div className="col-span-2 text-center py-12">
              <p className="text-[#6B7280]">Nema pronađenih OPG-ova</p>
            </div>
          ) : (
            filteredOPGs.map((opg) => (
              <div
                key={opg.id}
                onClick={() => navigate(`/opg/${opg.id}`)}
                className={`bg-white rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  viewMode === 'grid' ? '' : 'flex gap-4'
                }`}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${
                  viewMode === 'grid' ? 'h-40 rounded-t-2xl' : 'w-28 h-28 rounded-l-2xl flex-shrink-0'
                }`}>
                  <img
                    src={opg.cover_url || opg.avatar_url || '/placeholder.svg'}
                    alt={opg.display_name}
                    className="w-full h-full object-cover"
                  />

                  {/* OPG Type Badge - Side positioned */}
                  <div className={`absolute left-0 top-1/2 -translate-y-1/2 ${
                    opg.role === 'farmer'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500'
                      : 'bg-gradient-to-r from-emerald-500 to-green-500'
                  } text-white px-3 py-2 rounded-r-lg shadow-lg flex items-center gap-1.5`}>
                    {opg.role === 'farmer' ? (
                      <>
                        <Sprout className="w-4 h-4" />
                        <span className="text-xs font-bold">OPG</span>
                      </>
                    ) : (
                      <>
                        <Store className="w-4 h-4" />
                        <span className="text-xs font-bold">TRGOVINA</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(opg.id);
                    }}
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        favorites.includes(opg.id)
                          ? 'fill-red-500 text-red-500'
                          : 'text-[#6B7280]'
                      }`}
                    />
                  </button>
                </div>

                {/* Info */}
                <div className={viewMode === 'grid' ? 'p-3' : 'flex-1 py-3 pr-3'}>
                  <h3 className="font-semibold text-[#1F2937] mb-1 line-clamp-1">
                    {opg.display_name}
                  </h3>

                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-4 h-4 fill-[#FCD34D] text-[#FCD34D]" />
                    <span className="text-sm font-medium text-[#1F2937]">
                      {opg.rating.toFixed(1)}
                    </span>
                  </div>

                  {opg.location_address && (
                    <div className="flex items-start gap-1 text-xs text-[#6B7280] mb-1">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{opg.location_address}</span>
                    </div>
                  )}

                  {userLocation && opg.location_lat && opg.location_lng && (
                    <p className="text-xs text-[#22C55E] font-medium">
                      {calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        Number(opg.location_lat),
                        Number(opg.location_lng)
                      ).toFixed(1)} km
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default OPGsList;
