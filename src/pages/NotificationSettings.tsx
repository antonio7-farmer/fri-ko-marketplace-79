import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, MessageSquare, Package, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface NotificationPreferences {
  reservations: boolean;
  messages: boolean;
  updates: boolean;
  marketing: boolean;
}

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    reservations: true,
    messages: true,
    updates: true,
    marketing: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPreferences(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPreferences(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPreferences = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data?.notification_preferences) {
        setPreferences(data.notification_preferences as NotificationPreferences);
      }
    } catch (error) {
      
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user) return;

    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: newPreferences })
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Postavke obavijesti ažurirane');
    } catch (error) {
      
      toast.error('Greška pri ažuriranju postavki');
      // Revert on error
      setPreferences(preferences);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Morate biti prijavljeni</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#22C55E] text-white px-6 py-2 rounded-lg hover:bg-[#16A34A]"
          >
            Prijavi se
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky-header bg-white border-b z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft size={20} />
            <span>Natrag</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Postavke obavijesti</h1>
          <p className="text-sm text-gray-600 mt-1">
            Upravljajte kako želite primati obavijesti
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-[#22C55E]" size={32} />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Reservations */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Package className="text-[#22C55E]" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Obavijesti o rezervacijama</h3>
                    <p className="text-sm text-gray-600">
                      Primite obavijest kada kupac napravi rezervaciju vašeg proizvoda ili kada prodavač potvrdi vašu rezervaciju
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.reservations}
                    onChange={(e) => updatePreference('reservations', e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                </label>
              </div>
            </div>

            {/* Messages */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Obavijesti o porukama</h3>
                    <p className="text-sm text-gray-600">
                      Primite obavijest kada vam netko pošalje novu poruku
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.messages}
                    onChange={(e) => updatePreference('messages', e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                </label>
              </div>
            </div>

            {/* Updates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bell className="text-purple-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Ažuriranja rezervacija</h3>
                    <p className="text-sm text-gray-600">
                      Primite obavijest o promjenama statusa rezervacija (potvrđeno, otkazano, dovršeno)
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.updates}
                    onChange={(e) => updatePreference('updates', e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                </label>
              </div>
            </div>

            {/* Marketing */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="text-orange-600" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Marketing i novosti</h3>
                    <p className="text-sm text-gray-600">
                      Primajte emailove o novim funkcijama, promocijama i vijestima iz Frisko zajednice
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => updatePreference('marketing', e.target.checked)}
                    disabled={saving}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22C55E]"></div>
                </label>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-800">
                <strong>Napomena:</strong> Važne obavijesti vezane uz sigurnost računa i transakcije bit će poslane bez obzira na ove postavke.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationSettings;
