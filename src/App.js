import { useState,useEffect } from 'react';
import { io } from 'socket.io-client';
import './App.css';
let socket;
socket = io('http://localhost:3001')

function Card(props) {
  return(
  <div className="card">
    <div className="card-body">
      {props.message}
    </div>
  </div>
  )
} 

function App() {
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState([])
  const [number, setNumber] = useState(0)
  const [firstRender, setFirstRender] = useState(true)
  const [room, setRoom] = useState("room1")

  const joinRoom = (toRoom) => {
    setRoom(toRoom);
    socket.emit('join-room', toRoom)
  }
  
  const post = () =>{
    setMessages(old =>[...old,input])
    setNumber(number+1)
  }
  const changeInput = (event) =>{
    setInput(event.target.value)
  }
  //does nothing on first render sends message otherwise.
  useEffect(()=>{
    if(firstRender){
      setFirstRender(false)
      return
    }
    socket.emit('send-message',messages, room);
    
    fetch(`http://localhost:3001/room/${room}`,{
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        message: input
      })
    })
  },[number])

  //when room changes- load room messages
  useEffect(()=>{
    fetch(`http://localhost:3001/messages/${room}`,{
      method: 'get',
      headers: {'Content-Type': 'application/json'}
    }).then( response => response.json()).then(a => {
      const mapMessages = a.map(x => x.messages)
      setMessages(mapMessages)
    })    
  },[room])
  //creates socket connections
  useEffect(() =>{
    socket.on('connect',() => {
    })
    socket.on('send-message',(message) =>{
      setMessages(message)
    })  
  },[])

  const cardMessages = () =>{
    const list = messages.map(message =>{
      return <Card message={message} />
    })
    return list
  }


  return (
    <div className="container">
      <p onClick={() => joinRoom("room1")} style={{padding: "20px"}}>ROOM 1</p>
      <p onClick={() => joinRoom("room2")} style={{padding: "20px"}}>ROOM 2</p>
      <p onClick={() => joinRoom("room3")} style={{padding: "20px"}}>ROOM 3</p>
      <div className="messageContainer" style={{overflowY: "scroll"}}>
        {cardMessages()}
      </div>
      
      <input onChange={changeInput} type="text" />
      <button onClick={post} value="Send">Send</button>
    </div>
  );
}

export default App;



