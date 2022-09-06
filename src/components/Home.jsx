import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"
export const socket = io('https://grid-painter-back.herokuapp.com/:5000', { "autoConnect": false })

export function Home() {

    let { userParam } = useParams();
    const [username, setUsername] = useState("");
    const [roomToJoin, setRoomToJoin] = useState("");
    const [availableRooms, setAvailableRooms] = useState([]);
    const [availableDrawings, setAvailableDrawings] = useState([]);
    const [chosenDrawing, setChosenDrawing] = useState([]);
    const [showError, setShowError] = useState(false);
    const [userTakenError, setUserTakenError] = useState(false);

    const navigate = useNavigate();
    let userFromParam = userParam

    useEffect(() => {
        socket.connect();

        if (userParam) {
            setUsername(userFromParam);
        }

    }, []);

    socket.on("availableRooms", function (rooms) {
        setAvailableRooms([...rooms])

    });

    socket.on("savedDrawings", function (drawings) {
        setAvailableDrawings([...drawings])

    });

    function join(room) {

        if (username.length < 1) {
            setShowError(true);
            return
        }

        for (let i = 0; i < availableRooms.length; i++) {
            const room = availableRooms[i];

            for (let i = 0; i < room.users.length; i++) {
                const user = room.users[i];
                
                if (user.nickname === username) {
                    setUserTakenError(true)
                    return
                }
            }
            
        }
        setUserTakenError(false)
        let user = {
            nickname: username,
            isDone: false
        }
        socket.emit("join", room, user);

        navigate(`/${room}/${username}`);
    }

    function showDrawing(index) {
        setChosenDrawing([...availableDrawings[index].imageField])
    }


    let roomsHTML = availableRooms.map((room, i) => {
        console.log(room)
        return (
            <div className="room-list" key={i}>
                <h3>{room.roomName}</h3>
                <p> {room.users.length}/8</p>
                {room.roomIsFull && <h4>Room is full</h4> }
                {!room.roomIsFull && <button onClick={() => { join(room.roomName) }}>Join</button> }
            </div>
        )
    })

    let drawingsHTML = availableDrawings.map((drawing, i) => {
        return (
            <div className="room-list" key={i}>
                <h3>Room name: {drawing.name} - </h3>
                <p>time taken: {drawing.timeTaken} - result: {drawing.result}%</p>
                <button onClick={() => { showDrawing(i) }}>Image</button>
            </div>
        )
    })

    let renderDrawing = chosenDrawing.map((pixel) => {
        return (
            <div
                key={pixel.position}
                id={pixel.position}
                className="pixelFacit"
                style={{ backgroundColor: pixel.color }}
            ></div>
        );
    });

    return (<>
        <h1>Welcome {username}</h1>
        <input type="text" placeholder="nickname" onChange={(e) => { setUsername(e.target.value) }} />
        <input type="text" placeholder="room" onChange={(e) => { setRoomToJoin(e.target.value) }} />
        <button disabled={username.length < 1 || roomToJoin.length < 1} onClick={() => { join(roomToJoin) }}>create room</button>
        {showError && <div>You must first chose a nickname to join a room</div> }
        {userTakenError && <div>Nickname allready taken in this room, pick another nickname</div> }
        

        <br />
        <br />
        <div>{availableRooms.length} active rooms</div>
        <br />
        <div>Rooms to join: {roomsHTML}</div>
        <div>Drawings: {drawingsHTML}</div>

        <div>
            <div id="drawingPreviewGrid">
                {renderDrawing}
            </div>
        </div>

    </>)

}