import React, {
  useMemo,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";

const PeerContext = React.createContext(null);
export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
  const configuration = useMemo(
    () => ({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:global.stun.twilio.com:3478",
          ],
        },
      ],
    }),
    [],
  );

  const [peer, setPeer] = useState(new RTCPeerConnection(configuration));

  const createOffer = useCallback(async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(new RTCSessionDescription(offer));
    console.log("doneoffer");
    return offer;
  }, [peer]);

  const createAnswer = useCallback(
    async (offer) => {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(new RTCSessionDescription(answer));
      return answer;
    },
    [peer],
  );

  const setRemoteAnswer = useCallback(
    async ({ ans }) => {
      await peer.setRemoteDescription(new RTCSessionDescription(ans));
    },
    [peer],
  );

  const resetPeer = useCallback(() => {
    setPeer(new RTCPeerConnection(configuration));
  }, [configuration]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setRemoteAnswer,
        resetPeer,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
