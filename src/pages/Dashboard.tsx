import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import {
  Settings, Crown, Eye, MessageCircle, Package, Plus,
  Edit2, Trash2
} from 'lucide-react';

interface Product {
  id: string;
  title: string;
  price: number;
  unit: string;
  category: string;
  description: string | null;
  stock_status: string | null;
  image_url: string | null;
  created_at: string | null;
}

interface Profile {
  id: string;
  display_name: string;
  role: string;
  avatar_url: string | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState({ views: 0, messages: 0, reservations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeDashboard();
  }, []);

  const initializeDashboard = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profileData || !['seller', 'farmer'].includes(profileData.role)) {
      navigate('/home');
      toast({
        title: "Pristup odbijen",
        description: "Nemate pristup ovoj stranici",
        variant: "destructive"
      });
      return;
    }

    setProfile(profileData);

    const { data: productsData } = await supabase
      .from('products')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false });

    setProducts(productsData || []);

    const { count: messageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('read', false);

    const { count: reservationsCount } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', user.id)
      .eq('status', 'pending');

    setStats({
      views: 0,
      messages: messageCount || 0,
      reservations: reservationsCount || 0
    });

    setLoading(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Jeste li sigurni da želite obrisati ovaj proizvod?')) {
      return;
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      toast({
        title: "Greška",
        description: "Greška pri brisanju proizvoda",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Uspjeh",
        description: "Proizvod je obrisan"
      });
      setProducts(products.filter(p => p.id !== productId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8F5E9] pb-20">

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1F2937]">Moj OPG</h1>
            <p className="text-sm text-[#6B7280]">{profile?.display_name}</p>
          </div>
          <button
            onClick={() => navigate('/profile/edit')}
            className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
          >
            <Settings size={24} className="text-[#6B7280]" />
          </button>
        </div>

        {/* Tier Badge */}
        <div className="flex items-center gap-2">
          {profile?.role === 'farmer' ? (
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
              <Crown size={16} />
              Farmer Tier
            </div>
          ) : (
            <div className="bg-[#E5E7EB] text-[#6B7280] px-4 py-2 rounded-full text-sm font-semibold">
              Free Tier ({products.length}/2)
            </div>
          )}
          {profile?.role === 'seller' && (
            <button className="text-[#22C55E] text-sm font-semibold hover:underline">
              Nadogradi →
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="p-6 grid grid-cols-3 gap-3">
        <button
          onClick={() => navigate('/reservations')}
          className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Rezervacije</span>
            <Package size={20} className="text-[#22C55E]" />
          </div>
          <p className="text-2xl font-bold text-[#1F2937]">{stats.reservations}</p>
          <p className="text-xs text-[#6B7280] mt-1">Na čekanju</p>
        </button>

        <button
          onClick={() => navigate('/messages')}
          className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Poruke</span>
            <MessageCircle size={20} className="text-[#22C55E]" />
          </div>
          <p className="text-2xl font-bold text-[#1F2937]">{stats.messages}</p>
          <p className="text-xs text-[#6B7280] mt-1">Nepročitano</p>
        </button>

        <button
          onClick={() => navigate(`/opg/${profile?.id}`)}
          className="bg-white rounded-2xl shadow-md p-4 hover:shadow-lg transition-all text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#6B7280]">Profil</span>
            <Eye size={20} className="text-[#22C55E]" />
          </div>
          <p className="text-2xl font-bold text-[#1F2937]">{stats.views}</p>
          <p className="text-xs text-[#6B7280] mt-1">Pregledi</p>
        </button>
      </div>

      {/* Products Section */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#1F2937]">Moji proizvodi</h2>
          <button
            onClick={() => navigate('/dashboard/add-product')}
            disabled={profile?.role === 'seller' && products.length >= 2}
            className="bg-[#22C55E] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <Plus size={20} />
            Dodaj
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-12 text-center">
            <Package size={64} className="text-[#E5E7EB] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Nemate proizvoda</h3>
            <p className="text-[#6B7280] mb-6">Dodajte prvi proizvod i počnite prodavati</p>
            <button
              onClick={() => navigate('/dashboard/add-product')}
              className="bg-[#22C55E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#16A34A] transition-all"
            >
              Dodaj proizvod
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="relative h-40">
                  <img
                    src={product.image_url || '/placeholder.svg'}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${product.stock_status === 'available'
                      ? 'bg-[#22C55E] text-white'
                      : product.stock_status === 'low'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}>
                    {product.stock_status === 'available' && 'Dostupno'}
                    {product.stock_status === 'low' && 'Malo zaliha'}
                    {product.stock_status === 'out' && 'Rasprodano'}
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-[#1F2937] mb-1 truncate">{product.title}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-2xl font-bold text-[#22C55E]">€{product.price.toFixed(2)}</span>
                    <span className="text-sm text-[#6B7280]">/{product.unit}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/dashboard/edit-product/${product.id}`)}
                      className="flex-1 py-2 border-2 border-[#22C55E] text-[#22C55E] rounded-xl font-semibold hover:bg-[#E8F5E9] transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 size={16} />
                      Uredi
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="px-4 py-2 border-2 border-red-500 text-red-500 rounded-xl font-semibold hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upgrade CTA */}
        {profile?.role === 'seller' && products.length >= 2 && (
          <div className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">Dostigli ste limit</h3>
                <p className="text-sm opacity-90 mb-4">Nadogradite na Farmer tier za neograničeno proizvoda</p>
                <ul className="space-y-2 text-sm opacity-90 mb-4">
                  <li>✓ Neograničeno proizvoda</li>
                  <li>✓ Istaknuti profil na vrhu</li>
                  <li>✓ Verified badge</li>
                  <li>✓ Analytics i izvještaji</li>
                </ul>
                <button
                  onClick={async () => {
                    if (!confirm('Nadograditi na Farmer tier za 10€/mjesec?')) return;

                    const { data: { user } } = await supabase.auth.getUser();
                    if (!user) return;

                    const { error } = await supabase
                      .from('profiles')
                      .update({ role: 'farmer' })
                      .eq('id', user.id);

                    if (error) {
                      sonnerToast.error('Greška pri nadogradnji');
                    } else {
                      sonnerToast.success('Uspješno nadograđeno na Farmer tier!');
                      initializeDashboard();
                    }
                  }}
                  className="bg-white text-yellow-600 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                >
                  Nadogradi za 10€/mjesec
                </button>
              </div>
              <Crown size={64} className="opacity-20" />
            </div>
          </div>
        )}
      </div>

      <BottomNav />

    </div>
  );
};

export default Dashboard;
