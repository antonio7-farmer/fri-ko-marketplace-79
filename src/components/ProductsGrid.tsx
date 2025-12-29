import { useNavigate } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  stock_status: string | null;
}

interface ProductsGridProps {
  products: Product[];
}

const ProductsGrid = ({ products }: ProductsGridProps) => {
  const navigate = useNavigate();

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package size={48} className="text-[#E5E7EB] mx-auto mb-4" />
        <p className="text-[#6B7280]">Trenutno nema dostupnih proizvoda</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div
          key={product.id}
          onClick={() => navigate(`/product/${product.id}`)}
          className="bg-white rounded-2xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all"
        >
          {/* Product Image */}
          <div className="relative h-40">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/placeholder.svg';
              }}
            />
            {product.stock_status === 'low' && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                Malo zaliha
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="p-3">
            <h3 className="font-semibold text-[#1F2937] mb-1 truncate">{product.title}</h3>
            {product.description && (
              <p className="text-sm text-[#6B7280] mb-2 line-clamp-2">
                {product.description.slice(0, 50)}...
              </p>
            )}

            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-bold text-[#22C55E]">€{product.price.toFixed(2)}</span>
                <span className="text-sm text-[#6B7280]">/{product.unit}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to cart functionality
                }}
                className="bg-[#22C55E] text-white p-2 rounded-lg hover:bg-[#16A34A] transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductsGrid;
