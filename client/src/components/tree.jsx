import React from 'react'

const FileTreeNode = ({ fileName, nodes }) => {
    const isDir = !!nodes;

    return (
        <div style={{ marginLeft: '12px' }}>
            <p className={isDir ? '' : "file-node"}>
                {fileName}
            </p>
            {
                nodes && <ul>
                    {
                        Object.keys(nodes).map((child, ind) => (
                            <li key={ind}>
                                <FileTreeNode fileName={child} nodes={nodes[child]} />
                            </li>
                        ))
                    }
                </ul>
            }
        </div>
    )
}

function FileTree({ tree }) {
    return (
        <div>
            <FileTreeNode fileName={'/'} nodes={tree} />
        </div>
    )
}

export default FileTree;