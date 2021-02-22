import React, { useEffect, useState } from 'react'
import * as Tone from 'tone'

export const Deck = ({ crossFadeInput, sample }) => {
    const [player, setPlayer] = useState(null)
    const [playbackRate, setPlaybackRate] = useState(500)

    const play = () => {
        if (player === null) {
            const newPlayer = new Tone.Player(sample)
            newPlayer.autostart = true
            newPlayer.connect(crossFadeInput)
            setPlayer(newPlayer)
        } else {
            player.start()
        }
    }

    return (
        <div>
            <button onClick={play}>PLAY</button>
            <button
                disabled={player == null}
                onClick={() => {
                    player.stop()
                }}
            >
                STOP
            </button>
            <input
                type="range"
                min="0"
                max="1000"
                value={playbackRate}
                onChange={(event) => {
                    player.playbackRate =
                        0.5 + 1.5 * (event.target.value / 1000)
                    setPlaybackRate(event.target.value)
                }}
            ></input>
        </div>
    )
}
