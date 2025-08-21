
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '../hooks/useCart'

interface CartProps {
  isOpen: boolean
  onClose: () => void
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getTotalPrice } = useCart()

  // Debug para verificar se os produtos estão sendo carregados
  useEffect(() => {
    console.log('Cart renderizado - isOpen:', isOpen, 'cartItems:', cartItems)
  }, [isOpen, cartItems])

  const totalPrice = getTotalPrice()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Cart Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-purple-600/30">
              <div className="flex items-center space-x-3">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Carrinho</h2>
                {cartItems.length > 0 && (
                  <span className="bg-purple-600 text-white text-sm px-2 py-1 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-20">
                    <ShoppingBag className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Carrinho vazio
                    </h3>
                    <p className="text-gray-400">
                      Adicione produtos para começar suas compras
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {cartItems.map((item) => (
                        <motion.div
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          className="bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/10"
                        >
                          <div className="flex items-start space-x-4">
                            {/* Product Icon */}
                            <div className={`w-12 h-12 ${item.imageClass} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0`}>
                              {item.brand?.charAt(0) || item.name?.charAt(0) || 'P'}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-semibold text-sm truncate">
                                {item.name}
                              </h3>
                              <p className="text-purple-400 font-bold text-lg">
                                R$ {item.price.toFixed(2)}
                              </p>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center space-x-3 bg-white/10 rounded-full p-1">
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                  >
                                    <Minus className="w-4 h-4 text-white" />
                                  </button>
                                  <span className="text-white font-semibold w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                                  >
                                    <Plus className="w-4 h-4 text-white" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(item.productId)}
                                  className="p-2 text-red-400 hover:bg-red-500/20 rounded-full transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Subtotal */}
                              <div className="mt-2 text-right">
                                <span className="text-gray-300 text-sm">
                                  Subtotal: R$ {(item.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Clear Cart Button */}
                    {cartItems.length > 0 && (
                      <button
                        onClick={clearCart}
                        className="w-full p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/30"
                      >
                        Limpar Carrinho
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Footer - sempre visível quando há produtos */}
              {cartItems.length > 0 && (
                <div className="border-t border-purple-600/30 p-6 bg-gradient-to-r from-gray-900 to-gray-800">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold text-white">Total:</span>
                    <span className="text-2xl font-bold text-purple-400">
                      R$ {totalPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg">
                    Finalizar Compra
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default Cart
