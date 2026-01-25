import { log } from 'console';
import { insertChunks } from '../../models/Chunk';

export async function saveChunks(
  documentId: string,
  userId: string,
  chunks: string[],
  embeddings: number[][]
) {
  try{
    await insertChunks(documentId, userId, chunks, embeddings);
  }
  catch(e){
    log("error while saving the chunks ", e);
    return;
  }
}
