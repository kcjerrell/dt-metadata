import { createContext, type PropsWithChildren, useContext, useEffect, useRef } from "react"
import { proxy, useSnapshot } from "valtio"

type MessageContextType = {
	channels: Record<string, MessageChannel>
	postMessage: (message: Omit<Message, "id">) => void
	removeMessage: (message: Message) => void
}
type MessageChannel = {
	id: string
	messages: Message[]
	removeMessage: (message: Message) => void
}
type Message = {
	id: number
	channel: string
	message: string
	duration?: number
	source?: unknown
}

let messageIdCounter = 0
export const MessageContext = createContext<MessageContextType | null>(null)

export function MessageProvider(props: PropsWithChildren) {
	const { children } = props

	const store = useRef<MessageContextType>(null)

	if (store.current === null) {
		store.current = proxy({
			channels: {},
			postMessage: (message: Omit<Message, "id">) => {
				const channel = message.channel
				if (!store.current?.channels?.[channel]) return
				store.current.channels[channel].messages.push({ ...message, id: messageIdCounter++ })
			},
			removeMessage: (message: Message) => {
				const channel = store.current?.channels[message.channel]
				if (!channel) return
				const index = channel?.messages.findIndex((m) => m.id === message.id)
				if (index === -1) return
				channel.messages.splice(index, 1)
			},
		})
	}

	return <MessageContext value={store.current}>{children}</MessageContext>
}

export function usePostMessage() {
	const context = useContext(MessageContext)
	if (context === null) {
		throw new Error("usePostMessage must be used within a MessageProvider")
	}
	return context.postMessage
}

export function useMessages(type: string) {
	const context = useContext(MessageContext)
	if (context === undefined || context === null) {
		throw new Error("useMessages must be used within a MessageProvider")
	}

	if (!context?.channels[type]) {
		context.channels[type] = {
			id: type,
			messages: [],
			removeMessage: (message: Message) => {
				context.removeMessage(message)
			},
		}
	}

	const snap = useSnapshot(context)

	return snap.channels[type]
}
