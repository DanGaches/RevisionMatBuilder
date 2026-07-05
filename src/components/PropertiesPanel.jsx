import { useRef } from 'react'

export default function PropertiesPanel({ selectedBox, updateBox, duplicateBox, deleteBox, replaceImage }) {
  const imageInputRef = useRef()

  function updateImageSize(changes) {
    if (selectedBox.type !== 'image' || selectedBox.lockAspectRatio === false) {
      updateBox(selectedBox.id, changes)
      return
    }

    const ratio = selectedBox.naturalWidth && selectedBox.naturalHeight
      ? selectedBox.naturalHeight / selectedBox.naturalWidth
      : selectedBox.height / selectedBox.width

    if ('width' in changes) {
      updateBox(selectedBox.id, {
        width: changes.width,
        height: changes.width * ratio,
      })
      return
    }

    if ('height' in changes) {
      updateBox(selectedBox.id, {
        width: changes.height / ratio,
        height: changes.height,
      })
      return
    }

    updateBox(selectedBox.id, changes)
  }

  if (!selectedBox) {
    return (
      <aside className="panel properties empty-state">
        <h2>Item settings</h2>
        <p>Select a question box or image to edit it.</p>
      </aside>
    )
  }

  if (selectedBox.type === 'image') {
    return (
      <aside className="panel properties">
        <h2>Image settings</h2>

        <label>
          Image name
          <input
            value={selectedBox.title}
            onChange={(e) => updateBox(selectedBox.id, { title: e.target.value })}
          />
        </label>

        <button onClick={() => imageInputRef.current?.click()}>Replace image</button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => replaceImage(selectedBox.id, event)}
        />

        <div className="two-column">
          <label>
            Width
            <input
              type="number"
              min="60"
              value={Math.round(selectedBox.width)}
              onChange={(e) => updateImageSize({ width: Number(e.target.value) })}
            />
          </label>

          <label>
            Height
            <input
              type="number"
              min="60"
              value={Math.round(selectedBox.height)}
              onChange={(e) => updateImageSize({ height: Number(e.target.value) })}
            />
          </label>
        </div>

        <label>
          Opacity
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={selectedBox.opacity ?? 1}
            onChange={(e) => updateBox(selectedBox.id, { opacity: Number(e.target.value) })}
          />
        </label>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={selectedBox.lockAspectRatio !== false}
            onChange={(e) => updateBox(selectedBox.id, { lockAspectRatio: e.target.checked })}
          />
          Keep image proportions
        </label>

        <div className="button-row">
          <button onClick={() => duplicateBox(selectedBox.id)}>Duplicate</button>
          <button className="danger" onClick={() => deleteBox(selectedBox.id)}>Delete</button>
        </div>
      </aside>
    )
  }

  const questionsText = selectedBox.questions.join('\n')

  return (
    <aside className="panel properties">
      <h2>Question settings</h2>

      <label>
        Section title
        <input
          value={selectedBox.title}
          onChange={(e) => updateBox(selectedBox.id, { title: e.target.value })}
        />
      </label>

      <label>
        Questions <span className="small">(one per line)</span>
        <textarea
          rows="9"
          value={questionsText}
          onChange={(e) =>
            updateBox(selectedBox.id, {
              questions: e.target.value.split('\n'),
            })
          }
        />
      </label>

      <label>
        Question layout
        <select
          value={selectedBox.questionLayout || 'compact'}
          onChange={(e) => updateBox(selectedBox.id, { questionLayout: e.target.value })}
        >
          <option value="compact">Top of box</option>
          <option value="spaced">Spread through box</option>
        </select>
      </label>

      <div className="two-column">
        <label>
          Text size
          <input
            type="number"
            min="9"
            max="30"
            value={selectedBox.fontSize}
            onChange={(e) => updateBox(selectedBox.id, { fontSize: Number(e.target.value) })}
          />
        </label>

        <label>
          Title size
          <input
            type="number"
            min="11"
            max="36"
            value={selectedBox.titleFontSize}
            onChange={(e) => updateBox(selectedBox.id, { titleFontSize: Number(e.target.value) })}
          />
        </label>
      </div>

      <label>
        {selectedBox.questionLayout === 'spaced' ? 'Lines per question' : 'Answer lines'}
        <input
          type="number"
          min="0"
          max="20"
          value={selectedBox.answerLines}
          onChange={(e) => updateBox(selectedBox.id, { answerLines: Number(e.target.value) })}
        />
      </label>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={selectedBox.linedSpace}
          onChange={(e) => updateBox(selectedBox.id, { linedSpace: e.target.checked })}
        />
        Show writing lines
      </label>

      <label>
        Background
        <input
          type="color"
          value={selectedBox.background}
          onChange={(e) => updateBox(selectedBox.id, { background: e.target.value })}
        />
      </label>

      <div className="button-row">
        <button onClick={() => duplicateBox(selectedBox.id)}>Duplicate</button>
        <button className="danger" onClick={() => deleteBox(selectedBox.id)}>Delete</button>
      </div>
    </aside>
  )
}
