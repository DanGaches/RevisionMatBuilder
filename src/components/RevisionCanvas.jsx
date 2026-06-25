import React, { useEffect, useRef } from 'react'
import { Stage, Layer, Rect, Text, Line, Transformer, Group } from 'react-konva'

function QuestionBox({ box, selected, onSelect, onChange }) {
  const groupRef = useRef()
  const transformerRef = useRef()

  useEffect(() => {
    if (selected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [selected])

  const padding = 12
  const titleHeight = box.titleFontSize + 14
  const questionText = box.questions
    .filter((q) => q.trim().length > 0)
    .map((q, i) => `${i + 1}. ${q}`)
    .join('\n')

  const questionY = titleHeight + 8
  const lineStartY = Math.max(questionY + 45, box.height - box.answerLines * 22 - 12)

  return (
    <>
      <Group
        ref={groupRef}
        x={box.x}
        y={box.y}
        width={box.width}
        height={box.height}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={() => {
          const node = groupRef.current
          const scaleX = node.scaleX()
          const scaleY = node.scaleY()
          node.scaleX(1)
          node.scaleY(1)
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(140, node.width() * scaleX),
            height: Math.max(110, node.height() * scaleY),
          })
        }}
      >
        <Rect
          width={box.width}
          height={box.height}
          fill={box.background}
          stroke={selected ? '#2563eb' : '#111827'}
          strokeWidth={selected ? 3 : 1.5}
          cornerRadius={8}
          shadowColor="black"
          shadowBlur={selected ? 10 : 3}
          shadowOpacity={0.12}
          shadowOffsetY={2}
        />
        <Rect
          width={box.width}
          height={titleHeight}
          fill="#e5e7eb"
          cornerRadius={[8, 8, 0, 0]}
        />
        <Text
          x={padding}
          y={7}
          width={box.width - padding * 2}
          text={box.title || 'Untitled section'}
          fontSize={box.titleFontSize}
          fontStyle="bold"
          fill="#111827"
        />
        <Text
          x={padding}
          y={questionY}
          width={box.width - padding * 2}
          height={Math.max(35, lineStartY - questionY - 6)}
          text={questionText || 'Type questions in the panel'}
          fontSize={box.fontSize}
          lineHeight={1.35}
          fill="#111827"
          wrap="word"
        />
        {box.linedSpace && Array.from({ length: box.answerLines }).map((_, index) => {
          const y = lineStartY + index * 22
          return y < box.height - 8 ? (
            <Line
              key={index}
              points={[padding, y, box.width - padding, y]}
              stroke="#9ca3af"
              strokeWidth={1}
            />
          ) : null
        })}
      </Group>
      {selected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 140 || newBox.height < 110) return oldBox
            return newBox
          }}
        />
      )}
    </>
  )
}

export default function RevisionCanvas({ page, boxes, selectedId, setSelectedId, updateBox, stageRef }) {
  return (
    <div className="canvas-scroll">
      <div className="page-shadow" style={{ width: page.widthPx, height: page.heightPx }}>
        <Stage
          ref={stageRef}
          width={page.widthPx}
          height={page.heightPx}
          onMouseDown={(e) => {
            if (e.target === e.target.getStage()) setSelectedId(null)
          }}
        >
          <Layer>
            <Rect width={page.widthPx} height={page.heightPx} fill="white" />
            {boxes.map((box) => (
              <QuestionBox
                key={box.id}
                box={box}
                selected={box.id === selectedId}
                onSelect={() => setSelectedId(box.id)}
                onChange={(changes) => updateBox(box.id, changes)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
