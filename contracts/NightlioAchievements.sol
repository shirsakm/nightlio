// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NightlioAchievements is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 private _nextTokenId = 1;
    
    // Achievement types
    enum AchievementType {
        FIRST_ENTRY,      // 0
        WEEK_WARRIOR,     // 1  
        CONSISTENCY_KING, // 2
        DATA_LOVER,       // 3
        MOOD_MASTER       // 4
    }
    
    // Mapping from token ID to achievement type
    mapping(uint256 => AchievementType) public tokenAchievements;
    
    // Mapping from user address to achievement type to token ID (prevent duplicates)
    mapping(address => mapping(AchievementType => uint256)) public userAchievements;
    
    // Achievement metadata
    struct Achievement {
        string name;
        string description;
        string image;
        string rarity;
    }
    
    mapping(AchievementType => Achievement) public achievements;
    
    event AchievementMinted(address indexed user, uint256 indexed tokenId, AchievementType achievementType);
    
    constructor() ERC721("Nightlio Achievements", "NIGHTLIO") Ownable(msg.sender) {
        // Initialize achievement metadata
        achievements[AchievementType.FIRST_ENTRY] = Achievement(
            "First Entry",
            "Log your first mood entry",
            "https://your-domain.com/nft/first-entry.json",
            "Common"
        );
        
        achievements[AchievementType.WEEK_WARRIOR] = Achievement(
            "Week Warrior", 
            "Maintain a 7-day streak",
            "https://your-domain.com/nft/week-warrior.json",
            "Uncommon"
        );
        
        achievements[AchievementType.CONSISTENCY_KING] = Achievement(
            "Consistency King",
            "Maintain a 30-day streak",
            "https://your-domain.com/nft/consistency-king.json", 
            "Rare"
        );
        
        achievements[AchievementType.DATA_LOVER] = Achievement(
            "Data Lover",
            "View statistics 10 times",
            "https://your-domain.com/nft/data-lover.json",
            "Uncommon"
        );
        
        achievements[AchievementType.MOOD_MASTER] = Achievement(
            "Mood Master",
            "Log 100 total entries", 
            "https://your-domain.com/nft/mood-master.json",
            "Legendary"
        );
    }
    
    function mintAchievement(address to, AchievementType achievementType) public onlyOwner {
        require(userAchievements[to][achievementType] == 0, "Achievement already minted for this user");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        tokenAchievements[tokenId] = achievementType;
        userAchievements[to][achievementType] = tokenId;
        
        emit AchievementMinted(to, tokenId, achievementType);
    }
    
    function hasAchievement(address user, AchievementType achievementType) public view returns (bool) {
        return userAchievements[user][achievementType] != 0;
    }
    
    function getUserAchievementToken(address user, AchievementType achievementType) public view returns (uint256) {
        return userAchievements[user][achievementType];
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        AchievementType achievementType = tokenAchievements[tokenId];
        Achievement memory achievement = achievements[achievementType];
        
        // Return metadata JSON
        return string(abi.encodePacked(
            'data:application/json;base64,',
            _base64Encode(bytes(string(abi.encodePacked(
                '{"name":"', achievement.name, '",',
                '"description":"', achievement.description, '",',
                '"image":"', achievement.image, '",',
                '"attributes":[',
                    '{"trait_type":"Rarity","value":"', achievement.rarity, '"},',
                    '{"trait_type":"Achievement Type","value":"', uint256(achievementType).toString(), '"}',
                ']}'
            ))))
        ));
    }
    
    // Base64 encoding function (simplified)
    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        if (data.length == 0) return "";
        
        string memory table = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        string memory result = new string(4 * ((data.length + 2) / 3));
        
        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)
            
            for {
                let dataPtr := data
                let endPtr := add(dataPtr, mload(data))
            } lt(dataPtr, endPtr) {
                
            } {
                dataPtr := add(dataPtr, 3)
                let input := mload(dataPtr)
                
                mstore8(resultPtr, mload(add(tablePtr, and(shr(18, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(12, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(shr(6, input), 0x3F))))
                resultPtr := add(resultPtr, 1)
                mstore8(resultPtr, mload(add(tablePtr, and(input, 0x3F))))
                resultPtr := add(resultPtr, 1)
            }
            
            switch mod(mload(data), 3)
            case 1 {
                mstore8(sub(resultPtr, 1), 0x3d)
                mstore8(sub(resultPtr, 2), 0x3d)
            }
            case 2 {
                mstore8(sub(resultPtr, 1), 0x3d)
            }
        }
        
        return result;
    }
}