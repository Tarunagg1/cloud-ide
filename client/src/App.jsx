import './App.css';
import React, { useEffect, useState } from 'react'
import Terminal from './components/Terminal'
import FileTree from './components/tree';
import socket from './utils/socket';

function App() {
  const [fileTree, setFileTree] = useState({});
  const [selectedFile, setSelectedFile] = useState("");
  const [selectedFileContent, setSelectedFileContent] = useState("");
  const [code, setCode] = useState("");

  const getFileTree = async () => {
    const response = await fetch("http://localhost:9000/files");
    const result = await response.json();
    setFileTree(result.tree);
  };

  useEffect(() => {
    socket.on("file:refresh", getFileTree);
    return () => {
      socket.off("file:refresh", getFileTree);
    };
  }, []);


  return (
    <div className="playground-container">
      <div className="editor-container">
        <div className="files">
          <FileTree tree={fileTree} />
        </div>
        <div className="editor"></div>
      </div>
      <div className="terminal-container">
        <Terminal />
      </div>
    </div>

  )
}

export default App