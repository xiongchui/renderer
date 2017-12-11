const bindActionDropFile = () => {
    const div = _e('canvas')
    div.on('drop', (e) => {
        const r = Renderer.single()
        e.stopPropagation()
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        const api = Api.single()
        const p = api.readAsArrayBuffer(file)
        p.then((e) => {
            const buffer = e.target.result
            const parser = Parser.single()
            const mesh = parser.parsedFile(file.name, buffer)
            r.addMesh(file.name, mesh)
        })
    })

    div.on('dragover', (e) => {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    })
}

const __main = () => {
    const r = Renderer.single()
    bindActionDropFile()
}

__main()
const r = Renderer.single()