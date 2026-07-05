import { useMemo, useRef, useState } from 'react'
import { jsPDF } from 'jspdf'
import Toolbar from './components/Toolbar'
import PropertiesPanel from './components/PropertiesPanel'
import RevisionCanvas from './components/RevisionCanvas'
import { getPageSize } from './pageSizes'

const makeBox = (index = 0) => ({
  id: crypto.randomUUID(),
  type: 'question',
  title: `Topic ${index + 1}`,
  questions: ['Type your first question here', 'Add another question here'],
  x: 30 + index * 18,
  y: 30 + index * 18,
  width: 300,
  height: 240,
  fontSize: 17,
  titleFontSize: 22,
  questionLayout: 'compact',
  linedSpace: true,
  answerLines: 5,
  background: '#ffffff',
})

const makeImageBox = ({ src, name, naturalWidth, naturalHeight }, index = 0, page) => {
  const maxWidth = Math.min(360, page.widthPx - 60)
  const maxHeight = Math.min(280, page.heightPx - 60)
  const scale = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight, 1)
  const width = Math.max(80, Math.round(naturalWidth * scale))
  const height = Math.max(80, Math.round(naturalHeight * scale))

  return {
    id: crypto.randomUUID(),
    type: 'image',
    title: name || `Image ${index + 1}`,
    src,
    x: Math.min(40 + index * 18, page.widthPx - width - 20),
    y: Math.min(40 + index * 18, page.heightPx - height - 20),
    width,
    height,
    naturalWidth,
    naturalHeight,
    lockAspectRatio: true,
    opacity: 1,
  }
}

export default function App() {
  const [pageSize, setPageSize] = useState('A4')
  const [orientation, setOrientation] = useState('landscape')
  const [boxes, setBoxes] = useState([makeBox(0)])
  const [selectedId, setSelectedId] = useState(null)
  const fileInputRef = useRef()
  const imageInputRef = useRef()
  const stageRef = useRef()

  const page = useMemo(() => getPageSize(pageSize, orientation), [pageSize, orientation])
  const selectedBox = boxes.find((box) => box.id === selectedId) ?? null

  function updateBox(id, changes) {
    setBoxes((current) => current.map((box) => (box.id === id ? { ...box, ...changes } : box)))
  }

  function addBox() {
    const newBox = makeBox(boxes.length)
    newBox.x = Math.min(newBox.x, page.widthPx - newBox.width - 20)
    newBox.y = Math.min(newBox.y, page.heightPx - newBox.height - 20)
    setBoxes((current) => [...current, newBox])
    setSelectedId(newBox.id)
  }

  function addImageFromFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const newImage = makeImageBox(
          {
            src: reader.result,
            name: file.name.replace(/\.[^.]+$/, ''),
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
          },
          boxes.length,
          page,
        )
        setBoxes((current) => [...current, newImage])
        setSelectedId(newImage.id)
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function replaceImage(id, event) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const image = new Image()
      image.onload = () => {
        const current = boxes.find((box) => box.id === id)
        const nextWidth = current?.width ?? image.naturalWidth
        const nextHeight = current?.lockAspectRatio !== false
          ? nextWidth * (image.naturalHeight / image.naturalWidth)
          : current?.height ?? image.naturalHeight
        updateBox(id, {
          title: file.name.replace(/\.[^.]+$/, ''),
          src: reader.result,
          naturalWidth: image.naturalWidth,
          naturalHeight: image.naturalHeight,
          width: nextWidth,
          height: nextHeight,
        })
      }
      image.src = reader.result
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function duplicateBox(id) {
    const source = boxes.find((box) => box.id === id)
    if (!source) return
    const copy = {
      ...source,
      id: crypto.randomUUID(),
      title: `${source.title} copy`,
      x: Math.min(source.x + 25, page.widthPx - source.width - 10),
      y: Math.min(source.y + 25, page.heightPx - source.height - 10),
    }
    setBoxes((current) => [...current, copy])
    setSelectedId(copy.id)
  }

  function deleteBox(id) {
    setBoxes((current) => current.filter((box) => box.id !== id))
    setSelectedId(null)
  }

  function autoArrange() {
    if (boxes.length === 0) return
    const margin = 24
    const gap = 18
    const columns = boxes.length <= 2 ? boxes.length : boxes.length <= 6 ? 2 : 3
    const rows = Math.ceil(boxes.length / columns)
    const width = (page.widthPx - margin * 2 - gap * (columns - 1)) / columns
    const height = (page.heightPx - margin * 2 - gap * (rows - 1)) / rows

    setBoxes((current) => current.map((box, index) => {
      const column = index % columns
      const row = Math.floor(index / columns)
      const cellX = margin + column * (width + gap)
      const cellY = margin + row * (height + gap)

      if (box.type === 'image' && box.lockAspectRatio !== false && box.naturalWidth && box.naturalHeight) {
        const scale = Math.min(width / box.naturalWidth, height / box.naturalHeight)
        const imageWidth = box.naturalWidth * scale
        const imageHeight = box.naturalHeight * scale
        return {
          ...box,
          x: cellX + (width - imageWidth) / 2,
          y: cellY + (height - imageHeight) / 2,
          width: imageWidth,
          height: imageHeight,
        }
      }

      return {
        ...box,
        x: cellX,
        y: cellY,
        width,
        height,
      }
    }))
  }

  function saveLayout() {
    const data = JSON.stringify({ pageSize, orientation, boxes }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'revision-mat-layout.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  function loadLayout(event) {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        setPageSize(data.pageSize || 'A4')
        setOrientation(data.orientation || 'landscape')
        setBoxes(Array.isArray(data.boxes) ? data.boxes : [])
        setSelectedId(null)
      } catch {
        alert('That file could not be opened. Please choose a saved revision mat JSON file.')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  function exportPdf() {
    setSelectedId(null)
    requestAnimationFrame(() => {
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 })
      const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format: pageSize.toLowerCase(),
      })
      pdf.addImage(dataUrl, 'PNG', 0, 0, page.widthMm, page.heightMm)
      pdf.save('revision-mat.pdf')
    })
  }

  function clearMat() {
    if (confirm('Clear every item from this revision mat?')) {
      setBoxes([])
      setSelectedId(null)
    }
  }

  return (
    <main className="app-shell">
      <Toolbar
        pageSize={pageSize}
        orientation={orientation}
        onPageSizeChange={setPageSize}
        onOrientationChange={setOrientation}
        onAddBox={addBox}
        onAddImageClick={() => imageInputRef.current?.click()}
        onAutoArrange={autoArrange}
        onSave={saveLayout}
        onLoadClick={() => fileInputRef.current?.click()}
        onExport={exportPdf}
        onClear={clearMat}
      />

      <section className="workspace">
        <header className="workspace-header">
          <div>
            <h1>Revision Mat Builder</h1>
            <p>{pageSize} · {orientation}</p>
          </div>
          <span>{boxes.length} item{boxes.length === 1 ? '' : 's'}</span>
        </header>

        <RevisionCanvas
          page={page}
          boxes={boxes}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          updateBox={updateBox}
          stageRef={stageRef}
        />
      </section>

      <PropertiesPanel
        selectedBox={selectedBox}
        updateBox={updateBox}
        duplicateBox={duplicateBox}
        deleteBox={deleteBox}
        replaceImage={replaceImage}
      />

      <input ref={fileInputRef} type="file" accept="application/json" hidden onChange={loadLayout} />
      <input ref={imageInputRef} type="file" accept="image/*" hidden onChange={addImageFromFile} />
    </main>
  )
}
