import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import axios from "axios";
import Navbar from "./Navbar.jsx";
import { v4 as uuidV4 } from "uuid";

const Home = () => {
    const { user } = useContext(AuthContext);
    const [snippets, setSnippets] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const [deleteModal, setDeleteModal] = useState(null);

    const navigate = useNavigate();

    const handleClick = () => {
        const id = uuidV4();
        navigate(`/editor/${id}`);
    };

    useEffect(() => {
        const getAllSnippets = async () => {
            const snippets = await axios.get(
                `http://localhost:3000/api/snippet/user/${user._id}`
            );
            setSnippets(snippets.data);
        };
        getAllSnippets();
    }, []);

    const toggleDropdown = (id) => {
        setDropdownOpen((prev) => (prev === id ? null : id)); // Toggle dropdown for the given snippet
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(
                `http://localhost:3000/api/snippet/${id}`
            );
            setSnippets(
                snippets.filter(
                    (snippet) =>
                        snippet._id !==
                        id
                )
            );
            setDeleteModal(null)
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="text-white relative">
            <Navbar handleClick={handleClick} />

            <div className="flex justify-end py-4">
                <div
                    onClick={handleClick}
                    className="px-3 py-2 bg-orange-500 rounded-md cursor-pointer mr-[5%]"
                >
                    <i className="ri-add-fill"></i>
                    <button className="justify-end">New</button>
                </div>
            </div>

            {user ? (
                snippets.map((s) => (
                    <div
                        key={s._id}
                        className="bg-blue-300/50 backdrop-blur-sm block mx-[5%] px-5 py-3 rounded-lg border-2 border-blue-600 flex items-end gap-x-3 justify-between mb-5 relative"
                    >
                        <Link
                            to={`/editor/${s.codeId}`}
                            className="flex items-end gap-x-3"
                        >
                            <h3 className="font-semibold">{s.name}</h3>
                            <small className="text-zinc-300">
                                {s.language}
                            </small>
                        </Link>
                        <button
                            className="ri-more-2-fill"
                            onClick={() => toggleDropdown(s._id)}
                        ></button>

                        {dropdownOpen === s._id && (
                            <div className="absolute right-[3%] bg-gray-700 p-1 rounded-md">
                                <ul>
                                    <Link
                                        className="hover:bg-gray-800 cursor-pointer px-3 py-2 rounded-md block"
                                        to={`/editor/${s.codeId}`}
                                    >
                                        Edit
                                    </Link>
                                    <li
                                        className="hover:bg-gray-800 cursor-pointer px-3 py-2 rounded-md"
                                        onClick={() => setDeleteModal(s._id)}
                                    >
                                        Delete
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                ))
            ) : (
                <h2>Log in to see your works</h2>
            )}

            {deleteModal && (
                <div className="absolute top-[50%] right-[40%] bg-gray-800 p-10 rounded-lg ">
                    <h2 className="text-xl font-bold ">
                        Are you sure to delete the code?{" "}
                    </h2>
                    <div className="flex justify-end gap-x-5 mt-5">
                        <button
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
                            onClick={() => setDeleteModal(null)}
                        >
                            Cancel
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
                            onClick={() => handleDelete(deleteModal)}
                        >
                            Confirm
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;
