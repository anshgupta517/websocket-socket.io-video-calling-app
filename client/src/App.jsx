import { Routes, Route } from "react-router-dom";
import Homepage from "./pages/home";
import Room from "./pages/room";
import "./App.css";
import { SocketProvider } from "./providers/socket";
import { PeerProvider } from "./providers/peer";

function App() {
  return (
    <SocketProvider>
      <PeerProvider>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </PeerProvider>
    </SocketProvider>
  );
}

export default App;
