import { fetch, useFetch } from '@/router/fetch'
import { SegmentDetails } from 'electron/main/routes/segments'
import { useEffect, useState } from 'react'

export const useRecorder = (selectedDir: string, onRecordingError: (err: any) => void) => {
  const { data: segmentsInitial, error } = useFetch('/segments/list', { rootPath: selectedDir })
  const [segments, setSegments] = useState<SegmentDetails[]>()
  const [segmentIndex, setSegmentIndex] = useState(0)
  const [recordingStartDate, setRecordingStartDate] = useState<Date | undefined>()

  useEffect(() => {
    if (!segmentsInitial) return
    setSegments(segmentsInitial)
    setSegmentIndex(segmentsInitial.findIndex((segment) => !segment.hasRecording))
    console.log(segmentsInitial.filter(segment => segment.hasRecording).map(segment => segment.recordingDuration))
  }, [segmentsInitial])

  if (!segments && !error) return {}
  if (error) return { error }

  const start = (segmentIndex: number) => {
    const recordingStartDate = new Date()
    setRecordingStartDate(recordingStartDate)
    fetch('/record/start', { path: segments![segmentIndex].recordingPath })
      .then(() => {
        setSegments([
          ...segments!.slice(0, segmentIndex),
          {
            ...segments![segmentIndex],
            hasRecording: true,
            recordingDuration: (Number(new Date()) - Number(recordingStartDate)) / 1000,
          },
          ...segments!.slice(segmentIndex + 1),
        ])
      })
      .catch(onRecordingError)
      .finally(() => setRecordingStartDate(undefined))
  }
  const stop = () => fetch('/record/stop')

  return {
    isRecording: recordingStartDate !== undefined,
    recordingStartDate,
    start,
    stop,
    segments,
    segmentIndex,
    setSegmentIndex,
  }
}

export const useRecordingDuration = (recordingStartDate: Date | undefined) => {
  const [_, forceRerender] = useState(false)
  useEffect(() => {
    const intervalId = setInterval(() => forceRerender((val) => !val), 100)
    return () => clearInterval(intervalId)
  }, [])
  return recordingStartDate !== undefined ? (Number(new Date()) - Number(recordingStartDate)) / 1000 : 0
}
