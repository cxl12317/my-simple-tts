export default async function handler(req, res) {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: '缺少文本参数' });
  }

  try {
    // 使用更稳定的 Edge TTS 代理服务
    const ttsResponse = await fetch(
      `https://edge-tts.deno.dev/api/tts?text=${encodeURIComponent(text)}&voice=zh-CN-XiaoxiaoNeural`
    );
    
    if (!ttsResponse.ok) {
      const errorDetails = await ttsResponse.text();
      throw new Error(`TTS服务调用失败 (${ttsResponse.status}): ${errorDetails}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    // 设置响应头，返回音频文件
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="tts_output.mp3"`);
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('TTS API Error:', error);
    res.status(500).json({ error: error.message || '下载失败' });
  }
}
