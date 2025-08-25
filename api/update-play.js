import Redis from 'ioredis';

// �ӻ���������ȡUpstash Redis������Ϣ
const redis = new Redis(process.env.UPSTASH_REDIS_URL);

// ���ǰ�����������������������API��
const FRONTEND_DOMAIN = 'https://dsp-xi.vercel.app';

export default async function handler(req, res) {
    // �������� - ���������ǰ����������
    res.setHeader('Access-Control-Allow-Origin', FRONTEND_DOMAIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true'); // ����Я��ƾ֤

    // ����Ԥ������
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ��֤musicId����
    const { musicId } = req.query;
    if (!musicId || typeof musicId !== 'string') {
        return res.status(400).json({
            success: false,
            error: '��Ч��musicId����'
        });
    }

    try {
        // ����Redis����������ԭ�е������淶��
        const redisKey = `play:${musicId}`;

        if (req.method === 'POST') {
            // �������Ŵ���
            const count = await redis.incr(redisKey);
            return res.json({
                success: true,
                currentPlayCount: count,
                musicId: musicId // �ش�musicId����ǰ��ƥ��
            });
        } else if (req.method === 'GET') {
            // ��ȡ��ǰ���Ŵ���
            const count = await redis.get(redisKey);
            return res.json({
                success: true,
                currentPlayCount: count ? parseInt(count, 10) : 0,
                musicId: musicId
            });
        } else {
            // ��֧�ֵ����󷽷�
            return res.status(405).json({
                success: false,
                error: `��֧��${req.method}����`
            });
        }
    } catch (error) {
        console.error('Redis����ʧ��:', error);
        return res.status(500).json({
            success: false,
            error: '�������洢ʧ�ܣ����Ժ�����'
        });
    }
}
