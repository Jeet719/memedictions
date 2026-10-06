import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Memedictions — Predict the meme",description:"Experimental memecoin predictions on Solana Devnet. Test points only; no real funds.",metadataBase:new URL("https://memedictions.fun"),openGraph:{title:"Memedictions — Predict the meme",description:"Memecoin predictions on Solana Devnet using test points with no monetary value.",url:"https://memedictions.fun"}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
