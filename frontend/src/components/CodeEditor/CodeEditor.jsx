import React, { useContext, useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import toast, { Toaster } from "react-hot-toast";

import LanguageSelector from "../LanguageSelector.jsx";
import Share from "../Share";
import { executeCode } from "../../utils/execute";
import { LANGUAGE_BOILERPLATES, LANGUAGE_VERSIONS } from "../../utils/language";
import { initSocket } from "../../config/socket";
import { ACTIONS } from "../../Actions";
import { useLocation } from "react-router-dom";
import {
    AuthContext,
    AuthContextProvider,
} from "../../context/AuthContext.jsx";
import axios from "axios";
import Navbar from "../Navbar.jsx";

const CodeEditor = () => {
    const [value, setValue] = useState(
        localStorage.getItem("savedCode") || LANGUAGE_BOILERPLATES["javascript"]
    );
    const { user } = useContext(AuthContext);
    const { pathname } = useLocation();
    const codeId = pathname.split("/")[2];
    const [programName, setProgramName] = useState(codeId);

    const [output, setOutput] = useState("");
    const [userInput, setUserInput] = useState(
        localStorage.getItem("userInput") || ""
    );
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [language, setLanguage] = useState(
        localStorage.getItem("selectedLanguage") || "javascript"
    );

    const editorRef = useRef(null);
    const socketRef = useRef(null);

    const [roomId, setRoomId] = useState("");
    const [username, setUsername] = useState("");
    const [clients, setClients] = useState([]);

    useEffect(() => {
        const getSnippet = async () => {
            try {
                const res = await axios.get(
                    `http://localhost:3000/api/snippet/${codeId}`
                );
                setValue(res.data.sourceCode);
                setLanguage(res.data.language);
                setProgramName(res.data.name);
            } catch (error) {
                setValue(LANGUAGE_BOILERPLATES[language]);
            }
        };
        getSnippet();
    }, []);

    // Save code to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("savedCode", value);
    }, [value]);

    // Save language to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem("selectedLanguage", language);
    }, [language]);

    // Save user input to localStorage
    useEffect(() => {
        localStorage.setItem("userInput", userInput);
    }, [userInput]);

    const onMount = (editor) => {
        editorRef.current = editor;
        editor.focus();
    };
    const run = async () => {
        setIsLoading(true);
        try {
            try {
                if (user) {
                    await axios.post("http://localhost:3000/api/snippet", {
                        codeId,
                        name: programName,
                        language,
                        sourceCode: editorRef.current.getValue(),
                        version: LANGUAGE_VERSIONS[language],
                        input: userInput,
                        output,
                        userId: user._id,
                    });
                }
            } catch (e) {
                console.error(e);
                toast.error(
                    e.response?.data?.message || "Couldn't save changes"
                );
            }
            const res = await executeCode(
                language,
                editorRef.current.getValue(),
                userInput
            );
            setOutput(res.run.output);
        } catch (err) {
            console.error(err);
            setOutput("An error occurred while running the code.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCodeChange = (newValue) => {
        setValue(newValue);

        // Emit code change to other clients in the room
        if (socketRef.current && roomId) {
            socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                roomId,
                code: newValue,
                username,
            });
        }
    };

    const onSelect = (selectedLanguage) => {
        setLanguage(selectedLanguage);

        // Set default boilerplate for the selected language
        setValue(
            LANGUAGE_BOILERPLATES[selectedLanguage] || "// Write your code here"
        );

        // Emit language change to other clients in the room
        if (socketRef.current && roomId) {
            socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
                roomId,
                language: selectedLanguage,
                username: user.username,
            });
        }
    };

    useEffect(() => {
        if (user) {
            // Set initial username and room details
            setUsername(user.username);
        }
    }, [user]);

    const initSocketConnection = async () => {
        if (!user) return toast.error("Login to share code");
        socketRef.current = await initSocket();

        // Error handling
        socketRef.current.on("connect_error", (err) => handleSocketError(err));
        socketRef.current.on("connect_failed", (err) => handleSocketError(err));

        // Join room
        if (roomId && user.username) {
            setUsername(user.username);
            socketRef.current.emit(ACTIONS.JOIN, { roomId, username });
        }

        // Listen for code changes from other clients
        socketRef.current.on(
            ACTIONS.CODE_CHANGE,
            ({ code, username: sender }) => {
                if (sender !== username) {
                    setValue(code);
                }
            }
        );

        // Listen for language changes from other clients
        socketRef.current.on(
            ACTIONS.LANGUAGE_CHANGE,
            ({ language: newLanguage, username: sender }) => {
                if (sender !== username) {
                    setLanguage(newLanguage);
                    setValue(
                        LANGUAGE_BOILERPLATES[newLanguage] ||
                            "// Write your code here"
                    );
                }
            }
        );

        // Listen for joined clients
        socketRef.current.on(
            ACTIONS.JOINED,
            ({ clients, username: joinedUser }) => {
                if (joinedUser !== username) {
                    toast.success(`${joinedUser} joined the room`);
                }

                // Use Set to ensure unique clients
                const uniqueClients = Array.from(
                    new Set(clients.map((client) => client.username))
                ).map((username) =>
                    clients.find((client) => client.username === username)
                );

                setClients(uniqueClients);
            }
        );

        // Listen for disconnected clients
        socketRef.current.on(
            ACTIONS.DISCONNECTED,
            ({ username: disconnectedUser }) => {
                toast.success(`${disconnectedUser} left the room`);
                setClients((prev) =>
                    prev.filter(
                        (client) => client.username !== disconnectedUser
                    )
                );
            }
        );
    };

    const handleSocketError = (err) => {
        console.error("Socket connection error:", err);
        toast.error("Socket connection failed. Try again later.");
        navigate("/");
    };

    return (
        <div>
            <Toaster position="top-right" />
            <Navbar />
            <div>
                <div>
                    <div className="flex items-center justify-between mb-2 px-3 ">
                        <div>
                            <label
                                htmlFor="languages"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            > 
                                Program name
                            </label>
                            <input
                                type="text"
                                placeholder="Project Name"
                                style={{
                                    padding: "10px",
                                    border: "1px solid #ccc",
                                    borderRadius: "4px",
                                }}
                                value={programName}
                                onChange={(e) => setProgramName(e.target.value)}
                            />
                        </div>

                        <button
                            style={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                padding: "0.5rem 1rem",
                                fontSize: "16px",
                                margin: "10px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#45a049")
                            }
                            onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#4CAF50")
                            }
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen ? "Close Share" : "Share"}
                        </button>
                    </div>
                    <div className="flex justify-between items-end w-[70%] mb-2">
                        <LanguageSelector
                            onSelect={onSelect}
                            selectedLanguage={language}
                        />

                        <button
                            style={{
                                backgroundColor: "#4CAF50",
                                color: "white",
                                padding: "0.5rem 1rem",
                                fontSize: "16px",
                                margin: "10px",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer",
                                boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                                transition: "background-color 0.2s ease",
                            }}
                            onMouseEnter={(e) =>
                                (e.target.style.backgroundColor = "#45a049")
                            }
                            onMouseLeave={(e) =>
                                (e.target.style.backgroundColor = "#4CAF50")
                            }
                            onClick={run}
                            disabled={isLoading}
                        >
                            {isLoading ? "Running..." : "Run"}
                        </button>
                    </div>
                </div>
                <div style={{ display: "flex", width: "100%" }}>
                    <div style={{ width: "70%", marginRight: "10px" }}>
                        <Editor
                            height="75vh"
                            theme="vs-dark"
                            language={language}
                            value={value}
                            onChange={handleCodeChange}
                            onMount={onMount}
                            options={{
                                minimap: { enabled: false },
                            }}
                        />
                    </div>
                    <div style={{ width: "30%" }}>
                        <textarea
                            placeholder="Give your inputs here..."
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            style={{
                                width: "100%",
                                height: "30vh",
                                marginBottom: "10px",
                                backgroundColor: "#383838",
                                color: "white",
                                outline: "none",
                            }}
                        />
                        <textarea
                            readOnly
                            value={output}
                            placeholder="Output"
                            style={{
                                width: "100%",
                                height: "43vh",
                                backgroundColor: "#383838",
                                outline: "none",
                                color: "white",
                            }}
                        />
                    </div>
                </div>
                {isOpen && (
                    <Share
                        roomId={roomId}
                        setRoomId={setRoomId}
                        username={username}
                        setUsername={setUsername}
                        init={initSocketConnection}
                    />
                )}
                {clients.length > 0 && (
                    <div
                        style={{
                            width: "300px",
                            padding: "10px",
                            borderRadius: "5px",
                            backgroundColor: "#f0f0f0",
                        }}
                    >
                        <h3
                            style={{
                                color: "#4CAF50",
                                fontSize: "20px",
                                marginBottom: "10px",
                            }}
                        >
                            Connected Clients:
                        </h3>
                        {clients.map((client) => (
                            <div
                                key={client.socketId}
                                style={{
                                    backgroundColor: "#f0f0f0",
                                    padding: "10px",
                                    margin: "5px 0",
                                    borderRadius: "5px",
                                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                                    textAlign: "center",
                                    fontWeight: "bold",
                                    color: "#333",
                                }}
                            >
                                {client.username}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CodeEditor;
