/* eslint-disable @next/next/no-img-element */
"use client";
import React, { FC, useCallback, useEffect, useState } from "react";
import { BiUpvote } from "react-icons/bi";
import useOrbisUser from "@/hooks/store/useOrbisUser";
import { ORBIS, replyLimit } from "@/config";
import Loader from "../ui/Loader";
import useMessageReaction from "@/hooks/useMessageReaction";
type MessageType = {
  content: string;
  sender: string;
  upvotes: number;
  postId: string;
  master: string | null;
  refetchAllMessages?: () => Promise<void>;
  setThisAsReply: React.Dispatch<
    React.SetStateAction<{
      content: string;
      postId: string;
    }>
  >;
  username: string;
};

const Message: FC<MessageType> = ({
  content,
  sender,
  upvotes,
  postId,
  refetchAllMessages,
  setThisAsReply,
  master,
  username,
}) => {
  const userDid = useOrbisUser((state) => state.userDid);

  const { reactToPost, isReacted, loading } = useMessageReaction(
    postId,
    userDid,
    refetchAllMessages
  );
  const [masterMessage, setMasterMessage] = useState("");

  const fetchMasterPost = useCallback(async () => {
    if (master) {
      const { data, error } = await ORBIS.getPost(master);
      setMasterMessage(data.content.body);
    }
  }, [master]);

  useEffect(() => {
    fetchMasterPost();
  }, [fetchMasterPost]);

  if (!sender) return null;
  const senderArray = sender.split(":");
  const senderAddress = senderArray[senderArray.length - 1];
  return (
    <div className="flex items-center px-4 border-b-[1px] py-4 border-[rgba(126,144,175,0.1)] space-x-2 text-white">
      <div className="w-[85%] flex flex-col justify-center">
        <div className="flex mb-1 items-center">
          <p className="font-bold text-sm mr-4">
            {username ? username : senderAddress.slice(0, 4) + "..." + senderAddress.slice(39)}
          </p>
          {master ? (
            <p className="text-[10px]">
              <span className="font-bold">to: </span>
              {masterMessage.length > replyLimit
                ? masterMessage.slice(0, replyLimit - 1) + "..."
                : masterMessage}
            </p>
          ) : (
            <p
              className="text-[10px] hover:cursor-pointer"
              onClick={() => setThisAsReply({ content, postId })}
            >
              reply
            </p>
          )}
        </div>
        <p className="text-[12px] break-words font-extralight">{content}</p>
      </div>
      <div
        onClick={reactToPost}
        className={`w-[15%] rounded-md flex items-center justify-center space-x-1 py-1 bg-black hover:cursor-pointer hover:opacity-80`}
      >
        {loading ? (
          <Loader height="18" width="18" />
        ) : (
          <BiUpvote color={isReacted ? "#CBA1A4" : "#4A5875"} />
        )}
        <p className={`${isReacted ? "text-[#CBA1A4]" : "text-[#4A5875]"} text-sm`}>{upvotes}</p>
      </div>
    </div>
  );
};

export default Message;
