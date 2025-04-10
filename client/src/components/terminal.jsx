import { Terminal as Xterminal } from "@xterm/xterm";
import { useEffect, useRef } from "react";
import "@xterm/xterm/css/xterm.css";
import "../css/terminal.css";
import socket from "../socket";

const Terminal = () => {
  const terminalRef = useRef(null);
  const terminalInstance = useRef(null);

  useEffect(() => {
    if (!terminalRef.current) return;

    try {
      const term = new Xterminal({
        rows: 10,
        cols: 80,
        theme: {
          background: "#1e1e1e",
          foreground: "#ffffff",
          cursor: "#ffffff",
        },
        cursorBlink: true,
        convertEol: true,
        fontFamily: "monospace",
        fontSize: 14,
      });

      terminalInstance.current = term;
      term.open(terminalRef.current);

      // Handle socket connection events
      socket.on("connect", () => {
        term.write("\r\nConnected to server\r\n$ ");
      });

      socket.on("disconnect", () => {
        term.write("\r\nDisconnected from server\r\n$ ");
      });

      socket.on("connect_error", (error) => {
        term.write(`\r\nConnection error: ${error.message}\r\n$ `);
      });

      // Set up socket output listener once
      socket.on("terminal:output", (data) => {
        if (terminalInstance.current) {
          terminalInstance.current.write(data);
        }
      });

      let currentLine = "";

      term.onData((data) => {
        try {
          // Handle special characters
          if (data === "\u0003") {
            // Ctrl+C
            term.write("^C\r\n$ ");
            currentLine = "";
            return;
          }

          if (data === "\u007F") {
            // Backspace
            if (currentLine.length > 0) {
              currentLine = currentLine.slice(0, -1);
              term.write("\b \b");
            }
            return;
          }

          // Handle enter key
          if (data === "\r") {
            if (currentLine.trim()) {
              // Send command to server
              socket.emit("terminal:write", currentLine + "\n");
            }
            term.write("\r\n$ ");
            currentLine = "";
            return;
          }

          // Regular input
          currentLine += data;
          term.write(data);
        } catch (error) {
          console.error("Terminal data handling error:", error);
          term.write("\r\nError processing input\r\n$ ");
          currentLine = "";
        }
      });

      return () => {
        if (terminalInstance.current) {
          terminalInstance.current.dispose();
          terminalInstance.current = null;
        }
        // Clean up all socket listeners
        socket.off("connect");
        socket.off("disconnect");
        socket.off("connect_error");
        socket.off("terminal:output");
      };
    } catch (error) {
      console.error("Terminal initialization error:", error);
      throw error;
    }
  }, []);

  return <div ref={terminalRef} className="terminal" />;
};

export default Terminal;
