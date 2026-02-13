// 🚀 회고 생성 로컬 프록시 서버
// Claude API를 안전하게 호출하기 위한 Express.js 서버

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

// CORS 설정 (브라우저에서 접근 가능하도록)
app.use(cors());
app.use(express.json());

// Claude API 호출 함수
async function callClaudeAPI(task, guide) {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
    }

    const prompt = `${guide}

오늘 한 일: ${task}

위 내용을 바탕으로 [느끼다, 깨우다, 바꾸다] 형식의 회고를 작성해주세요.
규칙:
- 5년차 프론트엔드 개발자의 관점
- 담백하고 전문적인 말투
- 각 섹션당 3~5줄
- 이모지 적절히 사용 (🔥, ✅, 💡, ✨)
- ** 같은 마크다운 문법은 제거하고 순수 텍스트로만 작성

바로 복사해서 사용할 수 있도록 작성해주세요.`;

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
