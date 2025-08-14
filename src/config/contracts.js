// Contract addresses and ABIs
export const NIGHTLIO_ACHIEVEMENTS_ADDRESS = '0xc9e1e06191a1e9bd049e609ccba34357e8909c5e';

// Simplified ABI - only the functions we need
export const NIGHTLIO_ACHIEVEMENTS_ABI = [
  // Read functions
  {
    "inputs": [{"name": "user", "type": "address"}, {"name": "achievementType", "type": "uint8"}],
    "name": "hasAchievement",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "user", "type": "address"}, {"name": "achievementType", "type": "uint8"}],
    "name": "getUserAchievementToken",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Write functions
  {
    "inputs": [{"name": "to", "type": "address"}, {"name": "achievementType", "type": "uint8"}],
    "name": "mintAchievement",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "user", "type": "address"},
      {"indexed": true, "name": "tokenId", "type": "uint256"},
      {"indexed": false, "name": "achievementType", "type": "uint8"}
    ],
    "name": "AchievementMinted",
    "type": "event"
  }
];

// Achievement type mapping
export const ACHIEVEMENT_TYPES = {
  FIRST_ENTRY: 0,
  WEEK_WARRIOR: 1,
  CONSISTENCY_KING: 2,
  DATA_LOVER: 3,
  MOOD_MASTER: 4
};