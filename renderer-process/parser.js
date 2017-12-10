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
        helper.setGeometryRgb(geometry)
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

    materialPhong() {
        const m = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            vertexColors: THREE.VertexColors,
        })
        return m
    }

    materialLabert() {
        const m = new THREE.MeshLambertMaterial({
            color: 0xffffff,
            overdraw: 1,
            wireframe: false,
            shading: THREE.FlatShading,
            vertexColors: THREE.FaceColors
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
        const material = this.materialPhong()
        const mesh = new THREE.Mesh(geometry, material)
        return mesh
    }

    guitar() {
        const fs = require('fs')
        const path = require('path')
        const name = 'guitar.stl'
        log(__dirname)
        const p = path.join(__dirname, 'assets', name)
        log('p', p)
        const buffer = fs.readFileSync(p)
        const arrayBuffer = new Uint8Array(buffer).buffer
        const mesh  = this.parsedFile(name, arrayBuffer)
        mesh.name = 'guitar'
        return mesh
    }
}