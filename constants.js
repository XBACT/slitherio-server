module.exports = {
    // Packet types (clientbound)
    PACKET: {
        PRE_INIT: '6'.charCodeAt(0),           // 54
        INITIAL_SETUP: 'a'.charCodeAt(0),       // 97
        ROTATE_CCW_E: 'e'.charCodeAt(0),        // 101
        ROTATE_CCW_E2: 'E'.charCodeAt(0),       // 69
        ROTATE_CCW_3: '3'.charCodeAt(0),        // 51
        ROTATE_CW_4: '4'.charCodeAt(0),         // 52
        ROTATE_CW_5: '5'.charCodeAt(0),         // 53
        UPDATE_FAM: 'h'.charCodeAt(0),          // 104
        REMOVE_PART: 'r'.charCodeAt(0),         // 114
        MOVE_G: 'g'.charCodeAt(0),              // 103
        MOVE_G2: 'G'.charCodeAt(0),             // 71
        INCREASE_N: 'n'.charCodeAt(0),          // 110
        INCREASE_N2: 'N'.charCodeAt(0),         // 78
        LEADERBOARD: 'l'.charCodeAt(0),         // 108
        DEATH: 'v'.charCodeAt(0),               // 118
        ADD_SECTOR: 'W'.charCodeAt(0),          // 87
        REMOVE_SECTOR: 'w'.charCodeAt(0),       // 119
        HIGHSCORE: 'm'.charCodeAt(0),           // 109
        PONG: 'p'.charCodeAt(0),                // 112
        MINIMAP: 'u'.charCodeAt(0),             // 117
        SNAKE: 's'.charCodeAt(0),               // 115
        FOOD_F: 'F'.charCodeAt(0),              // 70
        FOOD_B: 'b'.charCodeAt(0),              // 98
        FOOD_F2: 'f'.charCodeAt(0),             // 102
        EAT_FOOD: 'c'.charCodeAt(0),            // 99
        UPDATE_PREY: 'j'.charCodeAt(0),         // 106
        PREY: 'y'.charCodeAt(0),                // 121
        KILL: 'k'.charCodeAt(0),                // 107
        TEAM_SCORES: 'o'.charCodeAt(0),         // 111
    },
    
    // Serverbound packet values
    CLIENT_PACKET: {
        START_LOGIN: 99,           // 'c'
        SET_USERNAME: 115,         // 's'
        PING: 251,
        ANGLE_UPDATE: 0,           // 0-250 angle
        TURN: 252,
        BOOST_START: 253,
        BOOST_END: 254,
        CLOSE: 255,
    }
};