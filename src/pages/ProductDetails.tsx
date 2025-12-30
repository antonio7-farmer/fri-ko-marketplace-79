import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Share2,
  AlertTriangle,
  XCircle,
  Check,
  BadgeCheck,
  Star,
  MapPin,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  Package,
  Copy
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { storeRedirectPath } from '@/lib/navigation';
import { PageLayout } from '@/components/layout';
import { getErrorMessage } from '@/lib/errors';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  stock_status: string | null;
  category: string;
  seller_id: string | null;
}

interface Seller {
  id: string;
  display_name: string;
  avatar_url: string | null;
  cover_url: string | null;
  rating: number | null;
  verified: boolean | null;
  location_address: string | null;
  location_lat: number | null;
  location_lng: number | null;
  products_count: number;
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    'voce': 'Voće',
    'povrce': 'Povrće',
    'meso': 'Meso',
    'jaja': 'Jaja',
    'mlijecni': 'Mliječni proizvodi',
    'ostalo': 'Ostalo'
  };
  return labels[category] || category;
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<Seller | null>(null);
  const [loading, setLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationQuantity, setReservationQuantity] = useState('1');
  const [reservationMessage, setReservationMessage] = useState('');
  const [submittingReservation, setSubmittingReservation] = useState(false);

  useEffect(() => {
    if (id) {
      checkAuth();
      fetchProductDetails();
    }
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchProductDetails = async () => {
    setLoading(true);

    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (productError || !productData) {
      toast.error('Proizvod nije pronađen');
      navigate(-1);
      return;
    }

    // Fetch seller info
    const { data: sellerData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', productData.seller_id)
      .maybeSingle();

    // Get products count
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('seller_id', productData.seller_id);

    setProduct(productData);
    setSeller(sellerData ? {
      ...sellerData,
      products_count: count || 0
    } : null);
    setLoading(false);
  };

  const handleReservation = async () => {
    if (!user) {
      toast.error('Prijavite se za rezervaciju');
      storeRedirectPath(window.location.pathname);
      navigate('/login');
      return;
    }

    if (product?.stock_status === 'out') {
      toast.error('Proizvod je trenutno rasprodan');
      return;
    }

    // Show reservation modal
    setShowReservationModal(true);
  };

  const submitReservation = async () => {
    if (!user) {
      toast.error('Morate biti prijavljeni');
      return;
    }

    if (!product) {
      toast.error('Proizvod nije učitan');
      return;
    }

    if (!seller || !seller.id) {
      toast.error('Prodavatelj nije pronađen');
      return;
    }

    const quantity = parseFloat(reservationQuantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error('Unesite ispravnu količinu');
      return;
    }

    setSubmittingReservation(true);

    try {
      // Create reservation with explicit field mapping
      const reservationData = {
        buyer_id: user.id,
        seller_id: seller.id,
        product_id: product.id,
        quantity: quantity,
        unit: product.unit,
        status: 'pending',
        message: reservationMessage.trim() || null
      };

      const { data: reservationResult, error: reservationError } = await supabase
        .from('reservations')
        .insert(reservationData)
        .select();

      if (reservationError) {
        throw reservationError;
      }

      // Generate conversation ID
      const conversationId = [user.id, seller.id].sort()[0];

      // Send message to seller
      const messageContent = reservationMessage
        ? `Rezervacija: ${quantity} ${product.unit} - ${product.title}\n\n${reservationMessage}`
        : `Rezervacija: ${quantity} ${product.unit} - ${product.title}`;

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: seller.id,
          content: messageContent,
          product_id: product.id,
          conversation_id: conversationId,
          read: false
        });

      if (messageError) throw messageError;

      toast.success('Rezervacija poslana!');
      setShowReservationModal(false);

      // Navigate to chat
      navigate(`/chat/${seller.id}`);

    } catch (error) {
      const errorMsg = getErrorMessage(error);
      console.error('Error creating reservation:', errorMsg);
      toast.error('Greška pri rezervaciji: ' + errorMsg);
    } finally {
      setSubmittingReservation(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22C55E]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#E8F5E9] flex items-center justify-center p-6">
        <div className="text-center">
          <Package size={64} className="text-[#E5E7EB] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#1F2937] mb-2">Proizvod nije pronađen</h2>
          <button
            onClick={() => navigate(-1)}
            className="text-[#22C55E] font-semibold hover:underline"
          >
            ← Natrag
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageLayout
      variant="transparent-header"
      showBottomNav={false}
      background="bg-[#E8F5E9]"
      contentPadding={{ x: 'px-0', y: 'py-0' }}
      header={{
        show: true,
        children: (
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
            >
              <ArrowLeft size={24} className="text-[#1F2937]" />
            </button>
            <button
              onClick={() => setShowShareMenu(true)}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
            >
              <Share2 size={24} className="text-[#1F2937]" />
            </button>
          </div>
        )
      }}
    >
      {/* Product Image */}
      <div className="relative h-96">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Floating Product Info Card */}
      <div className="relative -mt-24 mx-6 z-10">
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-4">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-[#1F2937] mb-2">{product.title}</h1>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-[#22C55E]">€{product.price.toFixed(2)}</span>
              <span className="text-xl text-[#6B7280]">/{product.unit}</span>
            </div>
          </div>

          {/* Stock Status */}
          {product.stock_status === 'low' && (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-3">
              <AlertTriangle size={20} className="text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-800">Još samo 5 kg!</span>
            </div>
          )}

          {product.stock_status === 'out' && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <XCircle size={20} className="text-red-600" />
              <span className="text-sm font-semibold text-red-800">Trenutno rasprodano</span>
            </div>
          )}

          {/* Category Badge */}
          <div>
            <span className="inline-block bg-[#E8F5E9] text-[#22C55E] px-4 py-2 rounded-full text-sm font-semibold">
              {getCategoryLabel(product.category)}
            </span>
          </div>

          {/* Description */}
          {product.description && (
            <div>
              <h3 className="text-lg font-semibold text-[#1F2937] mb-2">Opis proizvoda</h3>
              <p className="text-[#6B7280] leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Seller Info Section */}
      {seller && (
        <div className="mx-6 mt-6">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Prodavač</h3>
            <button
              onClick={() => navigate(`/opg/${seller.id}`)}
              className="w-full flex items-center gap-4 p-4 bg-[#E8F5E9] rounded-xl hover:bg-[#E8F5E9]/80 transition-all group"
            >
              <div className="relative">
                <img
                  src={seller.cover_url || seller.avatar_url || '/placeholder.svg'}
                  alt={seller.display_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }}
                />
                {seller.verified && (
                  <div className="absolute -bottom-1 -right-1 bg-[#22C55E] rounded-full p-1">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-[#1F2937]">{seller.display_name}</h4>
                  {seller.verified && (
                    <BadgeCheck size={18} className="text-[#22C55E]" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span>{(seller.rating || 0).toFixed(1)}</span>
                  <span>•</span>
                  <span>{seller.products_count} proizvoda</span>
                </div>
              </div>

              <ChevronRight size={24} className="text-[#6B7280] group-hover:text-[#22C55E] transition-all" />
            </button>
          </div>
        </div>
      )}

      {/* Location Section */}
      {seller?.location_lat && seller?.location_lng && (
        <div className="mx-6 mt-6 mb-6">
          <div className="bg-white rounded-2xl shadow-md p-5">
            <h3 className="text-lg font-semibold text-[#1F2937] mb-4">Lokacija preuzimanja</h3>

            {/* Static Map Placeholder */}
            <div
              className="h-48 rounded-xl overflow-hidden border-2 border-[#E5E7EB] mb-3 cursor-pointer"
              onClick={() => navigate(`/map?opg=${seller.id}`)}
            >
              <div className="w-full h-full bg-[#E8F5E9] flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={48} className="text-[#22C55E] mx-auto mb-2" />
                  <p className="text-[#6B7280] font-medium">Kliknite za prikaz na karti</p>
                </div>
              </div>
            </div>

            {/* Address */}
            {seller.location_address && (
              <div className="flex items-start gap-3">
                <MapPin size={20} className="text-[#22C55E] mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[#6B7280] leading-relaxed">{seller.location_address}</p>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${seller.location_lat},${seller.location_lng}`;
                      window.open(url, '_blank');
                    }}
                    className="text-[#22C55E] text-sm font-semibold hover:underline mt-2 inline-flex items-center gap-1"
                  >
                    Otvori u Google Maps
                    <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sticky CTA Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] p-6 z-40 safe-bottom">
        <button
          onClick={handleReservation}
          disabled={product.stock_status === 'out'}
          className="w-full bg-[#22C55E] text-white py-4 rounded-xl font-semibold hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg"
        >
          <MessageCircle size={20} />
          {product.stock_status === 'out' ? 'Rasprodano' : 'Rezerviraj ili pošalji poruku'}
        </button>
      </div>

      {/* Reservation Modal */}
      {showReservationModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowReservationModal(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-4" />

            <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Rezerviraj proizvod</h3>
            <p className="text-sm text-[#6B7280] mb-4">{product.title}</p>

            {/* Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Količina ({product.unit})
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={reservationQuantity}
                onChange={(e) => setReservationQuantity(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                placeholder="npr. 5"
              />
              <p className="text-xs text-[#6B7280] mt-1">
                Cijena: {product.price}€/{product.unit}
              </p>
              {reservationQuantity && !isNaN(parseFloat(reservationQuantity)) && (
                <p className="text-sm font-semibold text-[#22C55E] mt-2">
                  Ukupno: {(parseFloat(reservationQuantity) * product.price).toFixed(2)}€
                </p>
              )}
            </div>

            {/* Message Input */}
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                Poruka (opcionalno)
              </label>
              <textarea
                value={reservationMessage}
                onChange={(e) => setReservationMessage(e.target.value)}
                rows={3}
                className="w-full border border-[#E5E7EB] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                placeholder="Dodatne informacije ili pitanja..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowReservationModal(false)}
                className="flex-1 py-3 border-2 border-[#E5E7EB] text-[#6B7280] rounded-xl font-semibold hover:bg-gray-50 transition-all"
              >
                Odustani
              </button>
              <button
                onClick={submitReservation}
                disabled={submittingReservation || !reservationQuantity || parseFloat(reservationQuantity) <= 0}
                className="flex-1 bg-[#22C55E] text-white py-3 rounded-xl font-semibold hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {submittingReservation ? (
                  'Slanje...'
                ) : (
                  <>
                    <Package size={18} />
                    Rezerviraj
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Menu */}
      {showShareMenu && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end"
          onClick={() => setShowShareMenu(false)}
        >
          <div
            className="bg-white rounded-t-3xl w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-4" />

            <h3 className="text-xl font-semibold text-[#1F2937] mb-4">Podijeli proizvod</h3>

            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success('Link kopiran!');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-4 p-4 bg-[#E8F5E9] rounded-xl hover:bg-[#E8F5E9]/80 transition-all"
              >
                <Copy size={24} className="text-[#22C55E]" />
                <span className="font-semibold text-[#1F2937]">Kopiraj link</span>
              </button>

              <button
                onClick={() => {
                  const text = `Pogledaj ${product.title} na Friško.hr: ${window.location.href}`;
                  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
                  window.open(url, '_blank');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-4 p-4 bg-[#E8F5E9] rounded-xl hover:bg-[#E8F5E9]/80 transition-all"
              >
                <MessageCircle size={24} className="text-[#22C55E]" />
                <span className="font-semibold text-[#1F2937]">Podijeli na WhatsApp</span>
              </button>
            </div>

            <button
              onClick={() => setShowShareMenu(false)}
              className="w-full py-3 text-[#6B7280] font-semibold"
            >
              Odustani
            </button>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default ProductDetails;
