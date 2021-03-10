import React, { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import './App.css'
import sample_01 from '../../assets/01.mp3'
import sample_02 from '../../assets/02.mp3'
import { Player } from '../Player/Player'

export const App = () => {
    const [registeringClient, setRegisteringClient] = useState(false)
    const [clientRegistered, setClientRegistered] = useState(false)
    const [clientId, setClientId] = useState(null)

    const [connectingWebsocket, setConnectingWebsocket] = useState(false)
    const [websocketConnected, setWebsocketConnected] = useState(false)
    const [websocket, setWebsocket] = useState(null)

    const [crossFader, setCrossFader] = useState(null)
    const [crossFaderPosition, setCrossFaderPosition] = useState(50)

    const [player_A, setPlayer_A] = useState(null)
    const [loading_A, setLoading_A] = useState(false)
    const [loaded_A, setLoaded_A] = useState(false)
    const [player_B, setPlayer_B] = useState(null)
    const [loading_B, setLoading_B] = useState(false)
    const [loaded_B, setLoaded_B] = useState(false)

    const [lastStarted_MS_A, setLastStarted_MS_A] = useState(Date.now())
    const [lastStartPoint_MS_A, setLastStartPoint_MS_A] = useState(0)
    const [lastStarted_MS_B, setLastStarted_MS_B] = useState(Date.now())
    const [lastStartPoint_MS_B, setLastStartPoint_MS_B] = useState(0)

    useEffect(() => {
        if (
            websocket === null &&
            websocketConnected === false &&
            connectingWebsocket === false
        ) {
            setConnectingWebsocket(true)
            const webSocketEndpoint = process.env.WS_ENDPOINT
            const newSocket = new WebSocket(
                webSocketEndpoint !== undefined
                    ? webSocketEndpoint
                    : 'ws://localhost:8000'
            )
            newSocket.onopen = () => {
                setConnectingWebsocket(false)
                setWebsocketConnected(true)
            }
            newSocket.onmessage = onMessage
            setWebsocket(newSocket)
        }

        return () => {
            websocket.close()
        }
    }, [])

    const registerClient = () => {
        setRegisteringClient(true)
        const registrationMessage = { type: 'registration' }
        websocket.send(JSON.stringify(registrationMessage))
    }

    const handleClickPlay = (player) => {
        const timestamp_MS = Date.now()
        play(player, timestamp_MS)
        const playMessage = {
            type: 'play',
            payload: { clientId, player, timestamp: timestamp_MS },
        }
        websocket.send(JSON.stringify(playMessage))
    }

    const play = (player, playEventTimestamp_MS) => {
        const startPoint_MS = Date.now() - playEventTimestamp_MS
        const startPoint_S = startPoint_MS / 1000
        if (player === 1) {
            player_A.start(Tone.now(), startPoint_S)
            setLastStarted_MS_A(playEventTimestamp_MS)
            setLastStartPoint_MS_A(startPoint_MS)
        } else if (player === 2) {
            player_B.start(Tone.now(), startPoint_S)
            setLastStarted_MS_B(playEventTimestamp_MS)
            setLastStartPoint_MS_B(startPoint_MS)
        }
    }

    const handleClickStop = (player) => {
        const timestamp_MS = Date.now()
        if (player === 1) {
            player_A.stop()
        } else if (player === 2) {
            player_B.stop()
        }

        const stopMessage = {
            type: 'stop',
            payload: { clientId, player, timestamp: timestamp_MS },
        }
        websocket.send(JSON.stringify(stopMessage))
    }

    const handleClickFastForward = (player, offset_MS) => {
        const timestamp_MS = Date.now()
        let targetPosition_MS = null
        if (player === 1) {
            const playbackPosition_MS_A =
                timestamp_MS - lastStarted_MS_A + lastStartPoint_MS_A
            let targetPosition_MS_A = playbackPosition_MS_A + offset_MS
            fastForward(1, targetPosition_MS_A, timestamp_MS)
            targetPosition_MS = targetPosition_MS_A
        } else if (player === 2) {
            const playbackPosition_MS_B =
                timestamp_MS - lastStarted_MS_B + lastStartPoint_MS_B
            let targetPosition_MS_B = playbackPosition_MS_B + offset_MS
            fastForward(2, targetPosition_MS_B, timestamp_MS)
            targetPosition_MS = targetPosition_MS_B
        }

        const fastForwardMessage = {
            type: 'fastForward',
            payload: {
                clientId,
                player,
                targetPosition: targetPosition_MS,
                timestamp: timestamp_MS,
            },
        }
        websocket.send(JSON.stringify(fastForwardMessage))
    }

    const fastForward = (
        player,
        targetPosition_MS,
        fastForwardEventTimestamp_MS
    ) => {
        const now_MS = Date.now()
        const latency = now_MS - fastForwardEventTimestamp_MS
        const seekPosition_MS = targetPosition_MS + latency
        if (player === 1) {
            player_A.seek(seekPosition_MS / 1000, Tone.now())
            setLastStarted_MS_A(now_MS)
            setLastStartPoint_MS_A(seekPosition_MS)
        } else if (player === 2) {
            player_B.seek(seekPosition_MS / 1000, Tone.now())
            setLastStarted_MS_B(now_MS)
            setLastStartPoint_MS_B(seekPosition_MS)
        }
    }

    const handleClickCrossFade = (position) => {
        crossFade(position)
        const crossFadeMessage = {
            type: 'crossFade',
            payload: {
                clientId,
                position,
            },
        }
        websocket.send(JSON.stringify(crossFadeMessage))
    }

    const crossFade = (position) => {
        crossFader.fade.value = position / 100
        setCrossFaderPosition(position)
    }

    const onMessage = (message) => {
        const { type, payload } = JSON.parse(message.data)

        if (type === 'registrationSuccess') {
            setClientRegistered(true)
            setClientId(payload.clientId)
        }

        if (type === 'play') {
            play(payload.player, payload.timestamp)
        }

        if (type === 'stop') {
            if (payload.player === 1) {
                player_A.stop()
            } else if (payload.player === 2) {
                player_B.stop()
            }
        }

        if (type === 'fastForward') {
            fastForward(
                payload.player,
                payload.targetPosition,
                payload.timestamp
            )
        }

        if (type === 'crossFade') {
            crossFade(payload.position)
        }
    }

    useEffect(() => {
        // Update message callback (workaround to avoid scope issues)
        if (websocket !== null) {
            websocket.onmessage = onMessage
        }
    })

    const initCrossFader = () => {
        if (crossFader === null) {
            const newCrossFader = new Tone.CrossFade(0.5).toDestination()
            setCrossFader(newCrossFader)
        }
    }

    useEffect(() => {
        if (player_A === null && crossFader !== null) {
            const newPlayer = new Tone.Player()
            newPlayer.connect(crossFader.a)
            setPlayer_A(newPlayer)
        }

        if (player_B === null && crossFader !== null) {
            const newPlayer = new Tone.Player()
            newPlayer.connect(crossFader.b)
            setPlayer_B(newPlayer)
        }

        if (player_A !== null && !loaded_A && !loading_A) {
            setLoading_A(true)
            player_A.load(sample_01).then(() => {
                setLoading_A(false)
                setLoaded_A(true)
            })
        }

        if (player_B !== null && !loaded_B && !loading_B) {
            setLoading_B(true)
            player_B.load(sample_02).then(() => {
                setLoading_B(false)
                setLoaded_B(true)
            })
        }
    })

    return (
        <div className="app_container">
            {!websocketConnected && <h1>Connecting to server...</h1>}

            {websocketConnected && !clientRegistered && (
                <button
                    className="app_button_start"
                    onClick={() => {
                        if (crossFader === null) {
                            initCrossFader()
                        }
                        registerClient()
                    }}
                >
                    Start
                </button>
            )}

            {loading_A || loading_B ? <h1>Loading...</h1> : <React.Fragment />}

            {crossFader !== null &&
                clientRegistered &&
                !loading_A &&
                !loading_B &&
                loaded_A &&
                loaded_B && (
                    <div className="app_player_container">
                        <div className="app_players">
                            <Player
                                onClickForward={(offset_MS) => {
                                    handleClickFastForward(1, offset_MS)
                                }}
                                onClickPlay={() => {
                                    handleClickPlay(1)
                                }}
                                onClickStop={() => {
                                    handleClickStop(1)
                                }}
                            />
                            <Player
                                onClickForward={(offset_MS) => {
                                    handleClickFastForward(2, offset_MS)
                                }}
                                onClickPlay={() => {
                                    handleClickPlay(2)
                                }}
                                onClickStop={() => {
                                    handleClickStop(2)
                                }}
                            />
                        </div>
                        <input
                            className="slider"
                            type="range"
                            min="0"
                            max="100"
                            value={crossFaderPosition}
                            onChange={(event) => {
                                handleClickCrossFade(
                                    parseInt(event.target.value)
                                )
                            }}
                        ></input>
                    </div>
                )}
        </div>
    )
}
