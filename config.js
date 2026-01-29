module.exports = {
    // World settings
    GAME_RADIUS: 2000,           // Total world radius
    PLAY_RADIUS: 1950,           // Playable area radius (98% of game radius)
    SECTOR_SIZE: 300,            // Size of each sector
    SECTOR_COUNT: 14,            // Sectors along edge (4000/300 ≈ 14)
    
    // Snake settings
    MAX_SNAKE_PARTS: 411,        // Maximum body parts (mscps)
    INITIAL_SNAKE_PARTS: 2,      // Starting body parts
    INITIAL_SCORE: 10,           // Starting score
    MOVE_DISTANCE: 42,           // Units snake moves per update (msl)
    
    // Speed settings (official values from protocol)
    NSP1: 539,                   // Normal speed base (value / 100 = 5.39)
    NSP2: 40,                    // Speed increase per size (value / 100 = 0.4)
    NSP3: 1400,                  // Max/boost speed (value / 100 = 14)
    SPANGDV: 48,                 // Angular speed coefficient (value / 10 = 4.8)
    MAMU: 33,                    // Basic angular speed (value / 1000 = 0.033)
    MANU2: 28,                   // Prey angular speed (value / 1000 = 0.028)
    CST: 430,                    // Tail rigidity (value / 1000 = 0.43)
    
    // Timing
    TICK_RATE: 47,               // Server tick in ms
    PING_INTERVAL: 250,          // Ping every 250ms
    NORMAL_MOVE_INTERVAL: 240,   // Normal speed movement interval (~4 moves/sec)
    BOOST_MOVE_INTERVAL: 95,     // Boost speed movement interval (~10 moves/sec)
    
    // Food settings
    MIN_NATURAL_FOOD_SIZE: 15,
    MAX_NATURAL_FOOD_SIZE: 47,
    MIN_DEATH_FOOD_SIZE: 68,
    MAX_DEATH_FOOD_SIZE: 122,
    FOOD_COLORS: 9,              // 0-8 color values
    INITIAL_FOOD_COUNT: 200,     // Less food
    MAX_FOOD_COUNT: 400,         // Max food
    FOOD_SPAWN_INTERVAL: 2,      // Spawn food every N ticks
    
    FOOD_GROWTH_RATE: 0.25,      // 0.25 per food unit eaten
    
    // Prey settings
    MAX_PREY_COUNT: 10,
    PREY_SPAWN_CHANCE: 0.1,
    
    // Bot settings
    MIN_PLAYERS: 20,              // Minimum players before bots spawn
    MAX_BOTS: 25,                 // Maximum number of bots
    BOT_NAMES: ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon',
                'Snake AI', 'Robo Snake', 'AI Player', 'Computer', 'NPC'],
    
    // Protocol defaults (can be overridden by client handshake)
    DEFAULT_PROTOCOL_VERSION: 11,
    DEFAULT_MSL: 42,
    SERVER_ID: 1,
    GAME_MODE: 0,                // 0: FFA, 2: Team Mode
};
