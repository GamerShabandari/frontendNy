import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"
export const socket = io('http://localhost:3001', { "autoConnect": false })

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
                <h4>{room.roomName}</h4>
                <p> {room.users.length}/8</p>
                {room.roomIsFull && <h4>Room is full</h4>}
                {!room.roomIsFull && <button onClick={() => { join(room.roomName) }}>Join</button>}
            </div>
        )
    })

    let drawingsHTML = availableDrawings.map((drawing, i) => {
        return (
            <div className="room-list" key={i}>
                <h4>Room name: {drawing.name} - </h4>
                <p>time taken: {drawing.timeTaken} - result: {drawing.result}%</p>
                <button onClick={() => { showDrawing(i) }}>View Image</button>
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
        <header>
            <h1>Welcome {username}</h1>
        </header>

        <aside>
            <input type="text" placeholder="nickname" onChange={(e) => { setUsername(e.target.value) }} />
            <input type="text" placeholder="room" onChange={(e) => { setRoomToJoin(e.target.value) }} />
            <button disabled={username.length < 1 || roomToJoin.length < 1} onClick={() => { join(roomToJoin) }}>create room</button>
            {showError && <div>You must first chose a nickname to join a room</div>}
            {userTakenError && <div>Nickname allready taken in this room, pick another nickname</div>}
        </aside>


        <div>
            <h2>{availableRooms.length} active rooms</h2>

            <h3>Rooms to join:</h3> {roomsHTML}
            <h3>Drawings:</h3> {drawingsHTML}


                <div id="drawingPreviewGrid">
                    {renderDrawing}
                </div>
            

        </div>



    </>)

}