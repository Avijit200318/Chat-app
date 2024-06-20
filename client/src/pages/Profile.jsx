import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { FaArrowLeftLong } from "react-icons/fa6";
import {Link} from "react-router-dom";
import {getDownloadURL, getStorage, ref, uploadBytesResumable} from "firebase/storage";
import {app} from "../firebase";
import { useDispatch } from 'react-redux';
import { updateUserStart, updateUserFailure, updateUserSuccess } from '../redux/user/userSlice';

export default function Profile() {
    const { currentUser, error, loading } = useSelector((state) => state.user);
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [fileUploadPercent, setFilePercent] = useState(0);
    const [fileUploadError, setFileUploadError] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const fileRef = useRef(null);
    console.log(formData);
    console.log("upload: ", fileUploadPercent);
    const dispatch = useDispatch();

    const handleInputChange = (e) => {
        setFormData({...formData, [e.target.id]: e.target.value});
    }

    useEffect(() => {
        if(file){
            handleFileUpload(file);
        }
    }, [file]);

    const handleFileUpload = (file) => {
        const storage = getStorage(app);
        const fileName = new Date().getTime() + file.name;
        const storageRef = ref(storage, fileName);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on('state_changed', 
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setFilePercent(Math.round(progress));
            },
            (error) => {
                setFileUploadError(true);
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadUrl) => {
                    setFormData({...formData, avatar: downloadUrl});
                });
            },
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try{
            dispatch(updateUserStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if(data.success === false){
                dispatch(updateUserFailure(data.message));
            }
            console.log("updated user: ", data);
            dispatch(updateUserSuccess(data));
            setUpdateSuccess(true);
        }catch(error){
            dispatch(updateUserFailure(error.message));
        }
    }

    return (
        <div className='w-full h-screen bg-blue-100 py-6 px-4'>
            <div className="w-full px-4">
                <Link to='/'><FaArrowLeftLong className='text-2xl' /></Link>
            </div>
            <h1 className="text-3xl text-center py-2">Profile</h1>
            <div className="flex flex-col justify-center items-center py-6 border border-black">
                <div onClick={() => fileRef.current.click()} className="w-28 h-28 rounded-full overflow-hidden border-4 border-white cursor-pointer">
                    <img src={currentUser.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                {fileUploadError && <p className="text-sm font-semibold text-red-500">Error Image Upload(image must be less than 2MB)</p>}
                {
                    (!fileUploadError && fileUploadPercent !== 0 && fileUploadPercent < 100) && <p className="text-sm font-semibold text-green-500">{`Uploaded file ${fileUploadPercent}%`}</p>
                }
                {
                    (!fileUploadError && fileUploadPercent === 100) && <p className="text-sm font-semibold text-green-500">File Uploaded Successfully</p>
                }
            </div>
            <div className="flex justify-center border border-black p-4">
                <form onSubmit={handleSubmit} className="border-2 border-black w-[36%] flex flex-col gap-4 p-4 rounded-md">
                    <input ref={fileRef} onChange={(e) => setFile(e.target.files[0])} type="file" hidden accept='image/*' />
                    <input type="text" onChange={handleInputChange} placeholder='Username' id='username' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' defaultValue={currentUser.username} />
                    <input type="email" onChange={handleInputChange} placeholder='email' id='email' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' defaultValue={currentUser.email}/>
                    <input type="text" onChange={handleInputChange} placeholder='status' id='status' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' defaultValue={currentUser.status} />
                    <input type="password" onChange={handleInputChange} placeholder='Update password' id='password' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off'/>
                    <button disabled={loading} className="px-4 py-3 rounded-md bg-blue-500 text-white font-semibold transition-all duration-300 hover:bg-blue-600 disabled:bg-blue-400">{loading? 'Loading...' : 'Update'}</button>
                </form>
            </div>
            {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}
            {(!error && updateSuccess)&& <p className="text-green-500 text-sm font-semibold text-center">Profile Updated successfully</p>}
        </div>
    )
}
