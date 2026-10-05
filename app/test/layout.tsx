import TestWalletProvider from "./test-wallet-provider";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TestWalletProvider>
      {children}
    </TestWalletProvider>
  );
}
