import React, { useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { BsEmojiSmile } from "react-icons/bs";

export default function Emoji() {

    const [pickerVisible, setPickerVisible] = useState(false);
    const [currentEmoji, setCurrentEmoji] = useState(null);

  return (
    <div className='hidden lg:flex lg:items-center transition-all duration-300 hover:bg-gray-300 p-2 rounded-full'>
      <button onClick={()=> setPickerVisible(!pickerVisible)} className=""><BsEmojiSmile className='text-xl'/></button>
      <div className={`${pickerVisible ? 'absolute bottom-4' : 'hidden'}`}>
        <Picker data={data} previewPosition="none" onEmojiSelect={(e) => {
            setCurrentEmoji(e.native);
            setPickerVisible(!pickerVisible);
        }} onClickOutside={() => setPickerVisible(!pickerVisible)} categories='frequent' searchPosition='none' navPosition='none' className="h-20" />
      </div>
    </div>
  )
}
