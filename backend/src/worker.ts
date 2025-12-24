// src/worker.ts
import dotenv from 'dotenv';
dotenv.config();

import { startIngestionWorker } from './jobs/workers/ingestion.worker';

try{
    startIngestionWorker();
}
catch(err : any){
    console.error('Worker failed to start', err);
    process.exit(1);
}