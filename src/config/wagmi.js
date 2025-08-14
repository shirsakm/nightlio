import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: '2f5a2b1c8d3e4f5a6b7c8d9e0f1a2b3c',
      metadata: {
        name: 'Nightlio',
        description: 'Web3 Mood Tracking App',
        url: 'https://nightlio.vercel.app',
        icons: ['https://nightlio.vercel.app/favicon.ico']
      }
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
