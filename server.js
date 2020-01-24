const http = require('http');
// const fs = require('fs')
// const crypto
const app = require('./app');

// HTTPS secure
// const options = {
//      key: fs.readFileSync(./key.pem)
//      cert: fs.readFileSync(./certificate.pem)
//};

const PORT = 8080;
// var server = https.createServer(options, app)
var server = http.createServer(app);
server.listen(PORT);