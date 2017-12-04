Date.prototype.format = function () {
    var add0 = function (m) {
        return m < 10 ? `0${m}` : m
    }
    var time = this
    var y = time.getFullYear()
    var m = time.getMonth() + 1
    var d = time.getDate()
    var h = time.getHours()
    var mm = time.getMinutes()
    var s = time.getSeconds()
    return `${y}-${add0(m)}-${add0(d)} ${add0(h)}:${add0(mm)}:${add0(s)}`
}

const log = console.log.bind(console, new Date().format())

// 简化常用函数
const _e = document.querySelector.bind(document)

const _es = document.querySelectorAll.bind(document)

Element.prototype._e = function (selector) {
    return this.querySelector(selector)
}

Element.prototype._es = function (selector) {
    return this.querySelectorAll(selector)
}

Element.prototype.on = Element.prototype.addEventListener

// 封装绑定事件函数
const bindEvent = (element, eventName, callback) => {
    element.addEventListener(eventName, callback)
}

const bindEventDelegate = (element, eventName, callback, responseClass) => {
    element.addEventListener(eventName, event => {
        var self = event.target
        if (self.classList.contains(responseClass)) {
            callback(event)
        }
    })
}

const bindAll = (selector, eventName, callback, responseClass) => {
    var es = document.querySelectorAll(selector)
    var func = responseClass === undefined ? bindEvent : bindEventDelegate
    for (let e of es) {
        func(e, eventName, callback, responseClass)
    }
}

class Api {
    static single() {
        if (this._instance === undefined) {
            this._instance = new this()
        }
        return this._instance
    }

    _ajax(request) {
        var req = {
            url: request.url,
            data: JSON.stringify(request.data) || null,
            method: request.method || 'POST',
            header: request.header || {},
            contentType: request.contentType || 'application/json',
            callback: request.callback
        }
        var r = new XMLHttpRequest()
        var promise = new Promise((resolve, reject) => {
            r.open(req.method, req.url, true)
            r.setRequestHeader('Content-Type', req.contentType)
            // setHeader
            Object.keys(req.header).forEach(key => {
                r.setRequestHeader(key, req.header[key])
            })
            r.onreadystatechange = function () {
                if (r.readyState === 4) {
                    let res = r.response
                    // 回调函数
                    if (typeof req.callback === 'function') {
                        req.callback(res)
                    }
                    // Promise 成功
                    resolve(res)
                }
            }
            r.onerror = function (err) {
                reject(err)
            }
            if (req.method.toUpperCase() === 'GET') {
                r.send()
            } else {
                r.send(req.data)
            }
        })
        return promise
    }

    get(path, callback) {
        const req = {
            url: path,
            method: 'GET',
            callback: callback,
        }
        return this._ajax(req)
    }

    post(path, form, callback) {
        const req = {
            url: path,
            data: form,
            callback: callback,
        }
        return this._ajax(req)
    }

    _ajaxSync(request) {
        var req = {
            url: request.url,
            data: JSON.stringify(request.data) || null,
            method: request.method || 'POST',
            header: request.header || {},
            contentType: request.contentType || 'application/json',
        }
        var r = new XMLHttpRequest()
        if (request.contentType !== undefined) {
            r.setRequestHeader('Content-Type', request.contentType)
        }
        Object.keys(req.header).forEach(key => {
            r.setRequestHeader(key, req.header[key])
        })
        r.open(req.method, req.url, false)
        if (request.method === 'GET') {
            r.send()
        } else {
            r.send(request.data)
        }
        if (r.readyState === 4) {
            return r.response
        }
    }

    getSync(path) {
        const req = {
            url: path,
            method: 'GET',
        }
        return this._ajaxSync(req)
    }

    postSync(path, form) {
        const req = {
            url: path,
            data: form,
        }
        return this._ajaxSync(req)
    }

    _fileReader(form) {
        const m = {
            progress: form.progress,
            file: form.file,
            method: form.method || 'text',
            encoding: form.encoding || 'UTF-8',
        }
        const r = new FileReader()
        const mapMethod = {
            text: r.readAsText,
            dataUrl: r.readAsDataURL,
            binaryString: r.readAsBinaryString,
            arrayBuffer: r.readAsArrayBuffer,
        }
        const fn = mapMethod[m.method]
        if (m.method === 'text') {
            fn.call(r, m.file, m.encoding)
        } else {
            fn.call(r, m.file)
        }
        const p = new Promise((resolve, reject) => {
            r.onerror = (err) => {
                reject(err)
            }
            if (typeof m.progress === 'function') {
                r.onprogress = (e) => {
                    m.progress(e)
                }
            }
            r.onload = (e) => {
                resolve(e)
            }
        })
        return p
    }

    readAsText(file, progress, encoding) {
        const form = {
            file: file,
            progress: progress,
            encoding: encoding,
        }
        return this._fileReader(form)
    }

    readAsDataUrl(file, progress) {
        const form = {
            file: file,
            progress: progress,
            method: 'dataUrl',
        }
        return this._fileReader(form)
    }

    readAsBinaryString(file, progress) {
        const form = {
            file: file,
            progress: progress,
            method: 'binaryString',
        }
        return this._fileReader(form)
    }

    readAsArrayBuffer(file, progress) {
        const form = {
            file: file,
            progress: progress,
            method: 'arrayBuffer',
        }
        return this._fileReader(form)
    }
}
