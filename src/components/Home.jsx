import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Player, Controls } from '@lottiefiles/react-lottie-player';
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
            <motion.div className="room-list" key={i}
                initial={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ease: "easeInOut", duration: 0.5, delay: i * 0.4 }}
            >
                <h4>{room.roomName}</h4>
                <p> {room.users.length}/8</p>
                {room.roomIsFull && <h4>Room is full</h4>}
                {!room.roomIsFull && <button onClick={() => { join(room.roomName) }}>Join</button>}
            </motion.div>
        )
    })

    let drawingsHTML = availableDrawings.map((drawing, i) => {
        return (
            <motion.div className="room-list" key={i}

                initial={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ease: "easeInOut", duration: 0.5, delay: i * 0.4 }}
            >
                <h4>Room name: {drawing.name} - </h4>
                <p>time taken: {drawing.timeTaken} - result: {drawing.result}%</p>
                <button onClick={() => { showDrawing(i) }}>View Image</button>
            </motion.div>
        )
    })

    let renderDrawing = chosenDrawing.map((pixel) => {
        return (
            <div
                key={pixel.position}
                id={pixel.position}
                className="pixelFacit animate__animated animate__bounce"
                style={{ backgroundColor: pixel.color }}
            ></div>
        );
    });

    return (<>
        <header className="header">
            <h1 className="animate__animated animate__bounce">Welcome {username}</h1>
            <Player
                            autoplay
                            loop
                            src="https://assets6.lottiefiles.com/packages/lf20_1pxqjqps.json"
                            style={{ height: '200px', width: '200px' }}
                        >
                            <Controls visible={false} />
                        </Player>
        </header>

        <aside className="animate__animated animate__fadeInDown">
            <input type="text" placeholder="nickname" onChange={(e) => { setUsername(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)) }} />
            <input type="text" placeholder="room" onChange={(e) => { setRoomToJoin(e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)) }} />
            <button disabled={username.length < 1 || roomToJoin.length < 1} onClick={() => { join(roomToJoin) }}>create room</button>
            {showError && <div>You must first chose a nickname to join a room</div>}
            {userTakenError && <div>Nickname allready taken in this room, pick another nickname</div>}
        </aside>


        <div>

            <div>

                <h3 className="title animate__animated animate__fadeInDown">Rooms to join:</h3> {roomsHTML}

            </div>

            <div>
                <h3 className="title animate__animated animate__fadeInDown">Drawings:</h3> {drawingsHTML}


                <div id="drawingPreviewGrid">
                    {renderDrawing}
                </div>

            </div>



        </div>



    </>)

}