import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom"
import { socket } from "./Home";
import { useNavigate } from "react-router-dom";
import { Player, Controls } from '@lottiefiles/react-lottie-player';
const fieldsJSON = require("../assets/fields.json");


export function Chat() {

    let { room, user } = useParams();
    const navigate = useNavigate();
    const [facit, setFacit] = useState([]);
    const [message, setMessage] = useState("");
    const [chatArray, setChatArray] = useState([]);
    const [fieldsArray, setFieldsArray] = useState([]);
    const [colorsArray, setColorsArray] = useState([]);
    const [usersInRoom, setUsersInRoom] = useState([]);
    const [myColor, setMyColor] = useState("white");
    const [gamerOver, setGamerOver] = useState(false);
    const [result, setResult] = useState("");
    const [timeM, setTimeM] = useState(0);
    const [timeS, setTimeS] = useState(0);
    const [timeH, setTimeH] = useState(0);
    const [saveDone, setDaveDone] = useState(false);
    const [roomIsFull, setRoomIsFull] = useState(false);

    const messagesEndRef = useRef(null)

    useEffect(() => {
        scrollToBottom()
    }, [chatArray]);


    useEffect(() => {
        socket.connect();

        setFieldsArray([...fieldsJSON])

        socket.emit("getMyRoom", room);

        socket.on("updateColors", function (updatedColors) {
            setColorsArray(updatedColors);
        });

        socket.on("drawingSaved", function () {
            setDaveDone(true);
        });

        socket.on("chatting", function (message) {

            let updatedChatArray = chatArray
            updatedChatArray = chatArray
            updatedChatArray.push(message)
            setChatArray([...updatedChatArray])
            console.log("chatarray", chatArray);
            updatedChatArray = []
            return
        });

        socket.on("hereIsYourRoom", function (roomToMatch) {

            setFacit([...roomToMatch.facit])
            setColorsArray([...roomToMatch.colors])
            setUsersInRoom([...roomToMatch.users])
        });

        socket.on("history", function (history) {
            setFieldsArray([...history])
        });

        socket.on("gameOver", function (resultInRoom, timeTaken) {
            setResult(resultInRoom)
            setTimeH(timeTaken.h)
            setTimeM(timeTaken.m)
            setTimeS(timeTaken.s)

            setGamerOver(true)
        });


        socket.on("fullRoom", function (roomThatsFull, userWhoCantJoin) {
            if (userWhoCantJoin === user && roomThatsFull === room) {
                setRoomIsFull(true);
            }

        });

        socket.on("waitingForEveryOne", function (allUsersStatus) {
            setUsersInRoom([...allUsersStatus])
            console.log(usersInRoom);
        });

        socket.on("usersUpdate", function (usersUpdatedList) {
            console.log("fdfsdfs");
            setUsersInRoom([...usersUpdatedList]);
        });

    }, []);

    socket.on("drawing", function (pixelToUpdate) {

        let newArray = fieldsArray;
        for (let i = 0; i < newArray.length; i++) {
            const pixel = newArray[i];
            if (pixel.position === pixelToUpdate.position) {
                newArray[i].color = pixelToUpdate.color;
                setFieldsArray([...newArray]);
                return;
            }
        }
    });

    function sendMessage() {
        socket.emit("chatt", room, user, message);
    }


    function pickColor(color) {
        socket.emit("color", color, room);
        if (myColor !== "white") {
            socket.emit("colorChange", myColor, room);
        }

        setMyColor(color);
    }

    function timeToCheckFacit() {
        socket.emit("timeToCheckFacit", room, user);
    }

    function saveDrawing() {
        console.log(fieldsArray);
        socket.emit("saveThisDrawing", fieldsArray, room, result, timeH, timeM, timeS);
    }

    function leaveRoom() {
        //  console.log(user + " vill lämna rum: " + room);
        navigate(`/${user}`);
        socket.disconnect();
    }


    function paint(field, e) {

        fieldsArray.find(f => {
            if (f.position === field.position) {
                if (field.color !== "white") {
                    field.color = "white";
                }
                else {
                    field.color = myColor;
                }
                socket.emit("draw", field, room)
            }
        })
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })
    }

    let renderGrid = fieldsArray.map(field => {
        return (<div key={field.position} id={field.position} className="pixel"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = myColor }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = field.color }}
            onClick={(e) => paint(field, e)} style={{ backgroundColor: field.color }}>
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

    let renderColorpicker = colorsArray.map((color, i) => {
        return (
            <div key={i} onClick={() => { pickColor(color.color) }} style={{ backgroundColor: color.color, padding: "10px", width: "30px", color: "white" }}
            >Pick Color</div>
        );
    });

    let renderUsersInRoom = usersInRoom.map((user, i) => {
        return (<>
            <div
                key={i}

                style={{ backgroundColor: "red", padding: "10px", color: "white" }}
            >{user.nickname}

                {user.isDone && <div>

                    <Player
                        autoplay
                        keepLastFrame
                        src="https://assets9.lottiefiles.com/private_files/lf30_z1sghrbu.json"
                        style={{ height: '50px', width: '50px' }}
                    >
                        <Controls visible={false} />
                    </Player>
                </div>}
            </div>


        </>

        );
    });

    let chatList = chatArray.map((message, i) => {
        return (
            <div key={i}>
                {message.nickname === user && <div style={{ color: "#533483", textAlign: "right" }}>{message.nickname}: {message.text}</div> }
                
                {message.nickname !== user && <div style={{ color: "#E94560", textAlign: "left" }}>{message.nickname}: {message.text}</div> }
            </div>
        )
    })



    return (
        <>

            {roomIsFull && <div>
                <h3>Sorry room is full or finished, try another room or create a new one</h3>
                <button onClick={() => { navigate(`/`) }}>Back Home</button>
            </div>}

            {!roomIsFull && <>

                welcome {user} to room {room}
                <button onClick={leaveRoom}>Leave Room</button>
                <br />
                <div>{renderColorpicker}</div>
                <div>{renderUsersInRoom}</div>

                <input type="text" placeholder="chat" onChange={(e) => { setMessage(e.target.value) }} value={message} />
                <button onClick={sendMessage}>send</button>

                <div id="chatContainer">
                    {chatList}
                    <div ref={messagesEndRef} />
                </div>

                {!gamerOver && <div>
                    <button onClick={timeToCheckFacit}>Im Done!</button>
                </div>}


                {gamerOver && <>
                    <div><h1>GAME OVER! Your result was: {result}% - time taken: h:{timeH} m:{timeM} s:{timeS}</h1></div>
                    {!saveDone && <button onClick={saveDrawing}>Save this drawing</button>}
                </>}

                {!gamerOver && <>
                    <div id="grid">{renderGrid}</div>
                </>}

                <div className="imgContainer" id="facitGrid">{renderFacit}</div>

            </>}

        </>
    )
}