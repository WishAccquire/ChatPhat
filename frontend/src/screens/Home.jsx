import React, {useContext} from 'react'
import {UserContext} from '../context/user.context'
import { useState,useEffect } from 'react'
import axios from '../config/axios'
import { useNavigate } from 'react-router-dom'

function Home() {
  const { user } = useContext(UserContext)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [project,setProject]=useState([])
  const navigate=useNavigate();


  useEffect(()=>{
    axios.get('/project/all').then((res)=>{
     
      setProject(res.data.projects)
    }).catch((error)=>{
      console.log(error);
  })
  },[])

  function createProject(e){
    e.preventDefault()
    console.log("project creating with name:", projectName)
    axios.post('/project/create',{
      name:projectName
    }).then((res)=>{
      console.log(res)
     
      setIsModalOpen(false)

    }).catch((error)=>{
        console.log(error);
    })
    setProjectName('')
   
  }
  
  return (
    <main className='p-4 '>
      <div className='projects flex flex-wrap gap-3'>
           <button onClick={() => setIsModalOpen(true)} className='project p-4 border border-slate-300 rounded-md hover:bg-slate-100'> 
               <i className='ri-link ml-2'>New Project </i>
           </button>

           {
             project && project.map((project)=>(
              <div key={project._id} onClick={()=>{navigate(`/project`,{
                state:{project}
              })}} className='project flex flex-col min-w-58  gap-2 p-4 cursor-pointer border border-slate-300 rounded-md hover:bg-slate-100'>
                <h2 className='font-bold'>{project.name}</h2> 
                <div className='flex gap-x-2 items-center'>
                  <p><i className='ri-user-line mx-1'></i> Collaborators: </p> {project.users.length}</div>
                   </div>
             ))
           }
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={createProject}>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name"
                className="w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}

export default Home

