const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
const path = require('path')

const pathClient = path.join(__dirname, '../client')
const pathServer = path.join(__dirname, '../server')

let chat = {
    online: 0
}

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
    // флаг addedUser что бы после перезапуска сервера, если user был уже 'залогинен', и он вышел, не отнималось в минус один (ноль)
    let addedUser = false

    socket.on('disconnect', () => {
        // если user не был залогинен (не введен ник) - выходим
        if (!addedUser) return

        chat.online--
        socket.broadcast.emit('chat left', {nick: socket.username})
    })

    socket.on('chat message', client => {
        socket.broadcast.emit('chat message', client)
    })

    // отправляем число онлайна каждую секунду
    setInterval(function(){
        socket.emit('get chat online', chat.online)
    }, 1000)

    socket.on('chat join', client => {
        // если user уже вводил ник - выходим
        if (addedUser) return

        addedUser = true

        chat.online++
        socket.username = client.nick
        socket.broadcast.emit('chat new join', client)
    })
})

http.listen(3000, () => {
    console.log('listening on *:3000')
})