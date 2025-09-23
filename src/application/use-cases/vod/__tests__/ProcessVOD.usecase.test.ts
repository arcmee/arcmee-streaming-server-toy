import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { ProcessVODUseCase } from '../ProcessVOD.usecase';
import { FakeVodRepository } from '@src/tests/fakes/FakeVodRepository';
import { FakeStreamRepository } from '@src/tests/fakes/FakeStreamRepository';
import { FakeVideoProcessor } from '@src/tests/fakes/FakeVideoProcessor';
import { FakeStorage } from '@src/tests/fakes/FakeStorage';
import { Stream } from '@src/domain/entities/stream.entity';

// Mock fs.rm to avoid issues with spying on ES module exports
jest.mock('fs/promises', () => ({
  ...jest.requireActual('fs/promises'),
  rm: jest.fn(),
}));

describe('ProcessVODUseCase', () => {
  let processVODUseCase: ProcessVODUseCase;
  let fakeVodRepository: FakeVodRepository;
  let fakeStreamRepository: FakeStreamRepository;
  let fakeVideoProcessor: FakeVideoProcessor;
  let fakeStorage: FakeStorage;
  let tempRecordingPath: string;

  beforeEach(async () => {
    // Clear mock history before each test
    (fs.rm as jest.Mock).mockClear();

    fakeVodRepository = new FakeVodRepository();
    fakeStreamRepository = new FakeStreamRepository();
    fakeVideoProcessor = new FakeVideoProcessor();
    fakeStorage = new FakeStorage();

    processVODUseCase = new ProcessVODUseCase(
      fakeVodRepository,
      fakeStreamRepository,
      fakeVideoProcessor,
      fakeStorage,
    );

    // Use the actual fs.mkdtemp and fs.writeFile for setup
    const actualFs = jest.requireActual('fs/promises');
    const tempDir = await actualFs.mkdtemp(path.join(os.tmpdir(), 'recording-'));
    tempRecordingPath = path.join(tempDir, 'test.flv');
    await actualFs.writeFile(tempRecordingPath, 'dummy video data');
  });

  afterEach(async () => {
    // Clean up the dummy recording file using the actual fs.rm
    const actualFs = jest.requireActual('fs/promises');
    await actualFs.rm(path.dirname(tempRecordingPath), { recursive: true, force: true });
    fakeStorage.clear();
  });

  it('should process a VOD, upload files, and save it to the database', async () => {
    // Arrange
    const stream = await fakeStreamRepository.create(
      new Stream({
        id: 'stream-1',
        userId: 'user-1',
        title: 'My Awesome Stream',
        description: '...',
        isLive: false,
        thumbnailUrl: null,
      }),
    );

    // Act
    const vod = await processVODUseCase.execute({
      streamId: stream.id,
      recordedFilePath: tempRecordingPath,
    });

    // Assert
    const vodInDb = await fakeVodRepository.findById(vod.id);
    expect(vodInDb).toBeDefined();
    expect(vodInDb?.duration).toBe(123.45);

    // Check that the mocked rm was called for cleanup
    expect(fs.rm).toHaveBeenCalled();
  });

  it('should throw an error if the stream does not exist', async () => {
    // Act & Assert
    await expect(
      processVODUseCase.execute({
        streamId: 'non-existent-stream',
        recordedFilePath: tempRecordingPath,
      }),
    ).rejects.toThrow('Stream with id non-existent-stream not found.');
  });

  it('should clean up temporary files even if an error occurs', async () => {
    // Arrange
    const stream = await fakeStreamRepository.create(
      new Stream({
        id: 'stream-1',
        userId: 'user-1',
        title: 'My Awesome Stream',
        description: '...',
        isLive: false,
        thumbnailUrl: null,
      }),
    );

    // Force an error during video processing
    jest
      .spyOn(fakeVideoProcessor, 'transcodeToHLS')
      .mockRejectedValueOnce(new Error('Transcoding failed'));

    // Act & Assert
    await expect(
      processVODUseCase.execute({
        streamId: stream.id,
        recordedFilePath: tempRecordingPath,
      }),
    ).rejects.toThrow('Transcoding failed');

    // Assert that cleanup was still called
    expect(fs.rm).toHaveBeenCalled();
  });
});