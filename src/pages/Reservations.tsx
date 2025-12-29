import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Check, X, Clock, User, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import BottomNav from '@/components/BottomNav';

interface Reservation {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  message: string | null;
  created_at: string;
  updated_at: string;
  buyer: {
    display_name: string;
    avatar_url: string | null;
    cover_url: string | null;
  };
  seller: {
    display_name: string;
    avatar_url: string | null;
    cover_url: string | null;
  };
  product: {
    title: string;
    price: number;
    image_url: string | null;
  };
}

const Reservations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'past'>('all');
  const [view, setView] = useState<'incoming' | 'outgoing'>('incoming');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReservations();

      // Subscribe to realtime updates
      const subscription = supabase
        .channel('reservations-updates')
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'reservations' },
          () => fetchReservations()
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user, view]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    // Get user role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    setUser(user);
    setUserRole(profile?.role || null);

    // Set default view based on role - buyers can only see outgoing
    if (profile?.role === 'buyer') {
      setView('outgoing');
    } else {
      setView('incoming');
    }
  };

  const fetchReservations = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const query = supabase
        .from('reservations')
        .select(`
          *,
          buyer:profiles!buyer_id(display_name, avatar_url, cover_url),
          seller:profiles!seller_id(display_name, avatar_url, cover_url),
          product:products(title, price, image_url)
        `)
        .order('created_at', { ascending: false });

      // Filter by view (incoming for sellers, outgoing for buyers)
      if (view === 'incoming') {
        query.eq('seller_id', user.id);
      } else {
        query.eq('buyer_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReservations(data || []);
    } catch (error: any) {
      
      toast.error('Greška pri učitavanju rezervacija');
    } finally {
      setLoading(false);
    }
  };

  const updateReservationStatus = async (reservationId: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', reservationId);

      if (error) throw error;

      toast.success(
        status === 'confirmed' ? 'Rezervacija potvrđena' :
        status === 'cancelled' ? 'Rezervacija otkazana' :
        'Rezervacija označena završenom'
      );

      fetchReservations();
    } catch (error: any) {
      
      toast.error('Greška pri ažuriranju rezervacije');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };

    const labels = {
      pending: 'Na čekanju',
      confirmed: 'Potvrđeno',
      cancelled: 'Otkazano',
      completed: 'Završeno'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Upravo sad';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} dan${Math.floor(seconds / 86400) > 1 ? 'a' : ''}`;
    return date.toLocaleDateString('hr-HR');
  };

  const filteredReservations = filter === 'all'
    ? reservations
    : filter === 'active'
    ? reservations.filter(r => r.status === 'pending' || r.status === 'confirmed')
    : reservations.filter(r => r.status === 'cancelled' || r.status === 'completed');

  return (
    <div className="min-h-screen bg-[#F8FAF8] pb-20">
      {/* Header */}
      <div className="sticky-header bg-white border-b border-[#E5E7EB] z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-[#E8F5E9] rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-[#1F2937]" />
            </button>
            <h1 className="text-2xl font-bold text-[#1F2937]">Rezervacije</h1>
          </div>

          {/* View Toggle (only for sellers/farmers) */}
          {['seller', 'farmer'].includes(userRole || '') && (
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setView('incoming')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  view === 'incoming'
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#E8F5E9] text-[#6B7280] hover:bg-[#D1FAE5]'
                }`}
              >
                Primljene
              </button>
              <button
                onClick={() => setView('outgoing')}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                  view === 'outgoing'
                    ? 'bg-[#22C55E] text-white'
                    : 'bg-[#E8F5E9] text-[#6B7280] hover:bg-[#D1FAE5]'
                }`}
              >
                Poslane
              </button>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === 'all'
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#E8F5E9] text-[#6B7280] hover:bg-[#D1FAE5]'
              }`}
            >
              Sve ({reservations.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === 'active'
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#E8F5E9] text-[#6B7280] hover:bg-[#D1FAE5]'
              }`}
            >
              Aktivne ({reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                filter === 'past'
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#E8F5E9] text-[#6B7280] hover:bg-[#D1FAE5]'
              }`}
            >
              Prošle ({reservations.filter(r => r.status === 'cancelled' || r.status === 'completed').length})
            </button>
          </div>
        </div>
      </div>

      {/* Reservations List */}
      <div className="pt-6 px-6 pb-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-12">
            <Package size={64} className="text-[#E5E7EB] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Nema rezervacija</h3>
            <p className="text-[#6B7280] mb-6">
              {view === 'incoming'
                ? 'Ovdje će se prikazati rezervacije vaših proizvoda'
                : 'Ovdje će se prikazati vaše narudžbe'}
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#22C55E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#16A34A] transition-all"
            >
              Pregledaj proizvode
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Product Info */}
                <div className="p-4 flex gap-4">
                  <img
                    src={reservation.product.image_url || '/placeholder.svg'}
                    alt={reservation.product.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#1F2937] mb-1">{reservation.product.title}</h3>
                    <p className="text-sm text-[#6B7280] mb-2">
                      {reservation.quantity} {reservation.unit} × {reservation.product.price}€ =
                      <span className="font-semibold text-[#22C55E] ml-1">
                        {(reservation.quantity * reservation.product.price).toFixed(2)}€
                      </span>
                    </p>
                    {getStatusBadge(reservation.status)}
                  </div>
                  <div className="text-right text-sm text-[#6B7280]">
                    {getTimeAgo(reservation.created_at)}
                  </div>
                </div>

                {/* User Info */}
                <div className="px-4 pb-4 border-b border-[#E5E7EB]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                      <User size={16} className="text-[#22C55E]" />
                    </div>
                    <div>
                      <p className="text-sm text-[#6B7280]">
                        {view === 'incoming' ? 'Kupac' : 'Prodavač'}
                      </p>
                      <p className="font-medium text-[#1F2937]">
                        {view === 'incoming' ? reservation.buyer.display_name : reservation.seller.display_name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {reservation.message && (
                  <div className="px-4 py-3 bg-[#F8FAF8]">
                    <p className="text-sm text-[#6B7280]">
                      <span className="font-medium text-[#1F2937]">Poruka:</span> {reservation.message}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="p-4 flex gap-3">
                  {/* Contact Button */}
                  <button
                    onClick={() => navigate(`/chat/${view === 'incoming' ? reservation.buyer_id : reservation.seller_id}`)}
                    className="flex-1 py-3 border-2 border-[#22C55E] text-[#22C55E] rounded-xl font-semibold hover:bg-[#E8F5E9] transition-all flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={18} />
                    Kontakt
                  </button>

                  {/* Seller Actions */}
                  {view === 'incoming' && reservation.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                        className="flex-1 py-3 bg-[#22C55E] text-white rounded-xl font-semibold hover:bg-[#16A34A] transition-all flex items-center justify-center gap-2"
                      >
                        <Check size={18} />
                        Prihvati
                      </button>
                      <button
                        onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                        className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                      >
                        <X size={18} />
                        Odbij
                      </button>
                    </>
                  )}

                  {/* Mark as Completed */}
                  {view === 'incoming' && reservation.status === 'confirmed' && (
                    <button
                      onClick={() => updateReservationStatus(reservation.id, 'completed')}
                      className="flex-1 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      Označi završenim
                    </button>
                  )}

                  {/* Buyer Cancel - only for pending reservations */}
                  {view === 'outgoing' && reservation.status === 'pending' && (
                    <button
                      onClick={() => {
                        if (confirm('Jeste li sigurni da želite otkazati ovu rezervaciju?')) {
                          updateReservationStatus(reservation.id, 'cancelled');
                        }
                      }}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                    >
                      <X size={18} />
                      Otkaži rezervaciju
                    </button>
                  )}
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

export default Reservations;
