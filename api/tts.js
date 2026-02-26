export default async function handler(req, res) {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: '缺少文本参数' });
  }

  try {
    // 调用微软Edge TTS API（免费，无密钥）
    const ttsResponse = await fetch(`https://api.lb-0.hcjing.workers.dev/tts?text=${encodeURIComponent(text)}&voice=zh-CN-XiaoxiaoNeural`);
    
    if (!ttsResponse.ok) {
      throw new Error('TTS服务调用失败');
    }

    const audioBuffer = await ttsResponse.arrayBuffer();

    // 设置响应头，返回音频文件
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="tts_output.mp3"`);
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
