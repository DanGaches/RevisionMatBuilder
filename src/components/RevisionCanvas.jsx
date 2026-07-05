import React, { useEffect, useRef, useState } from 'react'
import { Stage, Layer, Rect, Text, Line, Transformer, Group, Image as KonvaImage } from 'react-konva'

function useCanvasImage(src) {
  const [image, setImage] = useState(null)

  useEffect(() => {
    if (!src) {
      setImage(null)
      return
    }

    const nextImage = new window.Image()
    nextImage.onload = () => setImage(nextImage)
    nextImage.src = src
  }, [src])

  return image
}

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
  const questionItems = box.questions.filter((q) => q.trim().length > 0)

  const questionY = titleHeight + 8
  const lineStartY = Math.max(questionY + 45, box.height - box.answerLines * 22 - 12)
  const contentBottom = box.height - padding
  const contentHeight = Math.max(35, contentBottom - questionY)

  function renderCompactQuestions() {
    return (
      <>
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
      </>
    )
  }

  function renderSpacedQuestions() {
    if (questionItems.length === 0) {
      return (
        <Text
          x={padding}
          y={questionY}
          width={box.width - padding * 2}
          height={contentHeight}
          text="Type questions in the panel"
          fontSize={box.fontSize}
          lineHeight={1.35}
          fill="#111827"
          wrap="word"
        />
      )
    }

    const slotHeight = contentHeight / questionItems.length

    return questionItems.map((question, index) => {
      const slotTop = questionY + slotHeight * index
      const questionHeight = Math.min(Math.max(box.fontSize * 1.7, 30), Math.max(30, slotHeight * 0.38))
      const lineStart = slotTop + questionHeight + 10
      const maxLines = Math.max(0, Math.floor((slotTop + slotHeight - lineStart - 4) / 22))
      const linesToDraw = Math.min(box.answerLines, maxLines)

      return (
        <React.Fragment key={`${box.id}-${index}`}>
          <Text
            x={padding}
            y={slotTop}
            width={box.width - padding * 2}
            height={questionHeight}
            text={`${index + 1}. ${question}`}
            fontSize={box.fontSize}
            fontStyle="bold"
            lineHeight={1.25}
            fill="#111827"
            wrap="word"
          />
          {box.linedSpace && Array.from({ length: linesToDraw }).map((_, lineIndex) => {
            const y = lineStart + lineIndex * 22
            return (
              <Line
                key={lineIndex}
                points={[padding, y, box.width - padding, y]}
                stroke="#9ca3af"
                strokeWidth={1}
              />
            )
          })}
        </React.Fragment>
      )
    })
  }

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
        {box.questionLayout === 'spaced' ? renderSpacedQuestions() : renderCompactQuestions()}
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

function ImageBox({ box, selected, onSelect, onChange }) {
  const groupRef = useRef()
  const transformerRef = useRef()
  const image = useCanvasImage(box.src)

  useEffect(() => {
    if (selected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [selected, image])

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
            width: Math.max(60, node.width() * scaleX),
            height: Math.max(60, node.height() * scaleY),
          })
        }}
      >
        <Rect
          width={box.width}
          height={box.height}
          fill="#f8fafc"
          stroke={selected ? '#2563eb' : '#cbd5e1'}
          strokeWidth={selected ? 3 : 1}
          cornerRadius={8}
        />
        {image ? (
          <KonvaImage
            image={image}
            width={box.width}
            height={box.height}
            opacity={box.opacity ?? 1}
            cornerRadius={8}
          />
        ) : (
          <Text
            width={box.width}
            height={box.height}
            text="Loading image"
            fontSize={16}
            fill="#64748b"
            align="center"
            verticalAlign="middle"
          />
        )}
      </Group>
      {selected && (
        <Transformer
          ref={transformerRef}
          rotateEnabled={false}
          keepRatio={box.lockAspectRatio !== false}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 60 || newBox.height < 60) return oldBox
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
            {boxes.map((box) => {
              const Item = box.type === 'image' ? ImageBox : QuestionBox
              return (
                <Item
                  key={box.id}
                  box={box}
                  selected={box.id === selectedId}
                  onSelect={() => setSelectedId(box.id)}
                  onChange={(changes) => updateBox(box.id, changes)}
                />
              )
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  )
}
