
import React, { useState, useRef, useEffect } from 'react'
import { Search, ShoppingCart, User, LogOut, AlertCircle } from 'lucide-react'
import { useProducts } from '../hooks/useProducts'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../hooks/useAuth'

interface HeaderProps {
  onCartToggle: () => void
}

const Header: React.FC<HeaderProps> = ({ onCartToggle }) => {
  const { searchQuery, setSearchQuery, getSuggestions } = useProducts()
  const { getTotalItems } = useCart()
  const { user, isAuthenticated, loading, signIn, signOut, googleLoaded } = useAuth()
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (searchQuery.length > 1) {
      const newSuggestions = getSuggestions(searchQuery)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }, [searchQuery, getSuggestions])

  // Fechar sugestões ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSuggestionClick = (suggestion: any) => {
    setSearchQuery(suggestion.name)
    setShowSuggestions(false)
  }

  const handleUserClick = async () => {
    if (isAuthenticated) {
      setShowUserMenu(!showUserMenu)
    } else {
      if (!googleLoaded) {
        console.log('⏳ Aguardando Google Identity Services carregar...')
        return
      }
      
      try {
        await signIn()
      } catch (error) {
        console.error('❌ Erro no login via Header:', error)
      }
    }
  }

  const totalItems = getTotalItems()

  // Determinar o estado do botão de usuário
  const getUserButtonState = () => {
    if (loading) {
      return {
        icon: <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />,
        className: 'opacity-50 cursor-not-allowed',
        disabled: true
      }
    }
    
    if (!googleLoaded) {
      return {
        icon: <AlertCircle className="w-5 h-5" />,
        className: 'border border-yellow-500/50 text-yellow-400',
        disabled: true
      }
    }
    
    if (isAuthenticated) {
      return {
        icon: <User className="w-5 h-5" />,
        className: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800',
        disabled: false
      }
    }
    
    return {
      icon: <User className="w-5 h-5" />,
      className: 'border border-white/30 hover:border-purple-500 hover:text-purple-400',
      disabled: false
    }
  }

  const buttonState = getUserButtonState()

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-lg shadow-purple-500/30">
              <img 
                src="https://ai-lumi-prd.oss-us-east-1.aliyuncs.com/90/90c9f0d353dc779cc4ff43274f0352e4.webp" 
                alt="Lunar System Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://i.imgur.com/9tuPcvG.png";
                  target.onerror = () => {
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-purple-900 to-purple-600 flex items-center justify-center relative">
                          <div class="custom-icon">
                            <div class="moon"></div>
                            <div class="stars">
                              <div class="star star1"></div>
                              <div class="star star2"></div>
                              <div class="star star3"></div>
                            </div>
                          </div>
                        </div>
                      `;
                    }
                  }
                }}
              />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-purple-400">
                LUNAR SYSTEM
              </h1>
            </div>
          </div>

          {/* Busca */}
          <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar produtos..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            {/* Sugestões */}
            {showSuggestions && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion._id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center p-4 hover:bg-purple-600/20 cursor-pointer transition-colors"
                  >
                    <div className={`w-10 h-10 rounded-lg ${suggestion.imageClass} flex items-center justify-center text-white text-xs font-bold mr-3`}>
                      {suggestion.brand.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium">{suggestion.name}</div>
                      <div className="text-purple-400 text-sm">R$ {suggestion.currentPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onCartToggle}
              className="relative p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full hover:from-purple-700 hover:to-purple-800 transition-all transform hover:scale-105 shadow-lg"
            >
              <ShoppingCart className="w-5 h-5 text-white" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
            
            {/* Botão de usuário/login */}
            <div ref={userMenuRef} className="relative">
              <button 
                onClick={handleUserClick}
                disabled={buttonState.disabled}
                className={`p-3 rounded-full transition-all ${buttonState.className}`}
                title={
                  !googleLoaded ? 'Carregando sistema de login...' :
                  loading ? 'Processando login...' :
                  isAuthenticated ? 'Menu do usuário' : 'Fazer login com Google'
                }
              >
                {buttonState.icon}
              </button>

              {/* Menu do usuário */}
              {isAuthenticated && showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900/95 backdrop-blur-lg border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                        {user?.userName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">
                          {user?.userName || 'Usuário'}
                        </p>
                        <p className="text-gray-400 text-sm truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2">
                    <button
                      onClick={() => {
                        signOut()
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center space-x-3 p-3 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Indicador de status do Google (apenas durante desenvolvimento) */}
      {!googleLoaded && (
        <div className="bg-yellow-500/20 border-b border-yellow-500/30 px-4 py-2">
          <p className="text-yellow-300 text-sm text-center">
            ⏳ Carregando sistema de login do Google...
          </p>
        </div>
      )}
    </header>
  )
}

export default Header
