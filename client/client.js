let socket = io()

const messages = document.getElementById('messages')
const form = document.getElementById('form')
const input = document.getElementById('input')

// formNickBlock - для того что бы после ввода ника и проигрывания анимации при сохранении нельзя было быстро поменять на другой ник
let formNickBlock = false
const formNick = document.getElementById('form-insert-nick')
const inputNick = document.getElementById('nick-input')

const spanOnline = document.querySelector('.statistics__num')

let user = {
    nick: 'Tester'
}
checkExistenceOfNick()

let system = {
    color: {
        default: '#efeff1',
        orange: '#f48b29',
        green: '#16c79a'
    }
}

form.addEventListener('submit', e => {
    e.preventDefault()

    let inputText = input.value
    if(inputText) {
        socket.emit('chat message', {nick: user.nick, msg: inputText})
        addMessageInChat({nick: user.nick, color: system.color.default}, {msg: inputText, color: system.color.default})
        input.value = ''
    }
})

formNick.addEventListener('submit', e => {
    e.preventDefault()

    if (formNickBlock) return

    const inputText = inputNick.value
    if (inputText) {
        formNickBlock = true

        user.nick = inputText
        inputNick.value = ''

        hideBlock(document.querySelector('.insert-nick'), input)
        addMessageInChat({nick: '[System]', color: system.color.orange}, {msg: `${user.nick}, добро пожаловать.`, color: system.color.green})
    }
})

socket.on('chat message', res => {
    addMessageInChat({nick: res.nick, color: system.color.default}, {msg: res.msg, color: system.color.default})
})

socket.on('get chat online', online => {
    spanOnline.textContent = online
})

// Не показывать окно с вводом ника если ник уже есть
function checkExistenceOfNick() {
    if (user.nick === '') return

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