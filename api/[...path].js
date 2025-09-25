export default async function handler(req, res) {
  try {
    const { path } = req.query;

    // 记录请求路径用于调试
    console.log('Received path:', path);

    // 确保path存在且第一个元素是proposal
    if (!path || !Array.isArray(path) || path.length === 0 || path[0] !== 'proposal') {
      console.log('Invalid path format:', path);
      return res.status(404).json({ error: 'Invalid path' });
    }

    // 构建目标资源路径
    const resourcePath = path.slice(1).join('/');

    // 如果没有资源路径，返回404
    if (!resourcePath) {
      console.log('No resource path provided');
      return res.status(404).json({ error: 'No resource specified' });
    }

    const targetUrl = `https://miao-surfing-game.vercel.app/${resourcePath}`;
    console.log('Proxying to:', targetUrl);

    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

    try {
      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; proxy)'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.log('Target responded with:', response.status);
        return res.status(response.status).json({
          error: `Resource not found: ${response.status}`
        });
      }

      // 获取内容类型
      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      console.log('Content-Type:', contentType);

      // 设置响应头
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1小时缓存
      res.setHeader('Access-Control-Allow-Origin', '*');

      // 获取响应数据
      const buffer = await response.arrayBuffer();
      return res.status(200).send(Buffer.from(buffer));

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.log('Request timed out for:', targetUrl);
        return res.status(504).json({ error: 'Request timeout' });
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}