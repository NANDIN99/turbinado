
import { useState, useEffect, useCallback } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

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

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const fetchProducts = useCallback(async () => {
    try {
      console.log('🛍️ Iniciando carregamento de produtos...')
      setLoading(true)
      
      const { list } = await lumi.entities.products.list()
      
      console.log('📦 Resposta do servidor:', {
        success: !!list,
        count: list?.length || 0,
        firstProduct: list?.[0]?.name || 'Nenhum'
      })
      
      setProducts(list || [])
      
      if (list && list.length > 0) {
        console.log('✅ Produtos carregados com sucesso:', list.length, 'produtos')
        console.log('📋 Categorias disponíveis:', [...new Set(list.map(p => p.category))])
      } else {
        console.log('⚠️ Nenhum produto encontrado na base de dados')
      }
    } catch (error) {
      console.error('❌ Erro ao carregar produtos:', error)
      toast.error('Erro ao carregar produtos. Tente novamente.', {
        style: {
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px'
        }
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar produtos automaticamente na inicialização
  useEffect(() => {
    console.log('🚀 Inicializando hook de produtos...')
    fetchProducts()
  }, [fetchProducts])

  // Filtrar produtos baseado na busca e categoria
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  // Agrupar produtos por categoria
  const productsByCategory = filteredProducts.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = []
    }
    acc[product.category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  // Debug: Log quando produtos são agrupados
  useEffect(() => {
    const categoryCount = Object.keys(productsByCategory).length
    const totalProducts = Object.values(productsByCategory).flat().length
    
    if (categoryCount > 0) {
      console.log(`📊 Produtos organizados: ${categoryCount} categorias, ${totalProducts} produtos`)
      console.log('🏷️ Categorias:', Object.keys(productsByCategory))
    }
  }, [productsByCategory])

  // Obter sugestões para busca
  const getSuggestions = (query: string) => {
    if (query.length < 2) return []
    
    return products
      .filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 6)
  }

  return {
    products,
    filteredProducts,
    productsByCategory,
    loading,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    getSuggestions,
    refetch: fetchProducts
  }
}
