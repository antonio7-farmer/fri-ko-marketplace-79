import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Upload, User, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PageLayout } from '@/components/layout';
import { classNames } from '@/lib/theme';

const SetupProfile = () => {
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Datoteka je prevelika. Maksimalna veličina je 5MB.');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Nepodržani format. Koristite JPG, PNG ili WEBP.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'cover') {
        setCoverPreview(reader.result as string);
        setCoverFile(file);
      } else {
        setAvatarPreview(reader.result as string);
        setAvatarFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handleSave = async () => {
    if (!coverFile) {
      setError('Naslovna fotografija je obavezna');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload images
      const coverUrl = await uploadImage(coverFile, `${user.id}/covers`);
      const avatarUrl = avatarFile ? await uploadImage(avatarFile, `${user.id}/avatars`) : null;

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          cover_url: coverUrl,
          avatar_url: avatarUrl,
          bio: bio || null
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast.success('Profil uspješno postavljen!');
      navigate('/');

    } catch (err: any) {
      setError(err.message || 'Greška pri spremanju profila');
      setLoading(false);
    }
  };

  const removeCover = () => {
    setCoverPreview(null);
    setCoverFile(null);
  };

  return (
    <PageLayout preset="form" header={{ show: false }}>
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <button
            onClick={() => navigate('/setup/location')}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Natrag
          </button>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Uredite profil</h1>
              <p className="text-base text-gray-600">Dodajte slike i opis vašeg OPG-a</p>
            </div>
            <div className="bg-[#E8F5E9] p-3 rounded-lg">
              <Camera size={32} className="text-[#22C55E]" />
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-[#22C55E] rounded-full"></div>
            <div className="flex-1 h-2 bg-[#22C55E] rounded-full"></div>
          </div>
          <p className="text-sm text-gray-500 mt-2">Korak 2 od 2</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
          
          {/* Cover Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Naslovna fotografija <span className="text-red-500">*</span>
            </label>
            <div className="relative h-48 rounded-xl overflow-hidden bg-[#E8F5E9] border-2 border-dashed border-[#22C55E] group cursor-pointer">
              {coverPreview ? (
                <>
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder.svg';
                  }} />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={removeCover}
                      className="bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                      Promijeni
                    </button>
                  </div>
                </>
              ) : (
                <label className="flex flex-col items-center justify-center h-full cursor-pointer">
                  <Upload size={48} className="text-[#22C55E] mb-2" />
                  <span className="text-gray-600 text-sm">Kliknite za upload naslovne slike</span>
                  <span className="text-gray-400 text-xs mt-1">JPG, PNG ili WEBP (max 5MB)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e, 'cover')}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Profilna fotografija</label>
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-[#E8F5E9] border-4 border-white shadow-lg">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User size={48} className="text-[#22C55E]" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-[#22C55E] p-2 rounded-full cursor-pointer hover:bg-[#16A34A] transition-all shadow-lg">
                  <Camera size={20} className="text-white" />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => handleFileChange(e, 'avatar')}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-2">Dodajte fotografiju vašeg OPG-a ili logo</p>
                <p className="text-xs text-gray-400">Preporučena veličina: 400x400px</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              O nama
              <span className="text-gray-400 font-normal ml-2">({bio.length}/500)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 500))}
              placeholder="Opišite vaš OPG, što uzgajate, kako radite..."
              rows={5}
              className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E] resize-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-2">
              Napišite nešto o svom OPG-u kako bi kupci znali što nudite
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate('/setup/location')}
            className="px-6 py-4 border-2 border-[#E5E7EB] bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Natrag
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !coverPreview}
            className="flex-1 bg-[#22C55E] text-white py-4 rounded-xl font-semibold hover:bg-[#16A34A] disabled:opacity-50 transition-all"
          >
            {loading ? 'Spremanje...' : 'Završi postavljanje'}
          </button>
        </div>

        {loading && (
          <div className="mt-4 bg-[#E8F5E9] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#22C55E]"></div>
              <span className="text-sm text-gray-600">Upload slika u tijeku...</span>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default SetupProfile;
