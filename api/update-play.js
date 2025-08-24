const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ��˽ӿڣ����� musicId ���������¶�Ӧ���ֵĲ�����
export default async function handler(req, res) {
    // 1. �������л�ȡ����ID��ǰ�˵���ʱ���ݣ��� ?musicId=music_001��
    const { musicId } = req.query;

    // У�飺��δ�� musicId��ֱ�ӷ��ش���
    if (!musicId) {
        return res.status(400).json({ error: '�봫������ID��musicId��' });
    }

    // 2. ���岥�����洢�ļ���·��
    const playsPath = path.join(process.cwd(), 'music_plays.json');

    try {
        // 3. ��ȡ��ǰ�������ֵĲ�����
        const playsData = fs.readFileSync(playsPath, 'utf8');
        const playsObj = JSON.parse(playsData);

        // 4. �ۼӲ�������������ID�����ڣ��Զ���ʼ��Ϊ1��
        playsObj[musicId] = playsObj[musicId] ? playsObj[musicId] + 1 : 1;

        // 5. д����º�Ĳ��������ļ�����ʽ��JSON�����ڲ鿴��
        fs.writeFileSync(playsPath, JSON.stringify(playsObj, null, 2), 'utf8');

        // 6. ͨ�� Git �ύ���µ� GitHub �ֿ⣨ȷ�� Vercel ����Ȩ GitHub��
        execSync('git config --global user.name "���GitHub�û���"'); // �滻Ϊ�����Ϣ
        execSync('git config --global user.email "���GitHub����"');   // �滻Ϊ�����Ϣ
        execSync('git add music_plays.json');                          // ���ύ�������ļ�
        execSync(`git commit -m "update play count: ${musicId} �� ${playsObj[musicId]}"`);
        execSync('git push origin main'); // ���ֿ�Ĭ�Ϸ�֧�� master���滻Ϊ master

        // 7. ���ظ��º�Ĳ�������ǰ��
        res.status(200).json({
            musicId: musicId,
            currentPlayCount: playsObj[musicId],
            success: true
        });

    } catch (error) {
        // ����������ļ���ȡʧ�ܡ�Git����ʧ�ܣ�
        console.error('���²�����ʧ�ܣ�', error);
        res.status(500).json({
            error: '����������ʧ��',
            musicId: musicId,
            success: false
        });
    }
}