import { Button, Typography } from '@/components'
import styled from '@emotion/styled'
import type { Segment, SegmentDetails } from 'electron/main/routes/segments'
import { Column, Grid, Row } from 'lese'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useRecorder, useRecordingDuration } from './libs/recorder'
import { fetch } from './router/fetch'
import { formatNumberDuration } from './utils'

const App: React.FC = () => {
  const [selectedDir, setSelectedDir] = useState<string | undefined>()

  if (!selectedDir) return <PickFolder onFolderSelect={setSelectedDir} />
  return <Record selectedDir={selectedDir} clearSelectedDir={() => setSelectedDir(undefined)} />
}

export default App

const PickFolder: React.FC<{ onFolderSelect: (folder: string) => void }> = ({ onFolderSelect }) => {
  return (
    <Column separation="24px" align>
      <Typography fontSize="32px">Pick your dataset folder</Typography>
      <Button onClick={() => fetch('/dialog/open').then(onFolderSelect)}>Select Folder</Button>
      {/* <input ref={inputRef} type="file" webkitdirectory style={{ display: 'none' }} /> */}
    </Column>
  )
}

const Record: React.FC<{ selectedDir: string; clearSelectedDir: () => void }> = ({
  selectedDir,
  clearSelectedDir,
}) => {
  const [recordingError, setRecordingError] = useState()
  const recorder = useRecorder(selectedDir, setRecordingError)

  const toggleRecording = async () => {
    if (!recorder.segments) return
    if (!recorder.isRecording) return recorder.start(recorder.segmentIndex)
    await recorder.stop()
    // Move to next segment without a recording
    recorder.setSegmentIndex(
      recorder.segments.slice(recorder.segmentIndex + 1).findIndex((segment) => !segment.hasRecording) +
        recorder.segmentIndex +
        1
    )
  }

  return (
    <Grid rows="60px 1fr auto" columns="1fr 1fr 1fr" xAlign="space-between" gap="16px">
      <ReSelectFolderButton onClick={() => clearSelectedDir()} style={{ justifySelf: 'start' }}>
        Re-select folder
      </ReSelectFolderButton>
      <Row align separation="2px">
        <Typography color="#ccc" fontSize="18px">
          Segment #
        </Typography>
        <input
          type="number"
          value={(recorder.segmentIndex ?? 0) + 1}
          onChange={(e) => recorder.setSegmentIndex?.(Number(e.target.value) - 1)}
          style={{
            width: '48px',
            fontSize: '18px',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#ccc',
            transform: 'translateY(1px)',
          }}
        />
      </Row>
      {/* <Typography color="#f7443d">{String(recorder.error ?? recordingError ?? '')}</Typography> */}
      <TotalDuration
        segments={recorder.segments ?? []}
        segmentIndex={recorder.segmentIndex ?? 0}
        style={{ justifySelf: 'end' }}
      />
      {!recorder.segments && !recorder.error && (
        <Typography fontSize="32px" align>
          Loading segments...
        </Typography>
      )}
      {recorder.segments && (
        <>
          <SegmentsList
            segments={recorder.segments}
            segmentIndex={recorder.segmentIndex}
            onSegmentSelect={recorder.setSegmentIndex}
            style={{ gridColumn: '1/-1' }}
          />
          <Button onClick={() => fetch('/segments/export-metadata', { recordingPath: selectedDir })} background="transparent" style={{ alignSelf: "end", justifySelf: "start" }}>
            Export segments
          </Button>
          <RecordButton
            isRecording={Boolean(recorder.isRecording)}
            recordingStartDate={recorder.recordingStartDate}
            onClick={toggleRecording}
            style={{ gridColumn: '2', justifySelf: 'center', marginBottom: '24px' }}
          />
        </>
      )}
    </Grid>
  )
}

const RecordButtonStyled = styled('button')<{ size: string }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  outline: none;
  margin: 6px;
  border: none;
  border-radius: 50%;
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  background-color: #f7443d;
  color: #83221e;

  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    transition: all 0.2s;

    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.8);
  }
  &:hover {
    &::before {
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
    }
  }
`

const RecordButton: React.FC<{
  isRecording: boolean
  recordingStartDate: Date | undefined
  onClick: () => any
  style?: React.HTMLAttributes<HTMLDivElement>['style']
}> = ({ isRecording, recordingStartDate, onClick, style }) => {
  const recordingDuration = useRecordingDuration(recordingStartDate)
  return (
    <RecordButtonStyled size="128px" onClick={() => onClick()} style={style}>
      {!isRecording && <MicIcon size="48px" />}
      {isRecording && <Typography fontSize="30px">{formatNumberDuration(recordingDuration)}</Typography>}
    </RecordButtonStyled>
  )
}

const MicIcon: React.FC<{ size: string; color?: string }> = ({ size, color }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color ?? 'currentColor'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
)

const ReSelectFolderButton = styled(Button)`
  color: #ccc;
  background: transparent;
`

const TotalDurationText = styled(Button)`
  color: #ccc;
  background: transparent;
`

const TotalDuration: React.FC<{
  segments: SegmentDetails[]
  segmentIndex: number
  style: React.HTMLAttributes<HTMLDivElement>['style']
}> = ({ segments, segmentIndex, style }) => (
  <TotalDurationText style={style}>
    Total Duration:{' '}
    {formatNumberDuration(
      segments.reduce((duration, segment) => (segment.recordingDuration ?? 0) + duration, 0)
    )}{' '}
    {Boolean(segments[segmentIndex]?.recordingDuration) &&
      `(${formatNumberDuration(segments[segmentIndex].recordingDuration!)})`}
  </TotalDurationText>
)

const InactiveSegment = styled(Typography)`
  display: block;
  padding: 8px;
  cursor: pointer;
  text-align: center;
  font-size: 24px;
  user-select: none;

  transition: opacity 0.2s;
  opacity: 0.5;
  &:hover {
    opacity: 1;
  }
`

const ActiveSegment = styled(Typography)`
  padding: 8px;
  font-size: 24px;
  text-align: center;
  user-select: none;
`

const SegmentListContainer = styled(Column)<{ atTop: boolean; atBottom: boolean }>`
  overflow-y: scroll;
  ::-webkit-scrollbar {
    display: none;
  }
  transition: mask-image 0.2s;
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 1) ${({ atTop }) => (atTop ? '0%' : '20%')},
    rgba(0, 0, 0, 1) ${({ atBottom }) => (atBottom ? '100%' : '80%')},
    rgba(0, 0, 0, 0)
  );
`

const SegmentsList: React.FC<{
  segmentIndex: number
  segments: SegmentDetails[]
  onSegmentSelect: (index: number) => void
  style?: React.HTMLAttributes<HTMLDivElement>['style']
}> = ({ segmentIndex, segments, onSegmentSelect, style }) => {
  const [isFirstScroll, setIsFirstScroll] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)

  const updateScroll = useCallback(
    (avoidSmooth?: boolean) => {
      if (!listRef.current) return
      console.log(isFirstScroll, avoidSmooth)
      listRef.current.children[segmentIndex].scrollIntoView({
        behavior: isFirstScroll || avoidSmooth ? 'auto' : 'smooth',
        block: 'center',
      })
      listRef.current.style.visibility = 'visible'
      if (isFirstScroll) setIsFirstScroll(false)
    },
    [isFirstScroll, listRef.current, segmentIndex]
  )

  useEffect(() => {
    // Resize observer fires immediately once observe is called so ignore first call
    let isFirst = true
    const observer = new ResizeObserver(() => {
      updateScroll(!isFirst)
      isFirst = false
    })
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [updateScroll])

  return (
    <SegmentListContainer
      atTop={segmentIndex <= 2}
      atBottom={segmentIndex >= segments.length - 2}
      ref={listRef}
      style={{ ...style, visibility: 'hidden' }}
    >
      {segments.map((segment) =>
        segment.index === segmentIndex ? (
          <ActiveSegment key={segment.index}>
            {segment.hasRecording ? '✓ ' : ''}
            {segment.prompt}
          </ActiveSegment>
        ) : (
          <InactiveSegment key={segment.index} onClick={() => onSegmentSelect(segment.index)}>
            {segment.hasRecording ? '✓ ' : ''}
            {segment.prompt}
          </InactiveSegment>
        )
      )}
    </SegmentListContainer>
  )
}
