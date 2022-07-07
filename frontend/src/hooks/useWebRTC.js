import { useCallback, useEffect, useRef } from "react";
import { useStateWithCallback } from "./useStateWithCallback"
import { socketInit } from '../socket'
import { ACTIONS } from '../actions'
import freeice from "freeice"


export const useWebRTC = (roomId, user) => {
    // we want to run a callback function after client is updated using setClients
    // but the useState hook doesn't have this as an inbuilt functionality, so we create a custom hook useStateWithCallback
    const [clients, setClients] = useStateWithCallback([]);
    // object with {userId: audioElementInstance}, to get which audio instance is related to which user, will be used for muting etc.
    const audioElements = useRef({})
    // peer connections {userSocketId: webrtcPeerConnectionObject}
    const connections = useRef({})
    // after connecting, we will have a local media stream
    const localMediaStream = useRef(null)

    // sockets
    const socket = useRef(null)
    const Connected = useRef(false)
    useEffect(() => {
        if (Connected.current || process.env.NODE_ENV !== 'development') {
            socket.current = socketInit();
        }

        // cleanup
        return () => {
            Connected.current = true;
        }
    }, [])

    // extra checks for adding new client
    const addNewClient = useCallback(
        (newClient, callback) => {
            // check if newClient already exists in clients list
            const lookingFor = clients.find(
                (client) => client.id === newClient.id
            )

            if (lookingFor === undefined) {
                setClients(
                    (existingClients) => [...existingClients, newClient],
                    callback
                )
            }
        },
        [clients, setClients]
    )

    // Capture media (audio from mic)
    const captured = useRef(false);
    useEffect(() => {
        if (captured.current || process.env.NODE_ENV !== 'development') {

            const startCapture = async () => {
                localMediaStream.current =
                    await navigator.mediaDevices.getUserMedia({
                        audio: true,
                    })
            }

            startCapture().then(() => {
                addNewClient(user, () => {
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
            // }
        }

        // cleanup
        return () => {
            // Leaving the room
            if (captured.current || process.env.NODE_ENV !== 'development') {
                localMediaStream.current
                    .getTracks()
                    .forEach((track) => track.stop());

                socket.current.emit(ACTIONS.LEAVE, { roomId })
            }

            captured.current = true;
        }
    }, [])


    // listen to add_peer request from server
    const peer_added = useRef(false)
    useEffect(() => {
        if (peer_added.current || process.env.NODE_ENV !== 'development') {
            const handleNewPeer = async ({
                peerId,
                createOffer,
                user: remoteUser
            }) => {
                // peerId is socketId, createOffer can be true or false
                // if already connected then give warning
                if (peerId in connections.current) {
                    return console.warn(
                        `You are already connected with ${peerId} (${user.name})`
                    )
                }

                // add the new peer to connections
                connections.current[peerId] = new RTCPeerConnection({ // webRTC
                    iceServers: freeice(),
                })

                // handle new ice candidate
                connections.current[peerId].onicecandidate = (event) => {
                    socket.current.emit(ACTIONS.RELAY_ICE, {
                        peerId,
                        icecandidate: event.candidate,
                    }) // send this ice candidate to all other clients
                }

                // handle on track on this connection (to handle data stream)
                connections.current[peerId].ontrack = ({
                    streams: [remoteStream]
                }) => {
                    // streams is an array, get remoteStream property from it
                    // add new client
                    addNewClient(remoteUser, () => {
                        // check if audio element for this client is already present
                        if (audioElements.current[remoteUser.id]) {
                            audioElements.current[remoteUser.id].srcObject = remoteStream
                        } else { // means audio element hasn't rendered yet 
                            let settled = false
                            const interval = setInterval(() => { // keep checking every 1 second for the same
                                if (audioElements.current[remoteUser.id]) {
                                    audioElements.current[remoteUser.id].srcObject = remoteStream
                                    settled = true
                                }
                                if (settled) {
                                    clearInterval(interval)
                                }
                            }, 1000)
                        }
                    })
                }

                // add local track to remote connections
                localMediaStream.current.getTracks().forEach((track) => {
                    connections.current[peerId].addTrack(
                        track,
                        localMediaStream.current
                    )
                })

                // create offer
                if (createOffer) {
                    const offer = await connections.current[peerId].createOffer();

                    // add this offer to local description
                    await connections.current[peerId].setLocalDescription(offer)

                    // send offer to other clients
                    socket.current.emit(ACTIONS.RELAY_SDP, {
                        peerId,
                        sessionDescription: offer,
                    })
                }
            }
            socket.current.on(ACTIONS.ADD_PEER, handleNewPeer)
        }

        // cleanup function
        return () => {
            if (peer_added.current || process.env.NODE_ENV !== 'development') {
                socket.current.off(ACTIONS.ADD_PEER) // clear/unsubscribe this listener
            }

            peer_added.current = true;
        }
        // }
    }, [])


    // handle ice candidate
    const iceHandled = useRef(false);
    useEffect(() => {
        if (iceHandled.current || process.env.NODE_ENV !== 'development') {
            socket.current.on(ACTIONS.ICE_CANDIDATE, ({ peerId, icecandidate }) => {
                if (icecandidate) {
                    connections.current[peerId].addIceCandidate(icecandidate)
                }
            })
        }

        // cleanup
        return () => {
            if (iceHandled.current || process.env.NODE_ENV !== 'development') {
                socket.current.off(ACTIONS.ICE_CANDIDATE)
            }

            iceHandled.current = true;
        }
    }, [])

    // handle SDP
    const sdpHandled = useRef(false)
    useEffect(() => {
        if (sdpHandled.current || process.env.NODE_ENV !== 'development') {
            const handleRemoteSDP = async ({
                peerId,
                sessionDescription: remoteSessionDescription,
            }) => {
                connections.current[peerId].setRemoteDescription(
                    new RTCSessionDescription(remoteSessionDescription)
                )

                // if sessionDescription is of offer type, create an answer
                if (remoteSessionDescription.type === 'offer') {
                    const connection = connections.current[peerId]

                    // create answer for this connection
                    const answer = await connection.createAnswer()
                    connection.setLocalDescription(answer);
                    socket.current.emit(ACTIONS.RELAY_SDP, {
                        peerId,
                        sessionDescription: answer
                    })
                }
            }
            socket.current.on(ACTIONS.SESSION_DESCRIPTION, handleRemoteSDP)
        }

        // cleanup
        return () => {
            if (sdpHandled.current || process.env.NODE_ENV !== 'development') {
                socket.current.off(ACTIONS.SESSION_DESCRIPTION)
            }

            sdpHandled.current = true;
        }
    }, [])

    // handle remove peer
    const peer_removed = useRef(false)
    useEffect(() => {
        if (peer_removed.current || process.env.NODE_ENV !== 'development') {
            const handleRemovePeer = async ({ peerId, userId }) => {
                if (connections.current[peerId]) {
                    connections.current[peerId].close();
                }
                delete connections.current[peerId]
                delete audioElements.current[peerId]
                console.log('removing peer')
                setClients((list) => list.filter((client) => client.id !== userId), ({ state }) => console.log(`state: ${state}`))
            }
            socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer)
        }

        // cleanup
        return () => {
            if (peer_removed.current || process.env.NODE_ENV !== 'development') {
                socket.current.off(ACTIONS.REMOVE_PEER)
            }

            peer_removed.current = true;
        }
    }, [])

    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    }

    return { clients, provideRef }
}