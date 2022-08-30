import React, { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import { io } from "socket.io-client";
import Facit from "./../assets/facit.json";

const socket = io("http://localhost:3001", { autoConnect: false });

export function Chat() {

    const [fields, setFields] = useState([]);
    const [colors, setColors] = useState([]);
    const [myColor, setMyColor] = useState("white");

    let testFacit = [];

    const { roomName } = useParams();

    useEffect(() => {
        socket.connect();
    }, []);

    socket.on("updateColors", function (msg) {
        setColors(msg);
    });

    socket.on("colors", function (msg) {
        setColors(msg);
    });

    socket.on("history", function (msg) {
        setFields(msg);
    });

    socket.on("drawing", function (msg) {
        let newArray = fields;
        for (let i = 0; i < fields.length; i++) {
            const pixel = fields[i];
            if (pixel.position === msg.position) {
                newArray[i].color = msg.color;
                setFields([...newArray]);
                return;
            }
        }
    });

    const paint = (field, e) => {
        fields.find((f) => {
            if (f.position === field.position) {
                if (field.color !== "white") {
                    field.color = "white";
                    socket.emit("drawing", field);
                    return;
                }
                field.color = myColor;
                socket.emit("drawing", field);
            }
        });
    };

    function pickColor(color) {

        socket.emit("color", color);

        if (myColor !== "white") {
            socket.emit("colorChange", myColor);
        }

        setMyColor(color);
    }

    function printFacit() {
        testFacit = fields;
        console.log(testFacit);
    }

    function compareToFacit() {
        let count = [0, 0];
        for (let i in Facit) {
            count[1]++; // total count
            if (fields[i].color === Facit[i].color) {
                if (fields[i].color === "white" && Facit[i].color === "white") {
                    count[1]--;
                } else {
                    count[0]++;
                } // match count
            }
        }
        let percentage = (count[0] / count[1]) * 100 + "%";
        console.log("percentage: " + percentage);
        console.log("count 0)" + count[0]);
        console.log("count1)" + count[1]);
        alert("percentage: " + percentage);
    }

    let renderGrid = fields.map((field) => {
        return (
            <div
                key={field.position}
                id={field.position}
                className="pixel"
                onMouseEnter={(e) => {
                    if (e.currentTarget.style.backgroundColor !== "white") {
                        e.currentTarget.style.backgroundColor = "white";
                    } else {
                        e.currentTarget.style.backgroundColor = myColor;
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = field.color;
                }}
                onClick={(e) => paint(field, e)}
                style={{ backgroundColor: field.color }}
            ></div>
        );
    });

    let colorsToPickFrom = colors.map((color) => {
        return (
            <div
                key={color.color}
                onClick={() => {
                    pickColor(color.color);
                }}
            >
                {color.color}
            </div>
        );
    });

    let renderFacit = Facit.map((pixel) => {
        return (
            <div
                key={pixel.position}
                id={pixel.position}
                className="pixelFacit"
                style={{ backgroundColor: pixel.color }}
            ></div>
        );
    });


    return (
        <>
            {/* {colors.length >= 0 && <> */}
            <h1>{roomName}</h1>

            <button onClick={printFacit}>se facit du ritat</button>

            <h1>{colors.length}</h1>
            <h1>{myColor}</h1>
            <div id="grid">
                {renderGrid}
                <div>{colorsToPickFrom}</div>
            </div>

            <button onClick={compareToFacit}>rätta bilden</button>

            <div id="facitGrid">{renderFacit}</div>

            {/* </>
} */}

            {/* {colors.length == 0 && <div>rummet är tyvörr fullt, prova ett annat rum</div>} */}

        </>
    )
}