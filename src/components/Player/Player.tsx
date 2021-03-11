import React from 'react'
import { Button } from '../Button/Button'
import './Player.css'

export interface PlayerProps {
    onClickPlay: () => void
    onClickStop: () => void
    onClickForward: (offset: number) => void
}

export const Player: React.FC<PlayerProps> = ({
    onClickPlay,
    onClickStop,
    onClickForward,
}) => (
    <div className="player">
        <div>
            <Button
                background="green"
                color="white"
                onClick={onClickPlay}
                text="Play"
            />
            <Button
                background="red"
                color="white"
                onClick={onClickStop}
                text="Stop"
            />
        </div>
        <div>
            <Button
                background="lightgrey"
                color="black"
                onClick={() => {
                    onClickForward(25)
                }}
                text="+25 ms"
            />
            <Button
                background="lightgrey"
                color="black"
                onClick={() => {
                    onClickForward(100)
                }}
                text="+100 ms"
            />
        </div>
    </div>
)
