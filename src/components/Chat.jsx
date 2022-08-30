import { useParams } from "react-router-dom"



export function Chat() {

    let { room } = useParams();
    return (
        <>
            hej från chatten rum {room}
        </>
    )
}