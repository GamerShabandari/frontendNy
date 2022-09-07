import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom"
import { socket } from "./Home";
import { useNavigate } from "react-router-dom";
import { Player, Controls } from '@lottiefiles/react-lottie-player';
import { motion } from "framer-motion";
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
        setMessage("")
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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    let renderGrid = fieldsArray.map((field, i) => {
        return (<motion.div key={field.position} id={field.position} className="pixel"
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = myColor }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = field.color }}
            onClick={(e) => paint(field, e)} style={{ backgroundColor: field.color }}

            initial={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ ease: "easeInOut", duration: 0.002, delay: i * 0.002 }}

        >
        </motion.div>)
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
            <motion.div className="colors" key={i} onClick={() => { pickColor(color.color) }} style={{ backgroundColor: color.color }}

                initial={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ease: "easeInOut", duration: 0.2, delay: i * 0.2 }}
            ></motion.div>
        );
    });

    let renderUsersInRoom = usersInRoom.map((user, i) => {
        return (<>
            <motion.li key={i}
                initial={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ease: "easeInOut", duration: 0.5, delay: i * 0.4 }}

            >
                <div>
                    <Player className="userIcon"
                        autoplay
                        keepLastFrame
                        src="https://assets2.lottiefiles.com/packages/lf20_fgp8rk11.json"
                        style={{ height: '20px', width: '20px' }}
                    >
                        <Controls visible={false} />
                    </Player>
                </div>


                {<span className="userNameInList">{user.nickname}</span>}
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
            </motion.li>


        </>

        );
    });

    let chatList = chatArray.map((message, i) => {
        return (
            <div key={i}>
                {message.nickname === user && <div className="chat-right"><p className="chat-nickname">{message.nickname}</p><p className="chat-text">{message.text}</p></div>}

                {message.nickname !== user && <div className="chat-left"><p className="chat-nickname">{message.nickname}</p><p className="chat-text">{message.text}</p></div>}
            </div>
        )
    })

    let renderDrawing = fieldsArray.map((pixel, i) => {
        return (
            <motion.div
                key={pixel.position}
                id={pixel.position}
                style={{ backgroundColor: pixel.color }}

                initial={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ ease: "easeInOut", duration: 0.001, delay: i * 0.001 }}
            ></motion.div>
        );
    });



    return (
        <>
            {roomIsFull && <div>
                <h3>Sorry room is full or finished, try another room or create a new one</h3>
                <button onClick={() => { navigate(`/`) }}>Back Home</button>
            </div>}

            {!roomIsFull && <>

                <header className="header">
                    {!gamerOver && <h2 className="animate__animated animate__fadeInDown">Welcome {user} to room {room}</h2>}
                    <button className="animate__animated animate__bounceIn  animate__delay-1s" onClick={leaveRoom}>Leave Room</button>
                </header>

                {!gamerOver && <div className="colorsContainer">
                    <div className="colorsArray">{renderColorpicker}</div>
                    <button className="animate__animated animate__bounceIn  animate__delay-1s" onClick={timeToCheckFacit}>Im Done!</button>
                </div>}


                {gamerOver && <>

                    <Player
                        autoplay
                        loop
                        src="https://assets4.lottiefiles.com/packages/lf20_clmd2mj6.json"
                        style={{ height: '200px', width: '200px' }}
                    >
                        <Controls visible={false} />
                    </Player>

                    <div className="GameOverContainer"><h1 className="GameOver  animate__animated animate__heartBeat">GAME OVER!</h1> <span className="results animate__animated  animate__heartBeat"> Your result was: {result}% - time taken: h:{timeH} m:{timeM} s:{timeS}</span></div>
                    {!saveDone && <button className="animate__animated animate__bounceIn  animate__delay-1s" onClick={saveDrawing}>Save this drawing</button>}
                </>}

                <main>


                    {!gamerOver &&
                        <>

                            <div className="usersContainer  animate__animated animate__flipInY">
                    
                                <Player
                                    autoplay
                                    loop
                                    src="https://assets5.lottiefiles.com/private_files/lf30_z588h1j0.json"
                                    style={{ height: '50px', width: '50px' }}
                                >
                                    <Controls visible={false} />
                                </Player>

                                <div id="chatContainer">
                                    {chatList}
                                    <div className="chatMessage">
                                        <input type="text" placeholder="chat" onChange={(e) => { setMessage(e.target.value) }} value={message} />
                                        <button disabled={message.length < 1} onClick={sendMessage}>send</button>
                                    </div>
                                    <div ref={messagesEndRef} />
                                </div>

                                <h4 className="title animate__animated animate__flipInY">Users in room:</h4>
                                <ul>{renderUsersInRoom}</ul>
                                
                            </div>
                        </>
                    }

                    {!gamerOver &&
                        <>
                            <div id="grid">{renderGrid}</div>

                            <div className="facit">
                                <div className="imgContainer animate__animated animate__flipInY" id="facitGrid">
                                    {renderFacit}
                                </div>
                                <h4 className="title  animate__animated animate__flipInY">Recreate this image. Time is ticking!
                                    <Player
                                        autoplay
                                        keepLastFrame
                                        src="https://assets8.lottiefiles.com/packages/lf20_pge4fjym.json"
                                        style={{ height: '60px', width: '60px' }}
                                    >
                                        <Controls visible={false} />
                                    </Player>

                                </h4>
                            </div>
                        </>
                    }
                    {
                        gamerOver &&
                        <div className="resultGrid">{renderDrawing}</div>
                    }

                </main>
            </>
            }
        </>
    )
}