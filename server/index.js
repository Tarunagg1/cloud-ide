const fs = require('fs/promises')
const http = require('http');
const express = require('express');
var os = require('os');
var pty = require('node-pty');
const chokidar = require('chokidar');
const cors = require('cors');
const path = require('path')

const { Server: SocketServer } = require('socket.io');

var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

console.log(process.env.INIT_CWD, 'process.env.INIT_CWD ');

chokidar.watch('./user').on('all', (event, path) => {
    io.emit('file:refresh', path)
});

const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.INIT_CWD + '/user',
    env: process.env
});


const app = express();

const server = http.createServer(app);

const io = new SocketServer({
    cors: '*'
});

app.use(cors())
io.attach(server);

ptyProcess.onData((data) => {
    console.log("in pyt", data);
    io.emit('terminal:data', data);
});

io.on('connection', (socket) => {
    console.log(`Socket connected`, socket.id)

    socket.emit('file:refresh')

    socket.on('file:change', async ({ path, content }) => {
        await fs.writeFile(`./user${path}`, content)
    })

    socket.on('terminal:write', (data) => {
        console.log('Term', data)
        ptyProcess.write(data);
    })
})


app.get('/files', async (req, res) => {
    const fileTree = await genrateFileTree('./user');
    return res.json({ tree: fileTree })
});


app.get('/files/content', async (req, res) => {
    const path = req.query.path;
    const content = await fs.readFile(`./user${path}`, 'utf-8')
    return res.json({ content })
})

async function genrateFileTree(directory) {
    const tree = {};

    async function buildTree(currentDir, currentTree) {
        const files = await fs.readdir(currentDir)
        for (const file of files) {
            const filePath = path.join(currentDir, file);
            const stat = await fs.stat(filePath)
            if (stat.isDirectory()) {
                currentTree[file] = {}
                await buildTree(filePath, currentTree[file])
            } else {
                currentTree[file] = null
            }
        }
    }

    await buildTree(directory, tree);
    return tree;
}


server.listen(9000, () => console.log('server listening on port 9000'));
