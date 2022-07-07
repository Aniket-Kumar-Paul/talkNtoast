require('dotenv').config();
const express = require('express');

const app = express();
const server = require('http').createServer(app)

// socket.io for websocket
const io = require('socket.io')(server, {
    cors: {
        origin: 'http://localhost:3000', // allow these origins 
        methods: ['GET', 'POST'] // allow these methods
    }
})

const router = require('./routes');
const DbConnect = require('./database');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const ACTIONS = require('./actions')

app.use(cookieParser())

// to remove CORS Error
const corsOption = {
    credentials: true,
    origin: ['http://localhost:3000'], // frontend url
}
app.use(cors(corsOption))

app.use('/storage', express.static('storage')) // if url has /storage serve all files from storage folder as static files

const PORT = process.env.PORT || 5500;
DbConnect(); // connect database
app.use(express.json({ limit: '8mb' })) // giving limit to allow uploading image
app.use(router);

app.get('/', (req, res) => {
    res.send('Hello from express');
});


// SOCKETS
const socketUserMapping = {}

io.on('connection', (socket) => {
    console.log('new connection', socket.id)

    socket.on(ACTIONS.JOIN, ({ roomId, user }) => {
        socketUserMapping[socket.id] = user;

        // get all clients in the room using the roomId(io.sockets.adapter.rooms is a map) 
        // if no room/client exists return [] 
        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        console.log(clients)

        clients.forEach(clientId => { // clientId is socketId
            // send requests to all clients to add me(new client) as a peer
            io.to(clientId).emit(ACTIONS.ADD_PEER, {
                peerId: socket.id,
                createOffer: false,
                user
            })

            // emit add_peer action to back to client(myself)
            socket.emit(ACTIONS.ADD_PEER, {
                peerId: clientId,
                createOffer: true,
                user: socketUserMapping[clientId]
            })
        })

        // join myself in the room
        socket.join(roomId)
    })

    // Handling relay ice
    socket.on(ACTIONS.RELAY_ICE, ({ peerId, icecandidate }) => {
        io.to(peerId).emit(ACTIONS.ICE_CANDIDATE, {
            peerId: socket.id,
            icecandidate
        })
    })

    // Handling relay sdp
    socket.on(ACTIONS.RELAY_SDP, ({ peerId, sessionDescription }) => {
        io.to(peerId).emit(ACTIONS.SESSION_DESCRIPTION, {
            peerId: socket.id,
            sessionDescription
        })
    })

    // Leaving room
    const leaveRoom = ({ roomId }) => {
        const { rooms } = socket; // get all connected rooms

        Array.from(rooms).forEach((roomId) => {
            const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || [])

            clients.forEach((clientId) => {
                io.to(clientId).emit(ACTIONS.REMOVE_PEER, {
                    peerId: socket.id,
                    userId: socketUserMapping[socket.id]?.id
                })

                // socket.emit(ACTIONS.REMOVE_PEER, {
                //     peerId: clientId,
                //     userId: socketUserMapping[clientId]?.id
                // })
            })

            socket.leave(roomId)
        })

        delete socketUserMapping[socket.id]
    }

    socket.on(ACTIONS.LEAVE, leaveRoom)
    socket.on('disconnecting', leaveRoom);
})

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));