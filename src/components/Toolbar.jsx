export default function Toolbar({
  pageSize,
  orientation,
  onPageSizeChange,
  onOrientationChange,
  onAddBox,
  onAddImageClick,
  onAutoArrange,
  onSave,
  onLoadClick,
  onExport,
  onClear,
}) {
  return (
    <aside className="panel toolbar">
      <h2>Revision Mat</h2>

      <label>
        Paper size
        <select value={pageSize} onChange={(e) => onPageSizeChange(e.target.value)}>
          <option value="A4">A4</option>
          <option value="A3">A3</option>
        </select>
      </label>

      <label>
        Orientation
        <select value={orientation} onChange={(e) => onOrientationChange(e.target.value)}>
          <option value="landscape">Landscape</option>
          <option value="portrait">Portrait</option>
        </select>
      </label>

      <button className="primary" onClick={onAddBox}>+ Add question box</button>
      <button onClick={onAddImageClick}>+ Add image</button>
      <button onClick={onAutoArrange}>Arrange automatically</button>

      <div className="divider" />

      <button onClick={onSave}>Save layout</button>
      <button onClick={onLoadClick}>Open layout</button>
      <button onClick={onExport}>Export PDF</button>
      <button className="danger" onClick={onClear}>Clear mat</button>

      <p className="hint">
        Drag items to move them. Select an item and use its handles to resize it.
      </p>
    </aside>
  )
}
