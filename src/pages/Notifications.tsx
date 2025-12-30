import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MessageCircle, Bell, Check, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout';
import { getErrorMessage } from '@/lib/errors';

interface Notification {
  id: string;
  type: 'reservation' | 'message' | 'reservation_update';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: {
    reservation_id?: string;
    message_id?: string;
    product_id?: string;
    sender_id?: string;
    status?: string;
  };
}

interface ReservationData {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  quantity: number;
  unit: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  buyer: {
    display_name: string;
  };
  seller: {
    display_name: string;
  };
  product: {
    title: string;
  };
}

interface MessageData {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender: {
    display_name: string;
    avatar_url: string | null;
  };
}

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchNotifications();

    // Subscribe to realtime updates
    const reservationsSubscription = supabase
      .channel('reservations-notifications')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => fetchNotifications()
      )
      .subscribe();

    const messagesSubscription = supabase
      .channel('messages-notifications')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => fetchNotifications()
      )
      .subscribe();

    return () => {
      reservationsSubscription.unsubscribe();
      messagesSubscription.unsubscribe();
    };
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const allNotifications: Notification[] = [];

      // Fetch reservation notifications (for sellers)
      const { data: reservations } = await supabase
        .from('reservations')
        .select(`
          *,
          buyer:profiles!buyer_id(display_name),
          product:products(title)
        `)
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (reservations) {
        reservations.forEach((res: ReservationData) => {
          allNotifications.push({
            id: `reservation-${res.id}`,
            type: res.status === 'pending' ? 'reservation' : 'reservation_update',
            title: res.status === 'pending'
              ? 'Nova rezervacija'
              : `Rezervacija ${res.status === 'confirmed' ? 'potvrđena' : res.status === 'cancelled' ? 'otkazana' : 'završena'}`,
            message: `${res.buyer.display_name} je ${
              res.status === 'pending' ? 'rezervirao' : 'ažurirao rezervaciju za'
            } ${res.quantity} ${res.unit} - ${res.product.title}`,
            read: false, // We'll implement read tracking separately
            created_at: res.created_at,
            data: {
              reservation_id: res.id,
              product_id: res.product_id,
              status: res.status
            }
          });
        });
      }

      // Fetch unread messages
      const { data: messages } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(display_name, avatar_url)
        `)
        .eq('receiver_id', user.id)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20);

      if (messages) {
        messages.forEach((msg: MessageData) => {
          allNotifications.push({
            id: `message-${msg.id}`,
            type: 'message',
            title: 'Nova poruka',
            message: `${msg.sender.display_name}: ${msg.content.substring(0, 50)}${msg.content.length > 50 ? '...' : ''}`,
            read: msg.read,
            created_at: msg.created_at,
            data: {
              message_id: msg.id,
              sender_id: msg.sender_id
            }
          });
        });
      }

      // Fetch reservation updates (for buyers)
      const { data: buyerReservations } = await supabase
        .from('reservations')
        .select(`
          *,
          seller:profiles!seller_id(display_name),
          product:products(title)
        `)
        .eq('buyer_id', user.id)
        .neq('status', 'pending')
        .order('updated_at', { ascending: false })
        .limit(10);

      if (buyerReservations) {
        buyerReservations.forEach((res: ReservationData) => {
          allNotifications.push({
            id: `buyer-reservation-${res.id}`,
            type: 'reservation_update',
            title: `Rezervacija ${res.status === 'confirmed' ? 'potvrđena' : res.status === 'cancelled' ? 'otkazana' : 'završena'}`,
            message: `${res.seller.display_name} je ${
              res.status === 'confirmed' ? 'potvrdio' : res.status === 'cancelled' ? 'otkazao' : 'označio završenom'
            } vašu rezervaciju za ${res.product.title}`,
            read: false,
            created_at: res.updated_at,
            data: {
              reservation_id: res.id,
              product_id: res.product_id,
              status: res.status
            }
          });
        });
      }

      // Sort all notifications by date
      allNotifications.sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setNotifications(allNotifications);
    } catch (error: any) {
      
      toast.error('Greška pri učitavanju obavijesti');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (notification.type === 'message' && notification.data?.sender_id) {
      navigate(`/chat/${notification.data.sender_id}`);
    } else if (notification.type === 'reservation' || notification.type === 'reservation_update') {
      // Navigate to reservations page
      navigate('/reservations');
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mark all messages as read
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('read', false);

      toast.success('Sve obavijesti označene kao pročitane');
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notifications as read:', getErrorMessage(error));
      toast.error('Greška pri ažuriranju obavijesti');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reservation':
      case 'reservation_update':
        return <Package size={20} className="text-[#22C55E]" />;
      case 'message':
        return <MessageCircle size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
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

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <PageLayout
      variant="standard"
      background="bg-[#F8FAF8]"
      loading={loading && notifications.length === 0}
      contentPadding={{ x: 'px-0', y: 'py-0' }}
      header={{
        children: (
          <div className="bg-white border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-[#E8F5E9] rounded-full transition-colors"
              >
                <ArrowLeft size={24} className="text-[#1F2937]" />
              </button>
              <h1 className="text-2xl font-bold text-[#1F2937]">Obavijesti</h1>
            </div>

            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 text-sm text-[#22C55E] hover:text-[#16A34A] font-medium"
              >
                <Check size={16} />
                Označi sve
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#E8F5E9] text-[#6B7280] hover:bg-[#D1FAE5]'
              }`}
            >
              Sve ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#E8F5E9] text-[#6B7280] hover:bg-[#D1FAE5]'
              }`}
            >
              Nepročitane ({notifications.filter(n => !n.read).length})
            </button>
          </div>
        </div>
        )
      }}
    >
      {/* Notifications List */}
      <div className="pt-6 px-6 pb-4">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={64} className="text-[#E5E7EB] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1F2937] mb-2">
              {filter === 'unread' ? 'Nema nepročitanih obavijesti' : 'Nema obavijesti'}
            </h3>
            <p className="text-[#6B7280]">
              {filter === 'unread'
                ? 'Sve obavijesti su pročitane'
                : 'Ovdje će se prikazati vaše obavijesti'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all text-left ${
                  !notification.read ? 'border-l-4 border-[#22C55E]' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${
                    notification.type === 'message'
                      ? 'bg-blue-50'
                      : 'bg-[#E8F5E9]'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-[#1F2937]">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-[#6B7280] whitespace-nowrap">
                        {getTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-[#6B7280] line-clamp-2">
                      {notification.message}
                    </p>

                    {notification.data?.status && notification.type !== 'message' && (
                      <div className="mt-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          notification.data.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : notification.data.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : notification.data.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {notification.data.status === 'pending' && 'Na čekanju'}
                          {notification.data.status === 'confirmed' && 'Potvrđeno'}
                          {notification.data.status === 'cancelled' && 'Otkazano'}
                          {notification.data.status === 'completed' && 'Završeno'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default Notifications;
