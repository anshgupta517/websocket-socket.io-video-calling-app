import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../providers/socket";

const Homepage = () => {
  const socket = useSocket();
  const navigate = useNavigate();

  const [emailId, setEmailId] = useState("");
  const [roomId, setRoomId] = useState("");

  const handleJoinRoom = () => {
    socket.emit("join-room", { emailId, roomId });
  };

  const handleJoinedRoom = ({ roomId }) => {
    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    socket.on("user:join", handleJoinedRoom);

    return () => {
      socket.off("joined-room", handleJoinedRoom);
    };
  }, [socket, navigate, roomId]);

  return (
    <div className="homepage-container">
      <div className="input-container">
        <input
          value={emailId}
          onChange={(e) => setEmailId(e.target.value)}
          type="email"
          placeholder="Enter your email here"
        />
        <input
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          type="text"
          placeholder="Enter room code"
        />
        <button onClick={handleJoinRoom}>submit</button>
      </div>
    </div>
  );
};

export default Homepage;
