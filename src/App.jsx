import React, { useEffect, useRef, useState } from 'react'
import * as Tone from 'tone'
import { Deck } from './Deck'
import sample_01 from './assets/01.mp3'
import sample_02 from './assets/02.mp3'

export const App = () => {
    const ws = useRef(null)
    const [connected, setConnected] = useState(false)

    useEffect(() => {
        console.log('connecting')
        ws.current = new WebSocket('ws://localhost:1234/ws')
        ws.current.onopen = () => {
            setConnected(true)
        }
        ws.current.onmessage = (msg) => {
            console.log(msg)
        }

        return () => {
            ws.current.close()
        }
    }, [])

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
                    ws.current.send('AWASOBABA')
                    if (crossFade === null) {
                        initCrossFade()
                    }
                }}
            >
                START
            </button>
            {crossFade && (
                <Deck crossFadeInput={crossFade.a} sample={sample_01} />
            )}
            {crossFade && (
                <Deck crossFadeInput={crossFade.b} sample={sample_02} />
            )}
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
        </div>
    )
}
