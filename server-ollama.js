// 🚀 회고 생성 로컬 프록시 서버 (Ollama 버전)
// 로컬 LLM을 사용하여 완전 무료로 회고 생성

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

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

// Ollama API 호출 함수
async function callOllamaAPI(task, guide) {
    // guide 파라미터가 있으면 사용, 없으면 guide.md 내용 사용
    const guideContent = guide || GUIDE_CONTENT;

    const prompt = `${guideContent}

오늘 한 일:
${task}

위 내용을 바탕으로 회고를 작성해주세요.`;

    try {
        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama3.2',  // 또는 'mistral', 'gemma2' 등 설치한 모델
                prompt: prompt,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama API 오류: ${response.status}`);
        }

        const data = await response.json();
        return data.response;

    } catch (error) {
        // Ollama 연결 실패 시 폴백 템플릿 사용
        console.error('⚠️ Ollama 연결 실패. 폴백 템플릿 사용:', error.message);
        return generateFallbackRetrospective(task);
    }
}

// 폴백 템플릿 (Ollama 연결 실패 시)
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

        const retrospective = await callOllamaAPI(task, guide || '');

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
    res.json({
        status: 'ok',
        message: '서버가 정상 작동 중입니다. (Ollama 버전)',
        ollamaUrl: 'http://localhost:11434'
    });
});

// Ollama 연결 테스트 엔드포인트
app.get('/test-ollama', async (req, res) => {
    try {
        const response = await fetch('http://localhost:11434/api/tags');
        if (response.ok) {
            const data = await response.json();
            res.json({
                status: 'connected',
                message: 'Ollama 연결 성공!',
                models: data.models || []
            });
        } else {
            throw new Error('Ollama 응답 실패');
        }
    } catch (error) {
        res.status(500).json({
            status: 'disconnected',
            message: 'Ollama 연결 실패. ollama serve가 실행 중인지 확인하세요.',
            error: error.message
        });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 회고 생성 서버 (Ollama 버전)가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`💡 Ollama 확인: http://localhost:${PORT}/test-ollama 접속`);
    console.log(`⚠️ Ollama가 실행 중인지 확인하세요: ollama serve`);
});
