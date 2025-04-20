import React, { useState, useEffect } from "react";
import HealthStatus from "./HealthStatus";
function App() {

/** TO FETCH ALL THE CACHE WITH ID AND VALUE */
const [cachedMessages, setCachedMessages] = useState([]);
const [cacheStatus, setCacheStatus] = useState("");

const fetchCachedMessages = async () => {
    try {
        const response = await fetch("http://localhost:5000/messages-cache");
        const result = await response.json();

        if (response.ok) {
            console.log("🚀 Cached Messages Retrieved:", result);
            setCachedMessages(result);
            setCacheStatus("✅ Successfully fetched cached messages.");
        } else {
            setCachedMessages([]);
            setCacheStatus("⚡ No cached messages found.");
        }
    } catch (error) {
        console.error("Error fetching cached messages:", error);
        setCacheStatus("❌ Error fetching cached messages.");
    }
};

/* TESTE AND WORKING******************************** */
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState(""); // New state for server response
    const sendMessage = async () => {
        const response = await fetch("http://localhost:5000/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message }),
        });
        
        const result = await response.json();
        setStatus(result.status); // Set status message ("Message stored")
        fetchMessages();
    };
    const fetchMessages = async () => {
        const response = await fetch("http://localhost:5000/messages");
        const data = await response.json();
        setMessages(data);
    };
    const deleteAllMessages = async () => {
      try {
        const response = await fetch("http://localhost:5000/messages", {
          method: "DELETE",
        });
        const result = await response.json();
        setStatus(result.status); // Show response message
        setMessages([]); // Clear the frontend messages list
      } catch (error) {
        console.error("Error deleting messages:", error);
        setStatus("Error deleting messages");
      }
  };  
    useEffect(() => {
        fetchMessages();
    }, []);
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "20px" }}>
            {/* CARD FOR TITLE *****************************************************************************************/}
          <div style={{
            width: "300px",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            backgroundColor: "#fff",
            textAlign: "center",
            fontWeight: "bold",
            fontSize: "20px",
            marginBottom: "10px"
          }}>
              Web App Title here
          </div>
          {/* LINK TO GITHUB ***************************************************************************************/}
          <a 
            href="https://your-link-here.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              textDecoration: "none", 
              color: "inherit", 
              transition: "color 0.3s ease-in-out"
            }}
            onMouseEnter={(e) => e.target.style.color = "blue"}
            onMouseLeave={(e) => e.target.style.color = "inherit"}
          >
            Link here
          </a>
          {/* DB managment card ************************************************************************************/}
          <div style={{
            width: "300px",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
            marginTop: "20px",
            marginBottom: "5px" // Added space after the card
          }}>
            <div style={{ display: "flex", gap: "10px" }}>
              {/* Erase All Messages Button *********************************************************************/}
              <button 
                onClick={deleteAllMessages} 
                style={{ 
                  padding: "10px", 
                  backgroundColor: "red", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "5px",
                  cursor: "pointer"
                }}
              >
                Erase All Messages
              </button>
              {/* Open Adminer Button *********************************************************************/}
              <a href="http://localhost:8081" target="_blank" rel="noopener noreferrer">
                <button style={{
                  padding: "10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer"
                }}>
                  Open Adminer
                </button>
              </a>
            </div>
          </div>
          <p>user: postgres | pwd: password</p>
          {/* CARD FOR TEXTBOX AND BUTTON ************************************************************************/}
            <div style={{
              width: "300px",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              backgroundColor: "#fff",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input 
                  type="text" 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  placeholder="Write a message"
                  style={{ padding: "10px" }}
                />
                <button onClick={sendMessage} style={{ padding: "10px" }}>Send</button>
              </div>
            </div>
          {/* SHOW MESSAGES RECEIVED FROM THE BACK ************************************************************************/}
          {status && <p style={{ color: "green" }}>{status}</p>}
          {/* CARD TO SHOW MESSAGES IN DB *********************************************************************************/}
          <div style={{
            width: "300px",
            padding: "20px",
            marginTop: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            backgroundColor: "#fff"
          }}>
            <h3>Messages Received from DB:</h3>
            <ul style={{ listStyle: "none", padding: "0" }}>
              {messages.map((msg, index) => (
                <li key={index} style={{
                  padding: "8px",
                  borderBottom: "1px solid #ddd"
                }}>
                  {msg.text}
                </li>
              ))}
            </ul>
          </div>
{/** TO FETCH ALL THE CACHE WITH ID AND VALUE */}
<div style={{
    width: "300px",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    marginTop: "20px"
}}>
    <button 
        onClick={fetchCachedMessages} 
        style={{ 
            padding: "10px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            cursor: "pointer"
        }}
    >
        Fetch Cached Messages
    </button>

    {cacheStatus && <p>{cacheStatus}</p>}

    {cachedMessages.length > 0 && (
        <ul style={{ listStyle: "none", padding: "0", width: "100%" }}>
            {cachedMessages.map((msg) => (
                <li key={msg.id} style={{
                    padding: "10px",
                    borderBottom: "1px solid #ddd",
                    display: "flex",
                    justifyContent: "space-between"
                }}>
                    <strong>ID: {msg.id}</strong> Value: {msg.text}
                </li>
            ))}
        </ul>
    )}
</div>

<div style={{
            width: "300px",
            padding: "20px",
            marginTop: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            backgroundColor: "#fff"
          }}>
        <div className="min-h-screen bg-gray-100 p-6">
              <HealthStatus />
            </div>
    </div>
      </div>
  );
}
export default App;