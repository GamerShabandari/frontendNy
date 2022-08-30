import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { socket } from "./Home";


export function Chat() {

    let { room, user } = useParams();
    // const [myRoomArray, setMyRoomArray] = useState([]);
    const [facit, setFacit] = useState([]);
    const [message, setMessage] = useState("");
    const [chatArray, setChatArray] = useState([]);

    useEffect(() => {
        socket.connect();
        if (facit.length === 0) {
            socket.emit("getMyRoom", room);
        }
    }, []);

    

    socket.on("hereIsYourRoom", function (room) {
        setFacit([...room.facit])
    });

    function sendMessage() {
        socket.emit("chatt", room, user, message);
    }

    socket.on("chatting", function (array) {

        setChatArray([...array])
        console.log("chatarray", chatArray);
    });

    let chatList = chatArray.map((message, i) => {
        return (
            <li key={i}>
                {message.nickname}: {message.text}
            </li>
        )
    })


    return (
        <>
            welcome {user} to room {room}

            <h3>Här är facit längd: {facit.length}</h3>

            <input type="text" placeholder="chat" onChange={(e) => { setMessage(e.target.value) }} value={message} />
            <button onClick={sendMessage}>send</button>

            <ul>
                {chatList}
            </ul>
        </>
    )
}