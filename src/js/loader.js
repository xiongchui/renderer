const scene = () => {
    const options = {
        canvas: _e('#id-canvas-show'),
    }
    const renderer = new THREE.WebGLRenderer(options)
    const {width, height} = renderer.domElement
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1000)
    camera.position.set(0, 0, 50)

    const s = new THREE.Scene()
    s.add(new THREE.AmbientLight(0xff0000))

    const light1 = new THREE.DirectionalLight(0xffffff)
    light1.position.set(0, 100, 100)
    s.add(light1)

    const light2 = new THREE.DirectionalLight(0xffffff)
    light2.position.set(0, -100, -100)
    s.add(light2)

    const controls = new THREE.OrbitControls(camera, renderer.domElement)

    // 使动画循环使用时阻尼或自转 意思是否有惯性
    controls.enableDamping = true
    //动态阻尼系数 就是鼠标拖拽旋转灵敏度
    //controls.dampingFactor = 0.25
    //是否可以缩放
    controls.enableZoom = true
    //是否自动旋转
    // controls.autoRotate = true
    //设置相机距离原点的最近距离
    controls.minDistance = 5
    //设置相机距离原点的最远距离
    controls.maxDistance = 600
    //是否开启右键拖拽
    controls.enablePan = true

    const loop = () => {
        requestAnimationFrame(loop)
        controls.update()
        renderer.clear()
        renderer.render(s, camera)
    }
    loop()
    return s
}

const bindActionDropFile = () => {
    const div = _e('#id-file-container')
    div.on('drop', (e) => {
        log('e', e)
        e.stopPropagation()
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        const api = Api.single()
        const p = api.readAsArrayBuffer(file)
        p.then((e) => {
            const s = scene()
            const mat = new THREE.MeshPhongMaterial({
                color: 0x339900,
                specular: 0x030303,
            })
            log('mat', mat)
            const buffer = e.target.result
            const geom = parsedFileStl(buffer)
            const obj = new THREE.Mesh(geom, mat)
            s.add(obj)
        })
    })

    div.on('dragover', (e) => {
        e.stopPropagation()
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    })
}

const __main = () => {
    bindActionDropFile()
}

__main()
