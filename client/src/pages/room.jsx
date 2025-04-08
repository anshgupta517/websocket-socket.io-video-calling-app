import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactPlayer from "react-player";
import { useSocket } from "../providers/socket";
import { usePeer } from "../providers/peer";

const Room = () => {
  const socket = useSocket();
  const { peer, createOffer, createAnswer, setRemoteAnswer, resetPeer } =
    usePeer();

  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [remoteSocketId, setRemoteSocketId] = useState(null);

  const myVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  const cleanUp = useCallback(() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    if (peer) {
      peer.close();
      resetPeer();
    }
    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
  }, [myStream, peer, resetPeer]);

  useEffect(() => {
    socket.on("disconnect", cleanUp);
  });

  const handleNewUser = useCallback(
    async (data) => {
      const { emailId, id } = data;
      setRemoteSocketId(id);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      if (myVideoRef.current) {
        myVideoRef.current.srcObject = stream;
      }

      for (const track of stream.getTracks()) {
        peer.addTrack(track, stream);
      }

      const offer = await createOffer();
      socket.emit("call-user", { newUserId: id, offer });
    },
    [socket, createOffer],
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { existingUserId, offer } = data;
      setRemoteSocketId(existingUserId);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
        setMyStream(stream);

        if (myVideoRef.current) {
          myVideoRef.current.srcObject = stream;
        }

        for (const track of stream.getTracks()) {
          peer.addTrack(track, stream);
        }
      } catch (error) {
        console.error("Failed to get user media:", error);
      }
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { existingUserId, ans });
    },
    [socket, createAnswer],
  );

  const handleCallFinalised = useCallback(
    async (ans) => {
      await setRemoteAnswer(ans);
      // sendStream(myStream);
    },
    [myStream, setRemoteAnswer],
  );

  useEffect(() => {
    const trackEventHandler = (event) => {
      const remoteStreams = event.streams;
      setRemoteStream(remoteStreams[0]);

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStreams[0];
      }
    };

    peer.addEventListener("track", trackEventHandler);

    return () => {
      peer.removeEventListener("track", trackEventHandler);
    };
  }, [peer]);

  useEffect(() => {
    socket.on("user-joined", handleNewUser);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-finalised", handleCallFinalised);

    return () => {
      socket.off("user-joined", handleNewUser);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-finalised", handleCallFinalised);
    };
  }, [handleNewUser, handleIncomingCall, handleCallFinalised, socket]);

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Room page</h1>
      <div className="mySquare">
        <h1>ME</h1>
        <video ref={myVideoRef} autoPlay controls />
      </div>
      <div className="remoteSquare">
        <h1>THEM</h1>
        <video ref={remoteVideoRef} autoPlay controls />
      </div>
    </div>
  );
};

export default Room;

