import toast, { Toaster } from "react-hot-toast";
import { v4 as uuidV4 } from "uuid";

const Share = ({ roomId, setRoomId, username, setUsername, init }) => {
    // const [showShare, setShowShare] = useState(false);
    const handleClick = () => {
        setShowShare((prev) => !prev);
    };
    const createNewRoom = (e) => {
        e.preventDefault();
        const newRoomId = uuidV4();
        setRoomId(newRoomId);
        toast.success(`Created new room`);
    };

    const copyRoomId = () => {
        if (roomId) {
            navigator.clipboard
                .writeText(roomId)
                .then(() => {
                    toast.success("Room ID copied to clipboard!");
                })
                .catch((err) => {
                    console.error("Failed to copy Room ID", err);
                    toast.error("Failed to copy Room ID. Please try again.");
                });
        } else {
            toast.error("Room ID is empty!");
        }
    };

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    flexDirection: "column",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        fontSize: "3.5rem",
                        margin: "10px 0",
                        fontWeight: "bold",
                        color: "#4CAF50",
                    }}
                >
                    Collaborate
                </h1>
                <input
                    type="text"
                    style={{
                        width: "300px",
                        padding: "10px",
                        margin: "10px",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                    }}
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                />

                <button
                    onClick={init}
                    style={{
                        backgroundColor: "#4CAF50",
                        color: "white",
                        padding: "10px",
                        margin: "10px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                    }}
                >
                    Join Room
                </button>
                {roomId && (
                    <button onClick={copyRoomId} 
                    style={{ 
                        marginLeft: "10px",
                        backgroundColor: "#e1ae25",
                        padding: "2px 4px",
                        borderRadius: "5px",
                        fontWeight: "bold"
                     }}>
                        Copy Room ID
                    </button>
                )}
                <small
                    style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginLeft: "10px",
                        marginRight: "10px",
                        color: "brown",
                    }}
                >
                    Don’t have a room? Create{" "}
                    <span
                        onClick={createNewRoom}
                        style={{
                            color: "#007bff",
                            cursor: "pointer",
                            textDecoration: "underline",
                            fontWeight: "bold",
                            marginLeft: "5px",
                            marginRight: "5px",
                            display: "inline-block",
                            fontSize: "20px",
                        }}
                    >
                        a new room
                    </span>
                </small>
                
            </div>
        </>
    );
};

export default Share;
