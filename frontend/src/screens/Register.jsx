import React,{useState, useContext} from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { UserContext } from '../context/user.context'
import loginImg from '../assets/images/boxoffice.png'
import axios from '../config/axios.jsx'

function Register() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('')
    const navigate=useNavigate();
    const { setUser }= useContext(UserContext)

    function submitHandle(e){
        
        e.preventDefault()
        axios.post('/users/register',{email,password}).then((res)=>{
         console.log(res.data)
         localStorage.setItem('token',res.data.user)
         setUser(res.data.user)
         navigate('/')
        }).catch((err)=>{
         console.log(err.response.data)
        })
    }

    return (

        <div className="w-full h-screen bg-[#6E727F] flex items-center justify-center px-10">
            <div className="bg-[#2C333F] text-white w-1/2 h-[500px] flex flex-col items-center justify-center px-5 py-10 rounded-md">
                <h1 className="text-4xl">
                    Welcome to <span className="text-sky-500 font-semibold">ChatPhat</span>
                </h1>
                <h1 className="text-3xl mt-5 mb-5">SignUp To Your Account</h1>
                <div className="w-full flex gap-x-2 my-3 ">

                  

                    <div>
                        <form autoComplete="email" onSubmit={submitHandle}>
                            <label className="text-xl mt-5 mb-2" htmlFor='email'>Email</label>
                            <input
                                onChange={(e)=>setEmail(e.target.value)}
                                type="email"
                                id='email'
                                placeholder="Email"
                                name="email"
                                className=" px-4 py-2 rounded border border-gray-300 mb-2"
                                required
                            />
                            <label htmlFor='password' className="text-xl mt-5 mb-2">Password</label>
                            <input
                                onChange={(e)=>setPassword(e.target.value)}  
                                id='password'
                                type="password"
                                placeholder="Password"
                                name="password"
                                className=" px-4 py-2 rounded border border-gray-300 mb-2"
                                required
                            />

                            <button
                                className="rounded-md px-4 py-2 bg-green-500 text-white text-xl my-4 cursor-pointer"
                                type="submit"
                                value="Login"
                            >Signup</button>
                        </form>
                        <div>Already have an Account? <NavLink to='/login' className='text-blue-400 underline mt-4'>Login</NavLink></div>
                    </div>
                    <div className='mt-4'><img src={loginImg} alt="loginpage" /></div>
                </div>
            </div>
        </div>



    )
}

export default Register
