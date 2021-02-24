import React, { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import './App.css'
import sample_01 from '../../assets/01.mp3'
import sample_02 from '../../assets/02.mp3'
import { Deck } from '../Deck/Deck'

export const App = () => {
    const [socket, setSocket] = useState(null)
    const [connected, setConnected] = useState(false)
    const [registered, setRegistered] = useState(false)

    const [player_A, setPlayer_A] = useState(null)
    const [loaded_A, setLoaded_A] = useState(false)

    const [lastStarted_MS_A, setLastStarted_MS_A] = useState(Date.now())
    const [lastStartPoint_MS_B, setLastStartPoint_MS_B] = useState(0)

    useEffect(() => {
        if (player_A === null && crossFade !== null) {
            const newPlayer = new Tone.Player()
            newPlayer.connect(crossFade.a)
            setPlayer_A(newPlayer)
        }

        if (player_A !== null && !loaded_A) {
            player_A.load(sample_01).then(() => {
                setLoaded_A(true)
            })
        }
    })

    useEffect(() => {
        if (socket !== null) {
            socket.onmessage = onMessage
        }
    })

    const play = () => {
        player_A.start()
        setLastStarted_MS_A(Date.now())
        setLastStartPoint_MS_B(0)
    }

    const forward = (offset_MS) => {
        let now_MS = Date.now()
        const timePlayed_MS = now_MS - lastStarted_MS_A + lastStartPoint_MS_B
        const seekPosition_MS = timePlayed_MS + offset_MS
        player_A.seek(seekPosition_MS / 1000, Tone.now())
        setLastStarted_MS_A(now_MS)
        setLastStartPoint_MS_B(seekPosition_MS)
    }

    const onMessage = (message) => {
        const payload = JSON.parse(message.data).body
        if (payload === 'register') {
            setRegistered(true)
        }
        if (payload === 'play') {
            play()
        }
        if (payload === 'stop') {
            player_A.stop()
        }
    }

    useEffect(() => {
        if (socket === null) {
            const newSocket = new WebSocket('ws://localhost:1234/ws')
            newSocket.onopen = () => {
                setConnected(true)
            }
            newSocket.onmessage = onMessage
            setSocket(newSocket)
        }

        return () => {
            socket.close()
        }
    }, [])

    const registerClient = () => {
        socket.send('register')
    }

    const [crossFade, setCrossFade] = useState(null)
    const [fade, setFade] = useState(50)

    const initCrossFade = () => {
        if (crossFade === null) {
            const newCrossFade = new Tone.CrossFade(0.5).toDestination()
            setCrossFade(newCrossFade)
        }
    }

    return (
        <div className="app_container">
            {!connected && <h1>Connecting to server...</h1>}

            {connected && !registered && (
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

            {crossFade !== null && registered && (
                <div className="app_deck_container">
                    <div className="app_decks">
                        <Deck
                            onClickForward={forward}
                            onClickPlay={() => {
                                socket.send('play')
                            }}
                            onClickStop={() => {
                                socket.send('stop')
                            }}
                        />
                        <Deck />
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
