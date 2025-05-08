import { Button } from '@/components/ui/button'
import React from 'react'
import GradientStrokeText from './GradientText'

interface NewChatSuggestionProps {
  name?: string;
  onSendMessage: (message: string) => void;
}

export default function NewChatSuggestion({
  name,
  onSendMessage,
}: NewChatSuggestionProps) {

  // Reusable handler
  const handleQuickMessage = (quickMsg: string) => {
    const trimmedMessage = quickMsg.trim();
    onSendMessage(trimmedMessage);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-8 w-full h-full">
        <GradientStrokeText text={`Hello ${name}`} />
        <p className="text-gray-600 mb-8 font-unilever text-xs">
          Tap into the expertise of{" "}
          <span className="font-unilever-medium">France market 2024 Skill</span>, ask your questions!
        </p>

        <div className="flex gap-4 flex-wrap justify-center mt-[-1%]">
          {[
            "What are the sales figures for January?",
            "Create an average report for 2024",
            "What are the average sales figures for 2024?"
          ].map((text, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="text-xs rounded-[5px] px-3 border border-gray-200 bg-[#FBF6F8] py-3 font-unilever cursor-pointer"
              onClick={() => handleQuickMessage(text)}
            >
              {text}
            </Button>
          ))}
        </div>
      </div>
    </>
  );
}
