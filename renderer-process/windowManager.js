class WindowManager {
    constructor() {
        this.bs = require('electron').remote.BrowserWindow
        this.path = require('path')
        this.url = require('url')
        this.windows = {}
    }

    static single() {
        if (this._instance === undefined) {
            this._instance = new this()
        }
        return this._instance
    }

    createWindow(name, template) {
        const windows = this.windows
        const absPath = this.path.join(this.url.format({
            pathname: this.path.join(__dirname, 'templates', template),
            protocol: 'file:',
            slashes: true,
        }))
        windows[name] = new this.bs({
            width: 800,
            height: 800,
        })
        let win = windows[name]
        win.on('close', function () {
            delete windows[name]
            win = null
        })
        win.loadURL(absPath)
        win.show()
        win.openDevTools()
        return win
    }

}

// 渲染进程之间通信机制

// 主进程

// const wm = WindowManager.single()
// const win = wm.createWindow(file.name, 'render.html')
// log(win.webContents.once('did-finish-load', () => {
//     win.webContents.send('render', [file.name, buffer])
// }))

//  渲染进程

// const __main = () => {
//     const receiver = require('electron').ipcRenderer
//     receiver.on('render', (event, message) => {
//         log('success', message)
//         const [name, buffer] = message
//         const options = {
//             canvas: _e('#id-canvas-show'),
//         }
//         const r = Renderer.single(options)
//         const parser = Parser.single()
//         log('buffer', buffer)
//         const mesh = parser.parsedFile(name, buffer)
//         r.addMesh('mesh', mesh)
//     })
// }
// document.addEventListener('DOMContentLoaded', () => {
//     __main()
// })