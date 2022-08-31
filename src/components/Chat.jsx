import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { socket } from "./Home";


export function Chat() {

    let { room, user } = useParams();
    const [facit, setFacit] = useState([]);
    const [message, setMessage] = useState("");
    const [chatArray, setChatArray] = useState([]);
    const [fieldsArray, setFieldsArray] = useState([]);
    const [colorsArray, setColorsArray] = useState([]);

    const myColor = "lightgreen";


    useEffect(() => {
        socket.connect();
        if (facit.length === 0) {
            socket.emit("getMyRoom", room);
        }

        socket.on("chatting", function (message) {

            let updatedChatArray = chatArray
            updatedChatArray = chatArray
            updatedChatArray.push(message)
            setChatArray([...updatedChatArray])
            console.log("chatarray", chatArray);
            updatedChatArray = []
            return
        });

        socket.on("hereIsYourRoom", function (room) {
            setFacit([...room.facit])
            setFieldsArray([...room.fields])
            setColorsArray([...room.colors])
        });

    }, []);

    function sendMessage() {
        socket.emit("chatt", room, user, message);
    }

    let chatList = chatArray.map((message, i) => {
        return (
            <li key={i}>
                {message.nickname}: {message.text}
            </li>
        )
    })

    const paint = (field, e) => {
        //socket.connect()
        
        fieldsArray.find(f => {
          if(f.position === field.position){
            field.color = myColor
            socket.emit("drawing", field, room)
            //console.log(fields);
          }
        }) 
      }

    let renderGrid = fieldsArray.map(field => {
        return(<div key={field.position} id={field.position} className="pixel" 
            onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = myColor}}
            onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = field.color}}
            onClick={(e) => paint(field, e)} style={{backgroundColor: field.color}}>
          </div>)
      })

      let renderFacit = facit.map((pixel) => {
        return (
          <div
            key={pixel.position}
            id={pixel.position}
            className="pixelFacit"
            style={{ backgroundColor: pixel.color }}
          ></div>
        );
      });


    return (
        <>
            welcome {user} to room {room}
            <br />

       

            <input type="text" placeholder="chat" onChange={(e) => { setMessage(e.target.value) }} value={message} />
            <button onClick={sendMessage}>send</button>

            <ul>
                {chatList}
            </ul>
        
            <div id="grid">{renderGrid}</div>

            <div id="facitGrid">{renderFacit}</div>
        </>
    )
}