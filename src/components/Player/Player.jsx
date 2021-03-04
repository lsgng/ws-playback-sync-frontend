import React from 'react'
import './Player.css'

export const Player = ({ onClickPlay, onClickStop, onClickForward }) => {
    return (
        <div className="player">
            <div>
                <button className="player_button_play" onClick={onClickPlay}>
                    Play
                </button>
                <button className="player_button_stop" onClick={onClickStop}>
                    Stop
                </button>
            </div>
            <div>
                <button
                    className="player_button_forward"
                    onClick={() => {
                        onClickForward(25)
                    }}
                >
                    +25 ms
                </button>
                <button
                    className="player_button_forward"
                    onClick={() => {
                        onClickForward(100)
                    }}
                >
                    +100 ms
                </button>
            </div>
        </div>
    )
}
