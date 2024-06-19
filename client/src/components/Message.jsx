import React from 'react'
import { useSelector } from 'react-redux'
import { LuArrowDownToLine } from "react-icons/lu";
import { MdDelete } from "react-icons/md";


export default function Message({ text, sender, createTime, file, image }) {
    const { currentUser } = useSelector((state) => state.user);

    const showTime = () => {
        const date = new Date(createTime);
        const options = {
            hour: '2-digit',
            minute: '2-digit',
        }
        return date.toLocaleTimeString('en-US', options);
    };

    const handleImageDownload = async (imgUrl) => {
        
    };

    return (
        <div style={{ justifyContent: `${currentUser._id === sender ? 'end' : 'start'}` }} className='my-2 py-2 flex px-12'>
            <div style={{ background: `${currentUser._id === sender ? '#5cf39f' : ''}` }} className="bg-blue-400 inline-block max-w-[55%] p-2 rounded-md">
                {(file && image) && (
                    <div className="w-40 relative">
                        <img src={image} alt="" className="w-full h-full object-contain" />
                        <div className="absolute bottom-0 right-0 flex items-center gap-1">
                            <button className="p-1 rounded-full bg-gray-200  transition-all duration-300 hover:bg-gray-400 hover:text-white"><MdDelete className='text-lg' /></button>
                            <button onClick={()=> handleImageDownload(image)} className="p-1 rounded-full bg-gray-200 transition-all duration-300 hover:bg-gray-400 hover:text-white"><LuArrowDownToLine className='text-base' /></button>
                        </div>
                    </div>
                )}
                <p className="break-all whitespace-normal">{text}</p>
                <div className="min-w-16 h-4">
                    <h2 className="text-[0.65rem] float-end min-w-[10%]">{showTime(createTime)}</h2>
                </div>
            </div>
        </div>
    )
}
