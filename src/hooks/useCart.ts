
import { useState, useEffect } from 'react'
import { lumi } from '../lib/lumi'
import toast from 'react-hot-toast'

interface CartItem {
  _id: string
  productId: string
  name: string
  price: number
  quantity: number
  imageClass: string
  brand: string
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Gerar ID único para sessão
  const getSessionId = () => {
    let sessionId = localStorage.getItem('lunar_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('lunar_session_id', sessionId)
    }
    return sessionId
  }

  // Carregar carrinho do localStorage na inicialização
  useEffect(() => {
    const savedCart = localStorage.getItem('lunar_cart')
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        console.log('Carregando carrinho do localStorage:', parsedCart)
        setCartItems(parsedCart)
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
        localStorage.removeItem('lunar_cart')
      }
    }
  }, [])

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    if (cartItems.length >= 0) { // Mudou de > 0 para >= 0 para salvar mesmo quando vazio
      localStorage.setItem('lunar_cart', JSON.stringify(cartItems))
      console.log('Salvando carrinho no localStorage:', cartItems)
    }
  }, [cartItems])

  const addToCart = async (product: any) => {
    try {
      console.log('Adicionando produto ao carrinho:', product)
      
      setCartItems(currentItems => {
        const existingItemIndex = currentItems.findIndex(item => item.productId === product._id)
        
        let updatedItems: CartItem[]
        
        if (existingItemIndex >= 0) {
          // Atualizar quantidade se já existe
          updatedItems = [...currentItems]
          updatedItems[existingItemIndex].quantity += 1
          console.log('Quantidade atualizada para produto existente')
        } else {
          // Adicionar novo item
          const newItem: CartItem = {
            _id: 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            productId: product._id,
            name: product.name,
            price: product.currentPrice,
            quantity: 1,
            imageClass: product.imageClass,
            brand: product.brand || 'Produto'
          }
          
          updatedItems = [...currentItems, newItem]
          console.log('Novo produto adicionado:', newItem)
        }
        
        // Salvar imediatamente no localStorage
        localStorage.setItem('lunar_cart', JSON.stringify(updatedItems))
        console.log('Carrinho atualizado:', updatedItems)
        
        return updatedItems
      })

      // Notificação que abre o carrinho
      toast.success(`${product.name} adicionado ao carrinho!`, {
        duration: 3000,
        onClick: () => setIsOpen(true),
        style: {
          background: 'rgba(138, 43, 226, 0.9)',
          color: '#fff',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          borderRadius: '12px',
          padding: '12px',
          cursor: 'pointer'
        }
      })

      // Abrir carrinho automaticamente após 1.5 segundos
      setTimeout(() => {
        setIsOpen(true)
      }, 1500)

      // Tentar salvar no MongoDB (não bloquear se falhar)
      try {
        await lumi.entities.cart_items.create({
          sessionId: getSessionId(),
          productId: product._id,
          quantity: 1,
          createdAt: new Date().toISOString()
        })
      } catch (error) {
        console.error('Erro ao salvar no MongoDB (não crítico):', error)
      }

    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error)
      toast.error('Erro ao adicionar produto ao carrinho')
    }
  }

  const removeFromCart = (productId: string) => {
    setCartItems(currentItems => {
      const updatedItems = currentItems.filter(item => item.productId !== productId)
      localStorage.setItem('lunar_cart', JSON.stringify(updatedItems))
      return updatedItems
    })
    toast.success('Produto removido do carrinho')
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    
    setCartItems(currentItems => {
      const updatedItems = currentItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity }
          : item
      )
      localStorage.setItem('lunar_cart', JSON.stringify(updatedItems))
      return updatedItems
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('lunar_cart')
    toast.success('Carrinho limpo')
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  return {
    cartItems,
    isOpen,
    setIsOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice
  }
}
