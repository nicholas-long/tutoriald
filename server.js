const express = require('express');
const { spawn } = require('child_process');
const { join } = require('node:path');
const socketIo = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
  var child = null
  console.log('user connected')

  socket.on('input', (data) => {
    console.log(`got input data ${data}`)
    if (child) {
      console.log(`sending input data ${data}`)
      child.stdin.write(data);
    }
  });

  socket.on('start', (data) => {
    console.log(`start called ${JSON.stringify(data)}`)
    child = spawn('python3', ['-c', 'import pty;pty.spawn("/bin/bash")']); 
    child.stdout.on('data', (data) => {
      socket.emit('output', data.toString());
    });
    child.stderr.on('data', (data) => {
      socket.emit('output', data.toString());
    });
    child.on('close', (code) => {
      socket.emit('exit', code);
    });
  })

});

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.get('/xterm.js', (req, res) => {
  res.sendFile(join(__dirname, 'node_modules/@xterm/xterm/lib/xterm.js'));
})
app.get('/xterm.css', (req, res) => {
  res.sendFile(join(__dirname, 'node_modules/@xterm/xterm/css/xterm.css'));
})

server.listen(8080, () => {
  console.log('Server is running');
});
