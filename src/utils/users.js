
const users= []

const addUser = ({id, username, room})=>{
    username =username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    //validate user
    if(!username || !room){
        return {
            error:'Username and room required'
        }
    }

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room
    })
    if(existingUser){
        return{
            error:'Username already taken.'
        }
    }

    //store user
    const user={id,username,room}
    users.push(user)
    return {user}
}

const removeUser = (id)=>{
    const index = users.findIndex((user)=>user.id===id)
    return users.slice(index,1)[0]
}

const getUser = (id)=>{
    return users.find((user)=>user.id===id)
}

const getUsers = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>user.room===room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsers
}