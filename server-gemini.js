// 🚀 회고 생성 로컬 프록시 서버 (Gemini API 버전)
// Google Gemini API를 안전하게 호출하기 위한 Express.js 서버

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

// Gemini API 호출 함수
async function callGeminiAPI(task, guide) {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인하세요.');
    }

    // guide 파라미터가 있으면 사용, 없으면 guide.md 내용 사용
    const guideContent = guide || GUIDE_CONTENT;

    const prompt = `${guideContent}

오늘 한 일:
${task}

위 내용을 바탕으로 회고를 작성해주세요.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API 오류: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('⚠️ Gemini API 호출 실패:', error.message);
        throw error;
    }
}

// 폴백 템플릿 (API 실패 시)
function generateFallbackRetrospective(task) {
    return `[느끼다]

오늘은 "${task}"을(를) 진행했다. 계획한 작업을 차근차근 수행하면서 목표를 달성할 수 있었고, 과정에서 기술적으로 성장하는 계기가 되었다. 작업을 마친 뒤 결과물을 보니 전체적인 완성도가 높아졌다는 확신이 들어 뿌듯했다.

[깨우다]

이번 작업의 핵심은 단순히 기능을 구현하는 것이 아니라, 사용자 관점에서 완성도를 높이는 것이었다. 세부적인 부분에 집중한 덕분에 전체 품질이 향상되었다는 것을 체감했다.

[바꾸다]

다음부터는 작업 시작 전 "이 작업이 사용자에게 어떤 가치를 줄까?"를 먼저 고민해야겠다. 목적 중심으로 접근하면 더 빠르고 효율적으로 결과물을 만들 수 있을 것이다.`;
}

// 회고 생성 엔드포인트
app.post('/generate-retrospective', async (req, res) => {
    try {
        const { task, guide } = req.body;

        if (!task) {
            return res.status(400).json({ error: '작업 내용(task)이 필요합니다.' });
        }

        console.log('📝 회고 생성 요청:', task);

        try {
            const retrospective = await callGeminiAPI(task, guide);
            console.log('✅ Gemini 회고 생성 완료');

            res.json({
                success: true,
                retrospective: retrospective
            });
        } catch (apiError) {
            console.log('⚠️ API 실패, 폴백 템플릿 사용');
            const retrospective = generateFallbackRetrospective(task);

            res.json({
                success: true,
                retrospective: retrospective,
                fallback: true
            });
        }

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
    res.json({
        status: 'ok',
        message: '서버가 정상 작동 중입니다. (Gemini API 버전)',
        apiKeySet: !!process.env.GEMINI_API_KEY
    });
});

// Gemini API 연결 테스트 엔드포인트
app.get('/test-gemini', async (req, res) => {
    try {
        const testRetrospective = await callGeminiAPI('테스트 작업', GUIDE_CONTENT);
        res.json({
            status: 'connected',
            message: 'Gemini API 연결 성공!',
            sample: testRetrospective.substring(0, 100) + '...'
        });
    } catch (error) {
        res.status(500).json({
            status: 'disconnected',
            message: 'Gemini API 연결 실패',
            error: error.message
        });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 회고 생성 서버 (Gemini API 버전)가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`💡 API 키 확인: ${process.env.GEMINI_API_KEY ? '✅ 설정됨' : '❌ 설정 안됨'}`);
    console.log(`✨ 테스트: http://localhost:${PORT}/test-gemini 접속`);
});
