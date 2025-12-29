import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';
import {
  Settings,
  Check,
  BadgeCheck,
  Crown,
  Store,
  ShoppingBag,
  LayoutDashboard,
  Eye,
  User,
  Lock,
  Heart,
  Bell,
  Globe,
  Info,
  HelpCircle,
  FileText,
  Shield,
  LogOut,
  ChevronRight,
  Package
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ favorites: 0, messages: 0, reservations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      navigate('/login');
      return;
    }

    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*, farm_pictures')
      .eq('id', user.id)
      .single();

    if (error) {
      // If profile doesn't exist, create it
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
            role: 'buyer'
          })
          .select('*, farm_pictures')
          .single();

        if (createError) {
          toast.error('Greška pri kreiranju profila');
          setLoading(false);
          return;
        }

        setProfile(newProfile);
        setLoading(false);
        return;
      } else {
        toast.error('Greška pri učitavanju profila');
        setLoading(false);
        return;
      }
    }

    setProfile(profileData);

    // Get stats for buyers
    if (profileData?.role === 'buyer') {
      const { count: favCount } = await supabase
        .from('favorites')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const { count: msgCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id);

      const { count: resCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('buyer_id', user.id);

      setStats({
        favorites: favCount || 0,
        messages: msgCount || 0,
        reservations: resCount || 0
      });
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    if (!confirm('Jeste li sigurni da se želite odjaviti?')) {
      return;
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Greška pri odjavi');
    } else {
      navigate('/login');
      toast.success('Uspješno ste se odjavili');
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
      <div className="bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white px-6 pt-12 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Profil</h1>
          <button
            onClick={() => navigate('/profile/edit')}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Cover Photo for OPGs */}
      {['seller', 'farmer'].includes(profile?.role) && profile?.cover_url && (
        <div className="relative -mt-16 mx-6 mb-4">
          <div className="h-48 w-full rounded-2xl overflow-hidden shadow-lg">
            <img
              src={profile.cover_url}
              alt={`${profile.display_name} cover`}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className={`relative ${['seller', 'farmer'].includes(profile?.role) && profile?.cover_url ? '-mt-8' : '-mt-16'} mx-6`}>
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={
                  ['seller', 'farmer'].includes(profile?.role) 
                    ? (profile?.cover_url || profile?.avatar_url || '/placeholder.svg')
                    : (profile?.avatar_url || '/placeholder.svg')
                }
                alt={profile?.display_name}
                className={`${
                  ['seller', 'farmer'].includes(profile?.role) && profile?.cover_url
                    ? 'w-16 h-16 rounded-xl'
                    : 'w-20 h-20 rounded-full'
                } object-cover border-4 border-white shadow-lg`}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder.svg';
                }}
              />
              {profile?.verified && (
                <div className="absolute bottom-0 right-0 bg-[#22C55E] rounded-full p-1.5">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-[#1F2937]">{profile?.display_name}</h2>
                {profile?.verified && (
                  <BadgeCheck size={20} className="text-[#22C55E]" />
                )}
              </div>

              {/* Role Badge */}
              {profile?.role === 'farmer' && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  <Crown size={12} />
                  Farmer Tier
                </span>
              )}
              {profile?.role === 'seller' && (
                <span className="inline-flex items-center gap-1 bg-[#E5E7EB] text-[#6B7280] px-3 py-1 rounded-full text-xs font-semibold">
                  <Store size={12} />
                  OPG (Free)
                </span>
              )}
              {profile?.role === 'buyer' && (
                <span className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#22C55E] px-3 py-1 rounded-full text-xs font-semibold">
                  <ShoppingBag size={12} />
                  Kupac
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions (for Sellers/Farmers) */}
          {['seller', 'farmer'].includes(profile?.role) && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center justify-center gap-2 bg-[#E8F5E9] text-[#22C55E] py-3 rounded-xl font-semibold hover:bg-[#22C55E] hover:text-white transition-all"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>
              <button
                onClick={() => navigate(`/opg/${profile.id}`)}
                className="flex items-center justify-center gap-2 bg-[#E8F5E9] text-[#22C55E] py-3 rounded-xl font-semibold hover:bg-[#22C55E] hover:text-white transition-all"
              >
                <Eye size={18} />
                Javni profil
              </button>
            </div>
          )}

          {/* Stats (for Buyers) */}
          {profile?.role === 'buyer' && (
            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-[#E5E7EB]">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1F2937]">{stats.favorites}</p>
                <p className="text-xs text-[#6B7280]">Favoriti</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1F2937]">{stats.messages}</p>
                <p className="text-xs text-[#6B7280]">Poruke</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#1F2937]">{stats.reservations}</p>
                <p className="text-xs text-[#6B7280]">Rezervacije</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Sections */}
      <div className="px-6 pt-6 space-y-4">
        {/* Account Section - BUYER */}
        {profile?.role === 'buyer' && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1F2937]">Moj račun</h3>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              <button
                onClick={() => navigate('/profile/edit')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <User size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Uredi profil</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>

              <button
                onClick={() => navigate('/reservations')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <Package size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Moje rezervacije</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>

              <button
                onClick={() => navigate('/favorites')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <Heart size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Moji favoriti</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>

              <button
                onClick={() => navigate('/profile/change-password')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <Lock size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Promijeni lozinku</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>
            </div>
          </div>
        )}

        {/* Account Section - SELLER/FARMER */}
        {['seller', 'farmer'].includes(profile?.role) && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1F2937]">Moj OPG</h3>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
              <button
                onClick={() => navigate('/profile/edit')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <User size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Uredi profil</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <Package size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Moji proizvodi</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>

              <button
                onClick={() => navigate('/reservations')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <Package size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Rezervacije</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>

              <button
                onClick={() => navigate(`/opg/${profile.id}`)}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <Eye size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Javni profil</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>

              <button
                onClick={() => navigate('/profile/change-password')}
                className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-[#E8F5E9] p-2 rounded-lg">
                    <Lock size={20} className="text-[#22C55E]" />
                  </div>
                  <span className="font-medium text-[#1F2937]">Promijeni lozinku</span>
                </div>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </button>
            </div>
          </div>
        )}

        {/* Subscription Section (for Sellers/Farmers) */}
        {['seller', 'farmer'].includes(profile?.role) && (
          <div className="bg-white rounded-2xl shadow-md overflow-hidden">
            <div className="px-4 py-3 border-b border-[#E5E7EB]">
              <h3 className="font-semibold text-[#1F2937]">Pretplata</h3>
            </div>
            <div className="p-4">
              {profile?.role === 'farmer' ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Crown size={20} className="text-yellow-600" />
                        <h4 className="font-semibold text-[#1F2937]">Farmer Tier</h4>
                      </div>
                      <ul className="space-y-1.5 text-sm text-[#6B7280] mb-3">
                        <li>✓ Neograničeno proizvoda</li>
                        <li>✓ Istaknuti profil</li>
                        <li>✓ Premium badge</li>
                        <li>✓ Analytics</li>
                      </ul>
                      <p className="text-xs text-[#6B7280]">10€/mjesec</p>
                    </div>
                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      Aktivno
                    </span>
                  </div>
                  <button
                    onClick={async () => {
                      if (!confirm('Jeste li sigurni da želite prijeći na Free tier? Izgubit ćete premium beneficije.')) return;

                      const { data: { user } } = await supabase.auth.getUser();
                      if (!user) return;

                      const { error } = await supabase
                        .from('profiles')
                        .update({ role: 'seller' })
                        .eq('id', user.id);

                      if (error) {
                        toast.error('Greška pri promjeni pretplate');
                      } else {
                        toast.success('Prešli ste na Free tier');
                        fetchProfile();
                      }
                    }}
                    className="w-full py-3 bg-[#E5E7EB] text-[#6B7280] rounded-xl font-semibold hover:bg-[#D1D5DB] transition-all"
                  >
                    Prebaci na Free Tier
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Store size={20} className="text-[#6B7280]" />
                        <h4 className="font-semibold text-[#1F2937]">Free Tier</h4>
                      </div>
                      <ul className="space-y-1.5 text-sm text-[#6B7280] mb-3">
                        <li>• Do 2 proizvoda</li>
                        <li>• Osnovni profil</li>
                        <li>• Standardni prikaz</li>
                      </ul>
                      <p className="text-xs text-[#22C55E] font-medium">Besplatno</p>
                    </div>
                    <span className="bg-[#E8F5E9] text-[#22C55E] px-3 py-1 rounded-full text-xs font-bold">
                      Aktivno
                    </span>
                  </div>
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
                        toast.error('Greška pri nadogradnji');
                      } else {
                        toast.success('Uspješno nadograđeno na Farmer tier!');
                        fetchProfile();
                      }
                    }}
                    className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Crown size={18} />
                    Nadogradi na Farmer (10€/mj)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Preferences Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <h3 className="font-semibold text-[#1F2937]">Postavke</h3>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            <button
              onClick={() => navigate('/notification-settings')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F5E9] p-2 rounded-lg">
                  <Bell size={20} className="text-[#22C55E]" />
                </div>
                <span className="font-medium text-[#1F2937]">Obavijesti</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6B7280]">Upravljaj</span>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </div>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F5E9] p-2 rounded-lg">
                  <Globe size={20} className="text-[#22C55E]" />
                </div>
                <span className="font-medium text-[#1F2937]">Jezik</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-[#6B7280]">Hrvatski</span>
                <ChevronRight size={20} className="text-[#6B7280]" />
              </div>
            </button>
          </div>
        </div>

        {/* App Info Section */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB]">
            <h3 className="font-semibold text-[#1F2937]">Informacije</h3>
          </div>
          <div className="divide-y divide-[#E5E7EB]">
            <button
              onClick={() => navigate('/about')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F5E9] p-2 rounded-lg">
                  <Info size={20} className="text-[#22C55E]" />
                </div>
                <span className="font-medium text-[#1F2937]">O aplikaciji</span>
              </div>
              <ChevronRight size={20} className="text-[#6B7280]" />
            </button>

            <button
              onClick={() => navigate('/help')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F5E9] p-2 rounded-lg">
                  <HelpCircle size={20} className="text-[#22C55E]" />
                </div>
                <span className="font-medium text-[#1F2937]">Pomoć i podrška</span>
              </div>
              <ChevronRight size={20} className="text-[#6B7280]" />
            </button>

            <button
              onClick={() => navigate('/terms')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F5E9] p-2 rounded-lg">
                  <FileText size={20} className="text-[#22C55E]" />
                </div>
                <span className="font-medium text-[#1F2937]">Uvjeti korištenja</span>
              </div>
              <ChevronRight size={20} className="text-[#6B7280]" />
            </button>

            <button
              onClick={() => navigate('/privacy')}
              className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#E8F5E9] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-[#E8F5E9] p-2 rounded-lg">
                  <Shield size={20} className="text-[#22C55E]" />
                </div>
                <span className="font-medium text-[#1F2937]">Privatnost</span>
              </div>
              <ChevronRight size={20} className="text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-white rounded-2xl shadow-md px-4 py-4 hover:bg-red-50 transition-all flex items-center justify-center gap-3"
        >
          <LogOut size={20} className="text-red-500" />
          <span className="font-semibold text-red-500">Odjavi se</span>
        </button>

        {/* App Version */}
        <div className="text-center py-4">
          <p className="text-sm text-[#6B7280]">Friško.hr v1.0.0</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
