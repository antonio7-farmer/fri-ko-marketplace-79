import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MoreVertical, Send, MessageCircle, BadgeCheck, Check, CheckCheck } from 'lucide-react';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout';

interface Message {
  id: string;
  sender_id: string | null;
  receiver_id: string | null;
  content: string;
  created_at: string | null;
  read: boolean | null;
  product_id: string | null;
}

interface OtherUser {
  id: string;
  display_name: string;
  avatar_url: string | null;
  verified: boolean | null;
}

interface ProductContext {
  id: string;
  title: string;
  price: number;
  unit: string;
  image_url: string | null;
}

const ChatThread = () => {
  const { id: otherUserId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [otherUser, setOtherUser] = useState<OtherUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [productContext, setProductContext] = useState<ProductContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeChat();
  }, [otherUserId]);

  useEffect(() => {
    scrollToBottom();
    if (currentUserId) {
      markMessagesAsRead();
    }
  }, [messages, currentUserId]);

  const initializeChat = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUserId(user.id);

    // Get other user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, verified')
      .eq('id', otherUserId)
      .maybeSingle();

    if (profile) {
      setOtherUser(profile);
    }

    // Load product context if passed from navigation
    const state = location.state as { productId?: string; productName?: string } | null;
    if (state?.productId) {
      const { data: product } = await supabase
        .from('products')
        .select('id, title, price, unit, image_url')
        .eq('id', state.productId)
        .maybeSingle();
      
      if (product) {
        setProductContext(product);
      }
    }

    // Load messages
    await fetchMessages(user.id, otherUserId as string);
    setLoading(false);

    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`chat:${user.id}-${otherUserId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const newMsg = payload.new as Message;
        // Only add if it's part of this conversation
        if (
          (newMsg.sender_id === user.id && newMsg.receiver_id === otherUserId) ||
          (newMsg.sender_id === otherUserId && newMsg.receiver_id === user.id)
        ) {
          setMessages(prev => [...prev, newMsg]);
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, (payload) => {
        const updatedMsg = payload.new as Message;
        setMessages(prev =>
          prev.map(m => m.id === updatedMsg.id ? updatedMsg : m)
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const fetchMessages = async (userId: string, partnerId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    setMessages(data || []);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || sending || !currentUserId) return;

    setSending(true);

    // Generate a deterministic UUID for the conversation
    // Use crypto.randomUUID() or a consistent hash-based approach
    // For now, we'll use the first user ID as the conversation_id (sorted to be consistent)
    const conversationId = [currentUserId, otherUserId].sort()[0];

    const messageData = {
      sender_id: currentUserId,
      receiver_id: otherUserId,
      content: newMessage.trim(),
      product_id: productContext?.id || null,
      conversation_id: conversationId,
      read: false
    };

    const { error } = await supabase
      .from('messages')
      .insert(messageData);

    if (error) {
      toast.error('Greška pri slanju poruke: ' + error.message);
    } else {
      setNewMessage('');
      setProductContext(null);
    }

    setSending(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const markMessagesAsRead = async () => {
    if (!currentUserId || !otherUserId) return;

    const unreadMessages = messages.filter(m =>
      m.receiver_id === currentUserId && !m.read
    );

    if (unreadMessages.length === 0) return;

    await supabase
      .from('messages')
      .update({ read: true })
      .in('id', unreadMessages.map(m => m.id));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isSameDay = (date1: string, date2: string) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
  };

  const formatMessageDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();

    if (date.toDateString() === today.toDateString()) {
      return 'Danas';
    }

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Jučer';
    }

    return date.toLocaleDateString('hr-HR', {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <PageLayout
      preset="chat"
      loading={loading}
      header={{
        show: true,
        children: (
      <div className="bg-white border-b border-[#E5E7EB] safe-x py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => navigate('/messages')}
            className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
          >
            <ArrowLeft size={24} className="text-[#1F2937]" />
          </button>

          <button
            onClick={() => navigate(`/opg/${otherUser?.id}`)}
            className="flex items-center gap-3 flex-1 min-w-0"
          >
            <img
              src={otherUser?.avatar_url || '/placeholder.svg'}
              alt={otherUser?.display_name}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="text-left min-w-0">
              <h2 className="font-semibold text-[#1F2937] truncate flex items-center gap-1">
                {otherUser?.display_name}
                {otherUser?.verified && (
                  <BadgeCheck size={16} className="text-[#22C55E]" />
                )}
              </h2>
              <p className="text-xs text-[#6B7280]">Odgovara obično za 2h</p>
            </div>
          </button>
        </div>

        <button className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all">
          <MoreVertical size={24} className="text-[#6B7280]" />
        </button>
      </div>
        ),
      }}
    >
      {/* Product Context Banner */}
      {productContext && (
        <div className="bg-white border-b border-[#E5E7EB] safe-x py-3">
          <div className="flex items-center gap-3">
            <img
              src={productContext.image_url || '/placeholder.svg'}
              alt={productContext.title}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1F2937]">{productContext.title}</p>
              <p className="text-xs text-[#6B7280]">€{productContext.price}/{productContext.unit}</p>
            </div>
            <button
              onClick={() => navigate(`/product/${productContext.id}`)}
              className="text-[#22C55E] text-sm font-semibold"
            >
              Prikaži
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto safe-x pb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <MessageCircle size={64} className="text-[#E5E7EB] mx-auto mb-4" />
              <p className="text-[#6B7280]">Započnite razgovor</p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === currentUserId;
            const showDate = index === 0 || 
              (message.created_at && messages[index - 1].created_at && 
               !isSameDay(messages[index - 1].created_at!, message.created_at));

            return (
              <div key={message.id}>
                {/* Date Divider */}
                {showDate && message.created_at && (
                  <div className="flex items-center justify-center my-4">
                    <span className="bg-white px-3 py-1 rounded-full text-xs text-[#6B7280] shadow-sm">
                      {formatMessageDate(message.created_at)}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] ${isOwn ? 'order-2' : 'order-1'}`}>
                    <div className={`rounded-2xl px-4 py-3 ${
                      isOwn
                        ? 'bg-[#22C55E] text-white rounded-br-md'
                        : 'bg-white text-[#1F2937] rounded-bl-md shadow-sm'
                    }`}>
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    </div>
                    <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-xs text-[#6B7280]">
                        {message.created_at && new Date(message.created_at).toLocaleTimeString('hr-HR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isOwn && (
                        <div className="ml-1">
                          {message.read ? (
                            <CheckCheck size={14} className="text-[#22C55E]" />
                          ) : (
                            <Check size={14} className="text-[#6B7280]" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-[#E5E7EB] safe-x pt-4 pb-6 safe-bottom">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Napišite poruku..."
            rows={1}
            className="flex-1 resize-none border border-[#E5E7EB] rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E] max-h-32 text-[#1F2937]"
            style={{ minHeight: '48px' }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-[#22C55E] text-white p-3 rounded-xl hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              <Send size={24} />
            )}
          </button>
        </form>
      </div>
    </PageLayout>
  );
};

export default ChatThread;
