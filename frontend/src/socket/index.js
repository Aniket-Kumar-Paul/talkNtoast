import {io} from 'socket.io-client'

export const socketInit = () => {
    const options = {
        'force new connection': true,
        reconnectionAttempt: 'Infinity',
        timeout: 10000, // in ms
        transport: ['websocket']
    }
    return io('http://localhost:5500', options) // returns object of io to use its functions
}