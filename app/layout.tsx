import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Memedictions — Predict the meme",description:"Prototipo de mercados de predicción de memecoins. Puntos ficticios, sin transacciones.",metadataBase:new URL("https://memedictions.fun"),openGraph:{title:"Memedictions — Predict the meme",description:"Demo de predicciones de memecoins en Solana",url:"https://memedictions.fun"}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="es"><body>{children}</body></html>}
