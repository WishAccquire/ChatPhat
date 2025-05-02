import React ,{useState} from 'react'
import { useLocation } from 'react-router-dom'

function Project() {
  const location = useLocation();
  const [isSidePanelOpen, setisSidePanelOpen] = useState(false)
  console.log(location.state)


  return (
    <main className='h-screen w-screen flex '>
      <section className='left h-full relative flex flex-col  min-w-72 bg-red-200'>
        <header className='flex justify-end p-2 w-full bg-red-300 '><button className='px-1 rounded-full bg-zinc-500' onClick={()=>setisSidePanelOpen(!isSidePanelOpen)}><i className="ri-group-fill "></i></button></header>
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
          <header className='flex justify-end p-2 px-3 bg-amber-100'>
              <button onClick={()=>setisSidePanelOpen(!isSidePanelOpen)}><i className="ri-close-circle-fill"></i></button>
          </header>

          <div className="users  flex flex-col gap-2">
            <div className="user flex cursor-pointer hover:bg-slate-50 p-2 gap-2 items-center">
              <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center text-white p-5 bg-slate-400'><i className='ri-user-fill absolute'></i></div>
              <h1 className='font-semibold text-lg'>username</h1>
            </div>
          </div>

        </div>
      </section>
    </main>
  )
}

export default Project