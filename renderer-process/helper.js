class Helper {
    constructor() {

    }

    static single(options) {
        if (this._instance === undefined) {
            this._instance = new this(options)
        }
        return this._instance
    }

    setGeometryFaceRandomColor(geometry) {
        for (let i = 0; i < geometry.faces.length; i++) {
            geometry.faces[i].color.setHex(Math.random() * 0xffffff)
        }
    }

    setGeometryVertexRandomColor(geometry) {
        geometry.computeBoundingBox()
        const {x: x1, y: y1, z: z1} = geometry.boundingBox.max
        const {x: x2, y: y2, z: z2} = geometry.boundingBox.min
        const [dx, dy, dz] = [x1 - x2, y1 - y2, z1 - z2]
        const faceIndices = ['a', 'b', 'c', 'd']
        for (let i = 0; i < geometry.faces.length; i++) {
            let face = geometry.faces[i]
            let numberOfSides = (face instanceof THREE.Face3) ? 3 : 4
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
}