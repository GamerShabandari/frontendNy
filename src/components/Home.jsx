import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client"
export const socket = io('http://localhost:3001', { "autoConnect": false })


export function Home() {

    const [username, setUsername] = useState("");
    const [roomToJoin, setRoomToJoin] = useState("");
    const [availableRooms, setAvailableRooms] = useState([]);
    const [availableDrawings, setAvailableDrawings] = useState([]);
    const [chosenDrawing, setChosenDrawing] = useState([]);
    const [showError, setShowError] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        socket.connect();

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
        return (
            <div key={i}>
                <h3 onClick={() => { join(room.roomName) }}>{room.roomName}</h3>

            </div>
        )
    })

    let drawingsHTML = availableDrawings.map((drawing, i) => {
        return (
            <div key={i}>
                <h3 onClick={() => { showDrawing(i) }}>name: {drawing.name} - time taken: {drawing.timeTaken} - result: {drawing.result}%</h3>
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