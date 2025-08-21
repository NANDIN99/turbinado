
import React from 'react'
import { ShoppingCart, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Product {
  _id: string
  name: string
  category: string
  currentPrice: number
  oldPrice?: number
  inStock: boolean
  description: string
  brand: string
  imageClass: string
}

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const handleAddToCart = () => {
    if (product.inStock) {
      onAddToCart(product)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="glass-effect rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 group"
    >
      {/* Imagem do produto */}
      <div className={`h-40 ${product.imageClass} flex items-center justify-center relative`}>
        {!product.inStock && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>ESGOTADO</span>
          </div>
        )}
        <div className="text-white font-bold text-lg tracking-wider">
          {product.brand.toUpperCase()}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        <h3 className="text-white font-bold text-lg mb-2 group-hover:text-purple-300 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-end mb-4">
          <div className="text-right">
            {product.oldPrice && (
              <div className="text-gray-500 text-sm line-through">
                R$ {product.oldPrice.toFixed(2)}
              </div>
            )}
            <div className="text-purple-400 font-bold text-xl">
              R$ {product.currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={!product.inStock}
          className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
            product.inStock
              ? 'button-gradient hover:scale-105 text-white shadow-lg hover:shadow-purple-500/25'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="w-5 h-5" />
          <span>{product.inStock ? 'Comprar agora' : 'Indisponível'}</span>
        </button>
      </div>
    </motion.div>
  )
}

export default ProductCard
