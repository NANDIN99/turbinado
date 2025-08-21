
import React from 'react'
import { motion } from 'framer-motion'
import ProductCard from './ProductCard'

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
  duration: string
}

interface CategorySectionProps {
  title: string
  icon: string
  products: Product[]
  onAddToCart: (product: Product) => void
}

const CategorySection: React.FC<CategorySectionProps> = ({ 
  title, 
  icon, 
  products, 
  onAddToCart 
}) => {
  if (products.length === 0) return null

  const categoryTitles: Record<string, string> = {
    streaming: 'TELAS STREAMING',
    musica: 'MÚSICA',
    ferramentas: 'FERRAMENTAS',
    educacao: 'EDUCAÇÃO'
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-16"
    >
      <div className="flex items-center justify-center mb-8 pb-4 border-b border-purple-600/30">
        <span className="text-2xl mr-4">{icon}</span>
        <h2 className="text-2xl sm:text-3xl font-bold text-white uppercase tracking-wider">
          {categoryTitles[title] || title}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <ProductCard product={product} onAddToCart={onAddToCart} />
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

export default CategorySection
