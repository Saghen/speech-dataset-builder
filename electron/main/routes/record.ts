import { createRouter } from '../router/router-impl'
import portAudio from 'naudiodon'
import { createWriteStream } from 'fs'
import { Writer } from 'wav'
import { mkdir } from 'fs/promises'
import { dirname } from 'path'

export enum Endpoints {
  start = 'start',
  stop = 'stop'
}

const bitsPerSample = portAudio.SampleFormat16Bit
const sampleRate = 48000

let audioRecorder: portAudio.IoStreamRead

export default createRouter('record', {
  [Endpoints.start]: async ({ path }: { path: string }) => {
    if (!path) throw Error('Output path not specified')
    await mkdir(dirname(path), { recursive: true })
    audioRecorder = portAudio.AudioIO({
      inOptions: {
        framesPerBuffer: 1,
        channelCount: 1,
        sampleFormat: bitsPerSample,
        sampleRate,
        deviceId: -1, // Use -1 or omit the deviceId to select the default device
        closeOnError: true, // Close the stream if an audio error is detected, if set false then just log the error
      },
    })
    const wavWriter = new Writer({
      channels: 1,
      bitDepth: bitsPerSample,
      sampleRate,
    })
    audioRecorder.start()
    audioRecorder.pipe(wavWriter).pipe(createWriteStream(path))
    return new Promise((resolve, reject) => {
      audioRecorder.on('close', resolve)
      audioRecorder.on('error', reject)
    })
  },
  [Endpoints.stop]: () =>
    new Promise<void>((resolve) => audioRecorder.quit(resolve)),
})
