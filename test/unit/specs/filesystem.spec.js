import FileSystem from '../../../src/index'

describe('Filesystem API', () => {
  it('creates instance', () => {
    let fs = new FileSystem({ name: 'test' })
    expect(typeof fs).toBe('object')
  })

  it('create directory mkdir', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let id = await fs.mkdir('root')
    expect(typeof id).toBe('string')
  })

  it('create directory mkdirParents', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    let path = '/root/is/the/king'
    let id = await fs.mkdirParents(path)
    expect(id).toBe(path)
  })

  it('delete directory rmdir', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let id = await fs.mkdir('root')
    expect(typeof id).toBe('string')

    let resp = await fs.rmdir('root')
    expect(resp).toBeUndefined()
  })

  it('delete directory that does not exists', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    await expect(fs.rmdir('root')).rejects.toEqual(new Error('dir does not exists'))
  })

  it('does not delete file with rmdir', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    let blob = new Blob(['my test data'], { type: 'plain/text' })
    await fs.outputFile('/root/xx/test.txt', blob)

    await expect(fs.rmdir('/root/xx/test.txt')).rejects.toEqual(new Error('it is not a dir'))
  })

  it('does not delete non-empty dirs', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    let blob = new Blob(['my test data'], { type: 'plain/text' })
    await fs.outputFile('/root/xx/test.txt', blob)

    await expect(fs.rmdir('/root/xx')).rejects.toEqual(new Error('dir is not empty'))
  })

  it('create file', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let id = await fs.mkdir('root')
    expect(typeof id).toBe('string')

    let blob = new Blob(['my test data'], { type: 'plain/text' })

    let resp = await fs.writeFile('root/test.txt', blob)
    expect(typeof resp).toBe('string')
  })

  it('create file and creates parent dirs recursively', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let blob = new Blob(['my test data'], { type: 'plain/text' })

    let resp = await fs.outputFile('root/to/some/unknown/folder/test.txt', blob)
    expect(typeof resp).toBe('string')
  })

  it('read file', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let id = await fs.mkdir('root')
    expect(typeof id).toBe('string')

    let blob = new Blob(['my test data'], { type: 'plain/text' })
    let resp = await fs.writeFile('root/test.txt', blob)
    expect(typeof resp).toBe('string')

    resp = await fs.readFile('root/test.txt')
    expect(typeof resp).toBe('object')
  })

  it('read file which does not exists', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let id = await fs.mkdir('root')
    expect(typeof id).toBe('string')

    await expect(fs.readFile('root/test.txt')).rejects.toEqual(new Error('file does not exist'))
  })

  it('write file without root', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    let blob = new Blob(['my test data'], { type: 'plain/text' })

    await expect(fs.writeFile('root/test.txt', blob)).rejects.toEqual(new Error('file needs parent'))
  })

  it('unlink file', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let id = await fs.mkdir('root')
    expect(typeof id).toBe('string')

    let blob = new Blob(['my test data'], { type: 'plain/text' })
    let resp = await fs.writeFile('root/test.txt', blob)
    expect(typeof resp).toBe('string')

    let removed = await fs.unlink('root/test.txt')
    expect(removed).toEqual(undefined)

    await expect(fs.unlink('root/test.txt')).rejects.toEqual(new Error('file does not exists'))
  })

  it('stats file', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let id = await fs.mkdir('root')
    expect(typeof id).toBe('string')

    let blob = new Blob(['my test data'], { type: 'plain/text' })
    let resp = await fs.writeFile('root/test.txt', blob)
    expect(typeof resp).toBe('string')

    let stats = await fs.stats('root/test.txt')
    expect(typeof stats).toBe('object')
  })

  it('check if file is a directory', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    let id = await fs.mkdir('root')
    expect(typeof id).toBe('string')

    let blob = new Blob(['my test data'], { type: 'plain/text' })
    let resp = await fs.writeFile('root/test.txt', blob)
    expect(typeof resp).toBe('string')

    let stats = await fs.stats('root')

    expect(stats.isFile()).toBe(false)
    expect(stats.isSymbolicLink()).toBe(false)
    expect(stats.isDirectory()).toBe(true)
  })

  it('rename file', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })

    await expect(fs.rename('root/test.txt', 'root/new.txt')).rejects.toEqual(new Error('not implemented'))
  })

  it('list root files', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    await fs.mkdir('/root')
    await fs.mkdir('/root/files')
    let blob = new Blob(['my test data'], { type: 'plain/text' })
    await fs.writeFile('/root/test1.txt', blob)
    await fs.writeFile('/root/files/test2.txt', blob)
    await fs.writeFile('/root/files/test3.txt', blob)

    let respRoot = await fs.ls('/root')
    expect(respRoot.length).toBe(2)
  })

  it('list child files', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    await fs.mkdir('root')
    await fs.mkdir('root/files')
    let blob = new Blob(['my test data'], { type: 'plain/text' })
    await fs.writeFile('root/test1.txt', blob)
    await fs.writeFile('root/files/test2.txt', blob)
    await fs.writeFile('root/files/test3.txt', blob)

    let respChild = await fs.ls('root/files')
    expect(respChild.length).toBe(2)
  })

  it('list child file as FileInfo', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    await fs.mkdir('root')
    await fs.mkdir('root/files')
    let blob = new Blob(['my test data'], { type: 'plain/text' })
    await fs.writeFile('root/test1.txt', blob)
    await fs.writeFile('root/files/test2.txt', blob)
    await fs.writeFile('root/files/test3.txt', blob)

    let respChild = await fs.ls('root/files')
    expect(respChild[0].mode).toBe('FILE')
    expect(respChild[0].isFile()).toBe(true)
  })

  it('filters output', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    await fs.mkdir('/root')
    await fs.mkdir('/root/files')
    let blob = new Blob(['my test data'], { type: 'plain/text' })
    await fs.writeFile('/root/test1.txt', blob)
    await fs.writeFile('/root/files/test2.txt', blob)
    await fs.writeFile('/root/files/test3.txt', blob)
    let respRoot = await fs.ls('/root', { 'mode': 'DIR' })
    expect(respRoot.length).toBe(1)
  })

  it('deletes recursively', async () => {
    let fs = new FileSystem({ backend: 'memory', name: 'test' })
    let blob = new Blob(['my test data'], { type: 'plain/text' })

    let dirs = ['/rootX', '/rootX/files', '/rootX/files/1', '/rootX/anotherFiles']
    let files = ['/rootX/test1.txt', '/rootX/files/test2.txt', '/rootX/files/test3.txt', '/rootX/files/1/test4.txt', '/rootX/anotherFiles/test4.txt']

    for (let el of dirs) {
      await fs.mkdir(el)
    }

    for (let el of files) {
      await fs.writeFile(el, blob)
    }

    await fs.rmdirRecursive('/rootX')

    for (let el of files.concat(dirs)) {
      expect(await fs.exists(el)).not.toBe(true)
    }
  })
})
