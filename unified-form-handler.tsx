import React, { useState, useEffect } from "react";
import { MessageInput } from "@/shared/MessageInput";
import { useFetchHandler } from "@/@logic/getHandlers";
import { useParams } from "react-router-dom";
import { useWorkspaceStore, Workspace } from "@/@logic/workspaceStore";
import { modelList } from "@/constant/models";
import { rolePlay } from "@/constant/role-play";
import { useMutateHandler } from "@/@logic/mutateHandlers";
import { HTTPMethod } from "@/@logic";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import DropdownSelect from "@/shared/chatdropDown";
import ChatMessages from "./ChatMessages";
import NewChatSuggestion from "./NewChatSuggestion";
import ChatMessage from "./ChatMessageModel";
import { useMsal } from '@azure/msal-react';
import { getUserProfile } from '@/utils/getUserProfile';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useNavigate } from "react-router-dom";

interface ChatResponse {
  data: {
    chat_id: number;
    user_message_id: number;
    ai_message_id: number;
    ai_response: string | string[];
  };
}

function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const queryClient = useQueryClient();
  const { chatId } = useParams();
  const [searchParams] = useSearchParams();
  const workspaceName = searchParams.get("workspace-name");
  const skillName = searchParams.get("skill-name");
  const skillIdFromUrl = searchParams.get("skill-id");
  const workspaces = useWorkspaceStore((state) => state.workspaces);
  const [selectedWorkspace, setSelectedWorkspace] = useState(workspaceName || ""); // Default to workspaceName from params
  const [selectedSkill, setSelectedSkill] = useState(skillName || ""); // Default to skillName from params
  const [selectedSkillId, setSelectedSkillId] = useState<number | null>(skillIdFromUrl ? Number(skillIdFromUrl) : null);
  const [models, setModels] = useState(modelList[0]);
  const [selectedRole, setSelectedRole] = useState(rolePlay[0]);
  const [isNewChat, setIsNewChat] = useState(true);
  // const { accounts } = useMsal();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState<string>();

  const { data: chat, isLoading } = useFetchHandler(
    chatId ? `chats/?userId=1&chatId=${chatId}` : "", // Empty URL when chatId is undefined
    chatId ? `chat-${chatId}` : "" // Empty key when chatId is undefined
  );

  // const userProfile = async () => {
  //   if (accounts.length > 0) {
  //     const userProfile = await getUserProfile(accounts[0]);
  //     setAvatar(userProfile);
  //   }
  // }
  // useEffect(() => {
  //   userProfile();
  // }, [accounts]);


  const addChat = useMutateHandler({
    endUrl: "chats/?userId=1",
    method: HTTPMethod.POST,
    onSuccess: (response: ChatResponse) => {
      queryClient.invalidateQueries({ queryKey: ['recent'] });
      navigate(`/chat/${response.data.chat_id}`);
      setIsNewChat(false);

      const botResponse: ChatMessage = {
        id: response.data.ai_message_id,
        message:Array.isArray(response.data.ai_response)
        ? response.data.ai_response[0]
        :response.data.ai_response ,
        role: "MSB_Admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chat_id: response.data.chat_id,
      };
      setMessages(prev => [...prev.filter(msg => !msg.isLoading), botResponse]);
    },
  });

  const existingChatMutation = useMutateHandler({
    endUrl: "chats/?userId=1",
    method: HTTPMethod.POST,
    onSuccess: (response: ChatResponse) => {
      const botResponse: ChatMessage = {
        id: response.data.ai_message_id,
        message:Array.isArray(response.data.ai_response)
        ? response.data.ai_response[0]
        :response.data.ai_response ,
        role: "MSB_Admin",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        chat_id: Number(chatId),
      };
      setMessages(prev => [...prev.filter(msg => !msg.isLoading), botResponse]);
    },
  });

  const onSendMessage = (messageToSend: string) => {
    if (!messageToSend.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now(),
      message: messageToSend,
      role: "USER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chat_id: Number(chatId) || 0,
    };
    const loadingMessage: ChatMessage = {
      id: Date.now()+1,
      message: "",
      role: "MSB_Admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chat_id: Number(chatId) || 0,
      isLoading:true,
    };
    setMessages(prev => [...prev, newUserMessage,loadingMessage]);

    const skillId = selectedSkillId || 0;
        
    console.log("Skill id", skillId);

    const payload = {
      userMessage: messageToSend,
      skillId,
      isNewChat,
    };

    if (!chatId) {
      addChat.mutate(payload);
    } else {
      existingChatMutation.mutate({
        ...payload,
        chatId: Number(chatId),
        isNewChat: false,
      });
    }


  };

  function handleWorkspaceChange(value: string) {
    setSelectedWorkspace(value);
    const firstSkill = workspaces
      .filter((item: Workspace) => item.name === value)[0]
      .skills[0];
      
    setSelectedSkill(firstSkill.name);
    setSelectedSkillId(Number(firstSkill.id));
  }

  function handleSkillChange(value: string) {
    setSelectedSkill(value);
    const skill = workspaces
      .find((item: Workspace) => item.name === selectedWorkspace)
      ?.skills.find(skill => skill.name === value);
      
    if (skill) {
      setSelectedSkillId(Number(skill.id));
    }
  }

  const showWelcome = !chatId && messages.length === 0;

  useEffect(() => {
    if (chatId && chat) {
      setSelectedWorkspace(chat?.workspace.name);
      setSelectedSkill(chat?.skill.name);
      setSelectedSkillId(Number(chat?.skill.id));
      setMessages(chat?.messages || []);
      // setChatTitle(` ${chat?.chat.title}`);
    } else if (!workspaceName && workspaces?.length > 0) {
      setSelectedWorkspace(workspaces?.[0].name);
      setSelectedSkill(workspaces?.[0].skills[0].name);
      setSelectedSkillId(Number(workspaces?.[0].skills[0].id));
      setMessages([]);
      // setChatTitle("New Chat");
    } else if (skillIdFromUrl) {
      setSelectedSkillId(Number(skillIdFromUrl));
    }
    if (chatId) {
      setIsNewChat(false);
    }
    else {
      setIsNewChat(true);
    }
  }, [chatId, chat, workspaceName, workspaces.length, skillIdFromUrl]);

  return (
    <div
      className="w-[100vw] font-unilever"
      style={{ maxHeight: `calc(100vh - var(--navbar-height))` }}
    >
      {isLoading && chatId ? (
        <div className="flex justify-center items-center h-full">
          <p>Loading chat...</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="flex items-center  mt-2 w-full">
            <div className="mx-auto flex">
              <Tooltip>
                <TooltipTrigger>
                  <DropdownSelect
                    title='Select workspace'
                    items={workspaces?.map((item) => item.name) || []}
                    searchPlaceholder="Search"
                    groupTitle="Recent Workspaces"
                    defaultValue={selectedWorkspace}
                    onValueChange={handleWorkspaceChange}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4} disableArrow>
                  <p>Workspace</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex px-2 text-gray-500">/</div>
              <Tooltip>
                <TooltipTrigger>
                  <DropdownSelect
                    title="Select Skill"
                    items={
                      workspaces?.find((item: Workspace) => item.name === selectedWorkspace)?.skills.map((item) => item.name) || []
                    }
                    searchPlaceholder="Search"
                    groupTitle={`Skill for ${selectedWorkspace}`}
                    defaultValue={selectedSkill}
                    onValueChange={handleSkillChange}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4} disableArrow>
                  <p>Skill</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex px-2 text-gray-500">/</div>
              <Tooltip>
                <TooltipTrigger>
                  <div className="text-[12px] font-medium bg-gradient-to-t from-[#1F36C7] to-[#697DFF] bg-clip-text text-transparent">{chatId ? chat?.chat.title : 'New Chat'}</div>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4} disableArrow>
                  <p>Chat</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex gap-2 md:flex-col lg:flex-row">
              <Tooltip>
                <TooltipTrigger>
                  <DropdownSelect
                    title="Select Role"
                    items={rolePlay}
                    searchPlaceholder="Search"
                    groupTitle={`Role Play`}
                    defaultValue={selectedRole}
                    onValueChange={(value) => setSelectedRole(value)}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4} disableArrow>
                  <p>Persona</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <DropdownSelect
                    title="Select Model"
                    items={modelList}
                    searchPlaceholder="Search"
                    groupTitle={`Model`}
                    defaultValue={models}
                    onValueChange={(value) => setModels(value)}
                  />
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4} disableArrow>
                  <p>Model</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          {showWelcome ? (
            <div className="flex justify-center items-center h-[calc(80vh-var(--navbar-height))] w-full">
              <NewChatSuggestion name={'Steve'}  onSendMessage={onSendMessage} />
            </div>) : (
            <ChatMessages messages={messages} avatar={avatar} name={'Steve'} />
          )}

          <div className="fixed bottom-0 left-32 w-full pl-2  flex justify-center items-end z-50">
            <MessageInput
              onSendMessage={onSendMessage}
            />
          </div>
        </div>
      )}
    </div>
  );
}
export default Chat;
