import { Worker } from 'bullmq';

console.log('VOD worker process started');

const worker = new Worker('vod-processing', async job => {
  console.log(`Processing VOD job for stream ${job.data.streamId}`);
  console.log('Job data:', job.data);

  // TODO: Implement actual VOD processing logic
  // 1. Download the recorded stream file (e.g., using ffmpeg)
  // 2. Transcode to MP4 or other formats
  // 3. Generate thumbnails
  // 4. Upload processed files to a storage service (like S3)
  // 5. Create a VOD record in the database with metadata

  // For now, just simulate a processing time
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log(`Finished processing VOD for stream ${job.data.streamId}`);
}, {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
  // It's good practice to limit the number of concurrent jobs
  concurrency: 5, 
});

worker.on('completed', job => {
  console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} has failed with error ${err.message}`);
});

process.on('SIGINT', () => worker.close());
