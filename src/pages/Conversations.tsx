import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, Search, ChevronRight, Check, BadgeCheck, Package } from 'lucide-react';
import { PageLayout } from '@/components/layout';

interface ConversationData {
  id: string;
  other_user: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    verified: boolean | null;
  };
  last_message: {
    id: string;
    content: string;
    created_at: string | null;
    sender_id: string | null;
    product_id: string | null;
    conversation_id: string;
    read: boolean | null;
    receiver_id: string | null;
  };
  unread_count: number;
}

interface UserConversationRow {
  partner_id: string;
  display_name: string;
  avatar_url: string | null;
  verified: boolean | null;
  last_message: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    product_id: string | null;
    conversation_id: string;
    read: boolean;
    receiver_id: string;
  } | null;
  unread_count: number;
}

const Conversations = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeConversations();
  }, []);

  const initializeConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    setCurrentUserId(user.id);
    await fetchConversations(user.id);

    // Subscribe to new messages
    const channel = supabase
      .channel('conversations-updates')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchConversations(user.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchConversations = async (userId: string) => {
    // Use optimized database function - reduces 31 queries to 1
    const { data, error } = await supabase
      .rpc('get_user_conversations', { user_id: userId });

    if (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
      setLoading(false);
      return;
    }

    const conversations = data as UserConversationRow[] | null;

    if (!conversations || conversations.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Transform data to match expected format
    const formattedConversations = conversations
      .filter((conv): conv is UserConversationRow & { last_message: NonNullable<UserConversationRow['last_message']> } =>
        conv.last_message !== null
      )
      .map(conv => ({
        id: conv.partner_id,
        other_user: {
          id: conv.partner_id,
          display_name: conv.display_name,
          avatar_url: conv.avatar_url,
          verified: conv.verified
        },
        last_message: conv.last_message,
        unread_count: Number(conv.unread_count)
      }));

    setConversations(formattedConversations);
    setLoading(false);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Sada';
    if (diff < 3600000) {
      const mins = Math.floor(diff / 60000);
      return `${mins} min`;
    }

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Jučer';
    }

    if (diff < 604800000) {
      return date.toLocaleDateString('hr-HR', { weekday: 'short' });
    }

    return date.toLocaleDateString('hr-HR', { day: 'numeric', month: 'short' });
  };

  return (
    <PageLayout
      variant="standard"
      loading={loading && conversations.length === 0}
      header={{
        children: (
          <div className="bg-white px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[#1F2937]">Poruke</h1>
              <button className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all">
                <Search size={24} className="text-[#6B7280]" />
              </button>
            </div>
          </div>
        )
      }}
    >
      {/* Conversations List */}
      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22C55E]"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle size={64} className="text-[#E5E7EB] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Nema poruka</h3>
            <p className="text-[#6B7280] mb-6">Započnite razgovor s OPG-om</p>
            <button
              onClick={() => navigate('/opgs')}
              className="bg-[#22C55E] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#16A34A] transition-all"
            >
              Pregledaj OPG-ove
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => navigate(`/chat/${conv.other_user.id}`)}
              className="w-full bg-white rounded-2xl p-4 hover:shadow-md transition-all text-left"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conv.other_user.avatar_url || '/placeholder.svg'}
                    alt={conv.other_user.display_name}
                    loading="lazy"
                    decoding="async"
                    className="w-14 h-14 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder.svg';
                    }}
                  />
                  {conv.other_user.verified && (
                    <div className="absolute -bottom-1 -right-1 bg-[#22C55E] rounded-full p-1">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                  {conv.unread_count > 0 && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread_count}
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[#1F2937] truncate flex items-center gap-2">
                      {conv.other_user.display_name}
                      {conv.other_user.verified && (
                        <BadgeCheck size={16} className="text-[#22C55E]" />
                      )}
                    </h3>
                    <span className="text-xs text-[#6B7280] flex-shrink-0 ml-2">
                      {formatTime(conv.last_message.created_at)}
                    </span>
                  </div>

                  <p className={`text-sm truncate ${conv.unread_count > 0 ? 'font-semibold text-[#1F2937]' : 'text-[#6B7280]'}`}>
                    {conv.last_message.sender_id === currentUserId && 'Vi: '}
                    {conv.last_message.content}
                  </p>

                  {conv.last_message.product_id && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-[#22C55E]">
                      <Package size={12} />
                      <span>Proizvod</span>
                    </div>
                  )}
                </div>

                <ChevronRight size={20} className="text-[#E5E7EB] flex-shrink-0" />
              </div>
            </button>
          ))
        )}
      </div>
    </PageLayout>
  );
};

export default Conversations;
