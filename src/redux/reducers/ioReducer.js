import io from 'socket.io-client'

const initialState = {
    io: io('http://172.31.99.73:4000'),
    joinedRooms: [],
    roomUsers: [],
    currentRoom: '',
    messages: {}
}

const IO_CONNECT = 'IO_CONNECT'
const IO_DISCONNECT = 'IO_DISCONNECT'
const JOIN_ROOM = 'JOIN_ROOM'
const JOIN_ROOM_RESPONSE = 'JOIN_ROOM_RESPONSE'
const LEAVE_ROOM = 'LEAVE_ROOM'
const SET_CURRENT_ROOM = 'SET_CURRENT_ROOM'
const GET_ROOM_USERS = 'GET_ROOM_USERS'
const SET_ROOM_USERS = 'SET_ROOM_USERS'
const SEND_MESSAGE = 'SEND_MESSAGE'
const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE'

export const ioConnect = host => {
    return {
        type: IO_CONNECT,
        payload: {
            io: io,
            host
        }
    }
}

export const ioDisconnect = () => {
    return {
        type: IO_DISCONNECT
    }
}

export const joinRoom = (room, user) => {
    console.log('room and user', room, user)
    return {
        type: JOIN_ROOM,
        payload: {
            room,
            user
        }
    }
}

export const joinRoomResponse = res => {
    return {
        type: JOIN_ROOM_RESPONSE,
        payload: res
    }
}

export const leaveRoom = (room, user) => {
    return {
        type: LEAVE_ROOM,
        payload: {
            room,
            user
        }
    }
}

export const setCurrentRoom = room => {
    return {
        type: SET_CURRENT_ROOM,
        payload: room
    }
}

export const getRoomUsers = room => {
    return {
        type: GET_ROOM_USERS,
        payload: room
    }
}

export const setRoomUsers = users => {
    return {
        type: SET_ROOM_USERS,
        payload: users
    }
}

export const sendMessage = msg => {
    console.log('send:', msg)
    return {
        type: SEND_MESSAGE,
        payload: msg
    }
}

export const receiveMessage = msg => {
    console.log(msg)
    return {
        type: RECEIVE_MESSAGE,
        payload: msg
    }
}

export default function reducer(state = initialState, action) {
    const {type, payload} = action

    switch(type) {
        case IO_CONNECT:
            return {
                ...state,
                io: payload.io(payload.host)
            }
        case IO_DISCONNECT:
            state.io.emit('disconnect')
            return {
                ...state,
                io: null,
                currentRoom: '',
                roomUsers: [],
                joinedRooms: [],
                messages: {}
            }
        case JOIN_ROOM:
            state.io.emit('join-room', payload.room, payload.user)
            return {
                ...state,
                joinedRooms: [...state.joinedRooms, payload.room]
            }
        case JOIN_ROOM_RESPONSE:
            const welcomeMessages = !state.messages[payload.room.name] ?
                [{from: payload.room.name, message: payload.message}]
            :
                [...state.messages[payload.room.name], {from: payload.room.name, message: payload.message}]
                console.log({
                    ...state,
                    messages: {...state.messages, [payload.room.name]: welcomeMessages}
                })
            return {
                ...state,
                messages: {...state.messages, [payload.room.name]: welcomeMessages}
            }
        case LEAVE_ROOM:
            state.io.emit('leave-room', payload.room, payload.user)
            return {
                ...state,
                joinedRooms: state.joinedRooms.filter(v => v.id != payload.room.id)
            }
        case SET_CURRENT_ROOM:
            return {
                ...state,
                currentRoom: payload
            }
        case GET_ROOM_USERS:
            state.io.emit('get-room-users', payload)
            return state
        case SET_ROOM_USERS:
            return {
                ...state,
                roomUsers: payload
            }
        case SEND_MESSAGE:
            state.io.emit('send-message', payload)
            return state
        case RECEIVE_MESSAGE:
            console.log('receive message:', payload)
            const roomMessages = !state.messages[payload.room] ?
                [{from: payload.user, message: payload.message}]
            :
                [...state.messages[payload.room], {from: payload.user, message: payload.message}]
            if(state.messages[payload.room].indexOf({from: payload.user, message: payload.message}) != -1) return state
            return {
                ...state,
                messages: {...state.messages, [payload.room]: roomMessages}
            }
        default: return state
    }
}