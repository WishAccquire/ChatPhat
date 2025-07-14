import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js'
import { getWebContainer } from '../config/webContainer'

function SyntaxHighlightedCode(props) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current && props.className?.includes('lang-') && window.hljs) {
      window.hljs.highlightElement(ref.current)
      ref.current.removeAttribute('data-highlighted')
    }
  }, [props.className, props.children])

  return <code {...props} ref={ref} />
}

const Project = () => {
  const location = useLocation()

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState(new Set())
  const [project, setProject] = useState(location.state?.project || {})
  const [message, setMessage] = useState('')
  const { user } = useContext(UserContext)
  const messageBox = useRef()

  const [users, setUsers] = useState([])
  const [messages, setMessages] = useState([])
  const [fileTree, setFileTree] = useState({})
  const [currentFile, setCurrentFile] = useState(null)
  const [openFiles, setOpenFiles] = useState([])
  const [webContainer, setWebContainer] = useState(null)
  const [iframeUrl, setIframeUrl] = useState(null)
  const [runProcess, setrunProcess] = useState(null)

  const handleUserClick = (id) => {
    setSelectedUserId(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  function addCollaborators() {
    axios.put("/project/add-user", {
      projectId: project._id,
      users: Array.from(selectedUserId)
    }).then(res => {
      setProject(res.data)
      setIsModalOpen(false)
    }).catch(err => {
      console.log(err)
    })
  }

  // Load previous messages from database
  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/message/project/${project._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const formattedMessages = response.data.messages.map(msg => ({
        sender: msg.messageType === 'ai' ? { _id: 'ai', email: 'AI' } : msg.sender,
        message: msg.content,
        messageType: msg.messageType
      }))
      
      setMessages(formattedMessages)
      
      // Scroll to bottom after loading messages
      setTimeout(() => {
        if (messageBox.current) {
          messageBox.current.scrollTop = messageBox.current.scrollHeight
        }
      }, 100)
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const send = () => {
    sendMessage('project-message', {
      message,
      sender: user
    })
    setMessages(prev => [...prev, { sender: user, message }])
    setMessage("")
    messageBox.current.scrollTop = messageBox.current.scrollHeight;
  }

  function WriteAiMessage(message) {
    let messageObject;
    try {
      messageObject = typeof message === "string" ? JSON.parse(message) : message;
    } catch {
      // If not JSON, treat as markdown string
      messageObject = { text: message };
    }

    return (
      <div className='overflow-auto rounded-sm p-2 flex flex-col gap-4'>
        {/* Render main text if present */}
        {messageObject.text && (
          <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>
            {messageObject.text}
          </Markdown>
        )}

        {/* Render functions if present */}
        {Array.isArray(messageObject.functions) && messageObject.functions.length > 0 && (
          <div className="functions-list flex flex-col gap-4">
            {messageObject.functions.map((fn, idx) => (
              <div key={idx} className="function-block p-2 bg-slate-100 rounded">
                <h3 className="font-semibold mb-1">{fn.name}</h3>
                {fn.description && <p className="mb-1">{fn.description}</p>}
                {fn.parameters && (
                  <div className="mb-1">
                    <strong>Parameters:</strong>
                    <ul className="list-disc ml-5">
                      {fn.parameters.map((param, i) => (
                        <li key={i}>
                          <b>{param.name}</b> (<i>{param.type}</i>): {param.description}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {fn.returnType && (
                  <div className="mb-1">
                    <strong>Returns:</strong> <span>{fn.returnType}</span>
                  </div>
                )}
                {fn.code && (
                  <div className="mb-1">
                    <strong>Code:</strong>
                    <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>
                      {`\`\`\`javascript\n${fn.code}\n\`\`\``}
                    </Markdown>
                  </div>
                )}
                {fn.example && (
                  <div>
                    <strong>Example:</strong>
                    <Markdown options={{ overrides: { code: SyntaxHighlightedCode } }}>
                      {`\`\`\`javascript\n${fn.example}\n\`\`\``}
                    </Markdown>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  useEffect(() => {
    if (!project._id) return;

    // Load previous messages first
    loadMessages();

    initializeSocket(project._id)

    if (!webContainer) {
      getWebContainer().then(container => {
        setWebContainer(container)
        console.log("container started")
      })
    }

    receiveMessage('project-message', data => {
      console.log(data)

      if (data.sender._id === 'ai') {
        try {
          const messageObj = JSON.parse(data.message);
          if (messageObj.fileTree) {
            webContainer?.mount(messageObj.fileTree);
            setFileTree(messageObj.fileTree);
          }
        } catch (e) {
          // Not JSON, ignore
        }
      }

      setMessages(prev => [...prev, data])
    })

    axios.get(`/project/get-project/${project._id}`).then(res => {
      setProject(res.data)
      // Load existing file tree from project if available
      if (res.data.fileTree) {
        setFileTree(res.data.fileTree)
      }
    })

    axios.get('/users/all').then(res => {
      setUsers(res.data.users)
    }).catch(console.log)
  }, [project._id])

  function saveFileTree(ft) {
    console.log('Sending fileTree:', ft)
    axios.put('/project/update-file-tree',
      { projectId: project._id, fileTree: ft }).then(res => { console.log(res.data) }).catch(err => { console.log(err) })
  }

  // Helper function to get file content safely
  const getFileContent = (fileName) => {
    if (!fileTree[fileName]) return '';

    // Handle different possible structures
    if (fileTree[fileName].file && fileTree[fileName].file.contents) {
      return fileTree[fileName].file.contents;
    }
    if (typeof fileTree[fileName] === 'string') {
      return fileTree[fileName];
    }
    return '';
  }

  return (
    <main className='h-screen w-screen flex'>
      <section className="left relative flex flex-col h-screen min-w-96 bg-slate-300">
        <header className='flex justify-between items-center p-2 px-4 w-full bg-slate-100 absolute z-10 top-0'>
          <button className='flex gap-2' onClick={() => setIsModalOpen(true)}>
            <i className="ri-add-fill mr-1"></i>
            <p>Add collaborator</p>
          </button>
          <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
            <i className="ri-group-fill"></i>
          </button>
        </header>

        <div className="conversation-area pt-14 pb-10 flex-grow flex flex-col h-full relative">
          <div
            ref={messageBox}
            className="message-box p-1 flex-grow flex flex-col gap-1 overflow-auto max-h-full scrollbar-hide">
            {messages.map((msg, index) => (
              <div key={index} className={`${msg.sender._id === 'ai' ? 'max-w-84' : 'max-w-52'} ${msg.sender._id === user._id && 'ml-auto'} message flex flex-col p-2 bg-slate-50 w-fit rounded-md`}>
                <small className='opacity-65 text-xs'>{msg.sender.email}</small>
                <div className='text-sm'>
                  {msg.sender._id === 'ai' ? WriteAiMessage(msg.message) : <p>{msg.message}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="inputField w-full flex absolute bottom-0 ">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && send()}
              className='p-2 px-4 border-none outline-none flex-grow bg-slate-50'
              type="text"
              placeholder='Enter message'
            />
            <button onClick={send} className='px-5 bg-slate-950 text-white'>
              <i className="ri-send-plane-fill"></i>
            </button>
          </div>
        </div>

        <div className={`sidePanel w-full h-full flex flex-col gap-2 bg-slate-50 absolute transition-all ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'} top-0`}>
          <header className='flex justify-between items-center px-4 p-2 bg-slate-200'>
            <h1 className='font-semibold text-lg'>Collaborators</h1>
            <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className='p-2'>
              <i className="ri-close-fill"></i>
            </button>
          </header>
          <div className="users flex flex-col gap-2">
            {project.users && project.users.map((user, idx) => (
              <div key={idx} className="user cursor-pointer hover:bg-slate-200 p-2 flex gap-2 items-center">
                <div className='aspect-square rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                  <i className="ri-user-fill absolute"></i>
                </div>
                <h1 className='font-semibold text-lg'>{user.email}</h1>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="right bg-red-50 flex-grow h-full flex">
        <div className="explorer h-full max-w-64 min-w-52 bg-slate-200">
          <div className="file-tree w-full">
            {Object.keys(fileTree).map((file, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentFile(file)
                  setOpenFiles([...new Set([...openFiles, file])])
                }}
                className={`tree-element cursor-pointer p-2 px-4 flex items-center gap-2 w-full ${currentFile === file ? 'bg-slate-400' : 'bg-slate-300'}`}
              >
                <p className='font-semibold text-lg'>{file}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="code-editor flex flex-col flex-grow h-full shrink">
          <div className="top flex justify-between w-full">
            <div className="files flex">
              {openFiles.map((file, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFile(file)}
                  className={`open-file cursor-pointer p-2 px-4 flex items-center w-fit gap-2 ${currentFile === file ? 'bg-slate-400' : 'bg-slate-300'}`}
                >
                  <p className='font-semibold text-lg'>{file}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      const newOpenFiles = openFiles.filter(f => f !== file)
                      setOpenFiles(newOpenFiles)
                      if (currentFile === file && newOpenFiles.length > 0) {
                        setCurrentFile(newOpenFiles[0])
                      } else if (currentFile === file) {
                        setCurrentFile(null)
                      }
                    }}
                    className='ml-2 hover:bg-slate-500 px-1 rounded'
                  >
                    ×
                  </button>
                </button>
              ))}
            </div>

            <div className="actions flex gap-2">
              <button
                onClick={async () => {
                  if (!webContainer || Object.keys(fileTree).length === 0) {
                    console.log('WebContainer not ready or no files')
                    return
                  }

                  try {
                    await webContainer.mount(fileTree)

                    const installProcess = await webContainer.spawn("npm", ["install"])
                    installProcess.output.pipeTo(new WritableStream({
                      write(chunk) { console.log(chunk) }
                    }))

                    if (runProcess) {
                      runProcess.kill()
                    }

                    let tempRunProcess = await webContainer.spawn("npm", ["start"])
                    tempRunProcess.output.pipeTo(new WritableStream({
                      write(chunk) { console.log(chunk) }
                    }))
                    setrunProcess(tempRunProcess)

                    webContainer.on('server-ready', (port, url) => {
                      console.log(port, url)
                      setIframeUrl(url)
                    })
                  } catch (error) {
                    console.error('Error running project:', error)
                  }
                }}
                className='p-2 px-4 bg-slate-600 text-white rounded hover:bg-slate-700'
              >
                Run
              </button>
            </div>
          </div>

          <div className="bottom flex flex-grow max-w-full shrink overflow-auto">
            {currentFile && getFileContent(currentFile) ? (
              <div className="code-editor-area h-full overflow-auto flex-grow bg-slate-50">
                <pre className="hljs h-full">
                  <code
                    className="hljs h-full outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const updatedContent = e.target.innerText
                      const ft = {
                        ...fileTree,
                        [currentFile]: {
                          file: {
                            contents: updatedContent
                          }
                        }
                      }
                      setFileTree(ft)
                      saveFileTree(ft)
                    }}
                    dangerouslySetInnerHTML={{
                      __html: hljs.highlight(getFileContent(currentFile), { language: 'javascript' }).value
                    }}
                    style={{
                      whiteSpace: 'pre-wrap',
                      paddingBottom: '25rem',
                      counterSet: 'line-numbering',
                    }}
                  />
                </pre>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full w-full bg-slate-100">
                <p className="text-slate-500">
                  {currentFile ? 'File content not available' : 'Select a file to view'}
                </p>
              </div>
            )}
          </div>
        </div>

        {iframeUrl && webContainer && (
          <div className="flex min-w-96 flex-col h-full">
            <div className='address-bar'>
              <input type="text" onChange={(e) => setIframeUrl(e.target.value)} value={iframeUrl} className='w-full p-2 px-4 bg-slate-200'></input>
            </div>
            <iframe src={iframeUrl} className="w-full h-full" title="WebContainer Preview"></iframe>
          </div>)}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-md w-96 max-w-full relative">
            <header className='flex justify-between items-center mb-4'>
              <h2 className='text-xl font-semibold'>Select User</h2>
              <button onClick={() => setIsModalOpen(false)} className='p-2'>
                <i className="ri-close-fill"></i>
              </button>
            </header>
            <div className="users-list flex flex-col gap-2 mb-16 max-h-96 overflow-auto">
              {users.map(user => (
                <div
                  key={user._id}
                  className={`user cursor-pointer hover:bg-slate-200 ${selectedUserId.has(user._id) ? 'bg-slate-200' : ''} p-2 flex gap-2 items-center`}
                  onClick={() => handleUserClick(user._id)}
                >
                  <div className='aspect-square relative rounded-full w-fit h-fit flex items-center justify-center p-5 text-white bg-slate-600'>
                    <i className="ri-user-fill absolute"></i>
                  </div>
                  <h1 className='font-semibold text-lg'>{user.email}</h1>
                </div>
              ))}
            </div>
            <button
              onClick={() => addCollaborators()}
              className='absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-blue-600 text-white rounded-md'>
              Add Collaborators
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default Project