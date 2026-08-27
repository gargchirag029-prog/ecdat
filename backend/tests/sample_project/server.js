const tls = require('tls');
const signature = crypto.createSign('SHA256').sign(ecdsaKey);
