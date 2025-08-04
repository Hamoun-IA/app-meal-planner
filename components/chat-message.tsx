import { ChatMessage } from "@/hooks/use-chat"
import { cn } from "@/lib/utils"

interface ChatMessageProps {
  message: ChatMessage
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.isBot ? "justify-start" : "justify-end"} animate-fade-in-up`}>
      <div
        className={cn(
          "max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg",
          message.isBot
            ? "bg-white text-gray-800 rounded-bl-sm"
            : "bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-br-sm"
        )}
      >
        <p className="text-sm">
          {message.text}
          {message.isLoading && (
            <span className="inline-block ml-1">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-100">●</span>
              <span className="animate-pulse delay-200">●</span>
            </span>
          )}
        </p>
        <p 
          className={cn(
            "text-xs mt-1",
            message.isBot ? "text-gray-500" : "text-white/70"
          )}
        >
          {message.time}
        </p>
      </div>
    </div>
  )
} 