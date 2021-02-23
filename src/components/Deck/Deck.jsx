import React, { useEffect, useState } from 'react'
import * as Tone from 'tone'

export const Deck = ({ crossFadeInput, sample }) => {
    const [player, setPlayer] = useState(null)
    const [loaded, setLoaded] = useState(false)
    const [playbackRate, setPlaybackRate] = useState(500)

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
        <div>
            <button disabled={!loaded} onClick={play}>
                PLAY
            </button>
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
            <button
                disabled={player === null}
                onClick={() => {
                    forward(25)
                }}
            >
                &gt;
            </button>
            <button
                disabled={player === null}
                onClick={() => {
                    forward(100)
                }}
            >
                &gt;&gt;
            </button>
        </div>
    )
}
