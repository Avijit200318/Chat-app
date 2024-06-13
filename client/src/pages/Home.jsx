import React, { useEffect, useState } from 'react'
import { IoChatboxEllipsesOutline } from "react-icons/io5";
import { MdGroup } from "react-icons/md";
import { BsTools } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { TfiAnnouncement } from "react-icons/tfi";
import { IoIosSearch } from "react-icons/io";
import { useSelector } from "react-redux";

export default function Home() {

  const { currentUser } = useSelector((state) => state.user);
  const [allUsers, setAllUsers] = useState(null);
  console.log(allUsers);

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

  console.log(currentUser);
  return (
    <div className='flex'>
      <div className="left w-[30%] bg-yellow-400 h-screen flex pl-4">
        <div className="col1 bg-blue-50 w-[15%] flex flex-col justify-between px-3 py-6">
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
        <div className="col2 w-[85%] h-screen bg-white px-2 py-4 flex flex-col">
          <div className="border-b border-gray-400">
            <h1 className="text-2xl font-semibold px-4">Chats...</h1>
            <div className="border border-black flex my-4 overflow-hidden rounded-full">
              <input type="text" placeholder='Search...' className="px-4 py-2 w-[85%] outline-none" />
              <button className='py-2 px-4 text-2xl w-[15%]'><IoIosSearch/></button>
            </div>
          </div>
          {allUsers && (
            allUsers.map((user) => 
              <div key={user.email} className="flex items-center gap-6 py-2 border-b border-gray-500 transition-all duration-300 hover:bg-blue-50 cursor-pointer">
                <img src={user.avatar} alt="" className="w-10 h-10 rounded-full bg-blue-200" />
                <div className="flex flex-col gap-2">
                  <h1 className="">{user.username}</h1>
                  <p className="text-xs text-gray-500 font-semibold">some thing</p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <div className="right w-[70%] bg-blue-400 h-screen"></div>
    </div>
  )
}
