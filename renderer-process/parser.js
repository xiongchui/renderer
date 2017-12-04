const binaryVector3 = function (dataView, offset) {
    const dv = dataView
    const v = new THREE.Vector3()
    v.x = dv.getFloat32(offset + 0, true)
    v.y = dv.getFloat32(offset + 4, true)
    v.z = dv.getFloat32(offset + 8, true)
    return v
}

const parsedFileStl = (buffer) => {
    // binary STL
    const view = new DataView(buffer);
    const size = view.getUint32(80, true);
    const geom = new THREE.Geometry()
    let offset = 84
    for (var i = 0; i < size; i++) {
        const normal = binaryVector3(view, offset)
        geom.vertices.push(binaryVector3(view, offset + 12))
        geom.vertices.push(binaryVector3(view, offset + 24))
        geom.vertices.push(binaryVector3(view, offset + 36))
        geom.faces.push(
            new THREE.Face3(i * 3, i * 3 + 1, i * 3 + 2, normal))
        offset += 4 * 3 * 4 + 2
    }
    return geom
}

const parsedFile = (filename, buffer) => {
    const suffix = filename.split('.').pop().toLowerCase()
    const mapParse = {
        stl: parsedFileStl,
    }
    const fn = mapParse[suffix]
    return fn(buffer)
}

