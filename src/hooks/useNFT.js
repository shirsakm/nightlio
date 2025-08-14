import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { NIGHTLIO_ACHIEVEMENTS_ADDRESS, NIGHTLIO_ACHIEVEMENTS_ABI, ACHIEVEMENT_TYPES, getAchievementTypeNumber } from '../config/contracts';

export const useNFT = () => {
  const { address } = useAccount();
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  
  // console.log('useNFT hook state:', { address, hash, isPending, writeError });
  
  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Check if user has a specific achievement NFT
  const useHasAchievement = (achievementType) => {
    const typeNumber = getAchievementTypeNumber(achievementType);
    return useReadContract({
      address: NIGHTLIO_ACHIEVEMENTS_ADDRESS,
      abi: NIGHTLIO_ACHIEVEMENTS_ABI,
      functionName: 'hasAchievement',
      args: [address, typeNumber],
      enabled: !!address && typeNumber !== undefined,
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
    console.log('mintAchievement called with:', achievementType);
    console.log('User address:', address);
    
    const typeNumber = getAchievementTypeNumber(achievementType);
    console.log('Achievement type number:', typeNumber);
    
    if (!address) throw new Error('Wallet not connected');
    if (typeNumber === undefined) throw new Error('Invalid achievement type');
    
    console.log('Calling writeContract...');
    console.log('Contract address:', NIGHTLIO_ACHIEVEMENTS_ADDRESS);
    console.log('Function args:', [address, typeNumber]);
    
    try {
      // Try the async approach
      const result = await writeContract({
        address: NIGHTLIO_ACHIEVEMENTS_ADDRESS,
        abi: NIGHTLIO_ACHIEVEMENTS_ABI,
        functionName: 'mintAchievement',
        args: [address, typeNumber],
      });
      
      console.log('writeContract result:', result);
      return result;
    } catch (error) {
      console.error('writeContract error:', error);
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
    writeError,
  };
};