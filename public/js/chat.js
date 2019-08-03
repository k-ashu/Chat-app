const socket=io()

//Elements
const $messageForm=document.querySelector('#message-form')
const $messageFormButton= $messageForm.querySelector('button')
const $messageFormInput= $messageForm.querySelector('input')
const $sendLocationButton= document.querySelector('#sendLocation')
const $messages= document.querySelector('#messages')

//Templates
const $messageTemplate= document.querySelector('#message-template').innerHTML //innerHTML grabs its html
const $locationTemplate= document.querySelector('#location-template').innerHTML
const $sidebarTemplate= document.querySelector('#sidebar-template').innerHTML

const autoscroll = () =>{
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight

    //Container Height
    const containerHeight = $messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight            //scrollHeight is the max height available scroll
    }

}

//Options
const {username,room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

//printing message
socket.on('message',(message)=>{
    console.log(message)
    const html=Mustache.render($messageTemplate,{
        username: message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(message)=>{
    console.log(message.url)
    const html=Mustache.render($locationTemplate,{
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomInfo',({room,users})=>{
    const html=Mustache.render($sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//Sending message
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value

    socket.emit('sendMessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value =''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('Message was delivered!')
    })
})

//Sending Location
$sendLocationButton .addEventListener('click',()=>{
    $sendLocationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported in your browser')
    }
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendLocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
            },()=>{
                $sendLocationButton.removeAttribute('disabled')
                console.log("Location sent succefully.")
        })
    })
})

socket.emit('join',{username, room},(error)=>{
    if(error){
        alert(error)
        //location.href redirects the user to given url (in this case homepage)
        location.href = '/'
    }
})