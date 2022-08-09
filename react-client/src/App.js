import { useEffect, useRef, useState } from "react";
import "./App.css";

import { io } from "socket.io-client";

function App() {
  const socket = useRef();
  const [input, setInput] = useState(0);
  const [data, setData] = useState(0);

  
  

  useEffect(() => {
    socket.current = io("ws://localhost:9014");

    socket.current.on("connection", () => {
      console.log("connected to server");
    });

    socket.current.on("message", (message) => {
      console.log(`message from ${socket.current.id} : ${message}`);

      setInput(message);
    }
    );

    socket.current.on("data", (message) => {
 
      setData(message);

      console.log(data);
  

    }
    );


  },[data]);
  


  const handleClick = () => {
    socket.current.emit("data", input);
  };
   

  return (
    <div className="App">
       <h4>DEVICE : {input}</h4>

      <button type="button" onClick={handleClick}>
        GET FILE
      </button>
  
           {[data].map((item, index) => (
              
              <div key={index}>
                {Object.keys(item).map((key, index) => (
                  <h4 key={index}>{item[key]}</h4>
                ))}
              </div>

            ))}
       
         

    </div>
  );
}

export default App;
