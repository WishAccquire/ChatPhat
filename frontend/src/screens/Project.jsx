import React ,{useState, useEffect,useContext, use} from 'react'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios.js'
import { intializeSocket,receiveMessage,sendMessage } from '../config/socket';
import {UserContext} from '../context/user.context.jsx'
import { createRef } from 'react';
//we use room -jisme set of user hi chat kar sake
function Project() {
  const location = useLocation();
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [message, setMessage] = useState('')
  const project = location.state.project; // Assuming project data is passed in state
  const { user } = useContext(UserContext); // Get the current user from context
  const messageBox=createRef();
 
  

  useEffect(() => {
    // Fetch all users when modal opens
    if (isUserModalOpen) {
      axios.get('/users/all')
        .then((res) => {
          setUsers(res.data.users)
        })
        .catch((err) => {
          console.error('Error fetching users:', err)
        })
    }
  }, [isUserModalOpen])
  

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId)
      }
      return [...prev, userId]
    })
  }

  const [collaborators, setCollaborators] = useState([])

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = intializeSocket(project._id);

  

    // Now set up your listener
    receiveMessage('message', (data) => {
      console.log('✅ Received message:', data);
      appendIncomingMessage(data);
      
    });
 

    // Fetch project collaborators when component mounts
    axios.get(`/project/get-project/${location.state.project._id}`)
      .then((res) => {
        setCollaborators(res.data.users)
        
      })
      .catch((err) => {
        console.error('Error fetching collaborators:', err)
      })
  }, [])  

  const handleAddCollaborators = () => {
    // Add API call to add users to project
    axios.put('/project/add-user', {
      projectId: location.state.project._id,
      users: selectedUsers
    })
    .then((res) => {
      console.log('Users added successfully:', res.data)
      setIsUserModalOpen(false)
      setSelectedUsers([])
    })
    .catch((err) => {
      console.error('Error adding users:', err)
    })
  }

  const send = () => {
    //iske call pe message emit ho jayega client se server pe,
    //and then server will broadcast to all the users in that room
    
    sendMessage('message', {
      message,
      sender:user
    });
    appendOutgoingMessage(message,user)
     
    setMessage(''); // Clear the input field after sending

  }

  function scrollToBottom() {

      messageBox.current.scrollTop = messageBox.current.scrollHeight;

  }

  function appendIncomingMessage(data) {
    const messageBox=document.querySelector('.message-box');
    // Append the incoming message to the message box
    const mdata=document.createElement('div');
    mdata.classList.add('message','max-w-64','flex','flex-col','w-fit','bg-slate-50','rounded-md','p-2');
    mdata.innerHTML=`
      <small class='opacity-65 text-xs'>${data.sender.email}</small>
      <p class='text-sm'>${data.message}</p>
    `

    messageBox.appendChild(mdata);
    scrollToBottom(); // Scroll to the bottom after appending the message
  }

  function appendOutgoingMessage(data,userw) {
    const messageBox=document.querySelector('.message-box');
    // Append the outgoing message to the message box
    const mdata=document.createElement('div');
    mdata.classList.add('ml-auto','max-w-64','message','flex','flex-col','w-fit','bg-slate-50','rounded-md','p-2');
    mdata.innerHTML=`
      <small class='opacity-65 text-xs'>${userw.email}</small>
      <p class='text-sm'>${data}</p>
    `

    messageBox.appendChild(mdata);
    scrollToBottom(); // Scroll to the bottom after appending the message
  }
  return (
    <main className='h-screen w-screen flex '>
      <section className='left h-screen relative flex flex-col  min-w-72 bg-red-200'>
        <header className='flex justify-between items-center p-2 w-full bg-red-300 absolute top-0 '>
          <button className='flex gap-2' onClick={() => setIsUserModalOpen(true)}>
            <i className='ri-add-fill mr-1'></i>
            <p>Add Collaborator</p>
          </button>
          <button className='px-1 rounded-full bg-zinc-500' onClick={()=>setisSidePanelOpen(!isSidePanelOpen)}>
            <i className="ri-group-fill "></i>
          </button>
        </header>
        <div className="conversation-area pt-14 flex-grow flex flex-col rounded-md relative overflow-hidden">
          <div ref={messageBox} className="message-box flex-grow flex flex-col text-slate-700 gap-1 p-2 pb-12 overflow-auto max-h-full ">
            
          </div>
          <div className="input-field w-full absolute bottom-0 flex">
            <input 
            type='text'
            value={message}
            onChange={(e) => setMessage(e.target.value)} 
            className='p-2 px-4 bg-white  outline-None' 
            placeholder='Enter Message' />
            <button onClick={send} className='flex-grow bg-blue-100 px-3 text-blue-500 text-3xl'><i className="ri-send-plane-fill "></i></button>
          </div>
        </div>

        <div className={`sidePanel w-full  h-full flex flex-col gap-2 bg-slate-700 absolute transition-all  ${isSidePanelOpen? 'translate-x-0' :'-translate-x-full' } top-0`}>
          <header className='flex justify-between items-center p-2 px-3 bg-amber-100'>
            <h1 className='font-bold'>Collaborators</h1>
              <button onClick={()=>setisSidePanelOpen(!isSidePanelOpen)}><i className="ri-close-circle-fill"></i></button>
          </header>

          
                {
                  isSidePanelOpen && collaborators.length>0 && collaborators.map((collaborator) => (
                    <div key={collaborator._id} className="user flex flex-col justify-center cursor-pointer hover:bg-slate-50 p-2 gap-2 items-center">
                      <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center text-white p-5 bg-slate-400'>
                        <i className='ri-user-fill absolute'></i>
                      </div>
                      <h1 className='font-semibold text-[16px]'>{collaborator.email}</h1>
                    </div>
                  ))
                }
              

        </div>

        {/* User Selection Modal */}
        {isUserModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Select Collaborators</h2>
                  <button 
                    onClick={() => setIsUserModalOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                </div>
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => handleUserSelect(user._id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUsers.includes(user._id) 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <i className="ri-user-fill text-gray-500"></i>
                    </div>
                    <div>
                      <p className="font-medium">{user.email}</p>
                    </div>
                    {selectedUsers.includes(user._id) && (
                      <i className="ri-check-line text-blue-500 ml-auto"></i>
                    )}
                  </div>
                ))}
              </div>

              <div className="p-4 border-t flex justify-end gap-2">
                <button
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCollaborators}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  disabled={selectedUsers.length === 0}
                >
                  Add Selected Users
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}

export default Project