import './App.css';
import React, { useCallback, useEffect, useState } from 'react'
import Terminal from './components/Terminal'
import FileTree from './components/tree';
import socket from './utils/socket';


import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools";

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


  const isSaved = selectedFileContent === code;

  useEffect(() => {
    if (code && !isSaved) {
      const timer = setTimeout(() => {
        socket.emit("file:change", {
          path: selectedFile,
          content: code,
        });
      }, 5 * 1000);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, selectedFile, isSaved]);


  useEffect(() => {
    if (selectedFileContent) {
      setCode(selectedFileContent);
    }
  }, [selectedFileContent]);


  const getFileContents = useCallback(async () => {
    if (!selectedFile) return;
    const response = await fetch(`http://localhost:9000/files/content?path=${selectedFile}`);
    const result = await response.json();
    setSelectedFileContent(result.content);
  }, [selectedFile]);


  useEffect(() => {
    setCode("");
    if (selectedFile) getFileContents();
  }, [getFileContents, selectedFile]);

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
          <FileTree tree={fileTree} onSelect={(path) => setSelectedFile(path)} />
        </div>
        <div className="editor">
          {selectedFile && (
            <p>
              {selectedFile.replaceAll("/", " > ")}{" "}
              {isSaved ? "Saved" : "Unsaved"}
            </p>
          )}

          <AceEditor
            // width="70%"
            value={code}
            onChange={(e) => setCode(e)}
          />
        </div>
      </div>
      <div className="terminal-container">
        <Terminal />
      </div>
    </div>

  )
}

export default App