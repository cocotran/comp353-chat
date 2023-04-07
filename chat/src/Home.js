import React, { useState, useEffect } from "react";

import './App.css';

const URL = "http://localhost:5000"


function Home() {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const signIn = localStorage.getItem('signin');
  const userId = localStorage.getItem('userId');
  
  useEffect(() => {
    // Fetch channels from server
    fetch(URL + "/api/channels")
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      // Fetch messages for selected channel from server
      fetch(URL + `/api/channels/${selectedChannel}/messages`)
        .then((res) => res.json())
        .then((data) => setMessages(data))
        .catch((error) => console.error(error));
    }
  }, [selectedChannel]);

  function handleCreateChannel(name) {
    // Send new channel name to server
    fetch(URL + "/api/channels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((res) => res.json())
      .then((data) => setChannels([...channels, data]))
      .catch((error) => console.error(error));
  }

  function handleSendMessage() {
    // Send new message to server
    fetch(URL  + `/api/channels/${selectedChannel}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: messageInput, userId: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setMessages(data);
        setMessageInput("");
      })
      .catch((error) => console.error(error));
  }

  function handleSendReply(parentMessageId) {
    // Send new reply to server
    fetch(URL + `/api/messages/${parentMessageId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: messageInput, userId: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        const updatedMessages = messages.map((message) => {
          if (message.id === parentMessageId) {
            return {
              ...message,
              replies: data,
            };
          }
          return message;
        });
        setMessages(updatedMessages);
        setMessageInput("");
      })
      .catch((error) => console.error(error));
  }

  function getRepliesForMessage(messageID) {
    // Send new reply to server
    fetch(URL + `/api/messages/${messageID}/replies`)
      .then((res) => res.json())
      .then((data) => {
        const updatedMessages = messages.map((message) => {
          if (message.id === messageID) {
            return {
              ...message,
              replies: data,
            };
          }
          return message;
        });
        setMessages(updatedMessages);
      })
      .catch((error) => console.error(error));
  }

  if (signIn === "false" || userId === "0") {
    return <h1>You have to signin to use the app!</h1>
  }

  return (
    <div className="home">
      <div className="channel-list-container">
        <ChannelList
          channels={channels}
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
          onCreateChannel={handleCreateChannel}
        />
      </div>
      <div className="message-container">
        {selectedChannel && (
          <>
            <MessageList messages={messages} onReplyClick={handleSendReply} getRepliesForMessage={getRepliesForMessage} />
            <MessageInput
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onSend={handleSendMessage}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Home;


function ChannelList({ channels, selectedChannel, onChannelSelect, onCreateChannel }) {
  return (
    <div className="channel-list">
      <h2>Channels</h2>
      <ul>
        {channels.map(channel => (
          <li key={channel.id} className={channel.id === selectedChannel ? "selected" : ""}>
            <button onClick={() => onChannelSelect(channel.id)}>{channel.name}</button>
          </li>
        ))}
      </ul>
      <NewChannelForm onCreateChannel={onCreateChannel} />
    </div>
  );
}


function Message({ message, onReplyClick, getRepliesForMessage }) {
  const handleReplyClick = () => {
    onReplyClick(message.id);
  };

  const handleLoadReplyClick = () => {
    getRepliesForMessage(message.id);
  };

  const displayReplies = () => {
    if (message.replies !== undefined) {
      return message.replies.map((reply) => (
        <div className="reply-container" key={reply.id}>
          <span className="message-username">{reply.username}</span>
          <span className="message-timestamp">{new Date(reply.created_at).toLocaleString()}</span>
          <div className="reply-body">{reply.reply}</div>
        </div>
      ))
    }
    return <div></div>
  }
  
  return (
    <div className="message">
      <div className="message-header">
        <span className="message-username">{message.username}</span>
        <span className="message-timestamp">{new Date(message.created_at).toLocaleString()}</span>
      </div>
      <div className="message-body">{message.text}</div>
      {displayReplies()}
      <div className="message-actions">

        <button onClick={handleLoadReplyClick}>Load Reply</button>
        <button onClick={handleReplyClick}>Reply</button>
      </div>
    </div>
  );
}

function MessageList({ messages, onReplyClick, getRepliesForMessage }) {
  return (
    <div className="message-list">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onReplyClick={onReplyClick}
          getRepliesForMessage={getRepliesForMessage}
        />
      ))}
    </div>
  );
}

function MessageInput({ value, onChange, onSend }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="message-input">
      <input
        type="text"
        placeholder="Type a message..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={onSend}>Send</button>
    </div>
  );
}

function NewChannelForm({ onCreateChannel }) {
  const [channelName, setChannelName] = useState("");

  const handleSubmit = event => {
    event.preventDefault();
    onCreateChannel(channelName);
    setChannelName("");
  };

  return (
    <form onSubmit={handleSubmit} className="new-channel-form">
      <h4 className="mt-2">Create New Channel</h4>
      <input
        type="text"
        placeholder="New channel name"
        value={channelName}
        onChange={event => setChannelName(event.target.value)}
      />
      <button type="submit" className="mt-1">Create channel</button>
    </form>
  );
}