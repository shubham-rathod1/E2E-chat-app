const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('msg', ({ name, msg, secret }) => {
    console.log(name, msg, secret);
    io.emit('msg', { name, msg, secret });
  });
});

http.listen(2244, function () {
  console.log('listening on port 2244');
});
