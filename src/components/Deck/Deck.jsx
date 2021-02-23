import React, { useEffect, useState } from 'react'
import * as Tone from 'tone'
import './Deck.css'

export const Deck = ({ crossFadeInput, sample }) => {
    const [player, setPlayer] = useState(null)
    const [loaded, setLoaded] = useState(false)

    const [lastStarted_MS, setLastStarted_MS] = useState(Date.now())
    const [lastStartPoint_MS, setLastStartPoint_MS] = useState(0)

    useEffect(() => {
        if (player === null) {
            const newPlayer = new Tone.Player()
            newPlayer.connect(crossFadeInput)
            setPlayer(newPlayer)
        }

        if (player !== null && !loaded) {
            player.load(sample).then(() => {
                setLoaded(true)
            })
        }
    })

    const play = () => {
        player.start()
        setLastStarted_MS(Date.now())
        setLastStartPoint_MS(0)
    }

    const forward = (offset_MS) => {
        let now_MS = Date.now()
        const timePlayed_MS = now_MS - lastStarted_MS + lastStartPoint_MS
        const seekPosition_MS = timePlayed_MS + offset_MS
        player.seek(seekPosition_MS / 1000, Tone.now())
        setLastStarted_MS(now_MS)
        setLastStartPoint_MS(seekPosition_MS)
    }

    return (
        <div className="deck">
            <div>
                <button
                    className="deck_button_play"
                    disabled={!loaded}
                    onClick={play}
                >
                    Play
                </button>
                <button
                    className="deck_button_stop"
                    disabled={player == null}
                    onClick={() => {
                        player.stop()
                    }}
                >
                    Stop
                </button>
            </div>
            <div>
                <button
                    className="deck_button_forward"
                    disabled={player === null}
                    onClick={() => {
                        forward(25)
                    }}
                >
                    +25 ms
                </button>
                <button
                    className="deck_button_forward"
                    disabled={player === null}
                    onClick={() => {
                        forward(100)
                    }}
                >
                    +100 ms
                </button>
            </div>
        </div>
    )
}
