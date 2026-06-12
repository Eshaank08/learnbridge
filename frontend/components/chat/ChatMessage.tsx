import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart } from "lucide-react";
import BlueOrbAvatar from './BlueOrbAvatar';

interface ChatMessageProps {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  emotion_detected?: string;
  userAvatar?: string;
  userInitial?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  id,
  content,
  sender,
  timestamp,
  emotion_detected,
  userAvatar,
  userInitial = 'U'
}) => {
  return (
    <div
      key={id}
      className={`flex ${sender === "user" ? "justify-end" : "justify-start"} mb-4`}
    >
      {sender === "ai" && (
        <div className="mr-2">
          <BlueOrbAvatar size="md" />
        </div>
      )}
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          sender === "user" 
            ? "bg-blue-600 text-white" 
            : "bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900 border border-blue-200"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs opacity-70">
            {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          {emotion_detected && sender === "user" && (
            <span className="text-xs opacity-70 flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {emotion_detected}
            </span>
          )}
        </div>
      </div>
      {sender === "user" && (
        <div className="ml-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userAvatar || "/user-avatar.png"} alt="User" />
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
