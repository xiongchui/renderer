const constants = {
    colors: {
        "THREE.NoColors": THREE.NoColors,
        "THREE.FaceColors": THREE.FaceColors,
        "THREE.VertexColors": THREE.VertexColors,
    },
}

// dat gui shim
dat.GUI.prototype.removeFolder = function (name) {
    var folder = this.__folders[name]
    if (!folder) {
        return
    }
    folder.close()
    this.__ul.removeChild(folder.domElement.parentNode)
    delete this.__folders[name]
    this.onResize()
}

class Renderer {
    constructor() {
        this.setup()
        this.initRender()
        this.initCamera()
        this.initControls()
        this.initGui()
        this.initGrid()
        this.initLights()
        this.initFog()
        this.initStats()
        this.bindEvents()
        this.loop()
    }

    initGui() {
        const gui = new dat.GUI()
        this.gui = gui
        const sample = {
            'cube': true,
        }
        const f = gui.addFolder('sample')
        f.add(sample, 'cube').onChange((value) => {
            if (value) {
                this.initCube()
            } else {
                this.removeMesh('faceCube')
                this.removeMesh('vertexCube')
                this.removeMesh('rgbCube')
            }
        })
        if (sample.cube) {
            this.initCube()
        }
    }

    initCube() {
        const helper = Helper.single()
        const c1 = helper.cubeFace()
        const c2 = helper.cubeVertex()
        const c3 = helper.cubergb()
        this.addMesh('faceCube', c1)
        this.addMesh('vertexCube', c2)
        this.addMesh('rgbCube', c3)
    }

    removeMesh(name, mesh) {
        const ms = this.meshes
        delete ms[name]
        if (mesh === undefined) {
            mesh = this.scene.getObjectByName(name)
        }
        this.scene.remove(mesh)
        this.gui.removeFolder(name)
    }


    setGuiByMesh(name, mesh) {
        const material = mesh.material
        const geometry = mesh.geometry
        const gui = this.gui
        const f = gui.addFolder(name)
        const r = {
            '移除': () => {
                this.removeMesh(name, mesh)
            }
        }
        f.add(r, '移除')
        f.add(material, 'transparent')
        f.add(material, 'opacity', 0, 1)
        const isBasic = material instanceof THREE.MeshBasicMaterial
        const isPhong = material instanceof THREE.MeshPhongMaterial

        const func = this.needsUpdate(material, geometry)
        if (isBasic || isPhong) {
            f.add(material, 'wireframe')
            f.add(material, 'wireframeLinewidth', 0, 10)
            f.add(material, 'flatShading').onChange(func)
            f.add(material, 'vertexColors', constants.colors).onChange(func)
        }
        if (isPhong) {
            f.add(material, 'shininess', 0, 100)
        }
    }

    needsUpdate(material, geometry) {
        return () => {
            material.vertexColors = +material.vertexColors
            material.side = +material.side
            material.needsUpdate = true
            geometry.verticesNeedUpdate = true
            geometry.normalsNeedUpdate = true
            geometry.colorsNeedUpdate = true
        }
    }

    setup() {
        this.scene = new THREE.Scene()
        this.lights = {}
        this.meshes = {}
    }

    initRender() {
        const options = {
            antialias: true,
        }
        const r = new THREE.WebGLRenderer(options)
        r.setClearColor(0xffffff, 1)
        const [w, h] = [window.innerWidth, window.innerHeight]
        r.setSize(w, h)
        const div = _e('#id-div-container')
        div.appendChild(r.domElement)
        this.renderer = r
    }

    initCamera() {
        const [w, h] = [window.innerWidth, window.innerHeight]
        this.camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 20000)
        this.camera.position.set(0, 0, 1000)
    }

    bindEvents() {
        THREEx.WindowResize(this.renderer, this.camera)
        THREEx.FullScreen.bindKey({
            charCode: 'm'.charCodeAt(0),
        })
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
        this.setCameraByMesh(mesh)
        const ms = this.meshes
        ms[name] = mesh
        this.scene.add(mesh)
        this.setGuiByMesh(name, mesh)
    }

    initLights() {
        const al = new THREE.AmbientLight(0xffffff, 0.5)
        this.addLight('ambient', al)
        const dl = new THREE.DirectionalLight(0xffffff, 0.5)
        dl.position.set(1, 1, 1)
        this.addLight('directional', dl)
    }

    addLight(name, light) {
        const lights = this.lights
        const scene = this.scene
        lights[name] = light
        scene.add(light)
    }

    initGrid() {
        let grid = new THREE.GridHelper(3000, 20, 0xffffff, 0x55555)
        grid.rotateOnAxis(new THREE.Vector3(1, 0, 0), 90 * (Math.PI / 180))
        this.addMesh('grid', grid)
    }

    initFog() {
        let skyBoxGeometry = new THREE.CubeGeometry(10000, 10000, 10000)
        let skyBoxMaterial = new THREE.MeshBasicMaterial({
            color: 0x87cefa,
            side: THREE.BackSide
        })
        let skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial)
        this.scene.add(skyBox)
    }

    setCameraByMesh(mesh) {
        const geometry = mesh.geometry
        geometry.computeBoundingBox()
        const max = geometry.boundingBox.max
        const p = mesh.position
        const [x, y, z] = [0, p.y - max.y * 10, p.z + max.z * 5]
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