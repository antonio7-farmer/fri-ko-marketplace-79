import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, MessageCircle, User, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { storeRedirectPath } from '@/lib/navigation';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUnreadCounts(session.user.id);
      } else {
        setUnreadMessages(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Subscribe to realtime updates for messages
    const messagesSubscription = supabase
      .channel('messages-count')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        () => fetchUnreadCounts(user.id)
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
      fetchUnreadCounts(user.id);
    }
  };

  const fetchUnreadCounts = async (userId: string) => {
    // Count unread messages
    const { count: messagesCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('read', false);

    setUnreadMessages(messagesCount || 0);
  };

  const handleProtectedNav = (path: string) => {
    if (!user) {
      toast.error('Prijavite se za pristup');
      storeRedirectPath(path);
      navigate('/login');
      return;
    }
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5E7EB] z-50 max-w-[480px] mx-auto safe-bottom">
      <div className="px-6 py-3">
        <div className="flex items-center justify-around">
          {/* Home - Always accessible */}
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
              isActive('/') ? 'text-[#22C55E]' : 'text-[#6B7280]'
            }`}
          >
            <Home size={24} />
            <span className="text-xs font-medium">Početna</span>
          </button>

          {/* Reservations - Protected */}
          <button
            onClick={() => handleProtectedNav('/reservations')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
              isActive('/reservations') ? 'text-[#22C55E]' : 'text-[#6B7280]'
            }`}
          >
            <Package size={24} />
            <span className="text-xs font-medium">Rezervacije</span>
          </button>

          {/* Messages - Protected */}
          <button
            onClick={() => handleProtectedNav('/messages')}
            className={`relative flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
              isActive('/messages') ? 'text-[#22C55E]' : 'text-[#6B7280]'
            }`}
          >
            <MessageCircle size={24} />
            <span className="text-xs font-medium">Poruke</span>
            {user && unreadMessages > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadMessages > 9 ? '9+' : unreadMessages}
              </span>
            )}
          </button>

          {/* Profile - Protected */}
          <button
            onClick={() => handleProtectedNav('/profile')}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-all ${
              isActive('/profile') ? 'text-[#22C55E]' : 'text-[#6B7280]'
            }`}
          >
            <User size={24} />
            <span className="text-xs font-medium">Profil</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
