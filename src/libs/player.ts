import { fetch } from '@/router/fetch'
import { useEffect, useState } from 'react'

const arrayBufferToBase64 = (arrayBuffer: ArrayBuffer) =>
  btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''))

export const usePlayer = (playbackRate: number = 2) => {
  const [audio, setAudio] = useState<HTMLAudioElement>()

  // Ensure the audio pauses when updated
  useEffect(() => () => audio?.pause(), [audio])

  const play = async (recordingPath: string | undefined) => {
    if (!recordingPath) return
    const { audioData, audioFormat } = await fetch('/segments/get-recording', { recordingPath }).catch(
      () => ({ audioData: new ArrayBuffer(0), audioFormat: 'wav' })
    )
    const audio = new Audio(`data:audio/${audioFormat};base64,${arrayBufferToBase64(audioData)}`)
    audio.playbackRate = playbackRate
    audio.play()
    setAudio(audio)
  }
  const pause = () => audio?.pause()

  return {
    play,
    pause,
    getIsPlaying: () => !(audio?.paused ?? true)
  }
}

export const useRecordingDuration = (recordingStartDate: Date | undefined) => {
  const [, forceRerender] = useState(false)
  useEffect(() => {
    const intervalId = setInterval(() => forceRerender((val) => !val), 100)
    return () => clearInterval(intervalId)
  }, [])
  return recordingStartDate !== undefined ? (Number(new Date()) - Number(recordingStartDate)) / 1000 : 0
}
