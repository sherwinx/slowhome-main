export default async function handler(req, res) {
  try {
    // 获取原始游戏内容
    const gameResponse = await fetch('https://miao-surfing-game.vercel.app/');

    if (!gameResponse.ok) {
      return res.status(404).json({ error: 'Game not found' });
    }

    let html = await gameResponse.text();

    const baseUrl = 'https://miao-surfing-game.vercel.app';

    // 修复所有相对路径资源，避免重复替换
    // 使用更通用的方法处理所有资源文件

    // 处理所有引号内的资源路径（包括中文字符）
    // 匹配所有常见的资源文件扩展名，不论文件名是什么字符
    html = html.replace(/(['"])((?!https?:\/\/)[^'"]*\.(js|css|png|jpg|jpeg|gif|mp4|mov|wav|m4a))\1/gi, function(match, quote, path, ext) {
      // 确保路径不是以 ./ 开头的，如果是则移除
      const cleanPath = path.replace(/^\.\//, '');
      return quote + baseUrl + '/' + cleanPath + quote;
    });

    // 特别处理可能遗漏的相对路径
    html = html.replace(/src="(?!https?:\/\/)([^"]*\.(js|css|png|jpg|jpeg|gif|mp4|mov|wav|m4a))"/gi,
      `src="${baseUrl}/$1"`);
    html = html.replace(/href="(?!https?:\/\/)([^"]*\.css)"/gi,
      `href="${baseUrl}/$1"`);

    // 设置正确的响应头
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');

    return res.status(200).send(html);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}