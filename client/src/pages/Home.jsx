import React, { useEffect, useState, useRef } from 'react'
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdGroup } from "react-icons/md";
import { BsTools } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiAnnouncement } from "react-icons/tfi";
import { IoIosSearch } from "react-icons/io";
import { useSelector } from "react-redux";
import PlaneLogo from "../../public/images/plane.png";
import { CiPaperplane } from "react-icons/ci";
import Message from '../components/Message';

import { io } from "socket.io-client";

const ENDPOINT = 'http://localhost:3000';
let socket;

export default function Home() {

  const { currentUser } = useSelector((state) => state.user);
  const [allUsers, setAllUsers] = useState(null);
  const [reciverId, setReciverId] = useState(null);
  const [reciverData, setReciverData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // console.log(reciverId);
  // console.log(allMessages);
  console.log(message);
  const [socketConnected, setSocketConnected] = useState(false);
  const divRef = useRef(null);


  useEffect(() => {
    socket = io(ENDPOINT, { transports: ['websocket'] });

    socket.on("connection", () => {
      console.log("connected to socket");
    });
  }, [])

  useEffect(() => {
    socket.on('sendMessage', ({ textMsg }) => {
        setAllMessages([...allMessages, textMsg]);
    })

    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [allMessages]);

  useEffect(() => {
    const fetUsers = async () => {
      try {
        const res = await fetch("/api/user/allusers");
        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
        }
        setAllUsers(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetUsers();
  }, []);

  useEffect(() => {
    const fetchReciverData = async () => {
      try {
        if (reciverId) {
          setLoading(true);
          const res = await fetch(`/api/user/showuser/${reciverId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify()
          })
          const data = await res.json();
          if (data.success === false) {
            console.log("reciver not found: ", data.message);
            setLoading(false);
          }
          setReciverData(data);
          socket.emit('joined', { user: data });
          fetchAllMessages();
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
    fetchReciverData();

    const fetchAllMessages = async () => {
      try {
        if (reciverId) {
          const res = await fetch(`api/message/showmessage/${reciverId}`);
          const data = await res.json();
          if (data.success === false) {
            console.log(data.message);
            setLoading(false);
          }
          console.log("data: ", data);
          setAllMessages(data);
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };
  }, [reciverId]);

  const handleMessageSend = async () => {
    try {
      const res = await fetch(`/api/message/send/${reciverId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
      }
      socket.emit('message', { data: data });
      setMessage('');
      console.log("message was send");
    } catch (error) {
      console.log(error);
    }
  }


  return (
    <div className='flex'>
      <div className="left w-[30%] bg-yellow-400 h-screen flex pl-4">
        <div className="col1 bg-blue-50 w-[15%] flex flex-col justify-between px-3 py-6 border-r-2 border-gray-400">
          <div className="flex flex-col items-center gap-6 text-gray-600">
            <IoChatboxEllipsesOutline className='text-2xl' />
            <MdGroup className='text-2xl' />
            <BsTools className='text-2xl' />
            <TfiAnnouncement className='text-2xl' />
          </div>
          <div className="flex flex-col items-center gap-6 text-gray-600">
            <IoSettingsOutline className='text-3xl' />
            <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full bg-yellow-300 overflow-hidden" />
          </div>
        </div>
        <div className="col2 w-[85%] h-screen bg-white py-4 flex flex-col">
          <div className="border-b border-gray-400 px-2">
            <h1 className="text-2xl font-semibold px-4">Chats...</h1>
            <p className="">{currentUser.username}</p>
            <div className="border border-black flex my-4 overflow-hidden rounded-full bg-blue-50">
              <input type="text" placeholder='Search...' className="px-4 py-2 w-[85%] outline-none bg-transparent" />
              <button className='py-2 px-4 text-2xl w-[15%]'><IoIosSearch /></button>
            </div>
          </div>
          {allUsers && (
            allUsers.map((user) =>
              <div key={user.email} style={{ background: `${user._id === reciverId ? 'rgb(239, 246, 255)' : ''}` }} onClick={() => setReciverId(user._id)} className="flex items-center gap-6 py-2 border-b border-gray-500 transition-all duration-300 hover:bg-blue-50 cursor-pointer px-2">
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-blue-200" />
                <div className="flex flex-col gap-2">
                  <h1 className="text-lg">{user.username}</h1>
                  <p className="text-xs text-gray-500 font-semibold">{user.status}</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <div className="right w-[70%] h-screen border-l-4 border-gray-300 relative">
        {!reciverData && (
          <div className="w-full h-screen flex justify-center items-center gap-4">
            <h1 className="text-[3rem] text-gray-500">ChatPlus...</h1>
            <img src={PlaneLogo} alt="" className="w-48 h-48 opacity-50" />
          </div>
        )}
        {loading && (
          <div className="w-full h-full top-0 left-0 absolute flex justify-center items-center bg-[#0197ff]">
            <div className="border-8 border-t-8 border-t-white border-gray-300 rounded-full h-16 w-16 animate-spin"></div>
          </div>
        )}
        {reciverData && (
          <div>
            <div className="header bg-blue-50 flex items-center h-[9vh] gap-4 px-4 py-2">
              <img src={reciverData.avatar} alt="" className="h-12 w-12 rounded-full overflow-hidden bg-yellow-300" />
              <h1 className="text-lg">{reciverData.username}</h1>
            </div>
            <div ref={divRef} className="chatBox w-full h-[82vh] overflow-y-auto">
              {allMessages.length > 0 && (
                allMessages.map((msg) =>
                  <Message key={msg._id} text={msg.text} sender={msg.sender} createTime={msg.createdAt} />
                )
              )}
            </div>
            <div className="footer bg-blue-50 h-[9vh] px-4 py-2 flex items-center border">
              <input type="text" onChange={(e) => setMessage(e.target.value)} placeholder='Type a new message' className="w-[90%] px-4 py-3 rounded-md outline-none" value={message} />
              <button disabled={message === ''} onClick={handleMessageSend} className="px-4 py-1 bg-blue-400 text-white rounded-md disabled:bg-blue-300 "><CiPaperplane className='text-4xl' /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
