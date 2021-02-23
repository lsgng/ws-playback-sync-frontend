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

    useEffect(() => {
        if (socket === null) {
            const newSocket = new WebSocket('ws://localhost:1234/ws')
            newSocket.onopen = () => {
                setConnected(true)
            }
            newSocket.onmessage = (msg) => {
                console.log(msg)
                if (msg.data === 'register') {
                    setRegistered(true)
                }
            }
            setSocket(newSocket)
        }

        return () => {
            socket.current.close()
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

    return !connected ? (
        <h1>Connecting to server...</h1>
    ) : (
        <div>
            <button
                onClick={() => {
                    if (crossFade === null) {
                        initCrossFade()
                    }
                    registerClient()
                }}
            >
                Start
            </button>
            {crossFade !== null && registered && (
                <Deck crossFadeInput={crossFade.a} sample={sample_01} />
            )}
            {crossFade !== null && registered && (
                <Deck crossFadeInput={crossFade.b} sample={sample_02} />
            )}
            {crossFade !== null && registered && (
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={fade}
                    onChange={(event) => {
                        crossFade.fade.value = event.target.value / 100
                        setFade(event.target.value)
                    }}
                ></input>
            )}
        </div>
    )
}