import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Check } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import { getErrorMessage } from '@/lib/errors';

const AddProduct = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    unit: '',
    category: '',
    description: '',
    stock_status: 'available'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      // Validation
      if (!formData.title.trim()) {
        throw new Error('Naziv proizvoda je obavezan');
      }
      if (formData.title.trim().length > 100) {
        throw new Error('Naziv proizvoda ne smije biti duži od 100 znakova');
      }

      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error('Unesite ispravnu cijenu');
      }
      if (price > 99999.99) {
        throw new Error('Cijena ne smije biti veća od 99.999,99 €');
      }

      if (!formData.unit) {
        throw new Error('Odaberite jedinicu');
      }

      if (!formData.category) {
        throw new Error('Odaberite kategoriju');
      }

      if (!imageFile) {
        throw new Error('Fotografija proizvoda je obavezna');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('products')
        .insert({
          seller_id: user.id,
          title: formData.title.trim(),
          price: price,
          unit: formData.unit,
          category: formData.category,
          description: formData.description.trim() || null,
          stock_status: formData.stock_status,
          image_url: publicUrl
        });

      if (insertError) throw insertError;

      toast({
        title: "Uspjeh",
        description: "Proizvod je dodan!",
        variant: "default"
      });
      setLoading(false);
      navigate('/dashboard');

    } catch (err) {
      setError(getErrorMessage(err) || 'Greška pri dodavanju proizvoda');
      setLoading(false);
    }
  };

  const stockOptions = [
    { value: 'available', label: 'Dostupno', color: 'bg-[#22C55E]' },
    { value: 'low', label: 'Malo zaliha', color: 'bg-yellow-500' },
    { value: 'out', label: 'Rasprodano', color: 'bg-red-500' }
  ];

  return (
    <div className="min-h-screen bg-[#E8F5E9] pb-20">

      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-2 hover:bg-[#E8F5E9] rounded-lg transition-all"
        >
          <ArrowLeft size={24} className="text-[#1F2937]" />
        </button>
        <h1 className="text-xl font-bold text-[#1F2937]">Dodaj proizvod</h1>
        <div className="w-10" />
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 space-y-6">

          {/* Image Upload */}
          <ImageUpload
            label="Fotografija proizvoda *"
            value={imageFile}
            onChange={(file) => setImageFile(file)}
          />

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Naziv proizvoda *</label>
            <input
              type="text"
              required
              maxLength={100}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="npr. Svježe jagode"
              className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            />
          </div>

          {/* Price and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">Cijena (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="4.00"
                className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1F2937] mb-2">Jedinica *</label>
              <select
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              >
                <option value="">Odaberi</option>
                <option value="kg">kg</option>
                <option value="kom">kom</option>
                <option value="veza">veza</option>
                <option value="L">L</option>
              </select>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">Kategorija *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
            >
              <option value="">Odaberi kategoriju</option>
              <option value="voce">Voće</option>
              <option value="povrce">Povrće</option>
              <option value="meso">Meso</option>
              <option value="jaja">Jaja</option>
              <option value="mlijecni">Mliječni proizvodi</option>
              <option value="ostalo">Ostalo</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Opis
              <span className="text-[#6B7280] font-normal ml-2">({formData.description.length}/500)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value.slice(0, 500) })}
              placeholder="Opišite proizvod, kako je uzgojen, kada je sezona..."
              rows={4}
              className="w-full border border-[#E5E7EB] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#22C55E] resize-none"
            />
          </div>

          {/* Stock Status */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-3">Dostupnost *</label>
            <div className="space-y-2">
              {stockOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${formData.stock_status === option.value
                    ? 'border-[#22C55E] bg-[#E8F5E9]'
                    : 'border-[#E5E7EB] hover:border-[#22C55E]/50'
                    }`}
                >
                  <input
                    type="radio"
                    name="stock_status"
                    value={option.value}
                    checked={formData.stock_status === option.value}
                    onChange={(e) => setFormData({ ...formData, stock_status: e.target.value })}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded-full ${option.color}`} />
                  <span className="font-medium text-[#1F2937]">{option.label}</span>
                  {formData.stock_status === option.value && (
                    <Check size={20} className="text-[#22C55E] ml-auto" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !imageFile}
            className="w-full bg-[#22C55E] text-white py-4 rounded-xl font-semibold hover:bg-[#16A34A] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Spremanje...' : 'Dodaj proizvod'}
          </button>

        </form>
      </div>

    </div>
  );
};

export default AddProduct;

