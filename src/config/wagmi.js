import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "Nightlio",
  projectId: "nightlio-web3-demo", // You can use any string for demo
  chains: [sepolia], // Focus on Ethereum Sepolia only
  ssr: false, // We're not using server-side rendering
});
