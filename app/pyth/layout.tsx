import TestWalletProvider from "../test/test-wallet-provider";

export default function PythLayout({ children }: { children: React.ReactNode }) {
  return <TestWalletProvider>{children}</TestWalletProvider>;
}
