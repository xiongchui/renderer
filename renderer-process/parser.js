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
        const faceIndices = ['a', 'b', 'c', 'd']
        for (let i = 0; i < geometry.faces.length; i++) {
            let face = geometry.faces[i]
            let numberOfSides = (face instanceof THREE.Face3) ? 3 : 4
            for (let j = 0; j < numberOfSides; j++) {
                let vertexIndex = face[faceIndices[j]]
                let point = geometry.vertices[vertexIndex]
                let color = new THREE.Color(0xffffff)
                const rgb = {
                    r: (point.x - x2) / (x1 - x2),
                    g: (point.y - y2) / (y1 - y2),
                    b: (point.z - z2) / (z1 - z2),
                }
                color.setRGB(rgb.r, rgb.g, rgb.b)
                face.vertexColors[j] = color
            }
        }
    }
}

class Parser {
    constructor() {

    }

    parsedFile(filename, buffer) {
        const suffix = filename.split('.').pop().toLowerCase()
        const mapParse = {
            stl: this.parsedFileStlBinary,
        }
        const fn = mapParse[suffix]
        const r = fn.call(this, buffer)
        const geometry = this.geometryFromObject(r)
        this.computeParams(geometry)
        const helper = Helper.single()
        helper.setGeometryVertexRandomColor(geometry)
        const mesh = this.meshFromGeometry(geometry)
        return mesh
    }

    static single(...args) {
        if (this._instance === undefined) {
            this._instance = new this(...args)
        }
        return this._instance
    }

    _vertexIndex(dataView, offset, geometry, map) {
        const dv = dataView
        const vertices = geometry.vertices
        let x = dv.getFloat32(offset + 0, true)
        let y = dv.getFloat32(offset + 4, true)
        let z = dv.getFloat32(offset + 8, true)
        let vi = map[[x, y, z]]
        if (vi === undefined) {
            vi = vertices.length
            vertices.push(new THREE.Vector3(x, y, z))
            map[[x, y, z]] = vi
        }
        return vi
    }

    parsedFileStlBinary(buffer) {
        const view = new DataView(buffer)
        const size = view.getUint32(80, true)
        const map = {}
        let pos = 84
        const r = {
            vertices: [],
            faces: [],
        }
        for (let i = 0; i < size; i++) {
            let v1 = this._vertexIndex(view, pos + 12, r, map)
            let v2 = this._vertexIndex(view, pos + 24, r, map)
            let v3 = this._vertexIndex(view, pos + 36, r, map)
            r.faces.push(new THREE.Face3(v1, v2, v3))
            pos += 50
        }
        return r
    }

    materialDefault() {
        const m = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
            wireframe: true,
        })
        return m
    }

    geometryFromObject(object) {
        const {vertices, faces} = object
        let geometry = new THREE.Geometry()
        geometry.vertices = vertices
        geometry.faces = faces
        this.computeParams(geometry)
        return geometry
    }

    computeParams(geometry) {
        const g = geometry
        g.computeBoundingBox()
        g.computeFaceNormals()
        g.computeVertexNormals()
        g.center()
    }

    meshFromGeometry(geometry) {
        const material = this.materialDefault()
        const mesh = new THREE.Mesh(geometry, material)
        return mesh
    }
}