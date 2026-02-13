// ============================================
// 🚀 회고 자동화 스크립트 v2 - Claude API 연동
// ============================================
// 사용법: 
// 1. 로컬 서버 실행: npm start
// 2. 이 파일 전체를 복사해서 브라우저 콘솔에 붙여넣기
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

        const GUIDE_CONTENT = `# 회고 작성 가이드

당신은 5년 차 프론트엔드 개발자입니다.
아래 "오늘 한 일"을 바탕으로 회고 텍스트를 작성해주세요.

## 작성 규칙
1. 말투는 담백하고 전문적으로 작성할 것.
2. '문제 -> 해결 -> 배운 점' 구조를 유지할 것.
3. 너무 길지 않게 3~5줄 내외로 요약할 것.
4. 이모지는 쓰지마. ** 이런것도 쓰지말고.`;

        // Claude API 호출 (로컬 프록시 서버 통해)
        async function requestRetrospectiveFromClaude(task) {
            console.log('🤖 Claude API를 통해 회고 생성 중...');

            try {
                const response = await fetch('http://localhost:3000/generate-retrospective', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        task: task,
                        guide: GUIDE_CONTENT
                    })
                });

                if (!response.ok) {
                    throw new Error(`서버 오류: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    console.log('✅ Claude API 회고 생성 완료!');
                    return data.retrospective;
                } else {
                    throw new Error(data.error || '알 수 없는 오류');
                }

            } catch (error) {
                console.error('❌ API 호출 실패:', error.message);
                console.log('⚠️ 폴백 템플릿 사용');
                return generateFallbackRetrospective(task);
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

        const callbacks = {
            phase1: function phase1() {
                console.log("Phase1");
                function selectMultiples() {
                    function notIncludesNumber(el) {
                        return el.innerHTML.includes('1') || el.innerHTML.includes('2') || el.innerHTML.includes('3') || el.innerHTML.includes('4') || el.innerHTML.includes('5') || el.innerHTML.includes('6') || el.innerHTML.includes('7') || el.innerHTML.includes('8') || el.innerHTML.includes('9') || el.innerHTML.includes('0');
                    }
                    const findEl1 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('목적중심'));
                    if (findEl1.length > 0) findEl1[0].click();
                    const findEl2 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('긍정열기'));
                    if (findEl2.length > 0) findEl2[0].click();
                    const findEl3 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('결과추적'));
                    if (findEl3.length > 0) findEl3[0].click();
                    const findEl4 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('성과중심'));
                    if (findEl4.length > 0) findEl4[0].click();
                    const findEl5 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('전략검토'));
                    if (findEl5.length > 0) findEl5[0].click();
                    const findEl6 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('합리검토'));
                    if (findEl6.length > 0) findEl6[0].click();
                    const findEl7 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('감정 점검'));
                    if (findEl7.length > 0) findEl7[0].click();
                    const findEl8 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('최선 태도'));
                    if (findEl8.length > 0) findEl8[0].click();
                    const findEl9 = Array.from(document.querySelectorAll('button').values()).filter((el) => notIncludesNumber(el) && el.innerHTML.includes('변화 의지'));
                    if (findEl9.length > 0) findEl9[0].click();
                }
                function selectNumbers() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:has(svg))').values()).filter((el) => el.innerHTML.includes('9점'));
                    if (findEl.length > 0) findEl[0].click();
                }
                function clickConfirm() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)').values()).filter((el) => el.innerHTML === '확인');
                    if (findEl.length > 0) {
                        findEl[0].click();
                        _startPhaseAfterSecond('phase2');
                    }
                }
                selectMultiples();
                selectNumbers();
                clickConfirm();
            },
            phase2: function phase2() {
                console.log("Phase2");
                function feeling() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)').values()).filter((el) => el.innerHTML.includes('뿌듯한'));
                    if (findEl.length > 0) findEl[0].click();
                }
                function temper() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)').values()).filter((el) => el.innerHTML.includes('매우 만족'));
                    if (findEl.length > 0) findEl[0].click();
                }
                function slider() {
                    const findSlider = Array.from(document.querySelectorAll('[role="slider"]'));
                    function slideToEnd(el) {
                        el.focus();
                        el.dispatchEvent(new KeyboardEvent('keydown', {
                            key: 'End',
                            bubbles: true
                        }));
                    }
                    findSlider.forEach(slideToEnd);
                }
                function clickConfirm() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)').values()).filter((el) => el.innerHTML === '확인');
                    if (findEl.length > 0) {
                        findEl[0].click();
                        _startPhaseAfterSecond('phase3');
                    }
                }
                feeling();
                temper();
                slider();
                clickConfirm();
            },
            phase3: function phase3() {
                console.log("Phase3");
                function selectTarget() {
                    const findLastConversation = document.querySelector('li:last-of-type>section>:nth-child(2)>:nth-child(1)')
                    if (findLastConversation) findLastConversation.click();
                }
                function clickConfirm() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)').values()).filter((el) => el.innerHTML.includes('확인'));
                    if (findEl.length > 0) {
                        findEl[0].click();
                        _startPhaseAfterSecond('phase4')
                    }
                }
                selectTarget();
                clickConfirm();
            },
            phase4: function phase4() {
                console.log("Phase4");
                function selectFree() {
                    const findFree = document.querySelector('li:last-of-type>div:last-of-type>:nth-child(2)>:nth-child(2)>:nth-child(3)')
                    if (findFree) findFree.click();
                }
                function clickConfirm() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)').values()).filter((el) => el.innerHTML === '확인');
                    if (findEl.length > 0) {
                        findEl[0].click();
                        _startPhaseAfterSecond('phase5');
                    }
                }
                selectFree();
                clickConfirm();
            },
            phase5: function phase5() {
                console.log("Phase5", completeCsrCount);

                async function writeRetrospective() {
                    if (retrospectiveWritten) return;

                    const textareas = Array.from(document.querySelectorAll('textarea'));
                    const editableDivs = Array.from(document.querySelectorAll('[contenteditable="true"]'));
                    const inputs = Array.from(document.querySelectorAll('input[type="text"]'));

                    const targetElement = textareas[textareas.length - 1] ||
                                        editableDivs[editableDivs.length - 1] ||
                                        inputs[inputs.length - 1];

                    if (targetElement && todayTask) {
                        const retrospectiveText = await requestRetrospectiveFromClaude(todayTask);

                        if (targetElement.tagName === 'TEXTAREA' || targetElement.tagName === 'INPUT') {
                            targetElement.value = retrospectiveText;
                            targetElement.dispatchEvent(new Event('input', { bubbles: true }));
                            targetElement.dispatchEvent(new Event('change', { bubbles: true }));
                        }
                        else if (targetElement.contentEditable === 'true') {
                            targetElement.textContent = retrospectiveText;
                            targetElement.dispatchEvent(new Event('input', { bubbles: true }));
                        }

                        retrospectiveWritten = true;
                        console.log('📝 회고 입력 완료');
                    }
                }

                function passThings() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).filter(v => v.innerHTML.includes('넘어갈게요'));
                    if (findEl.length > 0) findEl[0].click();
                }
                function completeCSR() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).filter(v => v.innerHTML.includes('회고 완료'));
                    if (findEl.length > 0 && completeCsrCount === 1) {
                        findEl[0].click();
                        completeCsrCount++;
                    }
                }
                function completeCSR2() {
                    const findEl = Array.from(document.querySelectorAll('button:not(:disabled)')).filter(v => v.innerHTML.includes('회고 완료'));
                    if (findEl.length > 0 && completeCsrCount === 0) {
                        findEl[0].click();
                        completeCsrCount++;
                    }
                }
                function doitNextOrShare() {
                    const findShareEl = Array.from(document.querySelectorAll('li:last-of-type button')).filter(v => v.innerHTML.includes('공유하기'));
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).filter(v => v.innerHTML.includes('다음에 할게요'));
                    if (findShareEl.length > 0 && findEl.length > 0 && findShareEl[0]?.parentNode === findEl[0]?.parentNode) {
                        findShareEl[0].click();
                        return;
                    }
                    if (findEl.length > 0) findEl[0]?.click();
                }
                function checkLastShareMember() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).filter(v => v.innerHTML.includes('직전 공유 대상자 불러오기'));
                    if (findEl.length > 0) findEl[0].click();
                }
                function share() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).filter(v => v.innerHTML.includes('공유하기'));
                    if (findEl.length > 0) findEl[0].click();
                }
                function checkConfirm() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:not(:disabled)')).filter(v => v.innerHTML.includes('확인'));
                    if (findEl.length > 0) findEl[0].click();
                }
                function findEndpoint() {
                    const findEl = Array.from(document.querySelectorAll('li:last-of-type button:has(svg):not(:disabled)')).filter(v => v.innerHTML.includes('회고 완료'));
                    if (findEl.length > 0) {
                        findEl[0].click();
                        observerMaps.get('phase5')?.disconnect();
                        observerMaps.delete('phase5');
                        _end();
                    }
                }

                writeRetrospective();
                passThings();
                completeCSR();
                completeCSR2();
                doitNextOrShare();
                checkLastShareMember();
                share();
                checkConfirm();
                findEndpoint();
            }
        }
        let _current = '';
        let observer = null;
        let observerMaps = new Map();
        let interval = null;
        function _end() {
            clearInterval(interval);
            console.log('✅ 스크립트 완료!');
        }
        function _startPhase(cb) {
            let cbFunc = typeof cb === 'function' ? cb : callbacks[cb];
            _current = cb.name;
            _end();
            interval = setInterval(cbFunc, 1000);
        }
        function _startPhaseAfterSecond(cb, second = 1) {
            _end();
            setTimeout(() => {
                _startPhase(cb);
            }, second * 1000);
        }
        return {
            init: function (autoStart = true, taskInput = null) {
                if (!taskInput && autoStart) {
                    todayTask = prompt('📝 오늘 한 일을 입력하세요:', '14.2.0 개발 및 디자인 수정');
                    if (!todayTask) {
                        console.error('❌ 작업이 입력되지 않았습니다. 스크립트를 종료합니다.');
                        return;
                    }
                } else if (taskInput) {
                    todayTask = taskInput;
                }

                console.log('✅ 입력된 작업:', todayTask);
                console.log('🔗 로컬 서버 연결: http://localhost:3000');

                this.modifySetTimeout();
                this.registerSetTimeoutIgnore(20);
                if (autoStart) _startPhase('phase1');
            },
            modifySetTimeout: function () {
                window.setTimeout = function (callback, delay, ...args) {
                    if (setTimeoutSet.has(delay)) {
                        delay = 0;
                    }
                    return originalSetTimeout(callback, delay, ...args);
                };
            },
            registerSetTimeoutIgnore: function (delay) {
                setTimeoutSet.add(delay);
            },
            startPhase: _startPhase,
            end: _end,
            setTask: function(task) {
                todayTask = task;
                console.log('✅ 작업 설정:', task);
            },
            get current() {
                return _current;
            }
        }
    })()
    window.__SPYMODULE = Module;
    Module.init(true);
})();

console.log('🎉 회고 자동화 스크립트 (Claude API 연동) 로드 완료!');
console.log('💡 로컬 서버가 실행 중인지 확인하세요: http://localhost:3000/health');
