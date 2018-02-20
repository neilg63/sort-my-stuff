const app = require('./app');
const server = require('http').createServer(app);  
const io = require('socket.io')(server);

const PORT = 8099;

if (process.env.NODE_ENV === 'development') {
  
}
require('./webpack-dev-middleware').init(app);

if (process.env.NODE_ENV === 'production') {
  app.use('/dist', express.static(path.join(__dirname, 'dist')));
}

server.listen(PORT, () => {
	console.log(`Running on port ${PORT}`);
});

io.on('connection', (socket) => {
	socket.on('join', (user) => {
		socket.emit('join',user);
	});
	socket.on('leave', (user) => {
		socket.emit('join',user);
	});
	socket.on('update', (data) => {
		data.external = true;
		socket.emit('update',data);
	});
});
