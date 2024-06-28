import React, { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { BsEmojiSmile } from "react-icons/bs";

export default function Emoji({setMessage}) {

    const [pickerVisible, setPickerVisible] = useState(false);
    const [currentEmoji, setCurrentEmoji] = useState(null);    

  return (
    <div className='hidden lg:block'>
      <button onClick={()=> setPickerVisible(!pickerVisible)} className=" p-2 rounded-full transition-all duration-300 hover:bg-gray-300"><BsEmojiSmile className='text-xl'/></button>
      <div className={`${pickerVisible ? 'absolute w-[21rem] h-20 overflow-hidden rounded-xl right-8 -top-24 shadow-xl' : 'hidden'}`}>
        <Picker data={data} previewPosition="none" onEmojiSelect={(e) => {
            setCurrentEmoji(e.native);
            setMessage((prev) => prev + e.native);
            setPickerVisible(!pickerVisible);
        }} categories='frequent' searchPosition='none' navPosition='none' className="" />
      </div>
    </div>
  )
}