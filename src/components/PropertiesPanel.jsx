export default function PropertiesPanel({ selectedBox, updateBox, duplicateBox, deleteBox }) {
  if (!selectedBox) {
    return (
      <aside className="panel properties empty-state">
        <h2>Box settings</h2>
        <p>Select a question box to edit it.</p>
      </aside>
    )
  }

  const questionsText = selectedBox.questions.join('\n')

  return (
    <aside className="panel properties">
      <h2>Box settings</h2>

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
        Answer lines
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
