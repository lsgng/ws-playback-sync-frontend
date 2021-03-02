import React, { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import './App.css'
import sample_01 from '../../assets/01.mp3'
import sample_02 from '../../assets/02.mp3'
import { Deck } from '../Deck/Deck'
import Axios from 'axios'
import axios from 'axios'

export const App = () => {
    const [registeringClient, setRegisteringClient] = useState(false)
    const [clientRegistered, setClientRegistered] = useState(false)
    const [clientID, setClientID] = useState(null)

    const [connectingWebsocket, setConnectingWebsocket] = useState(false)
    const [websocketConnected, setWebsocketConnected] = useState(false)
    const [websocket, setWebsocket] = useState(null)

    const [crossFade, setCrossFade] = useState(null)
    const [fade, setFade] = useState(50)

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
            const newSocket = new WebSocket('ws://localhost:1234/websocket')
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
        const registerMessage = { type: 'register' }
        websocket.send(JSON.stringify(registerMessage))
    }

    const play = (decḱ) => {
        const playMessage = { type: 'play', payload: deck }
        websocket.send(JSON.stringify(playMessage))
    }

    const stop = (decḱ) => {
        const stopMessage = { type: 'stop', payload: deck }
        websocket.send(JSON.stringify(stopMessage))
    }

    const onMessage = (message) => {
        console.log(message)
        const { type, payload } = JSON.parse(message.data)

        if (type === 'registered') {
            setClientRegistered(true)
            setClientID(payload.userId)
        }

        if (type === 'play') {
            if (payload === 1) {
                play_A()
            } else if (payload === 2) {
                play_B()
            }
        }

        if (type === 'stop') {
            if (payload === 1) {
                player_A.stop()
            } else if (payload === 2) {
                player_B.stop()
            }
        }
    }

    useEffect(() => {
        // Update message callback
        if (websocket !== null) {
            websocket.onmessage = onMessage
        }
    })

    const initCrossFade = () => {
        if (crossFade === null) {
            const newCrossFade = new Tone.CrossFade(0.5).toDestination()
            setCrossFade(newCrossFade)
        }
    }

    useEffect(() => {
        if (player_A === null && crossFade !== null) {
            const newPlayer = new Tone.Player()
            newPlayer.connect(crossFade.a)
            setPlayer_A(newPlayer)
        }

        if (player_B === null && crossFade !== null) {
            const newPlayer = new Tone.Player()
            newPlayer.connect(crossFade.b)
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

    const play_A = () => {
        player_A.start()
        setLastStarted_MS_A(Date.now())
        setLastStartPoint_MS_A(0)
    }

    const play_B = () => {
        player_B.start()
        setLastStarted_MS_B(Date.now())
        setLastStartPoint_MS_B(0)
    }

    const forward_A = (offset_MS) => {
        let now_MS = Date.now()
        const timePlayed_MS = now_MS - lastStarted_MS_A + lastStartPoint_MS_A
        const seekPosition_MS = timePlayed_MS + offset_MS
        player_A.seek(seekPosition_MS / 1000, Tone.now())
        setLastStarted_MS_A(now_MS)
        setLastStartPoint_MS_A(seekPosition_MS)
    }

    const forward_B = (offset_MS) => {
        let now_MS = Date.now()
        const timePlayed_MS = now_MS - lastStarted_MS_B + lastStartPoint_MS_B
        const seekPosition_MS = timePlayed_MS + offset_MS
        player_B.seek(seekPosition_MS / 1000, Tone.now())
        setLastStarted_MS_B(now_MS)
        setLastStartPoint_MS_B(seekPosition_MS)
    }

    return (
        <div className="app_container">
            {!websocketConnected && <h1>Connecting to server...</h1>}

            {websocketConnected && !clientRegistered && (
                <button
                    className="app_button_start"
                    onClick={() => {
                        if (crossFade === null) {
                            initCrossFade()
                        }
                        registerClient()
                    }}
                >
                    Start
                </button>
            )}

            {loading_A || loading_B ? <h1>Loading...</h1> : <React.Fragment />}

            {crossFade !== null &&
                clientRegistered &&
                !loading_A &&
                !loading_B &&
                loaded_A &&
                loaded_B && (
                    <div className="app_deck_container">
                        <div className="app_decks">
                            <Deck
                                onClickForward={forward_A}
                                onClickPlay={() => {
                                    play(1)
                                }}
                                onClickStop={() => {
                                    stop(1)
                                }}
                            />
                            <Deck
                                onClickForward={forward_B}
                                onClickPlay={() => {
                                    play(2)
                                }}
                                onClickStop={() => {
                                    stop(2)
                                }}
                            />
                        </div>
                        <input
                            className="slider"
                            type="range"
                            min="0"
                            max="100"
                            value={fade}
                            onChange={(event) => {
                                crossFade.fade.value = event.target.value / 100
                                setFade(event.target.value)
                            }}
                        ></input>
                    </div>
                )}
        </div>
    )
}
