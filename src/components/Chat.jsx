import { useEffect, useState } from "react";
import { useParams } from "react-router-dom"
import { socket } from "./Home";
const fieldsJSON = require("../assets/fields.json");
const colorsJSON = require("../assets/colors.json");


export function Chat() {

    let { room, user } = useParams();
    const [facit, setFacit] = useState([]);
    const [message, setMessage] = useState("");
    const [chatArray, setChatArray] = useState([]);
    const [fieldsArray, setFieldsArray] = useState([]);
    const [colorsArray, setColorsArray] = useState([]);
    const [usersInRoom, setUsersInRoom] = useState([]);
    const [myColor, setMyColor] = useState("white");
    const [gamerOver, setGamerOver] = useState(false);
    const [result, setResult] = useState("");


    useEffect(() => {
        socket.connect();

        setFieldsArray([...fieldsJSON])

        socket.emit("getMyRoom", room);

        socket.on("updateColors", function (updatedColors) {
            setColorsArray(updatedColors);
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

        socket.on("gameOver", function (resultInRoom) {
            //alert(result)
            setResult(resultInRoom)
            setGamerOver(true)

        });


    }, []);

    socket.on("drawing", function (pixelToUpdate) {
        console.log("här"); //// hamnar här massa gånger av någon anledning 
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
        socket.emit("timeToCheckFacit", room);
    }


    let chatList = chatArray.map((message, i) => {
        return (
            <li key={i}>
                {message.nickname}: {message.text}
            </li>
        )
    })

    const paint = (field, e) => {

        fieldsArray.find(f => {
            if (f.position === field.position) {
                field.color = myColor
                socket.emit("draw", field, room)
                console.log("ritade på ruta: " + field.position + " med färgen: " + field.color + " i rum: " + room);
            }
        })
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
            >välj färg</div>
        );
    });

    let renderUsersInRoom = usersInRoom.map((user, i) => {
        return (
            <div
                key={i}

                style={{ backgroundColor: "red", padding: "10px", color: "white" }}
            >{user.nickname}</div>
        );
    });



    return (
        <>
            welcome {user} to room {room}
            <br />
            <div>{renderColorpicker}</div>

            <div>{renderUsersInRoom}</div>

            <input type="text" placeholder="chat" onChange={(e) => { setMessage(e.target.value) }} value={message} />
            <button onClick={sendMessage}>send</button>

            <ul>
                {chatList}
            </ul>

            <div>
                <button onClick={timeToCheckFacit}>Rätta synkat i rum</button>
            </div>

            {gamerOver && <div><h1>GAME OVER! Your result was: {result}</h1></div>}

            {!gamerOver && <>
                <div id="grid">{renderGrid}</div>
            </>}



            <div id="facitGrid">{renderFacit}</div>
        </>
    )
}