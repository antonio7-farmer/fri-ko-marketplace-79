import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Share2, Check, BadgeCheck, Star, MapPin, Heart, Plus, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { PageLayout } from '@/components/layout';
import ProductsGrid from '@/components/ProductsGrid';
import AboutSection from '@/components/AboutSection';
import ReviewsSection from '@/components/ReviewsSection';

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  bio: string | null;
  rating: number | null;
  verified: boolean | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  working_hours: Record<string, { open: string; close: string; closed: boolean }> | null;
  markets: { name: string; days: string }[] | null;
  sales_points: { address: string; note: string }[] | null;
  farm_pictures: string[] | null;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  stock_status: string | null;
  category: string;
}

const tabs = [
  { value: 'ponuda', label: 'Ponuda' },
  { value: 'o-nama', label: 'O Nama' },
  { value: 'galerija', label: 'Galerija' },
  { value: 'recenzije', label: 'Recenzije' }
];

const OPGProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [opg, setOpg] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('ponuda');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [reviewCount] = useState(12);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      checkAuth();
      fetchOPGProfile();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      checkFavoriteStatus(user.id);
    }
  };

  const fetchOPGProfile = async () => {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', id)
      .order('created_at', { ascending: false });

    setOpg(profileData);
    setProducts(productsData || []);
    setLoading(false);
  };

  const checkFavoriteStatus = async (userId: string) => {
    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('seller_id', id)
      .maybeSingle();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Prijavite se za dodavanje favorita');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('seller_id', id);
      setIsFavorite(false);
      toast.success('Uklonjeno iz favorita');
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, seller_id: id });
      setIsFavorite(true);
      toast.success('Dodano u favorite');
    }
  };

  const handleFollow = () => {
    if (!user) {
      toast.error('Prijavite se za praćenje');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }

    setIsFollowing(!isFollowing);
    toast.success(isFollowing ? 'Prestali ste pratiti' : 'Sada pratite ovaj OPG');
  };

  const handleContact = () => {
    if (!user) {
      toast.error('Prijavite se za slanje poruka');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/login');
      return;
    }
    navigate(`/chat/${opg?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E]"></div>
      </div>
    );
  }

  if (!opg) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">OPG nije pronađen</p>
          <button
            onClick={() => navigate('/')}
            className="text-[#22C55E] font-semibold hover:underline"
          >
            Povratak na početnu
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      variant="transparent-header"
      showBottomNav={true}
      background="bg-[#E8F5E9]"
      contentPadding={{ x: 'px-0', y: 'py-0' }}
      header={{
        show: true,
        children: (
          <div className="bg-white/90 backdrop-blur-sm px-6 py-4 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
            >
              <ArrowLeft size={24} className="text-[#1F2937]" />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link kopiran');
              }}
              className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
            >
              <Share2 size={24} className="text-[#1F2937]" />
            </button>
          </div>
        )
      }}
    >

      {/* Hero Section */}
      <div className="relative pt-16">
        {/* Cover Photo */}
        <div className="h-48 w-full">
          <img
            src={opg.cover_url || '/placeholder.svg'}
            alt={opg.display_name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.svg';
            }}
          />
        </div>

        {/* Profile Card */}
        <div className="relative mx-6 -mt-8">
          <div className="bg-white rounded-2xl shadow-lg p-4">
            {/* Profile Info */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-xl font-bold text-[#1F2937] flex items-center gap-2 mb-1">
                    {opg.display_name}
                    {opg.verified && (
                      <BadgeCheck size={20} className="text-[#22C55E]" />
                    )}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-[#6B7280]">
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold">{(opg.rating || 0).toFixed(1)}</span>
                      <span>({reviewCount} recenzija)</span>
                    </div>
                    {opg.location_address && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <MapPin size={14} className="text-[#6B7280]" />
                          <span>{opg.location_address.split(',')[0]}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={toggleFavorite}
                  className="p-1.5 hover:bg-[#E8F5E9] rounded-lg transition-all"
                >
                  <Heart
                    size={20}
                    className={isFavorite ? 'text-red-500 fill-red-500' : 'text-[#6B7280]'}
                  />
                </button>
              </div>

              {/* Open Status */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-[#22C55E] rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-[#22C55E]">Otvoreno danas: 08-17h</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleFollow}
                  className={`flex-1 py-2.5 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${isFollowing
                      ? 'bg-[#E8F5E9] text-[#22C55E] border-2 border-[#22C55E]'
                      : 'bg-[#22C55E] text-white hover:bg-[#16A34A]'
                    }`}
                >
                  {isFollowing ? (
                    <>
                      <Check size={18} />
                      Pratite
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Prati
                    </>
                  )}
                </button>
                <button
                  onClick={handleContact}
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-white border-2 border-[#22C55E] text-[#22C55E] hover:bg-[#E8F5E9] transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={18} />
                  Kontaktiraj
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 bg-white z-30 px-6 py-4 border-b border-[#E5E7EB] mt-6">
        <div className="flex gap-8">
          {tabs.filter(tab => tab.value !== 'galerija' || (opg?.farm_pictures && opg.farm_pictures.length > 0)).map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-3 font-semibold transition-all relative ${activeTab === tab.value
                  ? 'text-[#22C55E]'
                  : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
            >
              {tab.label}
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#22C55E]" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-6 py-6">
        {activeTab === 'ponuda' && <ProductsGrid products={products} />}
        {activeTab === 'o-nama' && <AboutSection opg={opg} />}
        {activeTab === 'galerija' && opg?.farm_pictures && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {opg.farm_pictures.map((url, index) => (
              <div key={index} className="aspect-square relative overflow-hidden rounded-lg cursor-pointer" onClick={() => setSelectedImage(url)}>
                <img
                  src={url}
                  alt={`Farm photo ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            ))}
          </div>
        )}
        {activeTab === 'recenzije' && <ReviewsSection rating={opg.rating || 0} reviewCount={reviewCount} />}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Farm photo"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default OPGProfile;
