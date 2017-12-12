class Helper extends Singleton {
    constructor() {
        super()
    }

    setGeometryRgb(geometry) {
        geometry.computeBoundingBox()
        const {x: x1, y: y1, z: z1} = geometry.boundingBox.max
        const {x: x2, y: y2, z: z2} = geometry.boundingBox.min
        const [dx, dy, dz] = [x1 - x2, y1 - y2, z1 - z2]
        const faceIndices = ['a', 'b', 'c', 'd']
        for (let i = 0; i < geometry.faces.length; i++) {
            const face = geometry.faces[i]
            const numberOfSides = (face instanceof THREE.Face3) ? 3 : 4
            for (let j = 0; j < numberOfSides; j++) {
                let vertexIndex = face[faceIndices[j]]
                let point = geometry.vertices[vertexIndex]
                const rgb = {
                    r: (point.x - x2) / dx,
                    g: (point.y - y2) / dy,
                    b: (point.z - z2) / dz,
                }
                let color = new THREE.Color(rgb.r, rgb.g, rgb.b)
                face.vertexColors[j] = color
            }
        }
    }

    setGeometryFaceColor(geometry) {
        const faceIndices = ['a', 'b', 'c', 'd']
        for (let i = 0; i < geometry.faces.length; i++) {
            const face = geometry.faces[i]
            const numberOfSides = (face instanceof THREE.Face3) ? 3 : 4
            for (let j = 0; j < numberOfSides; j++) {
                const vertexIndex = face[faceIndices[j]]
                const color = new THREE.Color(Math.random() * 0xffffff)
                face.vertexColors[j] = color
            }
        }
    }

    setGeometryVertexColor(geometry) {
        for (let i = 0; i < geometry.faces.length; i++) {
            const face = geometry.faces[i]
            face.color.setRGB(Math.random(), Math.random(), Math.random())
        }
    }

    cubeRgb() {
        let size = 80
        let material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
        })
        let geometry = new THREE.CubeGeometry(size, size, size, 1, 1, 1)
        this.setGeometryRgb(geometry)
        const cube = new THREE.Mesh(geometry, material)
        cube.position.set(100, 50, 80)
        cube.name = 'rgbCube'
        return cube
    }

    cubeFace() {
        let size = 80
        let material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.FaceColors,
        })
        let geometry = new THREE.CubeGeometry(size, size, size, 3, 3, 3)
        this.setGeometryFaceColor(geometry)
        const cube = new THREE.Mesh(geometry, material)
        cube.position.set(-100, 50, 80)
        cube.name = 'faceCube'
        return cube
    }

    cubeVertex() {
        let size = 80
        let material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
        })
        let geometry = new THREE.CubeGeometry(size, size, size, 3, 3, 3)
        this.setGeometryVertexColor(geometry)
        const cube = new THREE.Mesh(geometry, material)
        cube.position.set(0, 50, 80)
        cube.name = 'vertexCube'
        return cube
    }
}