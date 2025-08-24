const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 后端接口：接收 musicId 参数，更新对应音乐的播放量
export default async function handler(req, res) {
    // 1. 从请求中获取音乐ID（前端调用时传递，如 ?musicId=music_001）
    const { musicId } = req.query;

    // 校验：若未传 musicId，直接返回错误
    if (!musicId) {
        return res.status(400).json({ error: '请传入音乐ID（musicId）' });
    }

    // 2. 定义播放量存储文件的路径
    const playsPath = path.join(process.cwd(), 'music_plays.json');

    try {
        // 3. 读取当前所有音乐的播放量
        const playsData = fs.readFileSync(playsPath, 'utf8');
        const playsObj = JSON.parse(playsData);

        // 4. 累加播放量（若音乐ID不存在，自动初始化为1）
        playsObj[musicId] = playsObj[musicId] ? playsObj[musicId] + 1 : 1;

        // 5. 写入更新后的播放量到文件（格式化JSON，便于查看）
        fs.writeFileSync(playsPath, JSON.stringify(playsObj, null, 2), 'utf8');

        // 6. 通过 Git 提交更新到 GitHub 仓库（确保 Vercel 已授权 GitHub）
        execSync('git config --global user.name "你的GitHub用户名"'); // 替换为你的信息
        execSync('git config --global user.email "你的GitHub邮箱"');   // 替换为你的信息
        execSync('git add music_plays.json');                          // 仅提交播放量文件
        execSync(`git commit -m "update play count: ${musicId} → ${playsObj[musicId]}"`);
        execSync('git push origin main'); // 若仓库默认分支是 master，替换为 master

        // 7. 返回更新后的播放量给前端
        res.status(200).json({
            musicId: musicId,
            currentPlayCount: playsObj[musicId],
            success: true
        });

    } catch (error) {
        // 捕获错误（如文件读取失败、Git推送失败）
        console.error('更新播放量失败：', error);
        res.status(500).json({
            error: '播放量更新失败',
            musicId: musicId,
            success: false
        });
    }
}