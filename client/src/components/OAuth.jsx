import React from 'react'
import googleLogo from "../../public/images/googleLogo.png"
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth"
import { app } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';

export default function OAuth() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleGoogleClick = async () => {
        try {
            const provider = new GoogleAuthProvider();
            const auth = getAuth(app);

            const result = await signInWithPopup(auth, provider);

            const res = await fetch("/api/auth/google", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: result.user.displayName,
                    email: result.user.email,
                    photo: result.user.photoURL,
                }),
            });
            const data = await res.json();
            if(data.success !== false){
                dispatch(signInSuccess(data));
                navigate('/');
            }
        } catch (error) {
            console.log("cannot sign with google ", error);
        }
    };

    return (
        <button type='button' onClickCapture={handleGoogleClick} className='border sm:border-2 border-black flex justify-center items-center gap-4 p-[0.3rem] overflow-hidden rounded-full'>
            <img src={googleLogo} alt="" className="w-8" />
            <h3 className='text-xl font-semibold'>Google</h3>
        </button>
    )
}
