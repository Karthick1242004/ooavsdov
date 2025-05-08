import React, { KeyboardEvent, useRef,useState } from 'react';
import { Paperclip, ArrowUp } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import AI_BRAIN from "../assets/images/AI-brain.svg"
import COPY_RIGHT from "../assets/images/copyright.svg"
import GROUP from "../assets/images/Group.svg"


interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [message, setMessage] = useState("");




  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim()) {
        onSendMessage(message.trim());
        setMessage("");
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto"; // ✅ Reset after sending
        }
      }
    }
  };

  const handleSendClick = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; // ✅ Reset after sending
      }
    }
  };

  return (
    <div>
      <div className="border-[1.5px] border-[#FFC4D2] rounded-[10px] bg-white p-2 md:p-3 w-[50vw] flex flex-col items-center"
        style={{
          border: "1.5px solid transparent",
          borderRadius: "8px",
          backgroundImage: `
                linear-gradient(white,white), 
                linear-gradient(to right, #FFC4D2, #9AF6F4)
              `,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box"
        }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            e.target.style.height = "auto";
            e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question..."
          rows={1}
          className="w-full p-2 text-sm bg-white focus:outline-none resize-none overflow-hidden scrollbar-hide"
          style={{

            maxHeight: "150px",
            paddingTop: "0px",
            paddingBottom: "10px",
            overflowY: "scroll",
          }}
        ></textarea>

        <div className="flex justify-between items-center w-full mt-0.5">
          <div className="flex items-center gap-2">
            <button className="p-1 md:p-2 text-gray-500 hover:text-gray-700">
              <Paperclip size={16} />
            </button>
          </div>
          <button
            className={` md:p-2 ${message.trim() ? 'bg-[#1F36C7] text-white' : 'bg-blue-300 text-white cursor-not-allowed'} rounded-md transition duration-200`}
            onClick={handleSendClick}
            disabled={!message.trim()}
          >
            <ArrowUp size={12} />
          </button>
        </div>
      </div>
      <p className="text-[10px] md:text-xs pb-2 pt-2 text-gray-500  text-center lg:text-end w-full md:w-[500px]">  Please use with discretion and follow &nbsp;
        <Dialog>
          <DialogTrigger asChild>
            <span className='underline cursor-pointer'>usage terms</span>

          </DialogTrigger>
          <DialogContent className="sm:max-w-[35%] bg-white font-normal">
            <p className="flex justify-center text-[18px] font-medium bg-gradient-to-t from-[#1F36C7] to-[#697DFF] bg-clip-text text-transparent ">Usage terms</p>
            <hr style={{ border: '0.1px solid #DCDCDC' }} className='my-1' />
            <p className='font-medium'>Points to remember when using the tool:</p>
            <div className='mt-2'>
              <div className='flex gap-2 mb-2'>
                <img src={AI_BRAIN} alt="AI Brain" className='w-[25px] h-[25px] mt-2' />
                <p className='text-[12px]'> Inputs may <span className='font-medium'>not be fully up to date</span> and the tool might <span className='font-medium'>'hallucinate'</span> facts or even sources, so independently fact-check Outputs.</p>
              </div >
              <div className='flex gap-2 mb-2'>
                <img src={COPY_RIGHT} alt="Copyright" className='w-[25px] h-[25px] mt-2' />
                <p className='text-[12px]'>Outputs may be subject to third party rights (such as copyright), meaning that you should <span className='font-medium'>use the Output as stimulus only.</span> use the Output as stimulus only.</p>
              </div>
              <div className='flex gap-2 mb-2'>
                <img src={GROUP} alt="Group" className='w-[25px] h-[25px] mt-2' />
                <p className='text-[12px]'><span className='font-medium'>Do not prompt</span> the tool with <span className='underline text-[#697DFF] font-medium'>Personal Data</span> (e.g. a photo, name, email address etc of a living person) or <span className='font-medium'>third-party data/materials</span> (e.g. data we licence from our insight providers like Euromonitor, Kantar, retailer media partners, etc.).</p>
              </div>
            </div>
            <div className='bg-[#F3F8FF] p-3'>
              <p className='font-medium text-xs'>Need Help?</p>
              <p className='text-[12px]'>Contact your local Data <span className='underline text-[#697DFF]'>Protection Officer</span> / <span className='underline text-[#697DFF]'>legal business</span>  partner if your use case involves doing any of the above.</p>
            </div>
          </DialogContent>
        </Dialog>
      </p>

    </div>
  );
};
