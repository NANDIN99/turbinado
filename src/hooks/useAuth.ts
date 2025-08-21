
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

// Client ID configurado para funcionar com o domínio atual
const GOOGLE_CLIENT_ID = "600748991739-6dbkmvdqfc2ahrsvhninli7i7f768s90.apps.googleusercontent.com"

interface GoogleUser {
  userId: string
  email: string
  userName: string
  avatar?: string
}

// Tipos para Google Identity Services
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          prompt: (callback?: (notification: any) => void) => void
          renderButton: (parent: HTMLElement, options: any) => void
          disableAutoSelect: () => void
          cancel: () => void
        }
      }
    }
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [googleLoaded, setGoogleLoaded] = useState(false)

  // Carregar estado salvo do localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('lunar_google_user')
    const savedAuth = localStorage.getItem('lunar_google_auth')
    
    if (savedUser && savedAuth === 'true') {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        setIsAuthenticated(true)
        console.log('✅ Usuário carregado do localStorage:', userData.userName)
      } catch (error) {
        console.error('❌ Erro ao carregar usuário salvo:', error)
        localStorage.removeItem('lunar_google_user')
        localStorage.removeItem('lunar_google_auth')
      }
    }
  }, [])

  // Carregar Google Identity Services
  useEffect(() => {
    const loadGoogleScript = () => {
      // Verificar se já está carregado
      if (window.google?.accounts?.id) {
        console.log('✅ Google Identity Services já carregado')
        setGoogleLoaded(true)
        initializeGoogle()
        return
      }

      // Verificar se script já existe
      const existingScript = document.querySelector('script[src*="accounts.google.com/gsi/client"]')
      if (existingScript) {
        console.log('⏳ Aguardando carregamento do Google Identity Services...')
        existingScript.addEventListener('load', () => {
          setGoogleLoaded(true)
          initializeGoogle()
        })
        return
      }

      // Criar e carregar script
      console.log('📦 Carregando Google Identity Services...')
      const script = document.createElement('script')
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      
      script.onload = () => {
        console.log('✅ Google Identity Services carregado com sucesso')
        setGoogleLoaded(true)
        initializeGoogle()
      }
      
      script.onerror = () => {
        console.error('❌ Erro ao carregar Google Identity Services')
        toast.error('Erro ao carregar sistema de login do Google')
      }
      
      document.head.appendChild(script)
    }

    loadGoogleScript()
  }, [])

  // Inicializar Google Identity Services com configuração corrigida
  const initializeGoogle = () => {
    if (!window.google?.accounts?.id) {
      console.error('❌ Google Identity Services não está disponível')
      return
    }

    try {
      // Configuração corrigida para evitar origin_mismatch
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
        use_fedcm_for_prompt: false,
        // Configurações adicionais para compatibilidade
        itp_support: true,
        state_cookie_domain: window.location.hostname
      })
      console.log('✅ Google Identity Services inicializado com configuração corrigida')
    } catch (error) {
      console.error('❌ Erro ao inicializar Google Identity Services:', error)
    }
  }

  // Processar resposta do Google
  const handleCredentialResponse = (response: any) => {
    try {
      console.log('📨 Resposta recebida do Google')
      
      if (!response.credential) {
        throw new Error('Nenhuma credencial recebida do Google')
      }

      // Decodificar JWT token
      const credential = response.credential
      const payload = JSON.parse(atob(credential.split('.')[1]))
      
      console.log('🔓 Dados decodificados do Google')

      // Criar objeto do usuário
      const userData: GoogleUser = {
        userId: payload.sub,
        email: payload.email,
        userName: payload.name || payload.given_name || 'Usuário',
        avatar: payload.picture
      }

      console.log('👤 Usuário processado:', userData.userName)

      // Salvar no estado e localStorage
      setUser(userData)
      setIsAuthenticated(true)
      localStorage.setItem('lunar_google_user', JSON.stringify(userData))
      localStorage.setItem('lunar_google_auth', 'true')

      console.log('🎉 Login realizado com sucesso!')

      toast.success(`Bem-vindo, ${userData.userName}! 🎉`, {
        duration: 4000,
        style: {
          background: 'rgba(138, 43, 226, 0.9)',
          color: '#fff',
          border: '1px solid rgba(138, 43, 226, 0.3)',
          borderRadius: '12px'
        }
      })

      setLoading(false)
    } catch (error) {
      console.error('❌ Erro ao processar resposta do Google:', error)
      setLoading(false)
      toast.error('Erro ao processar dados do login. Tente novamente.')
    }
  }

  // Função de login corrigida
  const signIn = async () => {
    if (!googleLoaded || !window.google?.accounts?.id) {
      console.error('❌ Google Identity Services não está carregado')
      toast.error('Sistema de login ainda não está pronto. Aguarde um momento.')
      return
    }

    try {
      setLoading(true)
      console.log('🚀 Iniciando login com Google...')

      // Cancelar qualquer prompt anterior
      window.google.accounts.id.cancel()

      // Método principal: usar prompt
      window.google.accounts.id.prompt((notification) => {
        console.log('📋 Notificação do prompt:', notification)
        
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('⚠️ Prompt não exibido, usando método de botão...')
          
          // Método alternativo: criar botão temporário
          const tempContainer = document.createElement('div')
          tempContainer.style.position = 'fixed'
          tempContainer.style.top = '50%'
          tempContainer.style.left = '50%'
          tempContainer.style.transform = 'translate(-50%, -50%)'
          tempContainer.style.zIndex = '10000'
          tempContainer.style.background = 'white'
          tempContainer.style.padding = '20px'
          tempContainer.style.borderRadius = '12px'
          tempContainer.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
          
          // Overlay
          const overlay = document.createElement('div')
          overlay.style.position = 'fixed'
          overlay.style.inset = '0'
          overlay.style.background = 'rgba(0,0,0,0.5)'
          overlay.style.zIndex = '9999'
          overlay.onclick = () => {
            document.body.removeChild(overlay)
            document.body.removeChild(tempContainer)
            setLoading(false)
          }
          
          document.body.appendChild(overlay)
          document.body.appendChild(tempContainer)

          try {
            window.google.accounts.id.renderButton(tempContainer, {
              theme: 'outline',
              size: 'large',
              type: 'standard',
              shape: 'rectangular',
              text: 'signin_with',
              logo_alignment: 'left',
              width: 300
            })

            // Adicionar título
            const title = document.createElement('p')
            title.textContent = 'Clique no botão abaixo para fazer login:'
            title.style.marginBottom = '15px'
            title.style.textAlign = 'center'
            title.style.color = '#333'
            tempContainer.insertBefore(title, tempContainer.firstChild)

            // Limpar após login bem-sucedido
            const originalCallback = handleCredentialResponse
            const wrappedCallback = (response: any) => {
              document.body.removeChild(overlay)
              document.body.removeChild(tempContainer)
              originalCallback(response)
            }
            
            // Atualizar callback temporariamente
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: wrappedCallback,
              auto_select: false,
              cancel_on_tap_outside: true,
              context: 'signin',
              ux_mode: 'popup',
              use_fedcm_for_prompt: false,
              itp_support: true,
              state_cookie_domain: window.location.hostname
            })

          } catch (error) {
            console.error('❌ Erro no método de botão:', error)
            document.body.removeChild(overlay)
            document.body.removeChild(tempContainer)
            setLoading(false)
            toast.error('Erro ao iniciar login. Tente novamente.')
          }
        }
      })

    } catch (error) {
      console.error('❌ Erro no login:', error)
      setLoading(false)
      toast.error('Erro ao iniciar login. Tente novamente.')
      throw error
    }
  }

  // Função de logout
  const signOut = () => {
    console.log('👋 Realizando logout...')
    
    // Limpar estado
    setUser(null)
    setIsAuthenticated(false)
    
    // Limpar localStorage
    localStorage.removeItem('lunar_google_user')
    localStorage.removeItem('lunar_google_auth')

    // Cancelar qualquer sessão do Google
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect()
    }
    
    toast.success('Logout realizado com sucesso! 👋', {
      style: {
        background: 'rgba(138, 43, 226, 0.9)',
        color: '#fff',
        border: '1px solid rgba(138, 43, 226, 0.3)',
        borderRadius: '12px'
      }
    })
  }

  return { 
    user, 
    isAuthenticated, 
    loading, 
    signIn, 
    signOut,
    googleLoaded
  }
}
