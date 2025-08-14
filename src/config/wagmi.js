import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Nightlio',
  projectId: 'nightlio-web3-demo', // You can use any string for demo
  chains: [baseSepolia, sepolia],
  ssr: false, // We're not using server-side rendering
});