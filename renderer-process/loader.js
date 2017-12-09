const bindActionDropFile = () => {
    const div = _e('#id-file-container')
    div.on('drop', (e) => {
        const options = {
            canvas: _e('#id-canvas-show'),
        }
        const r = Renderer.single(options)
        e.stopPropagation()
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        const api = Api.single()
        const p = api.readAsArrayBuffer(file)
        p.then((e) => {
            const buffer = e.target.result
            const parser = Parser.single()
            const mesh = parser.parsedFile(file.name, buffer)
            r.addMesh('mesh', mesh)
        })
    })

    div.on('dragover', (e) => {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    })
}

const __main = () => {
    const options = {
        canvas: _e('#id-canvas-show'),
    }
    const r = Renderer.single(options)
    bindActionDropFile()
}

__main()
