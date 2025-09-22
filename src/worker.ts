import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { PostgresStreamRepository } from '@src/infrastructure/persistence/postgres/repositories/PostgresStreamRepository';
import { PostgresVodRepository } from '@src/infrastructure/persistence/postgres/repositories/PostgresVodRepository';
import { ProcessVODUseCase, IProcessVODDTO } from '@src/application/use-cases/vod/ProcessVOD.usecase';
import { FfmpegVideoProcessor } from '@src/infrastructure/media/FfmpegVideoProcessor';
import { LocalStorage } from '@src/infrastructure/storage/LocalStorage';
import * as path from 'path';

// --- 1. Composition Root ---
console.log('Initializing VOD worker dependencies...');
const prisma = new PrismaClient();
const streamRepository = new PostgresStreamRepository(prisma);
const vodRepository = new PostgresVodRepository(prisma);

// Storage and Video Processor setup
const publicDir = path.join(__dirname, '../public'); 
const baseUrl = process.env.BASE_URL || 'http://localhost:8000';
const storage = new LocalStorage(publicDir, `${baseUrl}/static`);
const videoProcessor = new FfmpegVideoProcessor();

const processVODUseCase = new ProcessVODUseCase(
  vodRepository,
  streamRepository,
  videoProcessor,
  storage
);
console.log('Dependencies initialized.');

// --- 2. Worker Definition ---
const connectionOptions = {
  host: process.env.REDIS_HOST || 'redis', // Use service name for Docker network
  port: Number(process.env.REDIS_PORT) || 6379,
};

const worker = new Worker('vod-processing', async (job: Job<IProcessVODDTO>) => {
  console.log(`[Worker] Processing VOD job ${job.id} for stream ${job.data.streamId}`);
  
  try {
    // In a real app, the recorded file path would come from the media server.
    // For local testing, we need to simulate this.
    // We assume recordings are saved in a known directory.
    const streamId = job.data.streamId;
    const recordedFilePath = path.join(__dirname, '../media/live', `${streamId}.flv`);
    
    const jobDataWithFullPath = {
      ...job.data,
      recordedFilePath,
    };

    await processVODUseCase.execute(jobDataWithFullPath);
    console.log(`[Worker] Finished VOD job ${job.id}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Worker] VOD job ${job.id} failed: ${errorMessage}`, error);
    // Re-throw the error to make the job fail
    throw error;
  }
}, {
  connection: connectionOptions,
  concurrency: 5, // Process up to 5 jobs concurrently
});

// --- 3. Event Listeners ---
worker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} has completed.`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} has failed with error: ${err.message}`);
});

console.log('VOD worker started and is listening for jobs on the \'vod-processing\' queue...');

// --- 4. Graceful Shutdown ---
const gracefulShutdown = async () => {
  console.log('Closing VOD worker...');
  await worker.close();
  await prisma.$disconnect();
  console.log('Worker closed gracefully.');
  process.exit(0);
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);