class Renderer {
    constructor(options) {
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer(options)
        this.renderer.setClearColor(0xffffff, 1)
        const {width, height} = this.renderer.domElement
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 20000)
        this.camera.position.set(0, 0, 1000)
        this.lights = {}
        this.meshes = {}
        this.initControls()
        this.initLights()
        this.initCube()
        this.initGrid()
        this.initFog()
        this.initStats()
        this.loop()
    }

    initStats() {
        const stats = new Stats()
        this.stats = stats
        // 0: fps, 1: ms
        // 将stats的界面对应左上角
        stats.setMode(0)
        stats.domElement.style.position = 'absolute'
        stats.domElement.style.left = '0px'
        stats.domElement.style.top = '0px'
        document.body.appendChild(stats.domElement)
    }

    initControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        const controls = this.controls
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
        controls.maxDistance = 7000
        //是否开启右键拖拽
        controls.enablePan = true

    }

    loop() {
        const controls = this.controls
        const renderer = this.renderer
        const stats = this.stats
        controls.update()
        stats.update()
        renderer.clear()
        renderer.render(this.scene, this.camera)
        requestAnimationFrame(() => {
            this.loop()
        })
    }

    static single(options) {
        if (this._instance === undefined) {
            this._instance = new this(options)
        }
        return this._instance
    }

    addMesh(name, mesh) {
        const ms = this.meshes
        ms[name] = mesh
        this.scene.add(mesh)
    }

    initLights() {

    }

    addLight(name, light) {
        const lights = this.lights
        const scene = this.scene
        lights[name] = light
        scene.add(light)
    }

    initCube() {
        let size = 80
        let point
        let cubeMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors
        })
        let faceIndices = ['a', 'b', 'c', 'd']
        let cubeGeometry = new THREE.CubeGeometry(size, size, size, 1, 1, 1)
        for (let i = 0; i < cubeGeometry.faces.length; i++) {
            let face = cubeGeometry.faces[i]
            let numberOfSides = (face instanceof THREE.Face3) ? 3 : 4
            for (let j = 0; j < numberOfSides; j++) {
                let vertexIndex = face[faceIndices[j]]
                point = cubeGeometry.vertices[vertexIndex]
                let color = new THREE.Color(0xffffff)
                color.setRGB(0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size)
                face.vertexColors[j] = color
            }
        }
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial)
        cube.position.set(100, 50, 0)
        this.addMesh('cube', cube)
    }


    initGrid() {
        let grid = new THREE.GridHelper(3000, 20, 0xffffff, 0x55555)
        grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), 90 * (Math.PI / 180))
        this.addMesh('grid', grid)
    }

    initFog() {
        let skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000)
        let skyBoxMaterial = new THREE.MeshBasicMaterial({color: 0x87cefa, side: THREE.BackSide})
        let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial)
        this.scene.add(skyBox)
    }

    setLight(name, options) {
        const m = this.lights[name]
        const attrs = ['x', 'y', 'z']
        attrs.forEach(key => {
            m.position[key] = options[key]
        })
    }

    setLightByGeometry(name, geometry) {
        const max = geometry.boundingBox.max
        const options = {
            x: max.x * 2,
            y: max.y * 2,
            z: max.z * 2,
        }
        this.setLight(name, options)
    }

    setCameraByGeometry(geometry) {
        const max = geometry.boundingBox.max
        const [x, y, z] = [max.x * 3, max.y * 3, max.z * 3]
        this.setCameraPosition(x, y, z)
    }

    setCameraPosition(x, y, z) {
        const m = this.camera
        m.position.x = x
        m.position.y = y
        m.position.z = z
        this.controls.reset()
    }
}

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
