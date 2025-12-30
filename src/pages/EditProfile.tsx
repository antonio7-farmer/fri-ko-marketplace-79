import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Save, MapPin, Plus, Trash2, Clock, Store, Map } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import ImageUpload from '@/components/ImageUpload';

// Fix for Leaflet default icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface Profile {
  id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  location_address: string | null;
  role: string;
  rating: number | null;
  verified: boolean | null;
  working_hours?: Record<string, { open: string; close: string; closed: boolean }> | null;
  markets?: { name: string; days: string }[] | null;
  sales_points?: { address: string; note: string }[] | null;
  farm_pictures?: string[] | null;
  created_at?: string;
}

const DAYS = [
  { value: 'monday', label: 'Ponedjeljak' },
  { value: 'tuesday', label: 'Utorak' },
  { value: 'wednesday', label: 'Srijeda' },
  { value: 'thursday', label: 'Četvrtak' },
  { value: 'friday', label: 'Petak' },
  { value: 'saturday', label: 'Subota' },
  { value: 'sunday', label: 'Nedjelja' },
];

interface LocationPickerProps {
  position: [number, number] | null;
  setPosition: (position: [number, number]) => void;
  setAddress: (address: string) => void;
}

const LocationPicker = ({ position, setPosition, setAddress }: LocationPickerProps) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        setAddress(data.display_name || 'Odabrana lokacija');
      } catch (error) {
      }
    },
  });

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position ? <Marker position={position} /> : null;
};

const compressImage = (file: File, maxWidth: number = 1200, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          resolve(file); // Fallback to original
        }
      }, file.type, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Form States
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // Location
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('');

  // New Fields
  const [workingHours, setWorkingHours] = useState<Record<string, { open: string; close: string; closed: boolean }>>({
    monday: { open: '08:00', close: '16:00', closed: false },
    tuesday: { open: '08:00', close: '16:00', closed: false },
    wednesday: { open: '08:00', close: '16:00', closed: false },
    thursday: { open: '08:00', close: '16:00', closed: false },
    friday: { open: '08:00', close: '16:00', closed: false },
    saturday: { open: '08:00', close: '13:00', closed: false },
    sunday: { open: '', close: '', closed: true },
  });

  const [markets, setMarkets] = useState<{ name: string; days: string }[]>([]);
  const [salesPoints, setSalesPoints] = useState<{ address: string; note: string }[]>([]);
  const [farmPictures, setFarmPictures] = useState<string[]>([]);
  const [farmPictureFiles, setFarmPictureFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setProfile(data);
      setDisplayName(data.display_name || '');
      setBio(data.bio || '');
      setCoverPreview(data.cover_url);

      if (data.location_lat && data.location_lng) {
        setPosition([data.location_lat, data.location_lng]);
        setAddress(data.location_address || '');
      }

      // Load new fields if they exist, otherwise use defaults
      if (data.working_hours) {
        // Merge with default structure to ensure all days exist
        setWorkingHours(prev => ({ ...prev, ...data.working_hours }));
      }

      if (data.markets && Array.isArray(data.markets)) {
        setMarkets(data.markets);
      }

      if (data.sales_points && Array.isArray(data.sales_points)) {
        setSalesPoints(data.sales_points);
      }

      if (data.farm_pictures && Array.isArray(data.farm_pictures)) {
        setFarmPictures(data.farm_pictures);
      }

    } catch (error: any) {
      toast.error('Greška pri učitavanju profila');
    } finally {
      setLoading(false);
    }
  };

  const addMarket = () => {
    setMarkets([...markets, { name: '', days: '' }]);
  };

  const removeMarket = (index: number) => {
    setMarkets(markets.filter((_, i) => i !== index));
  };

  const updateMarket = (index: number, field: 'name' | 'days', value: string) => {
    const newMarkets = [...markets];
    newMarkets[index] = { ...newMarkets[index], [field]: value };
    setMarkets(newMarkets);
  };

  const addSalesPoint = () => {
    setSalesPoints([...salesPoints, { address: '', note: '' }]);
  };

  const removeSalesPoint = (index: number) => {
    setSalesPoints(salesPoints.filter((_, i) => i !== index));
  };

  const updateSalesPoint = (index: number, field: 'address' | 'note', value: string) => {
    const newSalesPoints = [...salesPoints];
    newSalesPoints[index] = { ...newSalesPoints[index], [field]: value };
    setSalesPoints(newSalesPoints);
  };

  const handleFarmPictureUpload = async (files: FileList | null) => {
    if (!files) return;

    const maxImages = 10;
    const maxSizeMB = 5;
    const currentTotal = farmPictures.length + farmPictureFiles.length;

    if (currentTotal >= maxImages) {
      toast.error(`Maksimalno ${maxImages} slika gospodarstva dozvoljeno`);
      return;
    }

    const newFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        toast.error(`Slika ${file.name} je prevelika. Maksimalna veličina je ${maxSizeMB}MB`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        toast.error(`Datoteka ${file.name} nije slika`);
        continue;
      }

      try {
        const compressed = await compressImage(file);
        newFiles.push(compressed);
      } catch (error) {
        newFiles.push(file); // Fallback
      }

      if (currentTotal + newFiles.length >= maxImages) {
        toast.warning(`Dodano je maksimalno ${maxImages} slika. Ostale su preskočene.`);
        break;
      }
    }

    setFarmPictureFiles(prev => [...prev, ...newFiles]);
  };

  const removeFarmPicture = async (index: number) => {
    const pictureUrl = farmPictures[index];
    setFarmPictures(prev => prev.filter((_, i) => i !== index));

    // Delete from storage
    try {
      const urlParts = pictureUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `farm-pictures/${profile?.id}/${fileName}`;

      const { error } = await supabase.storage
        .from('profiles')
        .remove([filePath]);

      if (error) {
      }
    } catch (error) {
    }
  };

  const removeFarmPictureFile = (index: number) => {
    setFarmPictureFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let newCoverUrl = coverPreview;

      // Upload Cover
      if (coverFile) {
        const fileExt = coverFile.name.split('.').pop();
        const fileName = `cover-${Date.now()}.${fileExt}`;
        const filePath = `covers/${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('profiles')
          .upload(filePath, coverFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('profiles')
          .getPublicUrl(filePath);

        newCoverUrl = data.publicUrl;
      }

      // Upload Farm Pictures
      let newFarmPictures = [...farmPictures];
      if (farmPictureFiles.length > 0) {
        for (const file of farmPictureFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `farm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
          const filePath = `farm-pictures/${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('profiles')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data } = supabase.storage
            .from('profiles')
            .getPublicUrl(filePath);

          newFarmPictures.push(data.publicUrl);
        }
      }

      // Update Profile - different fields for buyers vs sellers/farmers
      const baseUpdate = {
        display_name: displayName,
      };

      const updateData = profile?.role === 'buyer'
        ? baseUpdate // Buyers only update name
        : {
            ...baseUpdate,
            bio: bio,
            cover_url: newCoverUrl,
            location_lat: position ? position[0] : null,
            location_lng: position ? position[1] : null,
            location_address: address,
            working_hours: workingHours,
            markets: markets,
            sales_points: salesPoints,
            farm_pictures: newFarmPictures,
          };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) throw error;

      toast.success('Profil uspješno ažuriran!');
      navigate('/profile');

    } catch (error: any) {
      toast.error('Spremanje nije uspjelo: ' + error.message);
    } finally {
      setSaving(false);
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
      {/* Navbar */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 fixed top-0 w-full z-[9999] flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
          >
            <ArrowLeft size={24} className="text-[#1F2937]" />
          </button>
          <h1 className="text-xl font-bold text-[#1F2937]">Uredi profil</h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 bg-[#22C55E] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#16A34A] transition-all disabled:opacity-50 shadow-sm"
        >
          {saving ? 'Spremanje...' : (
            <>
              <Save size={18} />
              <span>Spremi</span>
            </>
          )}
        </button>
      </div>

      <div className="pt-24 px-6 max-w-4xl mx-auto space-y-8">

        {/* Basic Info & Images */}
        <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#1F2937] mb-4">Osnovne informacije</h2>

          {/* Cover Photo - Only for Sellers/Farmers */}
          {['seller', 'farmer'].includes(profile?.role) && (
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">Naslovna fotografija</label>
              <div className="h-48">
                <ImageUpload
                  value={coverFile || coverPreview}
                  onChange={setCoverFile}
                  height="h-48"
                  label=""
                  placeholder="Promijeni naslovnu fotografiju"
                />
              </div>
            </div>
          )}

          {/* Text Fields */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">
                {profile?.role === 'buyer' ? 'Ime' : 'Naziv OPG-a / Ime'}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                placeholder={profile?.role === 'buyer' ? 'Vaše ime' : 'npr. OPG Horvat'}
              />
            </div>
          </div>

          {/* Bio - Only for Sellers/Farmers */}
          {['seller', 'farmer'].includes(profile?.role) && (
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">O nama</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                placeholder="Napišite nešto o svom OPG-u, tradiciji i proizvodima..."
              />
            </div>
          )}
        </section>

        {/* Farm Pictures - Only for Sellers/Farmers */}
        {['seller', 'farmer'].includes(profile?.role) && (
          <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1F2937] mb-3 flex items-center gap-2">
              <Map size={20} className="text-[#22C55E]" />
              Slike gospodarstva ({farmPictures.length + farmPictureFiles.length}/10)
            </h2>

            {/* Existing Farm Pictures */}
            {farmPictures.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Postojeće slike:</p>
                <div className="grid grid-cols-3 gap-2">
                  {farmPictures.map((pic, index) => (
                    <div key={index} className="relative">
                      <img
                        src={pic}
                        alt={`Farm ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFarmPicture(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Farm Pictures to Upload */}
            {farmPictureFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Nove slike za upload:</p>
                <div className="grid grid-cols-3 gap-2">
                  {farmPictureFiles.map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`New farm ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeFarmPictureFile(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-2 border-dashed border-[#E5E7EB] rounded-lg p-4 text-center hover:border-[#22C55E] transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFarmPictureUpload(e.target.files)}
                className="hidden"
                id="farm-pictures"
              />
              <label htmlFor="farm-pictures" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <Plus size={24} className="text-[#22C55E]" />
                  <span className="text-sm text-[#6B7280]">Dodaj slike gospodarstva</span>
                  <span className="text-xs text-gray-500">Kliknite za odabir više slika</span>
                </div>
              </label>
            </div>
          </section>
        )}

        {/* Location - Only for Sellers/Farmers */}
        {['seller', 'farmer'].includes(profile?.role) && (
          <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
              <MapPin size={20} className="text-[#22C55E]" />
              Lokacija
            </h2>

            <div className="h-[300px] rounded-xl overflow-hidden border border-[#E5E7EB] z-0 relative">
              <MapContainer
                center={position || [45.815, 15.9819]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationPicker
                  position={position}
                  setPosition={setPosition}
                  setAddress={setAddress}
                />
              </MapContainer>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">Adresa</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={address}
                  readOnly
                  className="flex-1 bg-gray-50 border border-[#E5E7EB] rounded-lg py-3 px-4 text-gray-500"
                  placeholder="Odaberite lokaciju na karti"
                />
              </div>
            </div>
          </section>
        )}

        {/* Working Hours - Only for Sellers/Farmers */}
        {['seller', 'farmer'].includes(profile?.role) && (
          <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#1F2937] flex items-center gap-2">
            <Clock size={20} className="text-[#22C55E]" />
            Radno vrijeme
          </h2>
          <div className="space-y-3">
            {DAYS.map((day) => (
              <div key={day.value} className="space-y-2 py-3 border-b border-gray-100 last:border-0">
                {/* Row 1: Day + Status */}
                <div className="flex items-center justify-between">
                  <div className="font-medium text-[#1F2937]">{day.label}</div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={workingHours[day.value].closed}
                      onChange={(e) => setWorkingHours(prev => ({
                        ...prev,
                        [day.value]: { ...prev[day.value], closed: e.target.checked }
                      }))}
                      className="rounded text-[#22C55E] focus:ring-[#22C55E]"
                    />
                    <span className="text-sm text-gray-600">
                      {workingHours[day.value].closed ? 'Zatvoreno' : 'Otvoreno'}
                    </span>
                  </label>
                </div>

                {/* Row 2: Working Hours (only if open) */}
                {!workingHours[day.value].closed && (
                  <div className="flex items-center gap-2 pl-4">
                    <div className="flex items-center gap-1">
                      <select
                        value={workingHours[day.value].open.split(':')[0]}
                        onChange={(e) => {
                          const [_, minutes] = workingHours[day.value].open.split(':');
                          setWorkingHours(prev => ({
                            ...prev,
                            [day.value]: { ...prev[day.value], open: `${e.target.value}:${minutes}` }
                          }));
                        }}
                        className="border border-[#E5E7EB] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#22C55E] w-16"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400">:</span>
                      <select
                        value={workingHours[day.value].open.split(':')[1]}
                        onChange={(e) => {
                          const [hours] = workingHours[day.value].open.split(':');
                          setWorkingHours(prev => ({
                            ...prev,
                            [day.value]: { ...prev[day.value], open: `${hours}:${e.target.value}` }
                          }));
                        }}
                        className="border border-[#E5E7EB] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#22C55E] w-16"
                      >
                        {['00', '15', '30', '45'].map(minute => (
                          <option key={minute} value={minute}>{minute}</option>
                        ))}
                      </select>
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="flex items-center gap-1">
                      <select
                        value={workingHours[day.value].close.split(':')[0]}
                        onChange={(e) => {
                          const [_, minutes] = workingHours[day.value].close.split(':');
                          setWorkingHours(prev => ({
                            ...prev,
                            [day.value]: { ...prev[day.value], close: `${e.target.value}:${minutes}` }
                          }));
                        }}
                        className="border border-[#E5E7EB] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#22C55E] w-16"
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i.toString().padStart(2, '0')}>
                            {i.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="text-gray-400">:</span>
                      <select
                        value={workingHours[day.value].close.split(':')[1]}
                        onChange={(e) => {
                          const [hours] = workingHours[day.value].close.split(':');
                          setWorkingHours(prev => ({
                            ...prev,
                            [day.value]: { ...prev[day.value], close: `${hours}:${e.target.value}` }
                          }));
                        }}
                        className="border border-[#E5E7EB] rounded px-2 py-1.5 text-sm focus:outline-none focus:border-[#22C55E] w-16"
                      >
                        {['00', '15', '30', '45'].map(minute => (
                          <option key={minute} value={minute}>{minute}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          </section>
        )}

        {/* Sales Locations - Only for Sellers/Farmers */}
        {['seller', 'farmer'].includes(profile?.role) && (
          <section className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-[#1F2937] mb-2">Gdje nas možete naći</h2>

          {/* Markets */}
          <div>
            <h3 className="text-md font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
              <Store size={18} className="text-[#22C55E]" />
              Tržnice
            </h3>
            <div className="space-y-3">
              {markets.map((market, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Naziv tržnice (npr. Dolac)"
                      value={market.name}
                      onChange={(e) => updateMarket(index, 'name', e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#22C55E]"
                    />
                    <input
                      type="text"
                      placeholder="Dani (npr. Pet-Sub)"
                      value={market.days}
                      onChange={(e) => updateMarket(index, 'days', e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>
                  <button
                    onClick={() => removeMarket(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={addMarket}
                className="flex items-center gap-2 text-sm font-medium text-[#22C55E] hover:text-[#16A34A] px-2 py-1 rounded transition-colors"
              >
                <Plus size={16} />
                Dodaj tržnicu
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 my-4" />

          {/* Sales Points */}
          <div>
            <h3 className="text-md font-semibold text-[#1F2937] mb-3 flex items-center gap-2">
              <Map size={18} className="text-[#22C55E]" />
              Prodajna mjesta
            </h3>
            <div className="space-y-3">
              {salesPoints.map((point, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Adresa / Lokacija"
                      value={point.address}
                      onChange={(e) => updateSalesPoint(index, 'address', e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#22C55E]"
                    />
                    <input
                      type="text"
                      placeholder="Napomena (npr. Zvati prije)"
                      value={point.note}
                      onChange={(e) => updateSalesPoint(index, 'note', e.target.value)}
                      className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#22C55E]"
                    />
                  </div>
                  <button
                    onClick={() => removeSalesPoint(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                onClick={addSalesPoint}
                className="flex items-center gap-2 text-sm font-medium text-[#22C55E] hover:text-[#16A34A] px-2 py-1 rounded transition-colors"
              >
                <Plus size={16} />
                Dodaj prodajno mjesto
              </button>
            </div>
          </div>

          </section>
        )}

        {/* Bottom Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            disabled={saving}
            className="flex-1 py-3 border-2 border-[#E5E7EB] text-[#6B7280] rounded-xl font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
          >
            Odustani
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || loading}
            className="flex-1 bg-[#22C55E] text-white py-3 rounded-xl font-semibold hover:bg-[#16A34A] disabled:opacity-50 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {saving ? 'Spremanje...' : (
              <>
                <Save size={20} />
                <span>Spremi promjene</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default EditProfile;
