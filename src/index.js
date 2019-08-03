const path = require ('path')
const http = require ('http')
const socketio = require ('socket.io')
const express = require('express')
const Filter = require ('bad-words')
const {generateMessage,generateLocationMessage} = require ('./utils/messages')
const {addUser, removeUser, getUser, getUsers} = require ('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')
app.use (express.static(publicDirectoryPath))

let count = 0
io.on('connection', (socket)=>{
    console.log('New connection!')
    socket.on('join',({username,room},callback)=>{
        const {error,user} = addUser({id:socket.id,username,room})

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message',generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`))
        io.to(user.room).emit('roomInfo',{
            room:user.room,
            users:getUsers(user.room)
        })
        callback()
    })
    socket.on('sendMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter= new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })
    socket.on('disconnect',()=>{
        const user=removeUser(socket.id)
        //To check if user was successfully connected before leaving or not
        if (user) {
            io.to(user.room).emit('message',generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomInfo',{
                room:user.room,
                users:getUsers(user.room)
            })
        }
    })
    
    socket.on('sendLocation',(position,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${position.latitude},${position.longitude}`))
        callback()
    })
})

server.listen(port, ()=>{
    console.log(`server is running at port ${port}`)
})