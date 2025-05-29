import React,{useContext,useEffect,useState} from 'react'
import { UserContext } from '../context/user.context.jsx'
import { useNavigate } from 'react-router-dom'
function UserAuth({children}) {
  const { user } = useContext(UserContext)
  const token = localStorage.getItem('token')
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  

  

  useEffect(() => {
    if(!token) {    
        navigate('/login') 
    }
    if(!user) {   
        navigate('/login') 
    }  
    else{
        navigate('/')
        setLoading(false)
    } 
}, []);
  
  

 if(loading) {
    return <div>Loading...</div>
  }

  return (
   <>{children}</>
  )
}

export default UserAuth
