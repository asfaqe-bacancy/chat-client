// pages/_app.tsx
import type { AppProps } from 'next/app'
import { SocketProvider } from '../context/SocketContext'
import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SocketProvider>
      <Component {...pageProps} />
    </SocketProvider>
  )
}

export default MyApp