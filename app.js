const app = require('express')();
const server = require('http').createServer(app);
const io = require('socket.io')(server, {
  cors: {
    origin: '*'
  },
});
const port = 3000;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

app.get('/', function (req, res) {
  res.send({ success: true });
});

app.use('/auth', require('./routes/authRouter'));

server.listen(port, function () {
  io.on('connection', (socket) => {
    console.log('user connected');

    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
  });
});
