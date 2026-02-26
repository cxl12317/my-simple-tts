import gTTS from 'gtts';
import { WritableStreamBuffer } from 'stream-buffers';

export default async function handler(req, res) {
  // 允许跨域
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const { text } = req.query;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: '请输入要转换的文本' });
  }

  try {
    // 初始化 Google TTS（中文）
    const gtts = new gTTS(text, 'zh-CN');
    const streamBuffer = new WritableStreamBuffer();

    // 生成音频流
    await new Promise((resolve, reject) => {
      gtts.stream().pipe(streamBuffer)
        .on('finish', resolve)
        .on('error', reject);
    });

    // 获取音频二进制数据
    const audioBuffer = streamBuffer.getContents();
    
    // 返回 MP3 文件给前端
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="tts_${Date.now()}.mp3"`);
    res.send(audioBuffer);

  } catch (error) {
    console.error('Google TTS 错误：', error);
    res.status(500).json({ error: `下载失败：${error.message}` });
  }
}
