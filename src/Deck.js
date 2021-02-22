import React, { useEffect, useState } from 'react'
import * as Tone from 'tone'
import sample_01 from './assets/01.mp3'

export const Deck = () => {
    const [player, setPlayer] = useState(null)
    const [playbackRate, setPlaybackRate] = useState(500)
    const [volume, setVolume] = useState(50)

    const play = () => {
        if (player == null) {
            const newPlayer = new Tone.Player(sample_01).toDestination()
            newPlayer.autostart = true
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
            <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => {
                    player.volume.value = -24 + 24 * (event.target.value / 100)
                    setVolume(event.target.value)
                }}
            ></input>
        </div>
    )
}
