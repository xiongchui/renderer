const binaryVector3 = function (dataView, offset) {
    const dv = dataView
    let x = dv.getFloat32(offset + 0, true)
    let y = dv.getFloat32(offset + 4, true)
    let z = dv.getFloat32(offset + 8, true)
    return [x, y, z]
}

const parsedFileStl = (buffer) => {
    // binary STL
    const view = new DataView(buffer)
    let tcount = view.getUint32(80, true)
    const vert_hash = {}
    // log('size', size)
    let pos = 84
    // for (let i = 0; i < size; i++) {
    //     const normal = binaryVector3(view, offset)
    //     g.vertices.push(binaryVector3(view, offset + 12))
    //     g.vertices.push(binaryVector3(view, offset + 24))
    //     g.vertices.push(binaryVector3(view, offset + 36))
    //     g.faces.push(
    //         new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2, normal))
    //     offset += 4 * 3 * 4 + 2
    // }
    // log(g)
    // return g
    let vertices = []
    let faces = []
    while (tcount--) {
        pos += 12
        let f1 = view.getFloat32(pos, true)
        let f2 = view.getFloat32(pos + 4, true)
        let f3 = view.getFloat32(pos + 8, true)
        let vertexIndex = vert_hash[[f1, f2, f3]]
        if (vertexIndex === undefined) {
            vertexIndex = vertices.length
            vertices.push(new THREE.Vector3(f1, f2, f3))
            vert_hash[[f1, f2, f3]] = vertexIndex
        }
        let v1 = vertexIndex

        pos += 12

        f1 = view.getFloat32(pos, true)
        f2 = view.getFloat32(pos + 4, true)
        f3 = view.getFloat32(pos + 8, true)
        vertexIndex = vert_hash[[f1, f2, f3]]
        if (vertexIndex === undefined) {
            vertexIndex = vertices.length
            vertices.push(new THREE.Vector3(f1, f2, f3))
            vert_hash[[f1, f2, f3]] = vertexIndex
        }
        let v2 = vertexIndex

        pos += 12

        f1 = view.getFloat32(pos, true)
        f2 = view.getFloat32(pos + 4, true)
        f3 = view.getFloat32(pos + 8, true)
        vertexIndex = vert_hash[[f1, f2, f3]]
        if (vertexIndex === undefined) {
            vertexIndex = vertices.length
            vertices.push(new THREE.Vector3(f1, f2, f3))
            vert_hash[[f1, f2, f3]] = vertexIndex
        }
        let v3 = vertexIndex
        faces.push(new THREE.Face3(v1, v2, v3))
        pos += 14
    }
    return {vertices: vertices, faces: faces}
}

const setColorRandom = (geometry) => {
    // for (let i = 0; i < geometry.faces.length; i++) {
    //     geometry.faces[i].color.setHex(Math.random() * 0xffffff)
    // }

    // for (let i = 0; i < geometry.faces.length; i++) {
    //     let face = geometry.faces[i];
    //     for (let j = 0; j < 3; j++) {
    //         let color = new THREE.Color(Math.random() * 0xffffff)
    //         face.vertexColors[j] = color
    //     }
    // }
    var size = 80;
    var faceIndices = ['a', 'b', 'c', 'd']
    for (var i = 0; i < geometry.faces.length; i++) {
        let face = geometry.faces[i]
        // determine if current face is a tri or a quad
        let numberOfSides = (face instanceof THREE.Face3) ? 3 : 4
        // assign color to each vertex of current face
        for (var j = 0; j < numberOfSides; j++) {
            let vertexIndex = face[faceIndices[j]]
            // store coordinates of vertex
            let point = geometry.vertices[vertexIndex]
            // initialize color variable
            let color = new THREE.Color(0xffffff)
            color.setRGB(0.5 + point.x / size, 0.5 + point.y / size, 0.5 + point.z / size)
            face.vertexColors[j] = color
        }
    }
}

const parsedFile = (filename, buffer) => {
    const suffix = filename.split('.').pop().toLowerCase()
    const mapParse = {
        stl: parsedFileStl,
    }
    const fn = mapParse[suffix]
    return fn(buffer)
}

