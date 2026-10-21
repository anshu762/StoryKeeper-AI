/**
 * Lightweight browser-side PCM WAV Encoder using standard Web Audio API.
 * Converts AudioBuffer into a 16-bit linear PCM WAV Blob (ideal for Whisper STT).
 */

export function audioBufferToWav(
  buffer: AudioBuffer,
  targetSampleRate = 16000
): Blob {
  const numChannels = 1; // Downmix to mono for speech
  const sourceSampleRate = buffer.sampleRate;
  const sourceData = buffer.getChannelData(0);

  // Resample to targetSampleRate (e.g. 16kHz)
  const resampledLength = Math.round(
    (sourceData.length * targetSampleRate) / sourceSampleRate
  );
  const resampledData = new Float32Array(resampledLength);

  for (let i = 0; i < resampledLength; i++) {
    const sourceIdx = (i * sourceSampleRate) / targetSampleRate;
    const lower = Math.floor(sourceIdx);
    const upper = Math.min(lower + 1, sourceData.length - 1);
    const fraction = sourceIdx - lower;
    resampledData[i] =
      sourceData[lower] * (1 - fraction) + sourceData[upper] * fraction;
  }

  // Create WAV container (RIFF format)
  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = targetSampleRate * blockAlign;
  const dataSize = resampledLength * blockAlign;
  const bufferSize = 44 + dataSize;
  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, "RIFF");
  // File size - 8
  view.setUint32(4, 36 + dataSize, true);
  // RIFF type 'WAVE'
  writeString(view, 8, "WAVE");

  // Format chunk identifier 'fmt '
  writeString(view, 12, "fmt ");
  // Format chunk length (16 for PCM)
  view.setUint32(16, 16, true);
  // Sample format (1 = PCM)
  view.setUint16(20, 1, true);
  // Channel count
  view.setUint16(22, numChannels, true);
  // Sample rate
  view.setUint32(24, targetSampleRate, true);
  // Byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true);
  // Block align (channels * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // Bits per sample
  view.setUint16(34, 16, true);

  // Data chunk identifier 'data'
  writeString(view, 36, "data");
  // Data chunk length
  view.setUint32(40, dataSize, true);

  // Write PCM audio samples (clamped Float32 to 16-bit signed Int)
  let offset = 44;
  for (let i = 0; i < resampledLength; i++) {
    const s = Math.max(-1, Math.min(1, resampledData[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([view], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
