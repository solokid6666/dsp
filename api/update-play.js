import Redis from 'ioredis';

// 从环境变量获取Upstash Redis连接信息
const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// 你的前端域名（仅允许该域名访问API）
const FRONTEND_DOMAIN = 'https://dsp-xi.vercel.app';

export default async function handler(req, res) {
    // 跨域配置 - 仅允许你的前端域名访问
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_DOMAIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // 允许携带凭证

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 验证musicId参数
    const { musicId } = req.query;
    if (!musicId || typeof musicId !== 'string') {
        return res.status(400).json({
            success: false,
            error: '无效的musicId参数'
        });
    }

    try {
        // 定义Redis键名（保持原有的命名规范）
        const redisKey = `play:${musicId}`;

        if (req.method === 'POST') {
            // 递增播放次数
            const count = await redis.incr(redisKey);
            return res.json({
                success: true,
                currentPlayCount: count,
                musicId: musicId // 回传musicId便于前端匹配
            });
        } else if (req.method === 'GET') {
            // 获取当前播放次数
            const count = await redis.get(redisKey);
            return res.json({
                success: true,
                currentPlayCount: count ? parseInt(count, 10) : 0,
                musicId: musicId
            });
        } else {
            // 不支持的请求方法
            return res.status(405).json({
                success: false,
                error: `不支持${req.method}方法`
            });
        }
    } catch (error) {
        console.error('Redis操作失败:', error);
        return res.status(500).json({
            success: false,
            error: '服务器存储失败，请稍后重试'
        });
    }
}
