import React from 'react'

const FileTreeNode = ({ fileName, nodes, onSelect, path }) => {
    const isDir = !!nodes;

    return (
        <div onClick={(e) => {
            e.stopPropagation();
            if (isDir) return;
            onSelect(path);
        }} style={{ marginLeft: '12px' }}>
            <p className={isDir ? '' : "file-node"}>
                {fileName}
            </p>
            {
                nodes && <ul>
                    {
                        Object.keys(nodes).map((child, ind) => (
                            <li key={ind}>
                                <FileTreeNode path={path + '/' + child} onSelect={onSelect} fileName={child} nodes={nodes[child]} />
                            </li>
                        ))
                    }
                </ul>
            }
        </div>
    )
}

function FileTree({ tree, onSelect }) {
    return (
        <div>
            <FileTreeNode fileName={'/'} path="" onSelect={onSelect} nodes={tree} />
        </div>
    )
}

export default FileTree;