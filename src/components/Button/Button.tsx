import React from 'react'
import './Button.css'

export interface ButtonProps {
    background: string
    color: string
    onClick: () => void
    text: string
}

export const Button: React.FC<ButtonProps> = ({
    background,
    color,
    onClick,
    text,
}) => (
    <button onClick={onClick} className="button" style={{ background, color }}>
        {text}
    </button>
)
