import React, { useEffect, useState } from 'react'
import './Deck.css'

export const Deck = ({ onClickPlay, onClickStop, onClickForward }) => {
    return (
        <div className="deck">
            <div>
                <button className="deck_button_play" onClick={onClickPlay}>
                    Play
                </button>
                <button className="deck_button_stop" onClick={onClickStop}>
                    Stop
                </button>
            </div>
            <div>
                <button
                    className="deck_button_forward"
                    onClick={() => {
                        onClickForward(25)
                    }}
                >
                    +25 ms
                </button>
                <button
                    className="deck_button_forward"
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
