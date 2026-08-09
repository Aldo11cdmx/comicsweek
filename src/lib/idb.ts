import Dexie from 'dexie'
import type { Comic } from '../types'

const dbName = 'comicsweek-db'
const dbVersion = 1

let dbInstance: Dexie | null = null

async function getDB(): Promise<Dexie> {
  if (dbInstance) return dbInstance

  dbInstance = new Dexie(dbName)
  dbInstance.version(dbVersion).stores({
    comics: 'id, importedAt, lastReadAt',
    files: 'id',
  })

  return dbInstance
}

export async function saveComic(comic: Comic): Promise<void> {
  const db = await getDB()
  await db.table('comics').put(comic)
}

export async function getComic(id: string): Promise<Comic | undefined> {
  const db = await getDB()
  return db.table('comics').get(id)
}

export async function getAllComics(): Promise<Comic[]> {
  const db = await getDB()
  return db.table('comics').toArray()
}

export async function deleteComic(id: string): Promise<void> {
  const db = await getDB()
  await db.table('comics').delete(id)
  await db.table('files').delete(id)
}

export async function saveFile(id: string, file: File): Promise<void> {
  const db = await getDB()
  await db.table('files').put({ id, blob: file })
}

export async function getFile(id: string): Promise<File | undefined> {
  const db = await getDB()
  const record = await db.table('files').get(id)
  if (!record) return undefined
  return new File([record.blob], 'comic', { type: record.blob.type || 'application/octet-stream' })
}
