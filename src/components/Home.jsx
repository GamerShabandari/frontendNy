import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"
export const socket = io('http://localhost:3001', { "autoConnect": false })
//export const socket = io.connect('http://localhost:3001');


export function Home() {

    const [username, setUsername] = useState("");
    const [roomToJoin, setRoomToJoin] = useState("");
    const [availableRooms, setAvailableRooms] = useState([]);
   // const [toggleChat, setToggleChat] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        socket.connect();

    }, []);

    socket.on("availableRooms", function (rooms) {
        setAvailableRooms([...rooms])
        console.log(rooms)
    });

    function join(room) {
        let user = {
            nickname: username
        }
        socket.emit("join", room, user);

        navigate(`/${room}/${username}`);
    }

    // function joinAvailableRoom(roomName) {
    //     let user = {
    //         nickname: username
    //     }
    //     socket.emit("joinAvailableRoom", roomName, user);

    //     navigate(`/${roomName}/${username}`);
    // }

    let roomsHTML = availableRooms.map((room, i) => {
        return (
            <div key={i}>
                <h3 onClick={() => {join(room.roomName)}}>{room.roomName}</h3>

            </div>
        )
    })

    return (<>
        <h1>hej och välkommen {username}</h1>
        <input type="text" placeholder="nickname" onChange={(e) => { setUsername(e.target.value) }} />
        <input type="text" placeholder="room" onChange={(e) => { setRoomToJoin(e.target.value) }} />
        <button onClick={()=>{join(roomToJoin)}}>join</button>

        <div>{username} - {roomToJoin}</div>
        {availableRooms.length}
        {roomsHTML}

    </>)

}