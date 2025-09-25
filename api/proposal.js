export default async function handler(req, res) {
  try {
    // 获取原始游戏内容
    const gameResponse = await fetch('https://miao-surfing-game.vercel.app/');

    if (!gameResponse.ok) {
      return res.status(404).json({ error: 'Game not found' });
    }

    let html = await gameResponse.text();

    // 修复资源路径 - 将相对路径转换为绝对路径
    html = html.replace(/src="([^"]*\.(?:js|css|png|jpg|gif|mp4|wav|m4a))"/g,
      'src="https://miao-surfing-game.vercel.app/$1"');
    html = html.replace(/href="([^"]*\.css)"/g,
      'href="https://miao-surfing-game.vercel.app/$1"');

    // 设置正确的响应头
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');

    return res.status(200).send(html);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}