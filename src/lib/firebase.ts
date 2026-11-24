import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseApp = initializeApp({
  apiKey: 'AIzaSyANTh06JyC0GofoqsBgkVFYMx1JNmCOIj8',
  authDomain: 'snpdm-senac.firebaseapp.com',
  projectId: 'snpdm-senac',
  storageBucket: 'snpdm-senac.firebasestorage.app',
  messagingSenderId: '187330024094',
  appId: '1:187330024094:web:4d94d0b75fea18e2c8218f',
  measurementId: 'G-H5YTB9GVPC',
})
export const auth = getAuth(firebaseApp)
export const db = getFirestore(firebaseApp)

export function errorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code
  const messages: Record<string, string> = {
    'auth/configuration-not-found':
      'O acesso ainda precisa ser configurado pelo responsável pelo aplicativo.',
    'auth/invalid-api-key':
      'A configuração de acesso precisa ser revisada pelo responsável pelo aplicativo.',
    'auth/invalid-credential':
      'E-mail ou senha incorretos. Confira e tente novamente.',
    'auth/email-already-in-use':
      'Este e-mail já tem uma conta. Entre ou recupere sua senha.',
    'auth/weak-password': 'Use uma senha com pelo menos 8 caracteres.',
    'auth/invalid-email': 'Informe um e-mail válido.',
    'auth/network-request-failed':
      'Não foi possível conectar. Confira sua internet.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos.',
    'auth/operation-not-allowed':
      'Esta forma de acesso ainda precisa ser habilitada pelo responsável pelo aplicativo.',
    'auth/unauthorized-domain':
      'Este endereço precisa ser autorizado no Firebase Authentication.',
    'auth/popup-closed-by-user':
      'A janela de acesso foi fechada. Você pode tentar de novo.',
    'permission-denied':
      'O acesso aos dados não foi liberado. Verifique as regras do Firebase com o responsável.',
    unavailable:
      'O serviço está indisponível. Confira sua conexão e tente novamente.',
  }
  return (
    (code && messages[code]) ||
    (error instanceof Error && !code
      ? error.message
      : 'Não foi possível concluir. Tente novamente.')
  )
}
