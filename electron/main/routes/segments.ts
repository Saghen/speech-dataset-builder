/**
 * Manages segments (prompt + audio) and assumes that the rootPath of each requests follows
 * a directory structure like so. Only prompts.txt needs to be provided to get started:
 *
 *   prompts.txt <- With each line representing a prompt like "The prompt for the voice actor"
 *   wavs
 *     0.wav
 *     1.wav
 *     2.wav
 */

import { createRouter } from '../router/router-impl'
import fs from 'fs/promises'
import path from 'path'
import assert from 'assert'

// Service
const getSegment = async (segments: Segment[], index: number): Promise<SegmentDetails> => {
  const segment = segments[index]
  assert(segment, `No segment exists at index ${index}`)

  const recordingPath = segment.recordingPath
  const hasRecording = await doesPathExist(recordingPath)
  const recordingDuration = !hasRecording ? undefined : await getRecordingDuration(recordingPath)

  return { ...segment, hasRecording, recordingDuration }
}

const getSegmentRecording = async (recordingPath: string): Promise<SegmentRecording> => {
  await assertPathExists(recordingPath)
  const audioData = await fs.readFile(recordingPath).then((data) => data.buffer)
  return { audioData, audioFormat: 'wav' }
}

const listSegments = async (rootPath: string) => {
  await assertPromptsExist(rootPath)
  const text = await fs.readFile(getPromptsPath(rootPath), 'utf-8')
  const prompts = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
  return prompts.map<Segment>((prompt, i) => ({
    index: i,
    recordingPath: getRecordingPath(rootPath, i),
    prompt,
  }))
}

const deleteSegment = async (recordingPath: string): Promise<void> => {
  await assertPathExists(recordingPath)
  await fs.rm(recordingPath)
}

// Helpers
const doesPathExist = (path: string) =>
  fs
    .stat(path)
    .then(() => true)
    .catch(() => false)
const assertPathExists = async (path: string) =>
  assert(await doesPathExist(path), `Path "${path}" does not exist`)

const getPromptsPath = (rootPath: string) => path.join(rootPath, 'prompts.txt')
const assertPromptsExist = (rootPath: string) => assertPathExists(getPromptsPath(rootPath))

const getRecordingPath = (rootPath: string, index: number) => path.join(rootPath, `wavs/${index}.wav`)
const getRecordingDuration = (path: string) =>
  import('music-metadata').then((mm) => mm.parseFile(path)).then((val) => val.format.duration)

// Routes
export enum Endpoints {
  get = 'get',
  getRecording = 'get-recording',
  list = 'list',
  delete = 'delete',
  exportMetadata = 'export-metadata',
}

export default createRouter('segments', {
  [Endpoints.get]: async ({
    rootPath,
    index,
  }: {
    rootPath: string
    index: number
  }): Promise<SegmentDetails> => listSegments(rootPath).then((segments) => getSegment(segments, index)),
  [Endpoints.getRecording]: async ({ recordingPath }: { recordingPath: string }): Promise<SegmentRecording> =>
    getSegmentRecording(recordingPath),
  // [Endpoints.list]: async ({ rootPath }: { rootPath: string }): Promise<Segment[]> => listSegments(rootPath),
  [Endpoints.list]: async ({ rootPath }: { rootPath: string }): Promise<SegmentDetails[]> =>
    listSegments(rootPath).then((segments) =>
      Promise.all(segments.map((segment) => getSegment(segments, segment.index)))
    ),
  [Endpoints.delete]: async ({ recordingPath }: { recordingPath: string }): Promise<void> =>
    deleteSegment(recordingPath),
  [Endpoints.exportMetadata]: async ({ recordingPath }: { recordingPath: string }) => {
    const segmentsWithAudio = await listSegments(recordingPath)
      .then((segments) => Promise.all(segments.map((_, i) => getSegment(segments, i))))
      .then((segments) => segments.filter((segment) => segment.hasRecording))
    const metadata = segmentsWithAudio
      .map((segment) => `${path.basename(segment.recordingPath)}|${segment.prompt}`)
      .join('\n')
    await fs.writeFile(path.join(recordingPath, 'metadata.csv'), metadata)
  },
})

// Types
export type Segment = {
  index: number
  recordingPath: string
  prompt: string
}
export type SegmentDetails = Segment & {
  hasRecording: boolean
  /** In seconds */
  recordingDuration?: number
}
export type SegmentRecording = {
  audioData: ArrayBuffer
  audioFormat: 'wav'
}
