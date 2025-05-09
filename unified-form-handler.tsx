import React, { useEffect, useRef, useState } from "react";
import { Sparkle, Copy, Pencil, ThumbsUp, ThumbsDown, RotateCcw, Check } from "lucide-react";
import ChatMessage from "./ChatMessageModel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";

type ComponentProps = {
  node?: any;
  [key: string]: any;
};

interface ChatMessagesProps {
    messages: ChatMessage[];
    avatar?: string;
    name?: string;
}

function ChatMessages({ messages, avatar, name }: ChatMessagesProps) {
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editedText, setEditedText] = useState("");
    const thinkingText = "Thinking...";



    const endOfMessagesRef = useRef<HTMLDivElement | null>(null);

    const handleCopy = async (text: string, id: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 1500); // Reset after 1.5s
        } catch (err) {
            console.error("Failed to copy text:", err);
        }
    };

    const handleSave = (id: number) => {
        // setMessages(prev =>
        //   prev.map(msg =>
        //     msg.id === id ? { ...msg, message: editedText } : msg
        //   )
        // );
        setEditingId(null);
        setEditedText("");
    };

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // Auto-adjust height on `editedText` change
    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    }, [editedText]);

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);
    return (
        <div className="flex-1 overflow-y-scroll max-h-[calc(85vh-8.3rem)] pl-1 scrollbar-hide  w-[55.8vw] mx-auto mt-4">
            <div className="flex flex-col gap-4 mx-auto">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-1 gap-2 align-middle ${msg.role.toLowerCase() === "user" ? "justify-end" : "justify-start"
                            }`}
                    >
                        {(msg.role.toLowerCase() === "msb_admin" || msg.role.toLowerCase() === "ai" || msg.role.toLowerCase() === "bot") && (
                            <div className="rounded-full self-start text-white bg-[#1F36C7] p-2">
                                <Sparkle size={20} />

                            </div>
                        )}
                        <div className="relative group max-w-[89.5%]">
                            {editingId === msg.id ? (
                                <div
                                    className={`flex flex-col w-[42vw] gap-2 overflow-hidden bg-[#EDF0FF] border border-[#d0d8ff] rounded-lg transition-all duration-500 ease-in-out
                                     ${editingId === msg.id ? "p-3 opacity-100" : "p-0 opacity-0"}
                                   `}
                                >
                                    <textarea
                                        ref={textareaRef}
                                        value={editedText}
                                        onChange={(e) => setEditedText(e.target.value)}
                                        className="w-full text-xs p-2 border-none rounded-lg bg-[#EDF0FF] resize-none overflow-hidden focus:outline-none "
                                        rows={1}
                                        style={{
                                            maxHeight: "150px",
                                        }}
                                    />
                                    <div className="flex gap-2 justify-end ">
                                        <Button
                                            className="text-xs py-1 px-2 border border-[#D5D5D5] cursor-pointer"
                                            onClick={() => {
                                                setEditingId(null);
                                                setEditedText("");
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            className="text-xs p-0 px-2  bg-[#005EEE] text-white cursor-pointer"
                                            onClick={() => handleSave(msg.id)}
                                        >
                                            Send
                                        </Button>
                                    </div>
                                </div>
                            ) : msg.isLoading ? (
                                <>
                                    <div
                                        className="relative inline-block align-middle"
                                        style={{
                                            padding: 0,
                                            margin: 0,
                                        }}
                                    >
                                        {/* SVG background */}
                                        <svg
                                            aria-hidden
                                            viewBox="0 0 100 32"
                                            width="100%"
                                            height="100%"
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                width: "100%",
                                                height: "100%",
                                                zIndex: 0,
                                                pointerEvents: "none",
                                            }}
                                            preserveAspectRatio="none"
                                        >
                                            <rect x="0" y="0" width="100" height="32" rx="10" fill="transparent" />
                                        </svg>

                                        {/* Text above SVG */}
                                        <div className="relative z-10 p-0 px-2 py-2">
                                            <div className="flex  text-black text-xl tracking-[0.05rem] font-light ">
                                                {thinkingText.split("").map((letter, i) => (
                                                    <span
                                                        key={i}
                                                        className="animate-fade text-[12px] font-unilever"
                                                        style={{
                                                            animationDelay: `${i * 0.1}s`,
                                                        }}
                                                    >
                                                        {letter}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <style>{`
                                                @keyframes fade {
                                                0% { opacity: 1; }
                                                100% { opacity: 0.2; }
                                                }
                                                .animate-fade {
                                                animation: fade 0.6s infinite alternate;
                                                display: inline-block;
                                                }
                                         `}</style>
                                    </div></>
                            ) : (
                                <div
                                    className={`border text-[12px] rounded-lg py-2 px-3 whitespace-pre-wrap break-words text-justify
                                     ${msg.role.toLowerCase() === "user" ? "bg-[#e2e6ff] border-[#AFBAFF]" : "bg-[#ffffff] border-[#AFBAFF]"}
                                     `}
                                >
                                    {msg.role.toLowerCase() === "user" ? (
                                        msg.message
                                    ) : (
                                        <Markdown
                                            components={{
                                                h1: ({node, ...props}: ComponentProps) => <h1 className="text-lg font-bold my-0" {...props} />,
                                                h2: ({node, ...props}: ComponentProps) => <h2 className="text-base font-bold my-0" {...props} />,
                                                h3: ({node, ...props}: ComponentProps) => <h3 className="text-sm font-bold my-0" {...props} />,
                                                strong: ({node, ...props}: ComponentProps) => <strong className="font-bold" {...props} />,
                                                em: ({node, ...props}: ComponentProps) => <em className="italic" {...props} />,
                                                ul: ({node, ...props}: ComponentProps) => <ul className="list-disc pl-4 !my-0" {...props} />,
                                                ol: ({node, ...props}: ComponentProps) => <ol className="list-decimal pl-4 my-0" {...props} />,
                                                li: ({node, ...props}: ComponentProps) => <li className="my-0 " {...props} />,
                                                a: ({node, ...props}: ComponentProps) => <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                p: ({node, ...props}: ComponentProps) => <p className="my-2" {...props} />,
                                                blockquote: ({node, ...props}: ComponentProps) => <blockquote className="border-l-4 border-gray-300 pl-2 italic my-0" {...props} />,
                                                table: ({node, ...props}: ComponentProps) => <table className="border-collapse border border-gray-300 my-0 w-full" {...props} />,
                                                thead: ({node, ...props}: ComponentProps) => <thead className="bg-gray-100" {...props} />,
                                                tbody: ({node, ...props}: ComponentProps) => <tbody {...props} />,
                                                tr: ({node, ...props}: ComponentProps) => <tr className="border-b border-gray-300" {...props} />,
                                                th: ({node, ...props}: ComponentProps) => <th className="border border-gray-300 px-2 py-1 text-left" {...props} />,
                                                td: ({node, ...props}: ComponentProps) => <td className="border border-gray-300 px-2 py-1" {...props} />,
                                                code: ({node, inline, ...props}: {node?: any, inline?: boolean, [key: string]: any}) => 
                                                    inline ? (
                                                        <code className="bg-gray-100 px-1 py-0.5 rounded" {...props} />
                                                    ) : (
                                                        <code className="block bg-gray-100 p-2 rounded my-0 overflow-x-auto text-[10px]" {...props} />
                                                    ),
                                                pre: ({node, ...props}: ComponentProps) => <pre className="bg-gray-100 px-2 rounded my-0 overflow-x-auto" {...props} />
                                            }}
                                        >
                                            {msg.message}
                                        </Markdown>
                                    )}
                                </div>
                            )}

                            {msg.role.toLowerCase() === "user" &&
                                <div className="flex gap-2 mr-1 mt-2 justify-end">
                                    {copiedId === msg.id ? (
                                        <Check
                                            size={12}
                                            className="opacity-100 transition-opacity duration-200 text-green-500"
                                            color="green"
                                        />
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Copy
                                                    size={12}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-gray-500"
                                                    color="black"
                                                    onClick={() => handleCopy(msg.message, msg.id)}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" sideOffset={4} className="bg-white border-none">
                                                <p>Copy</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Pencil
                                                size={12}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-gray-500"
                                                color="black"
                                                onClick={() => {
                                                    setEditingId(msg.id);
                                                    setEditedText(msg.message);
                                                }}

                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" sideOffset={4} className="bg-white border-none">
                                            <p>Edit</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                            }
                            {(msg.role.toLowerCase() === "msb_admin" || msg.role.toLowerCase() === "ai" || msg.role.toLowerCase() === "bot") &&
                                <div className="flex gap-2 mr-1 mt-2 ">
                                    {copiedId === msg.id ? (
                                        <Check
                                            size={12}
                                            className="opacity-100 transition-opacity duration-200 text-green-500"
                                            color="green"
                                        />
                                    ) : (
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Copy
                                                    size={12}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-gray-500"
                                                    color="black"
                                                    onClick={() => handleCopy(msg.message, msg.id)}
                                                />
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" sideOffset={4} className="bg-white border-none">
                                                <p>Copy</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <ThumbsUp
                                                size={12}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-gray-500"
                                                color="black"
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" sideOffset={4} className="bg-white border-none">
                                            <p>Good Response</p>
                                        </TooltipContent>
                                    </Tooltip>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <ThumbsDown
                                                size={12}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-gray-500"
                                                color="black"
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" sideOffset={4} className="bg-white border-none">
                                            <p>Bad Response</p>
                                        </TooltipContent>
                                    </Tooltip>

                                    <Tooltip>
                                        <TooltipTrigger>
                                            <RotateCcw
                                                size={12}
                                                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer text-gray-500"
                                                color="black"
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" sideOffset={4} className="bg-white border-none">
                                            <p>Regenerate Response</p>
                                        </TooltipContent>
                                    </Tooltip>

                                </div>
                            }
                        </div>

                        {msg.role.toLowerCase() === "user" && (
                            avatar ? (
                                <img
                                    src={avatar}
                                    alt="User"
                                    className="w-[35px] h-[35px] rounded-full"
                                />
                            ) : (
                                <div className="w-[35px] h-[35px] flex items-center justify-center bg-gray-300 text-white font-bold rounded-full">
                                    {name?.charAt(0).toUpperCase()}
                                </div>
                            )
                        )}
                    </div>
                ))}
            </div>
            <div ref={endOfMessagesRef} />
        </div>
    );
}
export default ChatMessages;
