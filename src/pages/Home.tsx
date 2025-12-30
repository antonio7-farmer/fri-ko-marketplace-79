import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, Bell, Package, LogIn, Heart, Star, Crown, Apple, Carrot, Beef, Egg, Milk, MoreHorizontal } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { PageLayout } from '@/components/layout';
import { CATEGORIES, DEFAULT_LOCATION } from '@/lib/constants';
import { calculateDistance, parseCoordinates } from '@/lib/geolocation';

const categories = CATEGORIES;

interface Product {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string;
  price: number;
  unit: string;
  stock_status: string;
  seller_id: string;
  seller?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    cover_url: string | null;
    rating: number;
    verified: boolean;
    location_address: string | null;
    location_lat: number | null;
    location_lng: number | null;
  };
}

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
  products: Product[];
}

// Helper function to get category icon
const getCategoryIcon = (category: string) => {
  const iconProps = { size: 16, className: "text-[#22C55E]" };
  
  switch (category) {
    case 'voce':
      return <Apple {...iconProps} />;
    case 'povrce':
      return <Carrot {...iconProps} />;
    case 'meso':
      return <Beef {...iconProps} />;
    case 'jaja':
      return <Egg {...iconProps} />;
    case 'mlijecni':
      return <Milk {...iconProps} />;
    default:
      return <MoreHorizontal {...iconProps} />;
  }
};

// Helper function to get unique categories from products
const getUniqueCategories = (products: Product[]): string[] => {
  const categories = products.map(product => product.category);
  return [...new Set(categories)];
};

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [allOPGs, setAllOPGs] = useState<OPG[]>([]);
  const [nearbyProducts, setNearbyProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    const init = async () => {
      const currentUser = await checkAuth();

      // Set default location immediately
      setUserLocation(DEFAULT_LOCATION);

      // Start location and feed in parallel
      const locationPromise = getUserLocationAsync(currentUser);
      fetchData(); // Load feed immediately with default location

      // Update feed when location arrives
      locationPromise.then(newLocation => {
        if (newLocation) {
          setUserLocation(newLocation);
          // Feed will auto-update via useMemo dependencies
        }
      });
    };
    init();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime updates for messages and reservations
    const messagesSubscription = supabase
      .channel('home-notifications')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => user && fetchUnreadCounts(user.id)
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => user && fetchUnreadCounts(user.id)
      )
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, [user]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      fetchFavorites(user.id);
      fetchUnreadCounts(user.id);
    }
    return user;
  };

  const getGeoPositionWithTimeout = (timeoutMs = 10000) => {
    return new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const timeoutId = setTimeout(() => {
        reject(new Error('Geolocation timeout'));
      }, timeoutMs);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          timeout: timeoutMs,
          enableHighAccuracy: false,  // Faster on mobile
          maximumAge: 300000  // 5-min cache
        }
      );
    });
  };

  const getUserLocationAsync = async (currentUser: User | null) => {
    try {
      // 1. Try Browser Geolocation with timeout
      const position = await getGeoPositionWithTimeout(10000);
      return position;
    } catch (error) {
      // 2. Try User Profile Location
      if (currentUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('location_lat, location_lng')
          .eq('id', currentUser.id)
          .single();

        const coords = parseCoordinates(profile?.location_lat, profile?.location_lng);
        if (coords) {
          return coords;
        }
      }

      // 3. Default fallback (Zagreb)
      return { lat: 45.815, lng: 15.9819 };
    }
  };

  const fetchData = async (pageNum = 0, append = false) => {
    setLoading(true);

    // Fetch paginated OPGs (farmers and sellers) with location data
    const { data: opgs, count } = await supabase
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
        products (
          id,
          title,
          image_url,
          category,
          price,
          stock_status
        )
      `, { count: 'exact' })
      .in('role', ['seller', 'farmer'])
      .not('location_lat', 'is', null)
      .not('location_lng', 'is', null)
      .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1)
      .order('created_at', { ascending: false });

    // Fetch paginated products with seller info
    const { data: products } = await supabase
      .from('products')
      .select(`
        id,
        title,
        description,
        image_url,
        category,
        price,
        unit,
        stock_status,
        seller_id,
        seller:profiles!seller_id (
          id,
          display_name,
          avatar_url,
          cover_url,
          rating,
          verified,
          location_address,
          location_lat,
          location_lng
        )
      `)
      .range(pageNum * ITEMS_PER_PAGE, (pageNum + 1) * ITEMS_PER_PAGE - 1);

    setAllOPGs(append ? [...allOPGs, ...((opgs as OPG[]) || [])] : ((opgs as OPG[]) || []));
    setNearbyProducts(append ? [...nearbyProducts, ...((products as Product[]) || [])] : ((products as Product[]) || []));
    setHasMore((count ?? 0) > (pageNum + 1) * ITEMS_PER_PAGE);
    setLoading(false);
  };

  const fetchFavorites = async (userId: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('seller_id')
      .eq('user_id', userId);

    if (data) {
      setFavorites(data.map(f => f.seller_id).filter(Boolean) as string[]);
    }
  };

  const fetchUnreadCounts = async (userId: string) => {
    // Count unread messages
    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    // Count pending reservations (for sellers) + updated reservations (for buyers)
    const { count: sellerReservationsCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', userId)
      .eq('status', 'pending');

    const { count: buyerReservationsCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', userId)
      .neq('status', 'pending');

    // Total notifications = unread messages + pending reservations + updated reservations
    setUnreadNotifications((messagesCount || 0) + (sellerReservationsCount || 0) + (buyerReservationsCount || 0));
  };

  const toggleFavorite = useCallback(async (sellerId: string) => {
    if (!user) {
      toast.error('Prijavite se za dodavanje favorita');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (favorites.includes(sellerId)) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('seller_id', sellerId);
      setFavorites(favorites.filter(id => id !== sellerId));
      toast.success('Uklonjeno iz favorita');
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, seller_id: sellerId });
      setFavorites([...favorites, sellerId]);
      toast.success('Dodano u favorite');
    }
  }, [user, favorites, navigate]);

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollTop = window.scrollY;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = window.innerHeight;

    if (scrollHeight - scrollTop - clientHeight < 300) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(nextPage, true);
    }
  }, [loading, hasMore, page]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const filteredOPGs = useMemo(() => {
    let filtered = allOPGs;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(opg =>
        opg.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(opg =>
        opg.products?.some(p => p.category === activeCategory)
      );
    }

    return filtered;
  }, [allOPGs, searchQuery, activeCategory]);

  const filteredProducts = useMemo(() => {
    let filtered = nearbyProducts;

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.seller?.display_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    return filtered;
  }, [nearbyProducts, searchQuery, activeCategory]);

  return (
    <PageLayout
      variant="standard"
      loading={loading}
      contentPadding={{ x: 'px-0', y: 'py-0' }}
      header={{
        children: (
          <div className="bg-white shadow-sm px-6 py-4">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-[#22C55E]">Friško.hr</h1>
            <div className="flex items-center gap-2">
              {!user && (
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#16A34A] transition-all"
                >
                  <LogIn size={18} />
                  Prijava
                </button>
              )}
              {user && (
                <button
                  onClick={() => navigate('/notifications')}
                  className="relative p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
                >
                  <Bell size={24} className="text-[#1F2937]" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadNotifications > 9 ? '9+' : unreadNotifications}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Pretražite OPG-ove..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  navigate(`/opgs?search=${encodeURIComponent(searchQuery)}`);
                }
              }}
              className="w-full pl-10 pr-12 py-3 border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#22C55E] text-[#1F2937] placeholder:text-[#9CA3AF]"
            />
            <button
              onClick={() => navigate('/opgs')}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
            >
              <SlidersHorizontal size={20} className="text-[#1F2937]" />
            </button>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${activeCategory === cat.value
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#E8F5E9]'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        )
      }}
    >
      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* OPGs Horizontal Scroll */}
        {filteredOPGs.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#1F2937]">OPG-ovi u blizini</h2>
              <button
                onClick={() => navigate('/opgs')}
                className="text-[#22C55E] font-medium text-sm hover:underline"
              >
                Vidi sve
              </button>
            </div>
            <div className="overflow-x-auto scrollbar-hide -mx-6 px-6">
              <div className="flex gap-4 pb-2">
                {filteredOPGs.map((opg) => (
                  <div
                    key={opg.id}
                    onClick={() => navigate(`/opg/${opg.id}`)}
                    className="flex-shrink-0 w-40 cursor-pointer group"
                  >
                    <div className="relative">
                      {/* Cover Image with Product Icons */}
                      <div className="w-40 h-40 rounded-2xl overflow-hidden mb-2 bg-gray-200 border-2 border-white shadow-md group-hover:shadow-lg transition-all relative">
                        <img
                          src={opg.cover_url || opg.avatar_url || '/placeholder.svg'}
                          alt={opg.display_name}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        {/* Category Icons Overlay */}
                        {opg.products && opg.products.length > 0 && (
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            {getUniqueCategories(opg.products).slice(0, 3).map((category, index) => (
                              <div
                                key={category}
                                className="w-8 h-8 rounded-full border-2 border-white bg-white shadow-sm flex items-center justify-center"
                                style={{ zIndex: 3 - index }}
                              >
                                {getCategoryIcon(category)}
                              </div>
                            ))}
                            {getUniqueCategories(opg.products).length > 3 && (
                              <div className="w-8 h-8 rounded-full border-2 border-white bg-[#22C55E] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                +{getUniqueCategories(opg.products).length - 3}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(opg.id);
                        }}
                        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-white transition-all"
                      >
                        <Heart
                          size={18}
                          className={favorites.includes(opg.id) ? 'text-red-500 fill-red-500' : 'text-[#6B7280]'}
                        />
                      </button>
                    </div>
                    {/* OPG Info */}
                    <div className="text-center">
                      <h3 className="font-semibold text-sm text-[#1F2937] truncate">
                        {opg.display_name}
                      </h3>
                      {opg.role === 'farmer' && (
                        <div className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold mt-1">
                          <Crown size={10} />
                          FARMER
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-1 text-xs text-[#6B7280] mt-1">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span>{(opg.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Products List */}
        <section>
          <h2 className="text-xl font-semibold text-[#1F2937] mb-4">
            Svi dostupni proizvodi
          </h2>
          <div className="space-y-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => navigate(`/product/${product.id}`)}
                className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex gap-4 p-4">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-gray-200">
                    <img
                      src={product.image_url || '/placeholder.svg'}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder.svg';
                      }}
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1F2937] truncate">{product.title}</h3>
                    <p className="text-sm text-[#6B7280] line-clamp-2 mt-1">
                      {product.description || 'Nema opisa'}
                    </p>

                    {/* Seller Info */}
                    {product.seller && (
                      <div className="flex items-center gap-2 mt-2">
                        <img
                          src={product.seller.cover_url || product.seller.avatar_url || '/placeholder.svg'}
                          alt={product.seller.display_name}
                          loading="lazy"
                          decoding="async"
                          className="w-5 h-5 rounded-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder.svg';
                          }}
                        />
                        <span className="text-xs text-[#6B7280]">{product.seller.display_name}</span>
                        {product.seller.verified && (
                          <span className="text-xs text-[#22C55E]">✓</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-[#22C55E] text-lg">
                      €{product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#6B7280]">/{product.unit}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="text-[#D1D5DB] mx-auto mb-4" />
              <p className="text-[#6B7280]">Nema dostupnih proizvoda</p>
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
};

export default Home;
