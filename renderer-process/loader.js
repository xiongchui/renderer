class Renderer {
    constructor(options) {
        this.scene = new THREE.Scene()
        this.renderer = new THREE.WebGLRenderer(options)
        this.renderer.setClearColor(0xffffff, 1);
        const {width, height} = this.renderer.domElement
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000)
        this.camera.position.set(0, 0, 1000)
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
        this.lights = {}
        this.meshes = {}
        this.setControls()
        this.initLights()
        this.initCube()
        this.loop()
    }

    setControls() {
        let controls = this.controls
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
        requestAnimationFrame(() => {
            this.loop()
        })
        controls.update()
        renderer.clear()
        renderer.render(this.scene, this.camera)
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
        const ambientLight = new THREE.AmbientLight(0x202020);
        this.addLight('ambient', ambientLight)

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.75);
        directionalLight.position.x = 1;
        directionalLight.position.y = 1;
        directionalLight.position.z = 2;
        directionalLight.position.normalize();
        this.addLight('directional', directionalLight);

        const pointLight = new THREE.PointLight(0xffffff, 0.3);
        pointLight.position.x = 0
        pointLight.position.y = -25
        pointLight.position.z = 10
        this.addLight('point', pointLight)
    }

    addLight(name, light) {
        const lights = this.lights
        const scene = this.scene
        lights[name] = light
        scene.add(light)
    }

    initCube() {
        // RGB color cube
        var size = 80;
        var point;
        var cubeMaterial = new THREE.MeshBasicMaterial(
            {color: 0xffffff, vertexColors: THREE.VertexColors});
        var faceIndices = ['a', 'b', 'c', 'd'];
        var cubeGeometry = new THREE.CubeGeometry(size, size, size, 1, 1, 1);
        for (var i = 0; i < cubeGeometry.faces.length; i++) {
            let face = cubeGeometry.faces[i];
            // determine if current face is a tri or a quad
            let numberOfSides = (face instanceof THREE.Face3) ? 3 : 4;
            // assign color to each vertex of current face
            for (var j = 0; j < numberOfSides; j++) {
                let vertexIndex = face[faceIndices[j]];
                // store coordinates of vertex
                point = cubeGeometry.vertices[vertexIndex];
                // initialize color variable
                let color = new THREE.Color(0xffffff);
                color.setRGB(0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size);
                face.vertexColors[j] = color;
            }
        }
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.position.set(100, 50, 0);
        this.addMesh('cube', cube)
    }

    setLight(name, options) {
        const m = this.lights[name]
        const attrs = ['x', 'y', 'z']
        attrs.forEach(key => {
            m.position[key] = options[key]
        })
    }

    setLightByGeometry(name, geometry) {
        const m = this.lights[name]
        const max = geometry.boundingBox.max
        const options = {
            x: max.x * 2,
            y: max.y * 2,
            z: max.z * 2,
        }
        this.setLight(name, options)
    }

    setCameraByGeometry(geometry) {
        const m = this.camera
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
        log('e', e)
        e.stopPropagation()
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        const api = Api.single()
        const p = api.readAsArrayBuffer(file)
        p.then((e) => {
            const options = {
                canvas: _e('#id-canvas-show'),
            }
            const r = Renderer.single(options)
            log(r)
            const mat = new THREE.MeshLambertMaterial({
                color: 0x808080,
                overdraw: 1,
                wireframe: false,
                flatShading: THREE.FlatShading,
                vertexColors: THREE.VertexColors,
            })
            const buffer = e.target.result
            const vf_data = parsedFileStl(buffer)

            var geo = new THREE.Geometry();
            geo.vertices = vf_data.vertices;
            geo.faces = vf_data.faces;
            geo.computeBoundingBox()
            geo.computeFaceNormals();
            geo.computeVertexNormals();
            geo.center()
            r.setCameraByGeometry(geo)
            r.setLightByGeometry('point', geo)
            r.setLightByGeometry('directional', geo)
            const mesh = new THREE.Mesh(geo, mat)
            // setColorRandom(geo)
            log('geo', geo)
            log('r', r)
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
    bindActionDropFile()
}

__main()
