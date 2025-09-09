// src/components/ProductCard.js
import Link from 'next/link';
import Image from 'next/image';

// A simple, gray placeholder image generated with code (Base64 SVG)
const placeholderImage =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiPjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMjZweCIgZmlsbD0iIzMzNDE1NSI+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdGV4dD48L3N2Zz4=';


export const ProductCard = ({ product }) => (
  <Link href={`/product/${product.id}`} className="group block bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl cursor-pointer">
    <Image
      src={product.image || placeholderImage}
      alt={product.description || 'Product Image'}
      width={600}
      height={400}
      className="w-full h-48 object-cover"
    />
    <div className="p-4">
      <p className="text-xs text-gray-500">
        {product.brand ? `${product.modality} / ${product.brand}` : product.modality || 'Unknown Modality'}
      </p>
      <h3 className="text-base font-bold text-gray-800 mb-2 h-12 truncate" title={product.description}>{product.description || 'No Description Provided'}</h3>
      <span className="text-sm text-teal-600 font-semibold hover:underline">
        View Details →
      </span>
    </div>
  </Link>
);