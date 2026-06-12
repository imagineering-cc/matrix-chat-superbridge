// AudioWorklet processor: mic float32 → PCM16 frames posted to the main
// thread, which base64s them into input_audio_buffer.append events.
// Same pattern as embodied-dreamfinder/mic-worklet.js.
class MicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0] || input[0].length === 0) return true;

    const float32 = input[0];
    const pcm16 = new Int16Array(float32.length);
    for (let i = 0; i < float32.length; i++) {
      const s = Math.max(-1, Math.min(1, float32[i]));
      pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    return true;
  }
}

registerProcessor("mic-processor", MicProcessor);
