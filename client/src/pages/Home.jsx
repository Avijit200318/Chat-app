import React, { useEffect, useState, useRef } from 'react'
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdGroup, MdOutlineAttachFile } from "react-icons/md";
import { BsTools } from "react-icons/bs";
import { IoSettingsOutline, IoClose } from "react-icons/io5";
import { TfiAnnouncement } from "react-icons/tfi";
import { IoIosSearch } from "react-icons/io";
import { useSelector } from "react-redux";
import PlaneLogo from "../../public/images/plane.png";
import { CiPaperplane } from "react-icons/ci";
import Message from '../components/Message';
import { messageSuccess } from '../redux/message/messageSlice';
import { useDispatch } from 'react-redux';
import { getStorage, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";

import { io } from "socket.io-client";
import { Link } from 'react-router-dom';

const ENDPOINT = 'http://localhost:3000';
let socket;

export default function Home() {

  const { currentUser } = useSelector((state) => state.user);
  const { currentMessage } = useSelector((state) => state.message);
  // console.log("currentMessage recId: ", currentMessage);
  const [allUsers, setAllUsers] = useState(null);
  const [reciverId, setReciverId] = useState(() => {
    if (currentMessage) {
      return currentMessage.rediverRedux;
    } else {
      return null;
    }
  });
  const [reciverData, setReciverData] = useState(null);
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  // console.log(allMessages);
  const [room, setRoom] = useState(null);
  const divRef = useRef(null);
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const [typing, setTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState(null);

  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState('');
  const [fileUploadError, setFileUploadError] = useState(null);
  const [fileUploadPercent, setFileUploadPercent] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [open, setOpen] = useState(false);
  const [messageSearch, setMessageSearch] = useState('');
  console.log("messagesearch: ", messageSearch);
  useEffect(() => {
    setSocket(io(ENDPOINT));

  }, []);

  useEffect(() => {
    if (socket && room) {
      socket.emit('join-room', { roomId: room._id });
    } else {
      console.log("socket is not ready or room is not ready");
    }
  }, [socket, room]);

  useEffect(() => {
    if (socket) {
      socket.on('message-from-server', (data) => {
        setAllMessages((prev) => [...prev, data.message]);
      })

      socket.on('typing-started-from-server', () => {
        setTyping(true);
      })

      socket.on('typing-stoped-from-server', () => {
        setTyping(false);
      })

    }
  }, [socket]);


  useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollTop = divRef.current.scrollHeight;
    }
  }, [allMessages, messageSearch]);

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
          const res = await fetch(`/api/user/showuser/${currentMessage.rediverRedux}`, {
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
          if (reciverId === currentUser._id) console.log("some problem in reciverId");
          const res = await fetch(`api/message/showmessage/${currentMessage.rediverRedux}`);
          const data = await res.json();
          if (data.success === false) {
            console.log(data.message);
            setLoading(false);
          }
          setAllMessages(data);
          fetchRoom();
          setLoading(false);
        }
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    const fetchRoom = async () => {
      try {
        const res = await fetch(`/api/message/getChat/${currentMessage.rediverRedux}`);
        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
        }
        setRoom(data);
      } catch (error) {
        console.log(error);
      }
    }
  }, [reciverId]);

  const handleMessageSend = async () => {
    try {
      const res = await fetch(`/api/message/send/${currentMessage.rediverRedux}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          userId: currentUser._id,
          file: fileUrl ? true : false,
          image: fileUrl
        })
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
      }
      socket.emit('send-message', { message: data, roomId: room._id });
      setAllMessages((prev) => [...prev, data]);
      setMessage('');
      setFileUrl('');
      setFile(null);
      console.log("message was send");
    } catch (error) {
      console.log(error);
    }
  }

  const handleSetReciverid = (recId) => {
    if (recId) {
      setReciverId(recId);
      dispatch(messageSuccess({ rediverRedux: recId }));
      socket.emit('leave-room', { roomId: room._id });
    }
  };

  const handleInputMessage = (e) => {
    setMessage(e.target.value);
    socket.emit('typing-started', { roomId: room._id });

    if (typingTimeOut) clearTimeout(typingTimeOut);

    setTypingTimeOut(setTimeout(() => {
      socket.emit('typing-stoped', { roomId: room._id });
    }, 1000));
  };

  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = async (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`file percent: ${progress}%`);
        setFileUploadPercent(progress);
      },
      (error) => {
        setFileUploadError(true);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setFileUrl(downloadURL);
        })
      }
    )
  };

  const handleSearchUser = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/user/search", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ searchText }),
      });

      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
      }
      setSearchText('');
      setAllUsers(data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className='flex'>
      <div className="left w-[30%] h-screen flex pl-4">
        <div className="col1 bg-blue-100 w-[15%] flex flex-col justify-between px-3 py-6 border-l-2 border-r-2 border-gray-400">
          <div className="flex flex-col items-center gap-6 text-gray-600">
            <IoChatboxEllipsesOutline className='text-2xl' />
            <MdGroup className='text-2xl' />
            <BsTools className='text-2xl' />
            <TfiAnnouncement className='text-2xl' />
          </div>
          <div className="flex flex-col items-center gap-6 text-gray-600">
            <IoSettingsOutline className='text-3xl' />
            <Link to='/profile'>
              <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full bg-yellow-300 overflow-hidden" />
            </Link>
          </div>
        </div>
        <div className="col2 w-[85%] h-screen bg-white py-4 flex flex-col">
          <div className="border-b border-gray-400 px-2">
            <h1 className="text-2xl font-semibold px-4">Chats...</h1>
            {room && <p className="text-xs sm:px-4 sm:text-sm">room: {room._id}</p>}

            <form onSubmit={handleSearchUser} className="border border-black flex my-4 overflow-hidden rounded-full bg-blue-50">
              <input type="text" onChange={(e) => setSearchText(e.target.value)} value={searchText} placeholder='Search username or email' className="px-4 py-2 w-[85%] outline-none bg-transparent placeholder:truncate" />
              <button className='py-2 px-4 text-2xl w-[15%]'><IoIosSearch /></button>
            </form>
          </div>
          <div className='overflow-y-auto scrollbar-custom'>
            {allUsers && (
              allUsers.map((user, index) => (
                (user._id !== currentUser._id) && (
                  <div key={index} style={{ background: `${user._id === reciverId ? 'rgb(220, 235, 255)' : ''}` }} onClick={() => handleSetReciverid(user._id)} className="flex items-center gap-6 py-2 border-b border-gray-500 transition-all duration-300 hover:bg-blue-100 cursor-pointer px-2">
                    <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-blue-200" />
                    <div className="flex flex-col gap-2">
                      <h1 className="text-lg truncate">{user.username}</h1>
                      <p className="text-xs text-gray-500 font-semibold">{user.status}</p>
                    </div>
                  </div>
                )
              )
              )
            )}
          </div>
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
            <div className="header bg-blue-50 h-[9vh] px-4 py-2 border-b-2 shadow-md flex justify-between items-center relative overflow-hidden">
              <div className="flex items-center gap-4">
                <img src={reciverData.avatar} alt="" className="h-12 w-12 rounded-full overflow-hidden bg-yellow-300" />
                <div className="">
                  <h1 className="text-lg">{reciverData.username}</h1>
                  {typing && <p className='text-xs font-semibold text-gray-600 pl-1'>Typing...</p>}
                </div>
              </div>
              <button onClick={() => setOpen(true)} className="transition-all duration-300 hover:bg-blue-200 p-2 mr-4 rounded-full"><IoIosSearch className='text-2xl' /></button>
              <div className={`absolute w-full h-[9vh] bg-blue-50 top-0  transition-all duration-500 ${open ? 'left-0' : 'left-[100%]'} flex items-center justify-between px-6`}>
                <input onChange={(e)=> setMessageSearch(e.target.value) } type="text" placeholder='Search...' value={messageSearch} className="px-4 py-2 w-[95%] outline-none border rounded-md" />
                <div className="transition duration-300 hover:bg-blue-100 p-2 rounded-full">
                  <IoClose onClick={() => {setOpen(false); setMessageSearch('')}} className='text-2xl cursor-pointer' />
                </div>
              </div>
            </div>
            <div ref={divRef} className="chatBox w-full h-[82vh] overflow-y-auto scrollbar-custom">
              {allMessages.length > 0 && (
                allMessages.filter((mssg) => mssg.text.includes(messageSearch)).map((msg) =>
                  <Message key={msg._id} text={msg.text} sender={msg.sender} createTime={msg.createdAt} file={msg.file} image={msg.image} imgId={msg._id} />
                )
              )}
            </div>
            <div className="footer bg-blue-50 h-[9vh] px-4 py-2 flex items-center gap-2 border relative">
              <div className="w-[90%] flex items-center gap-2">
                <input type="text" onChange={handleInputMessage} placeholder='Type a new message' className="w-[93%] px-4 py-3 rounded-md outline-none" value={message} />
                <input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files[0])} hidden accept='image/*' />
                <button onClick={() => fileRef.current.click()} className="p-5 flex justify-center items-center rounded-full transition-all duration-300 hover:bg-gray-300">
                  <MdOutlineAttachFile className='absolute text-2xl' />
                </button>
              </div>
              <button disabled={(message === '' && fileUploadPercent !== 100) || fileUploadError} onClick={handleMessageSend} className="px-4 py-1 bg-blue-400 text-white rounded-md disabled:bg-blue-300 "><CiPaperplane className='text-4xl' /></button>
              {fileUploadError && <p className="absolute text-red-600 -top-[11px] left-[20px] font-semibold">Error Image Upload(image must be less than 2MB)</p>}
              {(!fileUploadError && file && fileUploadPercent < 100) && <p className="absolute text-green-500 -top-[11px] left-[20px] font-semibold">{`File uploaded ${Math.round(fileUploadPercent)}%`}</p>}
              {(!fileUploadError && file && fileUploadPercent === 100) && <p className="absolute text-green-500 -top-[11px] left-[20px] font-semibold">File is successfully uploaded</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}