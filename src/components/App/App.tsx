import React, { useEffect, useState } from 'react'
import * as Tone from 'tone'
import sample_01 from '../../assets/01.mp3'
import sample_02 from '../../assets/02.mp3'
import {
    IncomingMessage,
    IncomingMessageType,
    OutgoingMessageCrossFade,
    OutgoingMessageFastForward,
    OutgoingMessagePlay,
    OutgoingMessageStop,
    OutgoingMessageType,
    PlayerID,
    WebSocketMessage,
} from '../../lib/message'
import { assertIsDefined } from '../../lib/utils'
import { Button } from '../Button/Button'
import { Player } from '../Player/Player'
import './App.css'

export const App: React.FC = () => {
    // Client state
    const [registeringClient, setRegisteringClient] = useState(false)
    const [clientRegistered, setClientRegistered] = useState(false)
    const [clientId, setClientId] = useState<string | null>(null)

    // WebSocket state
    const [connectingWebSocket, setConnectingWebSocket] = useState(false)
    const [webSocketConnected, setWebSocketConnected] = useState(false)
    const [webSocket, setWebSocket] = useState<WebSocket | null>(null)

    // Crossfader state
    const [crossFader, setCrossFader] = useState<Tone.CrossFade | null>(null)
    const [crossFaderPosition, setCrossFaderPosition] = useState(50)

    // Players state
    const [player_A, setPlayer_A] = useState<Tone.Player | null>(null)
    const [loading_A, setLoading_A] = useState(false)
    const [loaded_A, setLoaded_A] = useState(false)
    const [player_B, setPlayer_B] = useState<Tone.Player | null>(null)
    const [loading_B, setLoading_B] = useState(false)
    const [loaded_B, setLoaded_B] = useState(false)

    // Playback state
    const [lastStarted_A, setLastStarted_A] = useState(Date.now())
    const [lastStartPoint_A, setLastStartPoint_A] = useState(0)
    const [lastStarted_B, setLastStarted_B] = useState(Date.now())
    const [lastStartPoint_B, setLastStartPoint_B] = useState(0)

    // Initialize players and load samples
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

    // Initialize WebSocket connection
    useEffect(() => {
        if (
            webSocket === null &&
            webSocketConnected === false &&
            connectingWebSocket === false
        ) {
            setConnectingWebSocket(true)
            const webSocketEndpoint = process.env.WS_ENDPOINT
            const newSocket = new WebSocket(
                webSocketEndpoint !== undefined
                    ? webSocketEndpoint
                    : 'ws://localhost:8000'
            )
            newSocket.onopen = () => {
                setConnectingWebSocket(false)
                setWebSocketConnected(true)
            }
            newSocket.onmessage = onMessage
            setWebSocket(newSocket)
        }

        return () => {
            webSocket && webSocket.close()
        }
    }, [])

    // Update message callback after WebSocket initialization (workaround to avoid scope issues)
    useEffect(() => {
        if (webSocket !== null) {
            webSocket.onmessage = onMessage
        }
    })

    const onMessage = (message: WebSocketMessage) => {
        const data: IncomingMessage = JSON.parse(message.data)
        switch (data.type) {
            case IncomingMessageType.RegistrationSuccess: {
                setClientRegistered(true)
                setClientId(data.payload.clientId)
                setRegisteringClient(false)
                break
            }

            case IncomingMessageType.Play: {
                play(data.payload.player, data.payload.timestamp)
                break
            }

            case IncomingMessageType.Stop: {
                if (data.payload.player === PlayerID.A) {
                    assertIsDefined(player_A)
                    player_A.stop()
                } else if (data.payload.player === PlayerID.B) {
                    assertIsDefined(player_B)
                    player_B.stop()
                }
                break
            }

            case IncomingMessageType.FastForward: {
                fastForward(
                    data.payload.player,
                    data.payload.targetPosition,
                    data.payload.timestamp
                )
                break
            }

            case IncomingMessageType.CrossFade: {
                crossFade(data.payload.position)
                break
            }
        }
    }

    const registerClient = () => {
        setRegisteringClient(true)
        const registrationMessage = { type: 'registration' }
        assertIsDefined(webSocket)
        webSocket.send(JSON.stringify(registrationMessage))
    }

    const initCrossFader = () => {
        if (crossFader === null) {
            const newCrossFader = new Tone.CrossFade(0.5).toDestination()
            setCrossFader(newCrossFader)
        }
    }

    const handleClickPlay = (player: PlayerID) => {
        const timestamp = Date.now()
        play(player, timestamp)

        assertIsDefined(clientId)
        const playMessage: OutgoingMessagePlay = {
            type: OutgoingMessageType.Play,
            payload: { clientId, player, timestamp },
        }
        assertIsDefined(webSocket)
        webSocket.send(JSON.stringify(playMessage))
    }

    const play = (player: PlayerID, playEventTimestamp: number) => {
        const startPoint = Date.now() - playEventTimestamp
        const startPoint_S = startPoint / 1000
        if (player === PlayerID.A) {
            assertIsDefined(player_A)
            player_A.start(Tone.now(), startPoint_S)
            setLastStarted_A(playEventTimestamp)
            setLastStartPoint_A(startPoint)
        } else if (player === PlayerID.B) {
            assertIsDefined(player_B)
            player_B.start(Tone.now(), startPoint_S)
            setLastStarted_B(playEventTimestamp)
            setLastStartPoint_B(startPoint)
        }
    }

    const handleClickStop = (player: PlayerID) => {
        const timestamp = Date.now()
        if (player === PlayerID.A) {
            assertIsDefined(player_A)
            player_A.stop()
        } else if (player === PlayerID.B) {
            assertIsDefined(player_B)
            player_B.stop()
        }

        assertIsDefined(clientId)
        const stopMessage: OutgoingMessageStop = {
            type: OutgoingMessageType.Stop,
            payload: { clientId, player, timestamp },
        }
        assertIsDefined(webSocket)
        webSocket.send(JSON.stringify(stopMessage))
    }

    const handleClickFastForward = (player: PlayerID, offset: number) => {
        const timestamp = Date.now()
        let targetPosition = 0
        if (player === PlayerID.A) {
            const playbackPosition_A =
                timestamp - lastStarted_A + lastStartPoint_A
            let targetPosition_A = playbackPosition_A + offset
            fastForward(PlayerID.A, targetPosition_A, timestamp)
            targetPosition = targetPosition_A
        } else if (player === PlayerID.B) {
            const playbackPosition_B =
                timestamp - lastStarted_B + lastStartPoint_B
            let targetPosition_B = playbackPosition_B + offset
            fastForward(PlayerID.B, targetPosition_B, timestamp)
            targetPosition = targetPosition_B
        }

        assertIsDefined(clientId)
        const fastForwardMessage: OutgoingMessageFastForward = {
            type: OutgoingMessageType.FastForward,
            payload: {
                clientId,
                player,
                targetPosition,
                timestamp,
            },
        }
        assertIsDefined(webSocket)
        webSocket.send(JSON.stringify(fastForwardMessage))
    }

    const fastForward = (
        player: PlayerID,
        targetPosition: number,
        fastForwardEventTimestamp: number
    ) => {
        const now = Date.now()
        const latency = now - fastForwardEventTimestamp
        const seekPosition = targetPosition + latency
        if (player === PlayerID.A) {
            assertIsDefined(player_A)
            player_A.seek(seekPosition / 1000, Tone.now())
            setLastStarted_A(now)
            setLastStartPoint_A(seekPosition)
        } else if (player === PlayerID.B) {
            assertIsDefined(player_B)
            player_B.seek(seekPosition / 1000, Tone.now())
            setLastStarted_B(now)
            setLastStartPoint_B(seekPosition)
        }
    }

    const handleClickCrossFade = (position: number) => {
        crossFade(position)

        assertIsDefined(clientId)
        const crossFadeMessage: OutgoingMessageCrossFade = {
            type: OutgoingMessageType.CrossFade,
            payload: {
                clientId,
                position,
            },
        }
        assertIsDefined(webSocket)
        webSocket.send(JSON.stringify(crossFadeMessage))
    }

    const crossFade = (position: number) => {
        assertIsDefined(crossFader)
        crossFader.fade.value = position / 100
        setCrossFaderPosition(position)
    }

    return (
        <div className="app_container">
            {!webSocketConnected && <h1>Connecting to server...</h1>}

            {webSocketConnected && !clientRegistered && !registeringClient && (
                <Button
                    background="green"
                    color="white"
                    onClick={() => {
                        if (crossFader === null) {
                            initCrossFader()
                        }
                        registerClient()
                    }}
                    text="Start"
                />
            )}

            {loading_A || loading_B || registeringClient ? (
                <h1>Loading...</h1>
            ) : (
                <React.Fragment />
            )}

            {crossFader !== null &&
                clientRegistered &&
                !loading_A &&
                !loading_B &&
                loaded_A &&
                loaded_B && (
                    <div className="app_player_container">
                        <div className="app_players">
                            <Player
                                onClickForward={(offset) => {
                                    handleClickFastForward(PlayerID.A, offset)
                                }}
                                onClickPlay={() => {
                                    handleClickPlay(PlayerID.A)
                                }}
                                onClickStop={() => {
                                    handleClickStop(PlayerID.A)
                                }}
                            />
                            <Player
                                onClickForward={(offset) => {
                                    handleClickFastForward(PlayerID.B, offset)
                                }}
                                onClickPlay={() => {
                                    handleClickPlay(PlayerID.B)
                                }}
                                onClickStop={() => {
                                    handleClickStop(PlayerID.B)
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
