import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import BottomNav from '@/components/BottomNav';

interface Favorite {
  id: string;
  seller_id: string;
  profiles: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    rating: number;
    verified: boolean;
    location_address: string | null;
    bio: string | null;
  };
}

const Favorites = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchFavorites(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchFavorites(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchFavorites = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          seller_id,
          profiles!favorites_seller_id_fkey (
            id,
            display_name,
            avatar_url,
            rating,
            verified,
            location_address,
            bio
          )
        `)
        .eq('user_id', userId);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Greška pri učitavanju favorita');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (favoriteId: string, sellerName: string) => {
    if (!user) return;

    setRemovingId(favoriteId);
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(favorites.filter(f => f.id !== favoriteId));
      toast.success(`${sellerName} uklonjen iz favorita`);
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Greška pri uklanjanju favorita');
    } finally {
      setRemovingId(null);
    }
  };

  const handleOPGClick = (opgId: string) => {
    navigate(`/opg/${opgId}`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Morate biti prijavljeni za pregled favorita</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#22C55E] text-white px-6 py-2 rounded-lg hover:bg-[#16A34A]"
          >
            Prijavi se
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky-header bg-white border-b z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Moji favoriti</h1>
              <p className="text-sm text-gray-600">
                {favorites.length} {favorites.length === 1 ? 'favorit' : favorites.length < 5 ? 'favorita' : 'favorita'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#22C55E]" size={32} />
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Nema favorita</h2>
            <p className="text-gray-600 mb-6">
              Dodajte OPG-ove u favorite klikom na srce na njihovom profilu
            </p>
            <button
              onClick={() => navigate('/opgs')}
              className="bg-[#22C55E] text-white px-6 py-3 rounded-lg hover:bg-[#16A34A] transition-colors"
            >
              Pregledaj OPG-ove
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Card Header - Clickable */}
                <div
                  onClick={() => handleOPGClick(favorite.profiles.id)}
                  className="cursor-pointer"
                >
                  {/* Avatar */}
                  <div className="h-32 bg-gradient-to-br from-green-400 to-green-600 relative">
                    {favorite.profiles.avatar_url ? (
                      <img
                        src={favorite.profiles.avatar_url}
                        alt={favorite.profiles.display_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                        {favorite.profiles.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 flex-1">
                        {favorite.profiles.display_name}
                      </h3>
                      {favorite.profiles.verified && (
                        <div className="flex items-center gap-1 text-[#22C55E] bg-green-50 px-2 py-1 rounded-full text-xs">
                          <Star size={12} fill="currentColor" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-2">
                      <Star size={16} className="text-yellow-400" fill="currentColor" />
                      <span className="text-sm font-medium text-gray-900">
                        {favorite.profiles.rating.toFixed(1)}
                      </span>
                    </div>

                    {/* Location */}
                    {favorite.profiles.location_address && (
                      <div className="flex items-center gap-1 text-gray-600 mb-3">
                        <MapPin size={14} />
                        <span className="text-sm truncate">{favorite.profiles.location_address}</span>
                      </div>
                    )}

                    {/* Bio */}
                    {favorite.profiles.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {favorite.profiles.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 pb-4 pt-2 border-t">
                  <button
                    onClick={() => handleRemoveFavorite(favorite.id, favorite.profiles.display_name)}
                    disabled={removingId === favorite.id}
                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {removingId === favorite.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Heart size={18} fill="currentColor" />
                    )}
                    <span className="text-sm font-medium">
                      {removingId === favorite.id ? 'Uklanjanje...' : 'Ukloni iz favorita'}
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Favorites;
