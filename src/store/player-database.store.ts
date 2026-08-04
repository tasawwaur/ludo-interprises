import { PlayerDetailedStats } from './player-stats.store';

// Cleaned list of 100 luxury usernames (emoji prefixes removed)
export const RAW_NAMES_LIST = [
  "𓆩𝐋𝐮𝐜𝐢𝐟𝐞𝐫𓆪", "꧁༺𝐀𝐧𝐠𝐞𝐥༻꧂", "『𝐒𝐭𝐚𝐫𝐍𝐢𝐜𝐤』", "么𝐏𝐚𝐫𝐢么", "꧁༒𝐒𝐡𝐢𝐯𝐚༒꧂",
  "『𝐐𝐮𝐞𝐞𝐧』", "𓆩𝐏𝐫𝐢𝐧𝐜𝐞𓆪", "꧁༺𝐑𝐨𝐬𝐞༻꧂", "『𝐃𝐫𝐚𝐠𝐨𝐧』", "么𝐁𝐞𝐥𝐥𝐚么",
  "𓆩𝐒𝐮𝐥𝐭𝐚𝐧𓆪", "꧁༒𝐒𝐨𝐧𝐚༒꧂", "『𝐓𝐡𝐨𝐫』", "么𝐌𝐚𝐡𝐢么", "𓆩𝐑𝐞𝐚𝐩𝐞𝐫𓆪",
  "『𝐍𝐨𝐨𝐫』", "꧁༺𝐅𝐚𝐥𝐜𝐨𝐧༻꧂", "𓆩𝐊𝐢𝐚𝐫𝐚𓆪", "『𝐋𝐢𝐨𝐧』", "꧁༒𝐙𝐚𝐫𝐚༒꧂",
  "𓆩𝐁𝐥𝐚𝐳𝐞𓆪", "『𝐀𝐧𝐚𝐲𝐚』", "꧁༺𝐄𝐦𝐩𝐞𝐫𝐨𝐫༻꧂", "么𝐏𝐢𝐡𝐮么", "『𝐖𝐚𝐫𝐫𝐢𝐨𝐫』",
  "𓆩𝐀𝐥𝐢𝐧𝐚𓆪", "꧁༒𝐍𝐨𝐢𝐫༒꧂", "『𝐑𝐮𝐡𝐢』", "𓆩𝐕𝐞𝐧𝐨𝐦𓆪", "꧁༺𝐒𝐢𝐦𝐫𝐚𝐧༻꧂",
  "『𝐑𝐨𝐲𝐚𝐥』", "么𝐇𝐞𝐞𝐫么", "𓆩𝐀𝐥𝐩𝐡𝐚𓆪", "『𝐀𝐲𝐞𝐬𝐡𝐚』", "꧁༒𝐊𝐧𝐢𝐠𝐡𝐭༒꧂",
  "𓆩𝐌𝐮𝐬𝐤𝐚𝐧𓆪", "『𝐎𝐝𝐢𝐧』", "꧁༺𝐒𝐚𝐧𝐚༻꧂", "𓆩𝐙𝐞𝐮𝐬𓆪", "『𝐉𝐚𝐧𝐧𝐚𝐭』",
  "꧁༒𝐖𝐨𝐥𝐟༒꧂", "么𝐊𝐨𝐦𝐚𝐥么", "『𝐈𝐧𝐟𝐞𝐫𝐧𝐨』", "𓆩𝐍𝐚𝐢𝐧𝐚𓆪", "꧁༺𝐆𝐡𝐨𝐬𝐭༻꧂",
  "『𝐌𝐞𝐡𝐚𝐤』", "𓆩𝐒𝐭𝐨𝐫𝐦𓆪", "꧁༒𝐀𝐟𝐫𝐞𝐞𝐧༒꧂", "『𝐋𝐞𝐠𝐞𝐧𝐝』", "𓆩𝐏𝐫𝐢𝐧𝐜𝐞𝐬𝐬𓆪",
  "꧁༺𝐃𝐞𝐯𝐢𝐥༻꧂", "『𝐃𝐚𝐢𝐬𝐲』", "𓆩𝐄𝐚𝐠𝐥𝐞𓆪", "꧁༒𝐏𝐚𝐥𝐚𝐤༒꧂", "『𝐁𝐨𝐬𝐬』",
  "𓆩𝐑𝐨𝐬𝐡𝐧𝐢𓆪", "꧁༺𝐃𝐚𝐫𝐤༻꧂", "『𝐊𝐡𝐮𝐬𝐡𝐢』", "𓆩𝐀𝐜𝐞𓆪", "꧁༒𝐃𝐢𝐯𝐲𝐚༒꧂",
  "『𝐇𝐲𝐝𝐫𝐚』", "𓆩𝐀𝐫𝐨𝐡𝐢𓆪", "꧁༺𝐊𝐢𝐧𝐠༻꧂", "『𝐍𝐢𝐡𝐚𝐫𝐢𝐤𝐚』", "𓆩𝐓𝐢𝐭𝐚𝐧𓆪",
  "꧁༒𝐏𝐫𝐢𝐲𝐚༒꧂", "『𝐒𝐚𝐯𝐚𝐠𝐞』", "𓆩𝐓𝐚𝐦𝐚𝐧𝐧𝐚𓆪", "꧁༺𝐏𝐡𝐚𝐧𝐭𝐨𝐦༻꧂", "『𝐈𝐬𝐡𝐚』",
  "𓆩𝐍𝐨𝐯𝐚𓆪", "꧁༒𝐀𝐝𝐢𝐭𝐢༒꧂", "『𝐇𝐮𝐧𝐭𝐞𝐫』", "𓆩𝐑𝐢𝐲𝐚𓆪", "꧁༺𝐂𝐫𝐨𝐰𝐧༻꧂",
  "『𝐍𝐢𝐝𝐡𝐢』", "𓆩𝐀𝐩𝐨𝐥𝐥𝐨𓆪", "꧁༒𝐀𝐥𝐢𝐬𝐡𝐚༒꧂", "『𝐀𝐫𝐞𝐬』", "𓆩𝐒𝐨𝐧𝐚𝐦𓆪",
  "꧁༺𝐁𝐞𝐚𝐬𝐭༻꧂", "『𝐊𝐚𝐯𝐲𝐚』", "𓆩𝐋𝐮𝐱𝐮𝐫𝐲𓆪", "꧁༒𝐍𝐞𝐡𝐚༒꧂", "『𝐄𝐥𝐢𝐭𝐞』",
  "𓆩𝐓𝐚𝐧𝐢𝐚𓆪", "꧁༺𝐅𝐢𝐫𝐞༻꧂", "『𝐋𝐢𝐥𝐲』", "𓆩𝐃𝐨𝐦𝐢𝐧𝐚𝐭𝐨𝐫𓆪", "꧁༒𝐌𝐚𝐡𝐢𝐫𝐚༒꧂",
  "『𝐍𝐞𝐱𝐮𝐬』", "𓆩𝐏𝐫𝐞𝐞𝐭𝐢𓆪", "꧁༺𝐂𝐡𝐚𝐨𝐬༻꧂", "『𝐑𝐚𝐛𝐢𝐚』", "𓆩𝐇𝐚𝐰𝐤𓆪",
  "꧁༒𝐀𝐦𝐚𝐲𝐚༒꧂", "『𝐌𝐚𝐟𝐢𝐚』", "𓆩𝐀𝐯𝐧𝐢𓆪", "꧁༺𝐕𝐈𝐏༻꧂", "『𝐃𝐨𝐥𝐥』"
];

// Helper to determine if the name is traditionally female
const FEMALE_KEYWORDS = [
  "angel", "pari", "queen", "rose", "bella", "sona", "mahi", "noor", "kiara", "zara", "anaya",
  "pihu", "alina", "ruhi", "simran", "heer", "ayesha", "muskan", "sana", "jannat", "komal",
  "naina", "mehak", "afreen", "princess", "daisy", "palak", "roshni", "khushi", "divya", "arohi",
  "niharika", "priya", "tamanna", "isha", "aditi", "riya", "nidhi", "alisha", "sonam", "kavya",
  "neha", "tania", "lily", "mahira", "preeti", "rabia", "amaya", "avni", "doll"
];

// Deterministic pool of high-quality avatar links/placeholders
const MALE_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"
];

const FEMALE_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&auto=format&fit=crop&q=80"
];

const COUNTRIES = [
  { name: "INDIA", flag: "🇮🇳" },
  { name: "PAKISTAN", flag: "🇵🇰" },
  { name: "BANGLADESH", flag: "🇧🇩" },
  { name: "SAUDI ARABIA", flag: "🇸🇦" },
  { name: "UNITED ARAB EMIRATES", flag: "🇦🇪" },
  { name: "UNITED KINGDOM", flag: "🇬🇧" },
  { name: "UNITED STATES", flag: "🇺🇸" }
];

const FRAMES = [
  "frame_luxury_1", "frame_luxury_2", "frame_neon_glow", "frame_dragon", "frame_galaxy",
  "frame_vip", "frame_default", "frame_gold", "frame_sapphire", "frame_emerald", "frame_ruby"
];

// Generates a fully logical dataset for all 100 profiles deterministically
export const generatePlayerDatabase = (): PlayerDetailedStats[] => {
  return RAW_NAMES_LIST.map((rawName, i) => {
    // 1. Determine Gender
    const lowerName = rawName.toLowerCase();
    const isFemale = FEMALE_KEYWORDS.some(keyword => lowerName.includes(keyword));
    const gender = isFemale ? "female" : "male";

    // 2. Select avatar deterministically
    const avatarList = isFemale ? FEMALE_AVATARS : MALE_AVATARS;
    const avatarUrl = avatarList[i % avatarList.length];

    // 3. Unique ID
    const playerId = `PVZV${2000 + i * 79}`;

    // 4. Country & flag
    const countryObj = COUNTRIES[i % COUNTRIES.length];

    // 5. Level distribution (10 highly active Level 150+, 20 Level 100+, 30 Level 50+, 40 beginners)
    let level = 10;
    if (i < 10) level = 160 + (i * 3) + (i % 3);
    else if (i < 30) level = 100 + ((i - 10) * 2) + (i % 4);
    else if (i < 60) level = 50 + ((i - 30) * 1) + (i % 3);
    else level = 4 + ((i - 60) * 1) + (i % 5);

    // 6. XP
    const xpRequired = level * 150 + 100;
    const xp = Math.floor(xpRequired * 0.45);

    // 7. Calculate logical economy stats
    const currentCoins = Math.max(2000, level * 7500 + (i % 7) * 25000);
    const totalCoinsEarned = currentCoins * 3 + Math.floor(level * 40000);
    const currentDiamonds = level * 10 + (i % 6) * 45;
    const totalDiamondsEarned = currentDiamonds * 2 + 50;

    // 8. Matches Played, Won & Streaks (Mathematical consistency)
    const matchesPlayed = level * 12 + (i % 4) * 35 + 20;
    const winRate = 44 + (i % 17); // 44% - 60%
    const matchesWon = Math.floor(matchesPlayed * (winRate / 100));
    const matchesLost = matchesPlayed - matchesWon;
    
    const currentWinStreak = i % 8 === 0 ? 3 : i % 15 === 0 ? 6 : 0;
    const highestWinStreak = Math.max(currentWinStreak, level > 120 ? 12 : level > 60 ? 8 : 4);

    // 9. Match time
    const totalMatchDurationSeconds = matchesPlayed * (300 + (i % 4) * 80);

    // 10. Game modes
    const p1v1 = Math.floor(matchesPlayed * 0.45);
    const w1v1 = Math.floor(p1v1 * (winRate / 100));
    const l1v1 = p1v1 - w1v1;

    const p2v2 = Math.floor(matchesPlayed * 0.3);
    const w2v2 = Math.floor(p2v2 * (winRate / 100));
    const l2v2 = p2v2 - w2v2;

    const p4p = Math.floor(matchesPlayed * 0.15);
    const w4p = Math.floor(p4p * (winRate / 100));
    const l4p = p4p - w4p;

    const pPriv = Math.floor(matchesPlayed * 0.05);
    const wPriv = Math.floor(pPriv * (winRate / 100));

    const pTour = Math.max(0, matchesPlayed - p1v1 - p2v2 - p4p - pPriv);
    const wTour = Math.floor(pTour * (winRate / 100));

    const modeStats = {
      "1VS1": { played: p1v1, wins: w1v1, losses: l1v1 },
      "2VS2": { played: p2v2, wins: w2v2, losses: l2v2 },
      "4PLAYER": { played: p4p, wins: w4p, losses: l4p },
      "PRIVATE": { played: pPriv, wins: wPriv },
      "TOURNAMENT": { played: pTour, wins: wTour }
    };

    // 11. Gameplay actions proportional to wins/played
    const killCount = matchesWon * 4 + matchesLost * 1;
    const hardKillCount = Math.floor(killCount * 0.15);
    const revengeKillCount = Math.floor(killCount * 0.22);
    const doubleKill = Math.floor(matchesWon * 0.5);
    const tripleKill = Math.floor(matchesWon * 0.12);
    const quadraKill = Math.floor(matchesWon * 0.02);

    const tokensCompleted = matchesWon * 3 + Math.floor(matchesLost * 0.4);
    const tokensLost = matchesWon * 0.6 + matchesLost * 3;

    const totalDiceRolls = matchesPlayed * 32;
    const totalSixes = Math.floor(totalDiceRolls / 6);
    const consecutiveSixes = level > 90 ? 3 : 2;
    const safeZoneVisits = matchesPlayed * 4;
    const luckyRolls = matchesWon * 3;
    const unluckyRolls = matchesLost * 2;

    // 12. Signature Title and League Tiers
    const points = Math.max(0, matchesWon * 12 - matchesLost * 6);
    let currentLeague = "Bronze";
    if (points >= 25000) currentLeague = "Immortal";
    else if (points >= 16000) currentLeague = "Titan";
    else if (points >= 11000) currentLeague = "Legend";
    else if (points >= 7000) currentLeague = "Emperor";
    else if (points >= 4000) currentLeague = "Grand Master";
    else if (points >= 2000) currentLeague = "Master";
    else if (points >= 1000) currentLeague = "Diamond";
    else if (points >= 500) currentLeague = "Platinum";
    else if (points >= 250) currentLeague = "Gold";
    else if (points >= 100) currentLeague = "Silver";

    const cleanLg = currentLeague.toUpperCase();
    let signature = "ROOKIE - I";
    if (cleanLg.includes("IMMORTAL")) signature = "IMMORTAL - I";
    else if (cleanLg.includes("TITAN")) signature = "TITAN - I";
    else if (cleanLg.includes("LEGEND")) signature = "LEGEND - I";
    else if (cleanLg.includes("EMPEROR")) signature = "EMPEROR - I";
    else if (cleanLg.includes("GRAND")) signature = "GRAND MASTER - I";
    else if (cleanLg.includes("MASTER")) signature = "MASTER - I";
    else if (cleanLg.includes("DIAMOND")) signature = "DIAMOND - I";
    else if (cleanLg.includes("PLATINUM")) signature = "PLATINUM - I";
    else if (cleanLg.includes("GOLD")) signature = "GOLDEN - I";
    else if (cleanLg.includes("SILVER")) signature = "SILVER - I";

    // 13. Achievements unlocked
    const achievements: string[] = [];
    if (matchesWon >= 1) achievements.push("First Win");
    if (matchesWon >= 100) achievements.push("100 Wins");
    if (matchesWon >= 500) achievements.push("500 Wins");
    if (matchesWon >= 1000) achievements.push("1000 Wins");
    if (matchesWon >= 5000) achievements.push("5000 Wins");
    
    if (killCount >= 1) achievements.push("First Kill");
    if (killCount >= 100) achievements.push("100 Kills");
    if (killCount >= 1000) achievements.push("1000 Kills");
    if (killCount >= 5000) achievements.push("Legend Killer");
    
    if (highestWinStreak >= 10) achievements.push("Champion");
    if (level >= 100) achievements.push("Emperor");
    if (level >= 150) achievements.push("Titan");
    if (level >= 200) achievements.push("Immortal");

    // 14. Equippable Frame matches level rarity -> Set to frame_vip for all bot profiles to show VIP Pass!
    const equippedFrame = "frame_vip";

    return {
      playerId,
      username: rawName,
      avatarUrl,
      equippedFrame,
      country: countryObj.name,
      countryFlag: countryObj.flag,
      xp,
      level,
      nextLevelXp: xpRequired,
      currentCoins,
      currentDiamonds,
      totalCoinsEarned,
      totalDiamondsEarned,
      totalRewardsClaimed: level + 5,
      dailyLoginStreak: (i % 6) + 1,
      matchesPlayed,
      matchesWon,
      matchesLost,
      drawMatches: 0,
      currentWinStreak,
      highestWinStreak,
      totalMatchDurationSeconds,
      modeStats,
      killCount,
      hardKillCount,
      revengeKillCount,
      doubleKill,
      tripleKill,
      quadraKill,
      tokensCompleted,
      tokensLost,
      totalDiceRolls,
      totalSixes,
      consecutiveSixes,
      safeZoneVisits,
      luckyRolls,
      unluckyRolls,
      totalEarning: totalCoinsEarned > 1000000 ? `${(totalCoinsEarned/1000000).toFixed(1)} M` : `${(totalCoinsEarned/1000).toFixed(1)} K`,
      teamWins: w2v2,
      twoPlayerWins: w1v1,
      fourPlayerWins: w4p,
      titanBadgeCount: Math.floor(level / 4),
      achievements,
      currentLeague,
      signature,
      createdDate: new Date(Date.now() - (matchesPlayed * 2 * 3600 * 1000)).toISOString(),
      lastLogin: new Date(Date.now() - (i % 5 === 0 ? 0 : (i % 24) * 3600 * 1000)).toISOString(),
      hasVipPass: true, // ✅ VIP Pass active for all 100 database players
    };
  });
};

export const GLOBAL_PLAYER_DATABASE = generatePlayerDatabase();
