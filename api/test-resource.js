export default async function handler(req, res) {
  try {
    // 获取资源名称
    const { resource } = req.query;

    if (!resource) {
      return res.status(400).json({
        error: 'No resource specified',
        example: '/api/test-resource?resource=character_normal.png'
      });
    }

    // 构建目标URL
    const targetUrl = `https://miao-surfing-game.vercel.app/${resource}`;

    // 记录日志
    console.log('Testing resource:', resource);
    console.log('Target URL:', targetUrl);

    // 先尝试HEAD请求检查资源是否存在
    const headResponse = await fetch(targetUrl, { method: 'HEAD' });

    if (!headResponse.ok) {
      return res.status(404).json({
        error: 'Resource not found',
        resource: resource,
        targetUrl: targetUrl,
        status: headResponse.status,
        statusText: headResponse.statusText
      });
    }

    // 资源存在，获取完整内容
    const response = await fetch(targetUrl);
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');

    if (!response.ok) {
      return res.status(response.status).json({
        error: 'Failed to fetch resource',
        status: response.status,
        statusText: response.statusText
      });
    }

    // 设置响应头
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // 返回资源
    const buffer = await response.arrayBuffer();
    return res.status(200).send(Buffer.from(buffer));

  } catch (error) {
    console.error('Test resource error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: error.stack
    });
  }
}