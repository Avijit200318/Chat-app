import React, { useState } from 'react'
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link, useParams, useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";

export default function OthersPofile() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(false);
    const params = useParams();
    const [clearChatError, setClearChatError] = useState(null);
    const navigate = useNavigate();

    useState(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/user/showuser/${params.userId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({}),
                });

                const data = await res.json();
                if (data.success === false) {
                    console.log(data.message);
                    setLoading(false);
                    return;
                }
                setUserData(data);
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    const handleClearChat = async () => {
        let ans = confirm("Do you realy want to clear all messages?");
        if(!ans) return;
        try{
            const res = await fetch(`/api/message/clearChat/${userData._id}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if(data.success === false)
            {
                setClearChatError(data.message);
                return;
            }
            navigate('/');
        }catch(error){
            setClearChatError(error.message);
        }
    };

    return (
        <div>
            {loading && (
                <div className="w-full h-full absolute left-0 top-0 flex justify-center items-center bg-[#0197ff] z-50">
                    <div className="h-24 w-24 border-8 border-t-white border-gray-300 rounded-full animate-spin"></div>
                </div>
            )}
            {(!loading && userData) && (
            <div className='w-full h-screen bg-blue-100 py-6 px-2 sm:px-4'>
                <div className="w-full px-4">
                    <Link to='/'><FaArrowLeftLong className='text-2xl' /></Link>
                </div>
                <h1 className="text-3xl text-center py-4">Profile</h1>
                <div className="flex flex-col justify-center items-center py-4 border-2 border-white relative w-full mx-auto rounded-md sm:w-[70%] lg:w-[55%] xl:w-[35%]">
                    <div className="absolute w-full h-1/2 bg-blue-50 bottom-0 left-0 z-10"></div>
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white z-20">
                        <img src={userData.avatar} alt="" className="w-full h-full object-cover" />
                    </div>

                </div>
                <div className="flex justify-center border xl:px-4">
                    <div className="border-4 border-blue-50 w-full flex flex-col gap-4 p-4 rounded-md sm:w-[70%] lg:w-[55%] xl:w-[36%]">
                        <input type="text" placeholder='Username' id='username' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' value={userData.username} />
                        <input type="email" placeholder='email' id='email' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' value={userData.email} />
                        <input type="text" placeholder='status' id='status' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' value={userData.status} />
                        <button title='All messages delete in both side' onClick={handleClearChat} className="bg-red-500 text-white rounded-md flex items-center gap-4 justify-center py-3 transition duration-300 hover:bg-red-600"><MdDelete className='text-2xl' />Delete Chat</button>
                    </div>
                </div>
            </div>
            )}
        </div>
    )
}
