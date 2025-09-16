import { createContext, type PropsWithChildren, useContext, useRef } from "react"
import { proxy, useSnapshot } from "valtio"

type MessagesContextType = {
	channels: Record<string, MessageChannel>
	postMessage: (message: Omit<Message, "id">) => void
	removeMessage: (message: Pick<Message, 'id' | 'channel'>) => void
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
export const MessagesContext = createContext<MessagesContextType | null>(null)

export function MessagesProvider(props: PropsWithChildren) {
	const { children } = props

	const store = useRef<MessagesContextType>(null)

	if (store.current === null) {
		store.current = proxy({
			channels: {},
			postMessage: (message: Omit<Message, "id">) => {
				const channel = message.channel
				if (!store.current?.channels?.[channel]) return
				const id = messageIdCounter++
				store.current.channels[channel].messages.push({ ...message, id })
				return () => {
					store.current.removeMessage({channel, id})
				}
			},
			removeMessage: (message: Pick<Message, 'id' | 'channel'>) => {
				const channel = store.current?.channels[message.channel]
				if (!channel) return
				const index = channel?.messages.findIndex((m) => m.id === message.id)
				if (index === -1) return
				channel.messages.splice(index, 1)
			},
		})
	}

	return <MessagesContext value={store.current}>{children}</MessagesContext>
}

export function usePostMessage() {
	const context = useContext(MessagesContext)
	if (context === null) {
		throw new Error("usePostMessage must be used within a MessageProvider")
	}
	return context.postMessage
}

export function useMessages(type: string) {
	const context = useContext(MessagesContext)
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
