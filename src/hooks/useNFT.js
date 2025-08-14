import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { NIGHTLIO_ACHIEVEMENTS_ADDRESS, NIGHTLIO_ACHIEVEMENTS_ABI, ACHIEVEMENT_TYPES } from '../config/contracts';

export const useNFT = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending } = useWriteContract();
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if user has a specific achievement NFT
  const useHasAchievement = (achievementType) => {
    return useReadContract({
      address: NIGHTLIO_ACHIEVEMENTS_ADDRESS,
      abi: NIGHTLIO_ACHIEVEMENTS_ABI,
      functionName: 'hasAchievement',
      args: [address, ACHIEVEMENT_TYPES[achievementType]],
      enabled: !!address,
    });
  };

  // Get user's NFT balance
  const { data: nftBalance } = useReadContract({
    address: NIGHTLIO_ACHIEVEMENTS_ADDRESS,
    abi: NIGHTLIO_ACHIEVEMENTS_ABI,
    functionName: 'balanceOf',
    args: [address],
    enabled: !!address,
  });

  // Mint achievement NFT
  const mintAchievement = async (achievementType) => {
    if (!address) throw new Error('Wallet not connected');
    
    try {
      await writeContract({
        address: NIGHTLIO_ACHIEVEMENTS_ADDRESS,
        abi: NIGHTLIO_ACHIEVEMENTS_ABI,
        functionName: 'mintAchievement',
        args: [address, ACHIEVEMENT_TYPES[achievementType]],
      });
    } catch (error) {
      console.error('Minting failed:', error);
      throw error;
    }
  };

  return {
    // State
    address,
    nftBalance: nftBalance ? Number(nftBalance) : 0,
    
    // Actions
    mintAchievement,
    useHasAchievement,
    
    // Transaction state
    isPending,
    isConfirming,
    isConfirmed,
    hash,
  };
};