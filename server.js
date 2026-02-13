// 🚀 회고 생성 로컬 프록시 서버
// Claude API를 안전하게 호출하기 위한 Express.js 서버

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3000;

// guide.md 파일 읽기
let GUIDE_CONTENT = '';
try {
    GUIDE_CONTENT = fs.readFileSync(path.join(__dirname, 'guide.md'), 'utf-8');
    console.log('✅ guide.md 파일을 성공적으로 로드했습니다.');
} catch (error) {
    console.warn('⚠️ guide.md 파일을 찾을 수 없습니다. 기본 가이드를 사용합니다.');
    GUIDE_CONTENT = `# 회고 작성 가이드

당신은 5년 차 프론트엔드 개발자입니다.
아래 "오늘 한 일"을 바탕으로 회고 텍스트를 작성해주세요.

## 작성 규칙
1. 말투는 담백하고 전문적으로 작성할 것.
2. '문제 -> 해결 -> 배운 점' 구조를 유지할 것.
3. 너무 길지 않게 3~5줄 내외로 요약할 것.
4. 이모지는 쓰지마. ** 이런것도 쓰지말고.

[느끼다, 깨우다, 바꾸다] 형식으로 작성해주세요.`;
}

// CORS 설정 (브라우저에서 접근 가능하도록)
app.use(cors());
app.use(express.json());

// Claude API 호출 함수
async function callClaudeAPI(task, guide) {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
    }

    // guide 파라미터가 있으면 사용, 없으면 guide.md 내용 사용
    const guideContent = guide || GUIDE_CONTENT;

    const prompt = `${guideContent}

오늘 한 일:
${task}

위 내용을 바탕으로 회고를 작성해주세요.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 2000,
            messages: [{
                role: 'user',
                content: prompt
            }]
        })
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Claude API 오류: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return data.content[0].text;
}

// 회고 생성 엔드포인트
app.post('/generate-retrospective', async (req, res) => {
    try {
        const { task, guide } = req.body;

        if (!task) {
            return res.status(400).json({ error: '작업 내용(task)이 필요합니다.' });
        }

        console.log('📝 회고 생성 요청:', task);

        const retrospective = await callClaudeAPI(task, guide || '');

        console.log('✅ 회고 생성 완료');

        res.json({
            success: true,
            retrospective: retrospective
        });

    } catch (error) {
        console.error('❌ 오류:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 서버 상태 확인 엔드포인트
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: '서버가 정상 작동 중입니다.' });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 회고 생성 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`💡 API 키 확인: ${process.env.ANTHROPIC_API_KEY ? '✅ 설정됨' : '❌ 설정 안됨'}`);
});
