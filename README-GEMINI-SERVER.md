# 🚀 Gemini API 서버 기반 회고 자동화 가이드

**안전하게 API 키를 관리**하면서 고품질 AI 회고를 작성합니다!

---

## ✨ 이 방법의 장점

- ✅ **API 키 보안** - .env 파일로 안전하게 관리
- ✅ **빠른 속도** - Gemini 1.5 Flash는 매우 빠름
- ✅ **무료/저렴** - 월 1,500회 무료 (일 50회 사용해도 충분)
- ✅ **높은 품질** - Ollama보다 훨씬 좋은 회고 품질
- ✅ **guide.md 연동** - 자동으로 guide.md 내용 로드

---

## 🚀 빠른 시작 (3단계)

### 1. API 키 확인
`.env` 파일에 Gemini API 키가 설정되어 있는지 확인:

```bash
cat .env
```

다음과 같이 표시되어야 합니다:
```
GEMINI_API_KEY=AIzaSy...
```

### 2. 서버 실행

```bash
# Gemini 서버 시작
npm run start:gemini

# 또는 개발 모드 (자동 재시작)
npm run dev:gemini
```

**서버 실행 확인:**
```
🚀 회고 생성 서버 (Gemini API 버전)가 http://localhost:3000 에서 실행 중입니다.
💡 API 키 확인: ✅ 설정됨
✨ 테스트: http://localhost:3000/test-gemini 접속
```

### 3. 브라우저 스크립트 실행

1. 회고 페이지 열기
2. F12 (콘솔 열기)
3. `CONSOLE_PASTE_API.js` 전체 복사 & 붙여넣기
4. "오늘 한 일" 입력
5. 완료! 🎉

---

## 🔧 사용 가능한 서버들

| 서버 | 명령어 | API | 비고 |
|------|--------|-----|------|
| **Gemini** | `npm run start:gemini` | Google Gemini | 빠르고 저렴 (추천) ✨ |
| Ollama | `npm run start:ollama` | 로컬 LLM | 완전 무료, 느림 |
| Claude | `npm start` | Claude API | 최고 품질, 유료 |

---

## ⚙️ 서버 엔드포인트

### 회고 생성
```bash
curl -X POST http://localhost:3000/generate-retrospective \
  -H "Content-Type: application/json" \
  -d '{"task": "14.2.0 개발 및 디자인 수정"}'
```

### 서버 상태 확인
```
http://localhost:3000/health
```

### Gemini API 테스트
```
http://localhost:3000/test-gemini
```

---

## 🎯 API 키 발급받기

### Gemini API (무료/저렴)
1. https://aistudio.google.com/app/apikey 접속
2. "Create API Key" 클릭
3. API 키 복사
4. `.env` 파일에 붙여넣기:
   ```
   GEMINI_API_KEY=your_key_here
   ```

**무료 할당량:**
- 월 1,500회 무료
- 초과 시: $0.00035 / 1,000 토큰 (매우 저렴)

---

## ⚠️ 문제 해결

### "GEMINI_API_KEY가 설정되지 않았습니다" 오류

```bash
# .env 파일 확인
cat .env

# .env 파일이 없으면 생성
cp .env.example .env

# API 키 입력
# GEMINI_API_KEY=your_key_here
```

### 서버가 실행되지 않음

```bash
# Node.js 버전 확인 (18+ 필요)
node --version

# 패키지 재설치
rm -rf node_modules
npm install
```

### 회고가 생성되지 않음

1. **서버 실행 여부 확인:**
   ```bash
   curl http://localhost:3000/health
   ```

2. **브라우저 콘솔 확인** (F12):
   - "서버 오류" → 서버가 꺼져있음
   - "API 호출 실패" → API 키 문제

3. **서버 로그 확인:**
   - `npm run start:gemini` 실행 중인 터미널에서 에러 확인

---

## 💡 추가 설정

### 회고 품질 조정

`server-gemini.js`에서:

```javascript
generationConfig: {
    temperature: 0.7,  // 0.0 ~ 1.0 (높을수록 창의적)
    maxOutputTokens: 1000,  // 최대 토큰 수
}
```

### 다른 Gemini 모델 사용

```javascript
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// gemini-1.5-flash (빠름, 저렴) 👈 현재 사용 중
// gemini-1.5-pro (더 좋은 품질, 더 비쌈)
```

---

## 📊 비교표

| 항목 | Gemini 서버 (현재) | 브라우저 직접 호출 |
|------|-------------------|-------------------|
| API 키 보안 | ✅ 안전 (.env) | ❌ 노출됨 |
| 서버 필요 | ✅ 필요 | ❌ 불필요 |
| 설정 난이도 | 중간 | 쉬움 |
| 속도 | 빠름 | 빠름 |
| 품질 | 높음 | 높음 |

---

## 🎉 완료!

이제 안전하게 API 키를 관리하면서 고품질 AI 회고를 작성할 수 있습니다!

서버를 실행하고 (`npm run start:gemini`), 브라우저 스크립트를 사용하세요! 🚀
