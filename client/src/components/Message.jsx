import React from 'react'
import { useSelector } from 'react-redux'
import { LuArrowDownToLine } from "react-icons/lu";
import { MdDelete } from "react-icons/md";

import { saveAs } from 'file-saver'
import { getStorage, ref, deleteObject } from 'firebase/storage';
import { app } from '../firebase';


export default function Message({ text, sender, createTime, file, url, imgId, handleDeleteImage, fileType }) {
    const { currentUser } = useSelector((state) => state.user);
    const pdfImage = 'https://firebasestorage.googleapis.com/v0/b/chat-app-bd4d2.appspot.com/o/pdf.avif?alt=media&token=0c29950c-4994-40db-94c0-8b041a00a688';
    const wordImage = 'https://firebasestorage.googleapis.com/v0/b/chat-app-bd4d2.appspot.com/o/word.png?alt=media&token=a59b2874-1ed5-4ba1-8737-63ecb07e1ca8';
    const pptImage = 'https://firebasestorage.googleapis.com/v0/b/chat-app-bd4d2.appspot.com/o/ppt.png?alt=media&token=e64419a2-f9df-46e1-9555-5bc32938f906';

    
    // console.log("fileName", fileNamex)

    const showTime = () => {
        const date = new Date(createTime);
        const options = {
            hour: '2-digit',
            minute: '2-digit',
        }
        return date.toLocaleTimeString('en-US', options);
    };

    const handleImageDownload = async (imgUrl, fileType) => {
        try {
            const response = await fetch(imgUrl);
            const fileName = imgUrl.split('/').pop().split('#')[0].split('?')[0] || 'downloaded_file';
            if (!response.ok) throw new Error('Network response was not ok');

            const blob = await response.blob();
                
            if(fileType === 'pdf'){
                saveAs(blob,`${fileName}.pdf`);
            }else if(fileType === 'word'){
                saveAs(blob, `${fileName}.docx`);
            }else if(fileType === 'ppt'){
                saveAs(blob, `${fileName}.pptx`);
            }else{
                saveAs(blob, `${fileName}.jpg`);
            }
        } catch (error) {
            console.error('Error downloading the image', error);
        }
    };

    const deleteFirebaseImage = async (imgUrl, messageId) => {
        await handleDeleteImage(messageId);

        const storage = getStorage(app);
        // Extracting the file name from the URL
        const decodedUrl = decodeURIComponent(imgUrl); // Decode the URL
        const fileName = decodedUrl.substring(decodedUrl.lastIndexOf('/') + 1).split('?')[0];

        console.log("file name is ", fileName);
        const storageRef = ref(storage, fileName);
        try {
            await deleteObject(storageRef);
            console.log("File deleted successfully");
        } catch (error) {
            console.error("Error deleting file:", error);
        }
    };

    return (
        <div style={{ justifyContent: `${currentUser._id === sender ? 'end' : 'start'}` }} className='py-2 flex px-6 sm:my-2 sm:px-12'>
            <div style={{ background: `${currentUser._id === sender ? 'rgb(242, 242, 138)' : ''}` }} className={`bg-[#EBCCFF] inline-block max-w-[55%] p-2 rounded-xl relative ${currentUser._id === sender ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                {(file && fileType === 'image') && (
                    <div className="w-36 h-40 bg-white relative sm:w-40">
                        <img src={url} alt="" className="w-full h-full object-contain" />
                        <div className="absolute bottom-0 right-0 flex items-center gap-1">
                            {sender === currentUser._id && (
                                <button onClick={() => deleteFirebaseImage(url, imgId)} className="p-1 rounded-full bg-gray-200  transition-all duration-300 hover:bg-red-400 hover:text-white"><MdDelete className='text-lg' /></button>
                            )}
                            <button onClick={() => handleImageDownload(url)} className="p-1 rounded-full bg-gray-200 transition-all duration-300 hover:bg-gray-300 hover:text-white"><LuArrowDownToLine className='text-base' /></button>
                        </div>
                    </div>
                )}
                {(file && fileType && fileType !== 'image') && (
                    <div className="w-36 h-24 bg-white relative sm:w-40">
                        <img src={fileType === 'pdf' ? pdfImage : fileType === 'word' ? wordImage : pptImage} alt="" className="w-full h-full object-contain" />
                        <div className="absolute bottom-0 right-0 flex items-center gap-1">
                            {sender === currentUser._id && (
                                <button onClick={() => deleteFirebaseImage(url, imgId)} className="p-1 rounded-full bg-gray-200  transition-all duration-300 hover:bg-red-400 hover:text-white"><MdDelete className='text-lg' /></button>
                            )}
                            <button onClick={() => handleImageDownload(url, fileType)} className="p-1 rounded-full bg-gray-200 transition-all duration-300 hover:bg-gray-300 hover:text-white"><LuArrowDownToLine className='text-base' /></button>
                        </div>
                    </div>
                )}
                <p className="text-sm whitespace-normal break-words">{text}</p>
                <div className="min-w-16 h-4">
                    <h2 className="text-[0.65rem] float-end min-w-[10%] font-semibold text-gray-700">{showTime(createTime)}</h2>
                </div>
            </div>
        </div>
    )
}
