
import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Header from '../components/Header'
import CategorySection from '../components/CategorySection'
import Cart from '../components/Cart'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

const HomePage: React.FC = () => {
  const { productsByCategory, loading, searchQuery, refetch } = useProducts()
  const { addToCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const [isCartOpen, setIsCartOpen] = useState(false)

  const categoryIcons: Record<string, string> = {
    streaming: '💜',
    musica: '💜', 
    ferramentas: '💜',
    educacao: '💜'
  }

  const hasProducts = Object.keys(productsByCategory).length > 0

  // 🔥 CARREGAMENTO AUTOMÁTICO APÓS LOGIN
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('👤 Usuário logado:', user.userName, '- Carregando produtos...')
      // Aguardar um pouco para garantir que o estado foi atualizado
      setTimeout(() => {
        refetch()
      }, 500)
    }
  }, [isAuthenticated, user, refetch])

  // Debug: Log do estado atual
  useEffect(() => {
    console.log('🏠 HomePage - Estado:', {
      isAuthenticated,
      userName: user?.userName || 'Não logado',
      hasProducts,
      loading,
      searchQuery,
      categoriesCount: Object.keys(productsByCategory).length
    })
  }, [isAuthenticated, hasProducts, loading, searchQuery, productsByCategory, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Carregando produtos...</p>
          {isAuthenticated && user && (
            <p className="text-purple-400 text-sm mt-2">
              Olá, {user.userName}! Preparando seus produtos...
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header onCartToggle={() => setIsCartOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 🎉 MENSAGEM DE BOAS-VINDAS COM NOME DA CONTA */}
        {isAuthenticated && user && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user.userName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">
                  Olá, {user.userName}! 👋
                </h2>
                <p className="text-purple-300 text-sm">
                  Explore nossos produtos digitais exclusivos
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Conteúdo principal */}
        {!hasProducts && searchQuery ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Nenhum produto encontrado
            </h2>
            <p className="text-gray-400">
              Tente uma busca diferente ou navegue pelas categorias
            </p>
          </motion.div>
        ) : hasProducts ? (
          <div className="space-y-12">
            {Object.entries(productsByCategory).map(([category, products]) => (
              <CategorySection
                key={category}
                title={category}
                icon={categoryIcons[category] || '💜'}
                products={products}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🌙</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vindo ao Lunar System
            </h2>
            <p className="text-gray-400 mb-4">
              {isAuthenticated ? 
                `Olá, ${user?.userName}! Explore nossos produtos digitais exclusivos!` : 
                'Faça login para uma experiência personalizada'
              }
            </p>
            {!isAuthenticated && (
              <p className="text-purple-400 text-sm">
                Clique no ícone de pessoa para fazer login e ver os produtos
              </p>
            )}
            {isAuthenticated && !hasProducts && (
              <button 
                onClick={refetch}
                className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Recarregar Produtos
              </button>
            )}
          </motion.div>
        )}
      </main>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  )
}

export default HomePage
