# 🚀 Ollama 기반 회고 자동화 사용 가이드

Claude API 크레딧 없이 **완전 무료**로 AI 회고를 작성할 수 있습니다!

---

## 📦 1. Ollama 설치

### macOS
```bash
# Homebrew로 설치
brew install ollama

# 또는 공식 사이트에서 다운로드
# https://ollama.ai/download
```

### Windows
- https://ollama.ai/download 에서 설치 파일 다운로드 및 실행

### Linux
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

---

## 🤖 2. LLM 모델 다운로드

터미널에서 다음 명령어 실행:

```bash
# Ollama 서비스 시작
ollama serve
```

**새 터미널 창**을 열어서 모델 다운로드:

```bash
# 추천: llama3.2 (빠르고 가벼움, ~2GB)
ollama pull llama3.2

# 또는 더 강력한 모델 (선택사항)
# ollama pull mistral     # ~4GB
# ollama pull gemma2      # ~5GB
```

---

## ⚙️ 3. 서버 실행

프로젝트 폴더에서:

```bash
# Ollama 버전 서버 실행
node server-ollama.js
```

서버가 정상 실행되면:
```
🚀 회고 생성 서버 (Ollama 버전)가 http://localhost:3000 에서 실행 중입니다.
💡 Ollama 확인: http://localhost:3000/test-ollama 접속
```

---

## ✅ 4. 연결 테스트

브라우저에서 다음 URL 접속:

**건강 체크:**
```
http://localhost:3000/health
```

**Ollama 연결 확인:**
```
http://localhost:3000/test-ollama
```

정상이면 다음과 같은 응답이 나옵니다:
```json
{
  "status": "connected",
  "message": "Ollama 연결 성공!",
  "models": ["llama3.2"]
}
```

---

## 🎯 5. 브라우저 스크립트 실행

1. 회고 페이지 열기
2. 브라우저 콘솔 열기 (F12 또는 Cmd+Opt+I)
3. `CONSOLE_PASTE_API.js` 파일 내용 전체 복사 & 붙여넣기
4. Enter 키 입력
5. "오늘 한 일" 입력 창이 뜨면 작업 내용 입력

스크립트가 자동으로:
- ✅ 버튼 클릭
- ✅ 폼 작성
- ✅ AI로 회고 생성
- ✅ 제출 완료

---

## 🔧 문제 해결

### "Ollama 연결 실패" 오류
```bash
# Ollama가 실행 중인지 확인
ollama serve

# 모델이 다운로드되었는지 확인
ollama list

# llama3.2가 없다면 다운로드
ollama pull llama3.2
```

### "fetch is not defined" 오류 (Node.js 버전이 낮은 경우)
```bash
# Node.js 18+ 필요
node --version

# 업그레이드 필요시
# macOS: brew upgrade node
# Windows: nodejs.org에서 최신 버전 다운로드
```

---

## 💡 모델 변경하기

`server-ollama.js` 파일에서 모델을 변경할 수 있습니다:

```javascript
body: JSON.stringify({
    model: 'llama3.2',  // 여기를 변경
    prompt: prompt,
    stream: false
})
```

**추천 모델:**
- `llama3.2` - 빠르고 가벼움 (추천)
- `mistral` - 중간 성능
- `gemma2` - 높은 성능, 느림

---

## 📊 비교: Claude API vs Ollama

| 항목 | Claude API | Ollama |
|------|------------|---------|
| 비용 | 유료 (크레딧 필요) | 완전 무료 |
| 속도 | 매우 빠름 | 중간 (PC 성능에 따라) |
| 품질 | 최상 | 양호~좋음 |
| 인터넷 | 필요 | 불필요 |
| 설정 | 간단 | 초기 설정 필요 |

---

## 🎉 완료!

이제 Claude API 크레딧 없이 무료로 AI 회고를 작성할 수 있습니다!

문제가 있다면:
1. Ollama가 실행 중인지 확인 (`ollama serve`)
2. 모델이 다운로드되었는지 확인 (`ollama list`)
3. 서버가 실행 중인지 확인 (`node server-ollama.js`)
4. 브라우저 콘솔에 에러가 있는지 확인
