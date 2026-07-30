const generateNumericUID = (seedStr) => {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const num = Math.abs(hash % 89999999) + 10000000;
  return `${num}`;
};

const commonSeeds = [
  // Usernames
  "TASAVVUR",
  "Tasavvur Malik",
  "Tech Help",
  "Trlife",
  "Aman",
  "Govind",
  "Roxana",
  "Guest4296",
  "Ludo King",
  // Emails
  "trlife0786@gmail.com",
  "tasavvur.malik@gmail.com",
  // Facebook IDs / Custom IDs
  "fb_1745824376557788",
  "goog_trlife",
  "guest@ludostar.com",
  "1745824376557788",
  // Simulated / custom names
  "malik",
  "sonu",
  "Sonu Malik",
  "Aman [FB]",
  "Govind [FB]",
  "Roxana [FB]",
];

console.log("Searching seeds...");
for (const seed of commonSeeds) {
  const uid = generateNumericUID(seed);
  console.log(`Seed: "${seed}" => UID: LUDO-${uid}`);
  if (uid === "29060242") {
    console.log("MATCH FOUND!!!", seed);
  }
}
