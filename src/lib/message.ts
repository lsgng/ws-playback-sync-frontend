export enum PlayerID {
    A,
    B,
}

export interface WebSocketMessage {
    data: string
}

export enum IncomingMessageType {
    RegistrationSuccess = 'registrationSuccess',
    Play = 'play',
    Stop = 'Stop',
    FastForward = 'fastForward',
    CrossFade = 'crossFade',
}

export type IncomingMessage =
    | IncomingMessageRegistrationSuccess
    | IncomingMessagePlay
    | IncomingMessageStop
    | IncomingMessageFastForward
    | IncomingMessageCrossFade

export interface IncomingMessageRegistrationSuccess {
    type: IncomingMessageType.RegistrationSuccess
    payload: {
        clientId: string
    }
}

export interface IncomingMessagePlay {
    type: IncomingMessageType.Play
    payload: {
        player: PlayerID
        timestamp: number
    }
}

export interface IncomingMessageStop {
    type: IncomingMessageType.Stop
    payload: {
        player: PlayerID
    }
}

export interface IncomingMessageFastForward {
    type: IncomingMessageType.FastForward
    payload: {
        player: PlayerID
        targetPosition: number
        timestamp: number
    }
}

export interface IncomingMessageCrossFade {
    type: IncomingMessageType.CrossFade
    payload: {
        position: number
    }
}

export enum OutgoingMessageType {
    Registration = 'registration',
    Play = 'play',
    Stop = 'Stop',
    FastForward = 'fastForward',
    CrossFade = 'crossFade',
}

export type OutgoingMessageRegistration = {
    type: OutgoingMessageType.Registration
}

export interface OutgoingMessagePlay {
    type: OutgoingMessageType.Play
    payload: {
        clientId: string
        player: PlayerID
        timestamp: number
    }
}

export interface OutgoingMessageStop {
    type: OutgoingMessageType.Stop
    payload: {
        clientId: string
        player: PlayerID
        timestamp: number
    }
}

export interface OutgoingMessageFastForward {
    type: OutgoingMessageType.FastForward
    payload: {
        clientId: string
        player: PlayerID
        targetPosition: number
        timestamp: number
    }
}

export interface OutgoingMessageCrossFade {
    type: OutgoingMessageType.CrossFade
    payload: {
        clientId: string
        position: number
    }
}
