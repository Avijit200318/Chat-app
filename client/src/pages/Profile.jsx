import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux';
import { FaArrowLeftLong } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { useDispatch } from 'react-redux';
import { updateUserStart, updateUserFailure, updateUserSuccess, signOutSuccess, signOutFailure, signOutStart, deleteUserFailure, deleteUserStart, deleteUserSuccess } from '../redux/user/userSlice';

export default function Profile() {
    const { currentUser, error, loading } = useSelector((state) => state.user);
    const [formData, setFormData] = useState({});
    const [file, setFile] = useState(null);
    const [fileUploadPercent, setFilePercent] = useState(0);
    const [fileUploadError, setFileUploadError] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const fileRef = useRef(null);
    const dispatch = useDispatch();
    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    }

    useEffect(() => {
        if (file) {
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
                    setFormData({ ...formData, avatar: downloadUrl });
                });
            },
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            dispatch(updateUserStart());
            const res = await fetch(`/api/user/update/${currentUser._id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (data.success === false) {
                dispatch(updateUserFailure(data.message));
            }
            dispatch(updateUserSuccess(data));
            setFilePercent(0);
            setUpdateSuccess(true);
        } catch (error) {
            dispatch(updateUserFailure(error.message));
        }
    };

    const handleSignOut = async () => {
        try {
            dispatch(signOutStart());
            const res = await fetch("/api/auth/signout");
            const data = await res.json();
            if (data.success === false) {
                dispatch(signOutFailure(data.message));
                return;
            }
            dispatch(signOutSuccess(data));
        } catch (error) {
            dispatch(signOutFailure(error.message));
        }
    };

    const handleDeleteUser = async () => {
        let ans = confirm("Do you want to delete this account?");
        if(ans){
            try{
                dispatch(deleteUserStart());
                const res = await fetch(`/api/user/delete/${currentUser._id}`, {
                    method: 'DELETE',
                });
                const data = await res.json();
                if(data.success === false){
                    dispatch(deleteUserFailure(data.message));
                    return;
                }
                dispatch(deleteUserSuccess(data));
            }catch(error){
                dispatch(deleteUserFailure(error.message));
            }
        }
    };

    return (
        <div className='w-full h-screen bg-blue-100 py-6 px-4'>
            <div className="w-full px-4">
                <Link to='/'><FaArrowLeftLong className='text-2xl' /></Link>
            </div>
            <h1 className="text-3xl text-center">Profile</h1>
            <div className="flex flex-col justify-center items-center py-4 border-2 border-white relative w-[35%] mx-auto rounded-md">
                <div className="absolute w-full h-1/2 bg-blue-50 bottom-0 left-0 z-10"></div>
                <div onClick={() => fileRef.current.click()} className="w-28 h-28 rounded-full overflow-hidden border-4 border-white cursor-pointer z-20">
                    <img src={formData.avatar || currentUser.avatar} alt="" className="w-full h-full object-cover" />
                </div>
                {fileUploadError && <p className="text-sm font-semibold text-red-500">Error Image Upload(image must be less than 2MB)</p>}
                {
                    (!fileUploadError && fileUploadPercent !== 0 && fileUploadPercent < 100) && <p className="text-sm font-semibold text-green-500">{`Uploaded file ${fileUploadPercent}%`}</p>
                }
                {
                    (!fileUploadError && fileUploadPercent === 100) && <p className="text-sm font-semibold text-green-500">File Uploaded Successfully</p>
                }

                {error && <p className="text-red-600 font-semibold text-center">{error}</p>}

                {(!error && updateSuccess) && <p className="text-green-500 font-semibold text-center">Profile Updated successfully</p>}
            </div>
            <div className="flex justify-center border px-4">
                <form onSubmit={handleSubmit} className="border-4 border-blue-50 w-[36%] flex flex-col gap-4 p-4 rounded-md">
                    <input ref={fileRef} onChange={(e) => setFile(e.target.files[0])} type="file" hidden accept='image/*' />
                    <input type="text" onChange={handleInputChange} placeholder='Username' id='username' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' defaultValue={currentUser.username} />
                    <input type="email" onChange={handleInputChange} placeholder='email' id='email' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' defaultValue={currentUser.email} />
                    <input type="text" onChange={handleInputChange} placeholder='status' id='status' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' defaultValue={currentUser.status} />
                    <input type="password" onChange={handleInputChange} placeholder='Update password' id='password' className="px-4 py-3 border border-black rounded-md outline-none" autoComplete='off' />
                    <button disabled={loading} className="px-4 py-3 rounded-md bg-blue-500 text-white font-semibold transition-all duration-300 hover:bg-blue-600 disabled:bg-blue-400">{loading ? 'Loading...' : 'Update'}</button>
                    <button type='button' onClick={handleSignOut} className="px-4 py-3 rounded-md bg-red-500 text-white font-semibold transition-all duration-300 hover:bg-red-600">Log Out</button>
                    <button type='button' onClick={handleDeleteUser} className="px-4 py-3 rounded-md bg-red-500 text-white font-semibold transition-all duration-300 hover:bg-red-600">Delete Account</button>
                </form>
            </div>
        </div>
    )
}
