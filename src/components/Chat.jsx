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


    useEffect(() => {
        socket.connect();

        setFieldsArray([...fieldsJSON])
        setColorsArray([...colorsJSON])

        socket.emit("getMyRoom", room);
        // console.log("begärde rum info");

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
            console.log("du fick färger från: " + roomToMatch.roomName);
            setFacit([...roomToMatch.facit])
            //  setColorsArray([...roomToMatch.colors])
            setUsersInRoom([...roomToMatch.users])
            // setFieldsArray([...roomToMatch.fields])
        });

        socket.on("history", function (roomWithHistory) {
            setFieldsArray([...roomWithHistory.fields])
            setColorsArray([...roomWithHistory.colors])
        });

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

    }, []);

    function sendMessage() {
        socket.emit("chatt", room, user, message);
    }


    function pickColor(colorPicked) {
        setMyColor(colorPicked);

        socket.emit("colorPicked", colorPicked, room);
        if (myColor !== "white") {
            socket.emit("colorChange", myColor, room);
        }


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

            <div id="grid">{renderGrid}</div>

            <div id="facitGrid">{renderFacit}</div>
        </>
    )
}