export default async function handler(req, res) {
  try {
    const { path } = req.query;

    // path 是一个数组，第一个元素应该是 'proposal'
    if (!path || !Array.isArray(path) || path[0] !== 'proposal') {
      return res.status(404).json({ error: 'Not found' });
    }

    // 构建资源路径 - 移除 'proposal' 前缀
    const resourcePath = path.slice(1).join('/');
    const targetUrl = `https://miao-surfing-game.vercel.app/${resourcePath}`;

    console.log('Proxying request to:', targetUrl);

    // 获取资源
    const response = await fetch(targetUrl);

    if (!response.ok) {
      console.log('Resource not found:', targetUrl);
      return res.status(response.status).json({ error: 'Resource not found' });
    }

    // 获取内容类型
    const contentType = response.headers.get('content-type') || 'application/octet-stream';

    // 设置响应头
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 对于二进制资源，使用 buffer
    if (contentType.startsWith('image/') ||
        contentType.startsWith('video/') ||
        contentType.startsWith('audio/') ||
        contentType === 'application/octet-stream') {
      const buffer = await response.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));
    }

    // 对于文本资源
    const content = await response.text();
    return res.status(200).send(content);

  } catch (error) {
    console.error('Resource proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}