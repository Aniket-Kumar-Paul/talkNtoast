import { useEffect, useRef, useCallback } from 'react';
import { ACTIONS } from '../actions';
import { socketInit } from '../socket';
import freeice from 'freeice';
import { useStateWithCallback } from './useStateWithCallback';

export const useWebRTC = (roomId, user) => {
    // we want to run a callback function after client is updated using setClients
    // but the useState hook doesn't have this as an inbuilt functionality, so we create a custom hook useStateWithCallback
    const [clients, setClients] = useStateWithCallback([]);
    // object with {userId: audioElementInstance}, to get which audio instance is related to which user, will be used for muting etc.
    const audioElements = useRef({});
    // peer connections {userSocketId: webrtcPeerConnectionObject}
    const connections = useRef({});
    const socket = useRef(null);
    // after connecting, we will have a local media stream
    const localMediaStream = useRef(null);
    const clientsRef = useRef(null);

    // extra checks for adding new client
    const addNewClient = useCallback(
        (newClient, cb) => {
            // check if newClient already exists in clients list
            const lookingFor = clients.find(
                (client) => client.id === newClient.id
            );

            if (lookingFor === undefined) {
                setClients(
                    (existingClients) => [...existingClients, newClient],
                    cb
                );
            }
        },
        [clients, setClients]
    );

    useEffect(() => {
        clientsRef.current = clients;
    }, [clients]);

    const flag = useRef(false)
    useEffect(() => {
        if (flag.current || process.env.NODE_ENV !== 'development') {

            const initChat = async () => {
                socket.current = socketInit();
                await captureMedia();
                addNewClient({ ...user, muted: true }, () => {
                    const localElement = audioElements.current[user.id]; // get audio element
                    if (localElement) {
                        localElement.volume = 0; // if its not 0, you will listen your own voice
                        localElement.srcObject = localMediaStream.current; // what the user will listen
                    }
                });

                // Listeners
                socket.current.on(ACTIONS.MUTE_INFO, ({ userId, isMute }) => {
                    handleSetMute(isMute, userId);
                });
                socket.current.on(ACTIONS.ADD_PEER, handleNewPeer);
                socket.current.on(ACTIONS.REMOVE_PEER, handleRemovePeer);
                socket.current.on(ACTIONS.ICE_CANDIDATE, handleIceCandidate);
                socket.current.on(ACTIONS.SESSION_DESCRIPTION, setRemoteMedia);
                socket.current.on(ACTIONS.MUTE, ({ peerId, userId }) => {
                    handleSetMute(true, userId);
                });
                socket.current.on(ACTIONS.UNMUTE, ({ peerId, userId }) => {
                    handleSetMute(false, userId);
                });
                socket.current.emit(ACTIONS.JOIN, {
                    roomId,
                    user,
                });


                // Functions

                // Start capturing local audio stream.
                async function captureMedia() {
                    localMediaStream.current =
                        await navigator.mediaDevices.getUserMedia({
                            audio: true,
                        });
                }
                // listen to add_peer request from server
                async function handleNewPeer({
                    peerId,
                    createOffer,
                    user: remoteUser,
                }) {
                    // peerId is socketId, createOffer can be true or false
                    // if already connected then give warning
                    if (peerId in connections.current) {
                        return console.warn(
                            `You are already connected with ${peerId} (${user.name})`
                        );
                    }

                    // Store it to connections
                    connections.current[peerId] = new RTCPeerConnection({
                        iceServers: freeice(),
                    });

                    // Handle new ice candidate on this peer connection
                    connections.current[peerId].onicecandidate = (event) => {
                        socket.current.emit(ACTIONS.RELAY_ICE, {
                            peerId,
                            icecandidate: event.candidate,
                        }); // send this ice candidate to all other clients
                    };

                    // Handle on track event on this connection (to handle data stream)
                    connections.current[peerId].ontrack = ({
                        streams: [remoteStream],
                    }) => {
                        // streams is an array, get remoteStream property from it
                    // add new client
                        addNewClient({ ...remoteUser, muted: true }, () => {
                            // get current users mute info
                            const currentUser = clientsRef.current.find(
                                (client) => client.id === user.id
                            );
                            if (currentUser) {
                                socket.current.emit(ACTIONS.MUTE_INFO, {
                                    userId: user.id,
                                    roomId,
                                    isMute: currentUser.muted,
                                });
                            }
                            // check if audio element for this client is already present
                            if (audioElements.current[remoteUser.id]) {
                                audioElements.current[remoteUser.id].srcObject =
                                    remoteStream;
                            } else {
                                let settled = false;
                                const interval = setInterval(() => {  // keep checking every 1 second for the same
                                    if (audioElements.current[remoteUser.id]) {
                                        audioElements.current[
                                            remoteUser.id
                                        ].srcObject = remoteStream;
                                        settled = true;
                                    }

                                    if (settled) {
                                        clearInterval(interval);
                                    }
                                }, 300);
                            }
                        });
                    };

                    // add local track to remote connections
                    localMediaStream.current.getTracks().forEach((track) => {
                        connections.current[peerId].addTrack(
                            track,
                            localMediaStream.current
                        );
                    });

                    // Create an offer if required
                    if (createOffer) {
                        const offer = await connections.current[
                            peerId
                        ].createOffer();

                        // Set as local description
                        await connections.current[peerId].setLocalDescription(
                            offer
                        );

                        // send offer to the server to send to other clients
                        socket.current.emit(ACTIONS.RELAY_SDP, {
                            peerId,
                            sessionDescription: offer,
                        });
                    }
                }
                async function handleRemovePeer({ peerId, userId }) {
                    // Correction: peerID to peerId
                    if (connections.current[peerId]) {
                        connections.current[peerId].close();
                    }

                    delete connections.current[peerId];
                    delete audioElements.current[peerId];
                    setClients((list) => list.filter((c) => c.id !== userId));
                }
                async function handleIceCandidate({ peerId, icecandidate }) {
                    if (icecandidate) {
                        connections.current[peerId].addIceCandidate(icecandidate);
                    }
                }
                async function setRemoteMedia({
                    peerId,
                    sessionDescription: remoteSessionDescription,
                }) {
                    connections.current[peerId].setRemoteDescription(
                        new RTCSessionDescription(remoteSessionDescription)
                    );

                    // If session descrition is offer then create an answer
                    if (remoteSessionDescription.type === 'offer') {
                        const connection = connections.current[peerId];

                        const answer = await connection.createAnswer();
                        connection.setLocalDescription(answer);

                        socket.current.emit(ACTIONS.RELAY_SDP, {
                            peerId,
                            sessionDescription: answer,
                        });
                    }
                }
                async function handleSetMute(mute, userId) {
                    const clientIdx = clientsRef.current
                        .map((client) => client.id)
                        .indexOf(userId);
                    const allConnectedClients = JSON.parse(
                        JSON.stringify(clientsRef.current)
                    );
                    if (clientIdx > -1) {
                        allConnectedClients[clientIdx].muted = mute;
                        setClients(allConnectedClients);
                    }
                }
            };

            initChat();
        }

        // cleanup function
        return () => {
            if (flag.current || process.env.NODE_ENV !== 'development') {

                localMediaStream.current
                    .getTracks()
                    .forEach((track) => track.stop());
                socket.current.emit(ACTIONS.LEAVE, { roomId });
                for (let peerId in connections.current) {
                    connections.current[peerId].close();
                    delete connections.current[peerId];
                    delete audioElements.current[peerId];
                }
                socket.current.off(ACTIONS.ADD_PEER);
                socket.current.off(ACTIONS.REMOVE_PEER);
                socket.current.off(ACTIONS.ICE_CANDIDATE);
                socket.current.off(ACTIONS.SESSION_DESCRIPTION);
                socket.current.off(ACTIONS.MUTE);
                socket.current.off(ACTIONS.UNMUTE);

            }

            flag.current = true;
        };
    }, []);

    const provideRef = (instance, userId) => {
        audioElements.current[userId] = instance;
    };

    const handleMute = (isMute, userId) => {
        let settled = false;

        if (userId === user.id) {
            let interval = setInterval(() => {
                if (localMediaStream.current) {
                    localMediaStream.current.getTracks()[0].enabled = !isMute;
                    if (isMute) {
                        socket.current.emit(ACTIONS.MUTE, {
                            roomId,
                            userId: user.id,
                        });
                    } else {
                        socket.current.emit(ACTIONS.UNMUTE, {
                            roomId,
                            userId: user.id,
                        });
                    }
                    settled = true;
                }
                if (settled) {
                    clearInterval(interval);
                }
            }, 200);
        }
    };

    return {
        clients,
        provideRef,
        handleMute,
    };
};