import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"
export const socket = io('http://localhost:3001', { "autoConnect": false })
//export const socket = io.connect('http://localhost:3001');


export function Home() {

    const [username, setUsername] = useState("");
    const [roomToJoin, setRoomToJoin] = useState("");
    const [availableRooms, setAvailableRooms] = useState([]);
    const [roomIsFull, setRoomIsFull] = useState(false);

    // const [toggleChat, setToggleChat] = useState(false)

    const navigate = useNavigate();

    useEffect(() => {
        socket.connect();

        socket.on("fullRoom", function (roomThatsFull, userWhoCantJoin) {
            if (userWhoCantJoin === username) {
                setRoomIsFull(true);
            }
            
        });

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

        if (!roomIsFull) {
            navigate(`/${room}/${username}`);
        }
        
    }

    let roomsHTML = availableRooms.map((room, i) => {
        return (
            <div key={i}>
                <h3 onClick={() => { join(room.roomName) }}>{room.roomName}</h3>

            </div>
        )
    })

    return (<>
        <h1>hej och välkommen {username}</h1>
        {roomIsFull && <div>
            <h3>Sorry room is full or finished, try another room or create a new one</h3>
        </div>}

        <input type="text" placeholder="nickname" onChange={(e) => { setUsername(e.target.value) }} />
        <input type="text" placeholder="room" onChange={(e) => { setRoomToJoin(e.target.value) }} />
        <button onClick={() => { join(roomToJoin) }}>join</button>

        <div>{username} - {roomToJoin}</div>
        {availableRooms.length}
        {roomsHTML}

    </>)

}