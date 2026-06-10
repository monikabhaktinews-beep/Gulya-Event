if (!global.botDatabase) {
  global.botDatabase = {
    settings: {
      minWithdraw: 1.0,
      perReferReward: 0.2,
      poolSize: 300,
      payoutChannelId: "@PentaPower", 
      requiredChannels: [
        { id: "1", name: "Penta Hub", link: "https://t.me/example" },
        { id: "2", name: "Felix Backup", link: "https://t.me/example" }
      ],
      tasks: [
        { id: "task1", title: "Join Penta Craze Channel", reward: 0.10, link: "https://t.me/example" },
        { id: "task2", title: "Join YaarWin VIP Prediction", reward: 0.10, link: "https://t.me/example" }
      ]
    },
    users: {},
    payouts: []
  };
}

export const db = global.botDatabase;

export function getUser(userId) {
  if (!db.users[userId]) {
    db.users[userId] = {
      userId,
      username: "User_" + userId,
      balance: 0.0,
      referrals: 0,
      verified: false,
      channelsJoined: false,
      completedTasks: [],
      walletAddress: "",
      referredBy: null
    };
  }
  return db.users[userId];
}
