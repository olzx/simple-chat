let socket = io()

const messages = document.getElementById('messages')
const form = document.getElementById('form')
const input = document.getElementById('input')

// formNickBlock - для того что бы после ввода ника и проигрывания анимации при сохранении нельзя было быстро поменять на другой ник
let formNickBlock = false
const formNick = document.getElementById('form-insert-nick')
const inputNick = document.getElementById('nick-input')

const spanOnline = document.querySelector('.statistics__num')

const ulUsers = document.querySelector('.users')

let localUser = {
    nick: '',
    hasAuth: false
}
checkExistenceOfNick()

let system = {
    color: {
        default: '#efeff1',
        orange: '#f48b29',
        green: '#16c79a',
        red: '#FF0000'
    }
}

form.addEventListener('submit', e => {
    e.preventDefault()

    let inputText = input.value
    if(inputText) {
        socket.emit('chat message', {nick: localUser.nick, msg: inputText})
        addMessageInChat({nick: localUser.nick, color: system.color.green}, {msg: inputText, color: system.color.default})
        input.value = ''
    }
})

formNick.addEventListener('submit', e => {
    e.preventDefault()

    if (formNickBlock) return

    const inputText = inputNick.value
    if (inputText) {
        formNickBlock = true

        localUser.nick = inputText
        localUser.hasAuth = true
        inputNick.value = ''

        hideBlock(document.querySelector('.insert-nick'), input)
        addMessageInChat({nick: '[System]', color: system.color.orange}, {msg: `${localUser.nick}, добро пожаловать.`, color: system.color.green})
    
        socket.emit('chat join', {nick: localUser.nick})
        socket.emit('get chat all users')
    }
})

socket.on('chat message', res => {
    if (!localUser.hasAuth) return

    addMessageInChat({nick: res.nick, color: system.color.default}, {msg: res.msg, color: system.color.default})
})

socket.on('get chat online', online => {
    if (!localUser.hasAuth) return

    spanOnline.textContent = online
})

socket.on('chat new join', user => {
    if (!localUser.hasAuth) return

    addMessageInChat({nick: '[Server]', color: system.color.red}, {msg: `${user.nick} зашел к нам в чат.`, color: system.color.default})

    changeUlUsers('add', user.nick)
})

socket.on('chat left', user => {
    if (!localUser.hasAuth) return

    addMessageInChat({nick: '[Server]', color: system.color.red}, {msg: `${user.nick} вышел из чата.`, color: system.color.default})

    changeUlUsers('remove', user.nick)
})

socket.on('get chat all users', users => {
    if (!localUser.hasAuth) return
    
    users.forEach(user => changeUlUsers('add', user))
})

// Не показывать окно с вводом ника если ник уже есть
function checkExistenceOfNick() {
    if (localUser.nick === '') return

    document.querySelector('.insert-nick').classList.add('display-none')
}

function hideBlock(elem, $elemFocus = false) {
    elem.classList.add('hidden-block')
    
    elem.addEventListener('animationend', () => {
        elem.classList.add('display-none')

        // элемент на который нужно сфокусироваться после окончания анимации
        if ($elemFocus) {
            $elemFocus.focus()
        }
    })
}

function addMessageInChat(nick, msg) {
    let span = document.createElement('span')
    span.textContent = nick.nick + ': '
    span.className = 'nick'
    span.style.color = nick.color

    let li = document.createElement('li')
    li.textContent = msg.msg
    li.className = 'new'
    li.style.color = msg.color

    li.prepend(span)

    messages.appendChild(li)

    li.scrollIntoView({behavior: "smooth"})
}

function changeUlUsers(action, nick) {
    switch (action) {
        case 'add':
            let li = document.createElement('li')
            li.className = 'member'
            li.innerText = nick
            ulUsers.append(li)

            break;
        case 'remove':
            const $elements = [...ulUsers.children]
            const $findElem = $elements.filter(elem => elem.innerText === nick)
            $findElem[0].remove()

            break;
    }
}