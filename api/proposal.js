export default async function handler(req, res) {
  try {
    // 获取原始游戏内容
    const gameResponse = await fetch('https://miao-surfing-game.vercel.app/');

    if (!gameResponse.ok) {
      return res.status(404).json({ error: 'Game not found' });
    }

    let html = await gameResponse.text();

    const baseUrl = 'https://miao-surfing-game.vercel.app';

    // 修复所有相对路径资源 - 包括中文文件名
    // 处理 src 属性
    html = html.replace(/src="([^"]+\.(js|css|png|jpg|jpeg|gif|mp4|mov|wav|m4a))"/gi,
      `src="${baseUrl}/$1"`);

    // 处理 href 属性
    html = html.replace(/href="([^"]+\.css)"/gi,
      `href="${baseUrl}/$1"`);

    // 处理在JavaScript中的图片加载路径
    html = html.replace(/'([^']+\.(png|jpg|jpeg|gif|mp4|mov))'/g,
      `'${baseUrl}/$1'`);
    html = html.replace(/"([^"]+\.(png|jpg|jpeg|gif|mp4|mov))"/g,
      `"${baseUrl}/$1"`);

    // 处理中文文件名 - 特别处理你的游戏文件
    html = html.replace(/(['"])([^'"]*[角色|障碍物|treasure|Italy_Movie][^'"]*\.(?:png|jpg|gif|mp4|mov))\1/g,
      `$1${baseUrl}/$2$1`);

    // 处理可能的相对路径开头的资源
    html = html.replace(/(['"])\.\/([^'"]+\.(png|jpg|jpeg|gif|js|css|mp4|mov|wav|m4a))\1/g,
      `$1${baseUrl}/$2$1`);

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