import React ,{useState, useEffect} from 'react'
import { useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { intializeSocket,recieveMessage,sendMessage } from '../config/socket';

function Project() {
  const location = useLocation();
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false)
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  console.log(location.state)

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

  useEffect(() => {

     intializeSocket()
    // Fetch project collaborators when component mounts
      axios.get(`/project/get-project/${location.state.project._id}`)
      .then((res) => {

        
        
        setCollaborators(res.data.users)
        console.log("hjk",collaborators)
        
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

  return (
    <main className='h-screen w-screen flex '>
      <section className='left h-full relative flex flex-col  min-w-72 bg-red-200'>
        <header className='flex justify-between items-center p-2 w-full bg-red-300 '>
          <button className='flex gap-2' onClick={() => setIsUserModalOpen(true)}>
            <i className='ri-add-fill mr-1'></i>
            <p>Add Collaborator</p>
          </button>
          <button className='px-1 rounded-full bg-zinc-500' onClick={()=>setisSidePanelOpen(!isSidePanelOpen)}>
            <i className="ri-group-fill "></i>
          </button>
        </header>
        <div className="conversation-area flex-grow flex flex-col rounded-md ">
          <div className="message-box flex-grow flex flex-col text-slate-700 gap-1 p-2">
            <div className=" message max-w-64 flex flex-col w-fit bg-slate-50 rounded-md p-2  "><small className='opacity-65 text-xs'>example@gmail.com</small><p className='text-sm'>hello kya haal chal?? </p></div>
            <div className="ml-auto max-w-64 message flex flex-col w-fit bg-slate-50 rounded-md p-2  "><small className='opacity-65 text-xs'>example@gmail.com</small><p className='text-sm'>badiya </p></div>
          </div>
          <div className="input-field w-full flex">
            <input type='text' className='p-2 px-4 bg-white  outline-None' placeholder='Enter Message' />
            <button className='flex-grow bg-blue-100 px-3 text-blue-500 text-3xl'><i className="ri-send-plane-fill "></i></button>
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