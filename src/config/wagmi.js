import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

const appUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV)
  ? 'http://localhost:5173'
  : 'https://nightlio.vercel.app';

const wcProjectId = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_WALLETCONNECT_PROJECT_ID)
  ? import.meta.env.VITE_WALLETCONNECT_PROJECT_ID
  : undefined;

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    walletConnect({ 
      projectId: wcProjectId,
      metadata: {
        name: 'Nightlio',
        description: 'Web3 Mood Tracking App',
        url: appUrl,
  icons: [`${appUrl}/logo.png`]
      }
    }),
  ],
  transports: {
    [sepolia.id]: http(),
  },
});
