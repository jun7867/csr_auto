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
역할: 5년 차 시니어 프론트엔드 개발자
목표: 입력된 "오늘 한 일"을 바탕으로 회고 작성

[작성 규칙]
1. 톤앤매너: 5년 차 개발자의 담백하고 전문적인 말투. 번역투 절대 금지.
2. 길이: 1000자 이상 2000자 내외로 디테일하게 작성.
3. 금지: 이모지(❌), 마크다운 볼드(**), 상투적 서두.

[출력 형식]
[느끼다], [깨우다], [바꾸다] 3가지 섹션으로 작성.

오늘 한 일: {{TASK}}
`;

        async function requestRetrospectiveFromGemini(task) {
            console.log('✨ Gemini에게 회고 작성을 요청합니다...');

            // 1. 저장된 키 가져오기
            const GEMINI_API_KEY = getApiKey();

            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

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
                        // 키가 틀렸을 경우 삭제 유도
                        localStorage.removeItem('MY_GEMINI_KEY');
                        alert('❌ API 키가 올바르지 않아 삭제했습니다. 다시 실행해서 키를 재입력하세요.');
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