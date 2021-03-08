const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const path = require('path')

const pathClient = path.join(__dirname, '../client')
const pathServer = path.join(__dirname, '../server')

app.get('/', (req, res) => {
    res.sendFile(pathClient + '/index.html')
})

app.get('/styles.css', (req, res) => {
    res.sendFile(pathClient + '/styles.css')
})

app.get('/client.js', (req, res) => {
    res.sendFile(pathClient + '/client.js')
})

io.on('connection', socket => {
    console.log('a user connected')

    socket.on('disconnect', () => {
        console.log('user disconnected')
    })

    socket.on('chat message', client => {
        socket.broadcast.emit('chat message', client)
    })
})

http.listen(3000, () => {
    console.log('listening on *:3000')
})