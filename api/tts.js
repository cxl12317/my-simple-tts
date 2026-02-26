export default async function handler(req, res) {
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: '缺少文本参数' });
  }

  try {
    // 微软 Edge TTS 官方服务配置
    const voice = 'zh-CN-XiaoxiaoNeural'; // 中文音色“晓晓”
    const endpoint = 'https://eastus.tts.speech.microsoft.com/cognitiveservices/v1';

    // 构造 SSML（语音合成标记语言）请求体
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="zh-CN">
        <voice name="${voice}">${text}</voice>
      </speak>
    `;

    // 发送请求到微软 TTS 服务
    const ttsResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      body: ssml
    });

    if (!ttsResponse.ok) {
      const errorDetails = await ttsResponse.text();
      throw new Error(`微软TTS服务调用失败 (${ttsResponse.status}): ${errorDetails}`);
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
