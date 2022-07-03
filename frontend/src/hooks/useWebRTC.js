import { useCallback, useEffect, useRef } from "react";
import { useStateWithCallback } from "./useStateWithCallback"
import { socketInit } from '../socket'
import { ACTIONS } from '../actions'

export const useWebRTC = (roomId, user) => {
    // we want to run a callback function after client is updated using setClients
    // but the useState hook doesn't have this as an inbuilt functionality, so we create a custom hook useStateWithCallback
    const [clients, setClients] = useStateWithCallback([]);

    // sockets
    const socket = useRef(null)
    useEffect(() => {
        socket.current = socketInit();
    }, [])

    // extra checks for adding new client
    const addNewClients = useCallback(
        (newClient, callback) => {
            // check if newClient already exists in clients list
            const lookingFor = clients.find((client) => client.id === newClient.id)

            if (lookingFor === undefined) {
                setClients(
                    (existingClients) => [...existingClients, newClient],
                    callback
                )
            }
        },
        [clients, setClients]
    )

    // object with {userId: audioElementInstance}, to get which audio instance is related to which user, will be used for muting etc.
    const audioElements = useRef({})
    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    }

    // peer connections {userSocketId: peerConnectionObject}
    const connections = useRef({})

    // after connecting, we will have a local media stream
    const localMediaStream = useRef(null)

    // Capture media (audio from mic)
    useEffect(() => {
        const startCapture = async () => {
            localMediaStream.current =
                await navigator.mediaDevices.getUserMedia({
                    audio: true
                })
        }
        startCapture().then(() => {
            addNewClients(user, () => {
                const localElement = audioElements.current[user.id] // get audio element

                if (localElement) {
                    localElement.volume = 0; // if its not 0, you will listen your own voice
                    localElement.srcObject = localMediaStream.current // what the user will listen
                }


                // WebSockets (using socket.io)
                // socket emit JOIN event 
                socket.current.emit(ACTIONS.JOIN, { roomId, user }) // join request goes to server with the given options/attributes

            })
        })
    }, [])

    return { clients, provideRef }
}