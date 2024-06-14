import React from 'react'
import { useSelector } from 'react-redux'

export default function Message({ text, sender, createTime}) {
    const {currentUser} = useSelector((state) => state.user);
    
    const showTime = () => {
        const date = new Date(createTime);
        const options = {
            hour: '2-digit',
            minute: '2-digit',
        }
        return date.toLocaleTimeString('en-US', options);
    }

    return (
        <div style={{justifyContent: `${currentUser._id === sender? 'end':'start'}`}} className='my-2 py-2 flex px-12'>
            <div style={{background: `${currentUser._id === sender? '#5cf39f':''}`}} className="bg-blue-400 inline-block max-w-[55%] p-2 rounded-md">
                <p className="break-all whitespace-normal">{text}</p>
                <div className="min-w-16 h-4">
                    <h2 className="text-[0.65rem] float-end min-w-[10%]">{showTime(createTime)}</h2>
                </div>
            </div>
        </div>
    )
}
