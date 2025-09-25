export default async function handler(req, res) {
  try {
    console.log('Proposal API called');

    // 测试是否能访问游戏
    const gameResponse = await fetch('https://miao-surfing-game.vercel.app/');

    console.log('Game response status:', gameResponse.status);

    if (!gameResponse.ok) {
      return res.status(404).json({
        error: 'Game not found',
        status: gameResponse.status
      });
    }

    let html = await gameResponse.text();
    console.log('HTML length:', html.length);

    // 简单的路径替换 - 直接指向slowhome.art/proposal/
    html = html.replace(/src="([^"]*\.(js|css|png|jpg|jpeg|gif|mp4|mov|wav|m4a))"/gi,
      'src="/proposal/$1"');
    html = html.replace(/href="([^"]*\.css)"/gi,
      'href="/proposal/$1"');

    // 设置响应头
    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 'no-cache');

    return res.status(200).send(html);
  } catch (error) {
    console.error('Proposal API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
}