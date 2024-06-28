import React, { useEffect, useState, useRef } from 'react'
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdGroup, MdOutlineAttachFile } from "react-icons/md";
import { BsTools } from "react-icons/bs";
import { IoSettingsOutline, IoClose } from "react-icons/io5";
import { TfiAnnouncement } from "react-icons/tfi";
import { IoIosSearch, IoIosMenu } from "react-icons/io";
import { useSelector } from "react-redux";
import PlaneLogo from "../../public/images/plane.png";
import { CiPaperplane } from "react-icons/ci";
import Message from '../components/Message';
import { messageSuccess } from '../redux/message/messageSlice';
import { useDispatch } from 'react-redux';
import { getStorage, getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { HiArrowLeftOnRectangle } from "react-icons/hi2";
import { app } from "../firebase";

import { io } from "socket.io-client";
import { Link } from 'react-router-dom';
import Emoji from '../components/Emoji';

const ENDPOINT = 'https://mern-chatplus.onrender.com/';
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
  const [online, setOnline] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [sideOpen, setSideOpen] = useState(false);

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

      socket.on('message-delete-server', (data) => {
        setAllMessages((prev) => prev.filter((message) => message._id !== data.messageId));
      })

      socket.emit('register', { user: currentUser });

      socket.on('user-online', (data) => {
        setOnline(data.connectedUsers);
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
          url: fileUrl,
          fileType: fileType,
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
      if (room) {
        socket.emit('leave-room', { roomId: room._id });
      }
      setSideOpen(false);
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
      fileTypeDetect();
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
  };

  const handleDeleteImage = async (msgId) => {
    try {
      const res = await fetch(`/api/message/delete/${msgId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setAllMessages((prev) => prev.filter((message) => message._id !== msgId));
      socket.emit('message-delete', { roomId: room._id, messageId: msgId });
    } catch (error) {
      console.log(error);
    }
  };

  const fileTypeDetect = () => {
    if (file) {
      const typeFile = file.type;
      console.log("what file: ", typeFile);

      // Determine the file type based on MIME type
      if (typeFile.startsWith('image/')) {
        setFileType('image');
      } else if (typeFile === 'application/pdf') {
        setFileType('pdf');
      } else if (typeFile === 'application/msword' ||
        typeFile === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setFileType('word');
      } else if (typeFile === 'application/vnd.ms-powerpoint' ||
        typeFile === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
        setFileType('ppt');
      }
    }
  };

  return (
    <main className='flex w-full'>
      <div className={`sideleft w-[98%] Dheight bg-white flex pl-4 absolute top-0 z-10 border-r-2 transition-all duration-500 ${(sideOpen || reciverId === null)? 'left-0' : '-left-[100%]'} sm:w-[60%] md:w-[55%] lg:w-[30%] lg:static lg:pl-0 xl:pl-4`}>
        <div className="col1 bg-blue-100 w-[20%] flex flex-col justify-between px-2 py-6 border-l border-r-2 border-gray-400 md:w-[15%] md:px-3 lg:px-2 lg:w-[20%] xl:w-[15%]">
          <div className="flex flex-col items-center gap-6 text-gray-600">
            <IoChatboxEllipsesOutline className='text-2xl' />
            <MdGroup className='text-2xl' />
            <BsTools className='text-2xl' />
            <TfiAnnouncement className='text-2xl' />
          </div>
          <div className="flex flex-col items-center gap-6 text-gray-600">
            <IoSettingsOutline className='text-3xl' />
            <Link to='/profile'>
              <img src={currentUser.avatar} alt="" className="w-10 h-10 rounded-full bg-yellow-300 overflow-hidden border border-gray-600" />
            </Link>
            <button onClick={()=> setSideOpen(!sideOpen)} className="lg:hidden hover:bg-blue-100 p-1">
            <HiArrowLeftOnRectangle className='text-3xl' />
            </button>
          </div>
        </div>
        <div className="col2 w-[85%] Dheight bg-white py-4 flex flex-col">
          <div className="border-b border-gray-400 px-2">
            <h1 className="text-2xl font-semibold px-4">Chats...</h1>
            {room && <p className="text-xs sm:px-4 sm:text-sm">room: {room._id}</p>}

            <form onSubmit={handleSearchUser} className="border border-black flex my-4 overflow-hidden rounded-full bg-blue-50">
              <input type="text" onChange={(e) => setSearchText(e.target.value)} value={searchText} placeholder='Search username or email' className="px-4 py-2 w-[85%] outline-none bg-transparent placeholder:truncate" />
              <button className='py-2 px-2 text-2xl w-[15%] flex justify-center 2xl:px-4'><IoIosSearch /></button>
            </form>
          </div>
          <div className='overflow-y-auto scrollbar-custom'>
            {allUsers && (
              allUsers.map((user, index) => (
                (user._id !== currentUser._id) && (
                  <div key={index} style={{ background: `${user._id === reciverId ? 'rgb(245, 234, 255)' : ''}` }} onClick={() => handleSetReciverid(user._id)} className="flex items-center gap-6 py-2 border-b border-gray-500 transition-all duration-300 hover:bg-blue-50 cursor-pointer px-2">
                    <div style={{ border: `${(online && online.some((obj) => Object.values(obj).includes(user._id))) ? '3px solid yellow' : ''}` }} className="w-auto h-auto relative bg-yellow-500 rounded-full">
                      <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-blue-200 border" />
                      {(online && online.some((obj) => Object.values(obj).includes(user._id))) && (
                        <div className="onlineFinder absolute w-4 h-4 bg-[#fdfd00] rounded-full bottom-0 right-0"></div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h1 className="text-lg truncate">{user.username}</h1>
                      <p className="text-xs text-gray-500 sm:font-semibold">{user.status}</p>
                    </div>
                  </div>
                )
              )
              )
            )}
          </div>
        </div>
      </div>
      <div className={`sideright w-full Dheight border-l-4 border-gray-300 relative ${sideOpen? 'opacity-60 bg-gray-200' : ''} lg:w-[70%]`}>
        {!reciverData && (
          <div className="w-full Dheight flex justify-center items-center gap-4">
            <h1 className="text-4xl text-gray-500 sm:text-[3rem[">ChatPlus...</h1>
            <img src={PlaneLogo} alt="" className="w-32 h-32 opacity-50 sm:w-48 sm:h-48" />
          </div>
        )}
        {loading && (
          <div className="w-full h-full top-0 left-0 absolute flex justify-center items-center bg-[#0197ff]">
            <div className="border-8 border-t-8 border-t-white border-gray-300 rounded-full h-16 w-16 animate-spin"></div>
          </div>
        )}
        {reciverData && (
          <div className='Dheight w-auto'>
            <div className="header bg-blue-50 h-[9svh] px-4 py-2 border-b-2 shadow-md flex justify-between items-center relative overflow-hidden z-10">
              <div className="flex items-center gap-4">
                <Link to={`/userProfile/${reciverData._id}`}>
                  <img src={reciverData.avatar} alt="" className="h-12 w-12 rounded-full overflow-hidden bg-yellow-300" />
                </Link>
                <div className="">
                  <h1 className="text-lg truncate">{reciverData.username}</h1>
                  {typing && <p className='text-xs font-semibold text-gray-600 pl-1'>Typing...</p>}
                </div>
              </div>
              <div className="">
                <button onClick={() => setOpen(true)} className="transition-all duration-300 hover:bg-blue-200 p-2 mr-4 rounded-full"><IoIosSearch className='text-2xl' /></button>
                <button onClick={()=> setSideOpen(!sideOpen)} className=''><IoIosMenu className='text-2xl lg:hidden' /></button>
              </div>
              <div className={`absolute w-full h-[9svh] bg-blue-50 top-0  transition-all duration-500 ${open ? 'left-0' : 'left-[100%]'} flex items-center justify-between px-4 sm:px-6`}>
                <input onChange={(e) => setMessageSearch(e.target.value)} type="text" placeholder='Search...' value={messageSearch} className="px-4 py-2 w-[95%] outline-none border rounded-md" />
                <div className="transition duration-300 hover:bg-blue-100 p-2 rounded-full">
                  <IoClose title='open Sidebar' onClick={() => { setOpen(false); setMessageSearch('') }} className='text-2xl cursor-pointer' />
                </div>
              </div>
            </div>
            <div ref={divRef} className="chatBox w-full h-[82svh] overflow-y-auto scrollbar-custom bg-[#FDFFE2]">
              {allMessages.length > 0 && (
                allMessages.filter((mssg) => mssg.text.includes(messageSearch)).map((msg) =>
                  <Message key={msg._id} text={msg.text} sender={msg.sender} createTime={msg.createdAt} file={msg.file} url={msg.url} imgId={msg._id} handleDeleteImage={handleDeleteImage} fileType={msg.fileType} />
                )
              )}
            </div>
            <div className="footer bg-blue-100 h-[9svh] px-2 py-2 flex items-center gap-2 border-t-2 border-gray-400 relative sm:px-4">
              <div className="w-[90%] flex items-center gap-2">
                <input disabled={sideOpen} type="text" onChange={handleInputMessage} placeholder='Type a new message' className="w-[93%] px-4 py-3 rounded-md outline-none" value={message} />
                <input ref={fileRef} type="file" onChange={(e) => setFile(e.target.files[0])} hidden />
                <Emoji setMessage={setMessage} />
                <button disabled={sideOpen} onClick={() => fileRef.current.click()} className="p-5 flex justify-center items-center rounded-full transition-all duration-300 hover:bg-gray-300">
                  <MdOutlineAttachFile className='absolute text-xl sm:text-2xl' />
                </button>
              </div>
              <button disabled={(message === '' && fileUploadPercent !== 100) || fileUploadError} onClick={handleMessageSend} className="px-3 py-1 bg-blue-400 text-white rounded-md disabled:bg-blue-300 sm:px-4 "><CiPaperplane className='text-3xl sm:4xl' /></button>
              {fileUploadError && <p className="absolute text-red-600 -top-[11px] left-[20px] font-semibold">Error Image Upload(image must be less than 2MB)</p>}
              {(!fileUploadError && file && fileUploadPercent < 100) && <p className="absolute text-green-500 -top-[11px] left-[20px] font-semibold">{`File uploaded ${Math.round(fileUploadPercent)}%`}</p>}
              {(!fileUploadError && file && fileUploadPercent === 100) && <p className="absolute text-green-500 -top-[11px] left-[20px] font-semibold">File is successfully uploaded</p>}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}