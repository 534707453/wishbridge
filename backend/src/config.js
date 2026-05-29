require('dotenv').config();

module.exports = {
  port: process.env.PORT || 8080,
  jwtSecret: process.env.JWT_SECRET || 'wishbridge_secret_key_2024',
  jwtExpiresIn: '7d',
  bcryptRounds: 12,
  serverAddr: process.env.SERVER_ADDR || 'jp-2.frp.one',
  serverPort: process.env.SERVER_PORT || 35661
};
