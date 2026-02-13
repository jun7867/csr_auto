// ============================================
// 🚀 회고 자동화 스크립트 v4 - Gemini (localStorage 저장형)
// ============================================

"use strict";
(function () {
    if (window.__SPYMODULE) {
        __SPYMODULE?.end();
        delete window.__SPYMODULE
    }

    const Module = (function () {
        let completeCsrCount = 0;
        let todayTask = '';
        let retrospectiveWritten = false;
        const originalSetTimeout = setTimeout;
        const setTimeoutSet = new Set();

        function getApiKey() {
            let key = localStorage.getItem('MY_GEMINI_KEY');
            
            // 키가 없으면 브라우저 창으로 물어보고 저장합니다. (최초 1회)
            if (!key) {
                key = prompt('🔑 Gemini API 키를 입력하세요 (최초 1회만 저장됨):');
                if (key) {
                    localStorage.setItem('MY_GEMINI_KEY', key);
                    alert('✅ API 키가 브라우저에 안전하게 저장되었습니다.');
                } else {
                    alert('❌ 키를 입력하지 않으면 회고를 작성할 수 없습니다.');
                    throw new Error('API Key Missing');
                }
            }
            return key;
        }

        const GUIDE_CONTENT = `
# 회고 작성 가이드

당신은 5년 차 프론트엔드 개발자입니다. 
아래 "오늘 한 일"을 바탕으로 회고 텍스트를 작성해주세요.

## 작성 규칙
1. 말투는 담백하고 전문적으로 작성할 것.
2. '문제 -> 해결 -> 배운 점' 구조를 유지할 것.
3. 너무 길지 않게 3~5줄 내외로 요약할 것.
4. 이모지는 쓰지마. ** 이런것도 쓰지말고. 

## 출력 형식

내가 하루에 어떤 내용을 했는지 간단하게 적으면 [느끼다, 깨우다, 바꾸다] 총 3가지로 나눠서 하루의 회고를 작성해줘. 아래는 그 예시야.

바로 복사해서 사용할거라서 답변 내용에 ** 같은 것들은 제거해서 알려줘.



예시) 



14.2.0 개발 (액션 플로우 ax)

- AX 패널 서브챗 개발.

- 14.2.0 검증 사항 해결.

- 지원서 작성 기간 수정 validation 추가작업.





[느끼다]



오늘은 AX 1차 시연을 앞두고 디자인 변경사항을 모두 적용했다. 주요 수정 포인트는 컴포넌트 간 여백, 카드 간격, 폰트 스타일 정리 등 세부적인 시각적 완성도를 높이는 작업이었다. 처음에는 수정 범위가 많아 보여 막막했지만, 실제로 하나씩 반영해보니 구조적으로 잘 정리되어 있어서 의외로 빠르게 진행됐다. 수정하면서 디자이너와의 협의 과정에서도 “이 부분은 의도된 스타일인가?” 같은 세밀한 확인을 거쳤고, 덕분에 전체 톤이 통일되었다는 확신이 들었다. 작업을 마친 뒤 화면을 보니 이제 ‘시연용’이 아닌 ‘완성된 서비스 화면’에 가까워졌다는 생각이 들어 뿌듯했다.



[깨우다]



결국 이번 변경의 핵심은 단순한 디자인 보완이 아니라 시연이라는 목적에 맞게 사용자에게 명확한 인상을 주는 화면을 만드는 것이었다. 처음엔 ‘디자인 변경’이라는 단어에만 집중했지만, 실제로는 ‘어떤 맥락에서 이 화면이 보여질지’를 고려한 정돈 작업이었다. 세부 수정에 시간을 들인 덕분에, 작은 시각적 요소가 서비스 전체의 완성도에 얼마나 큰 영향을 미치는지 다시 한번 체감했다.



[바꾸다]



다음부터는 디자인 변경사항이 나올 때마다 “이 변경이 시연 혹은 실제 사용 맥락에서 어떤 효과를 낼까?”를 먼저 떠올려야겠다. 단순히 픽셀 단위의 조정이 아니라, 목적 중심의 디자인 반영으로 접근하면 수정 속도도 빨라지고 결과물의 만족도도 높아질 것이다. 또한 시연 전 단계에서는 디자이너, 기획자와 함께 “시연 관점 점검 회의”를 짧게 가져보는 것도 좋겠다. 이렇게 하면 막판에 수정되는 부분을 줄이고, 팀 전체가 같은 목표 이미지를 공유할 수 있을 것이다.
`;

async function requestRetrospectiveFromGemini(task) {
    console.log('✨ Gemini에게 회고 작성을 요청합니다...');

    const GEMINI_API_KEY = getApiKey();

    // 🔥 수정된 부분: 모델명을 'gemini-1.5-flash-latest'로 변경
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: GUIDE_CONTENT.replace('{{TASK}}', task) }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
            })
        });

        if (!response.ok) {
            if (response.status === 400 || response.status === 403) {
                localStorage.removeItem('MY_GEMINI_KEY');
                alert('❌ API 키가 올바르지 않거나 만료되었습니다. 키를 삭제했으니 다시 실행하세요.');
            } else if (response.status === 404) {
                // 만약 이것도 안 되면 구형 모델로 자동 재시도
                console.warn('⚠️ 최신 모델 실패, 구형 모델(gemini-pro)로 재시도합니다...');
                return await requestRetrospectiveFromGeminiLegacy(task, GEMINI_API_KEY);
            }
            throw new Error(`Gemini API 오류: ${response.status}`);
        }

        const data = await response.json();
        const retrospective = data.candidates[0].content.parts[0].text;
        console.log('✅ Gemini 회고 생성 완료!');
        return retrospective;

    } catch (error) {
        console.error('❌ API 호출 실패:', error.message);
        return generateFallbackRetrospective(task);
    }
}

        // 🔥 비상용: 만약 Flash 모델이 죽었으면 구형 모델(Gemini 1.0 Pro) 사용
        async function requestRetrospectiveFromGeminiLegacy(task, key) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: GUIDE_CONTENT.replace('{{TASK}}', task) }] }]
                })
            });
            const data = await response.json();
            return data.candidates[0].content.parts[0].text;
        }

        function generateFallbackRetrospective(task) {
            return `[느끼다]\n오늘은 "${task}" 작업을 진행했다. 예상치 못한 이슈가 있었지만 동료들과 논의하며 해결해 나갔다.\n\n[깨우다]\n기본기의 중요성을 다시금 느꼈다. 코드를 작성하기 전 설계를 더 꼼꼼히 해야겠다.\n\n[바꾸다]\n다음 작업부터는 체크리스트를 활용해 실수를 줄여야겠다.`;
        }

        // ==========================================
        // DOM 조작 로직 (기존과 동일)
        // ==========================================
        const callbacks = {
            phase1: function phase1() {
                // ... 기존 로직 ...
                function selectMultiples() {
                    function notIncludesNumber(el) { return !/\d/.test(el.innerHTML); }
                    const keywords = ['목적중심', '긍정열기', '결과추적', '성과중심', '전략검토', '합리검토', '감정 점검', '최선 태도', '변화 의지'];
                    keywords.forEach(key => {
                        const el = Array.from(document.querySelectorAll('button')).find(b => notIncludesNumber(b) && b.innerHTML.includes(key));
                        if (el) el.click();
                    });
                }
                function selectNumbers() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:has(svg))')).find((el) => el.innerHTML.includes('9점'));
                    if (findEl) findEl.click();
                }
                function clickConfirm() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)')).find((el) => el.innerHTML === '확인');
                    if (findEl) { findEl.click(); _startPhaseAfterSecond('phase2'); }
                }
                selectMultiples(); selectNumbers(); clickConfirm();
            },
            phase2: function phase2() {
                // ... 기존 로직 ...
                function feeling() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)')).find((el) => el.innerHTML.includes('뿌듯한'));
                    if (findEl) findEl.click();
                }
                function temper() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)')).find((el) => el.innerHTML.includes('매우 만족'));
                    if (findEl) findEl.click();
                }
                function slider() {
                    document.querySelectorAll('[role="slider"]').forEach(el => {
                        el.focus(); el.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
                    });
                }
                function clickConfirm() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)')).find((el) => el.innerHTML === '확인');
                    if (findEl) { findEl.click(); _startPhaseAfterSecond('phase3'); }
                }
                feeling(); temper(); slider(); clickConfirm();
            },
            phase3: function phase3() {
                 function selectTarget() {
                    const findLastConversation = document.querySelector('li:last-of-type>section>:nth-child(2)>:nth-child(1)')
                    if (findLastConversation) findLastConversation.click();
                }
                function clickConfirm() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)')).find((el) => el.innerHTML.includes('확인'));
                    if (findEl) { findEl.click(); _startPhaseAfterSecond('phase4') }
                }
                selectTarget(); clickConfirm();
            },
            phase4: function phase4() {
                function selectFree() {
                    const findFree = document.querySelector('li:last-of-type>div:last-of-type>:nth-child(2)>:nth-child(2)>:nth-child(3)')
                    if (findFree) findFree.click();
                }
                function clickConfirm() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)')).find((el) => el.innerHTML === '확인');
                    if (findEl) { findEl.click(); _startPhaseAfterSecond('phase5'); }
                }
                selectFree(); clickConfirm();
            },
            phase5: function phase5() {
                async function writeRetrospective() {
                    if (retrospectiveWritten) return;
                    const textareas = Array.from(document.querySelectorAll('textarea'));
                    const editableDivs = Array.from(document.querySelectorAll('[contenteditable="true"]'));
                    const inputs = Array.from(document.querySelectorAll('input[type="text"]'));
                    const targetElement = textareas[textareas.length - 1] || editableDivs[editableDivs.length - 1] || inputs[inputs.length - 1];

                    if (targetElement && todayTask) {
                        const retrospectiveText = await requestRetrospectiveFromGemini(todayTask);
                        if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
                            targetElement.value = retrospectiveText;
                            targetElement.dispatchEvent(new Event('input', { bubbles: true }));
                            targetElement.dispatchEvent(new Event('change', { bubbles: true }));
                        } else if (targetElement.contentEditable === 'true') {
                            targetElement.textContent = retrospectiveText;
                            targetElement.dispatchEvent(new Event('input', { bubbles: true }));
                        }
                        retrospectiveWritten = true;
                        console.log('📝 회고 입력 완료');
                    }
                }
                function passThings() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).find(v => v.innerHTML.includes('넘어갈게요'));
                    if (findEl) findEl.click();
                }
                function completeCSR() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).find(v => v.innerHTML.includes('회고 완료'));
                    if (findEl && completeCsrCount === 1) { findEl.click(); completeCsrCount++; }
                }
                function completeCSR2() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)')).find(v => v.innerHTML.includes('회고 완료'));
                    if (findEl && completeCsrCount === 0) { findEl.click(); completeCsrCount++; }
                }
                function doitNextOrShare() {
                    const findShareEl = Array.from(document.querySelectorAll('li:last-of-type button')).find(v => v.innerHTML.includes('공유하기'));
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).find(v => v.innerHTML.includes('다음에 할게요'));
                    if (findShareEl && findEl && findShareEl.parentNode === findEl.parentNode) { findShareEl.click(); return; }
                    if (findEl) findEl.click();
                }
                function checkLastShareMember() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).find(v => v.innerHTML.includes('직전 공유 대상자 불러오기'));
                    if (findEl) findEl.click();
                }
                function share() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).find(v => v.innerHTML.includes('공유하기'));
                    if (findEl) findEl.click();
                }
                function checkConfirm() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).find(v => v.innerHTML.includes('확인'));
                    if (findEl) findEl.click();
                }
                function findEndpoint() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:has(svg):not(:disabled)')).find(v => v.innerHTML.includes('회고 완료'));
                    if (findEl) { findEl.click(); observerMaps.get('phase5')?.disconnect(); observerMaps.delete('phase5'); _end(); }
                }
                writeRetrospective(); passThings(); completeCSR(); completeCSR2(); doitNextOrShare(); checkLastShareMember(); share(); checkConfirm(); findEndpoint();
            }
        }
        let _current = ''; let interval = null; let observerMaps = new Map();
        function _end() { clearInterval(interval); console.log('✅ 스크립트 완료!'); }
        function _startPhase(cb) { let cbFunc = typeof cb === 'function' ? cb : callbacks[cb]; _current = cb.name; _end(); interval = setInterval(cbFunc, 1000); }
        function _startPhaseAfterSecond(cb, second = 1) { _end(); setTimeout(() => { _startPhase(cb); }, second * 1000); }
        
        return {
            init: function (autoStart = true, taskInput = null) {
                if (!taskInput && autoStart) {
                    todayTask = prompt('📝 오늘 한 일을 입력하세요:', '14.2.0 개발 및 디자인 수정');
                    if (!todayTask) { console.error('❌ 작업 미입력'); return; }
                } else if (taskInput) { todayTask = taskInput; }
                console.log('✅ Gemini API 모드 (서버 불필요)');
                this.modifySetTimeout(); this.registerSetTimeoutIgnore(20);
                if (autoStart) _startPhase('phase1');
            },
            modifySetTimeout: function () {
                window.setTimeout = function (callback, delay, ...args) {
                    if (setTimeoutSet.has(delay)) { delay = 0; } return originalSetTimeout(callback, delay, ...args);
                };
            },
            registerSetTimeoutIgnore: function (delay) { setTimeoutSet.add(delay); },
            startPhase: _startPhase, end: _end,
            resetApiKey: function() {
                localStorage.removeItem('MY_GEMINI_KEY');
                alert('🗑️ API 키가 삭제되었습니다. 다시 실행하면 새로 입력할 수 있습니다.');
            }
        }
    })()
    window.__SPYMODULE = Module;
    Module.init(true);
})();