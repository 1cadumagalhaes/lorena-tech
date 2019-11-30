(function (name, context, definition) {
    'use strict'
    if (typeof window !== 'undefined' && typeof define === 'function' && define.amd) {
        define(definition)
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = definition()
    } else if (context.exports) {
        context.exports = definition()
    } else {
        context[name] = definition()
    }
})('ccWebRecorderInit', this, function () {
    'use-strict'
    const init_cc_recorder = () => {
        const IOS_FP_KEY = 'cc_ios_fp'
        const PAGE_KEY = 'cc_page_id'
        const VISIT_KEY = 'cc_visit_id'
        const STEP_KEY = 'cc_save_step'
        const EVENTS_ENDPOINT = 'https://monitor.clickcease.com/V2/recorder/entry2'
        const STATSV2_ENDPOINT = 'https://monitor.clickcease.com/monitor/api/statsV2'

        const guid = () => {
            var chars = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"];
            var str = "";
            for (var i = 0; i < 36; i++) {
                str = str + (i === 8 || i === 13 || i === 18 || i === 23 ? "-" : chars[Math.floor(Math.random() * chars.length)]);
            }
            return str;
        }

        const getLocalStorageProp = (key) => localStorage.getItem(key)
        const setLocalStorageProp = (key) => localStorage.setItem(key, guid())

        const getSessionProp = (key) => sessionStorage.getItem(key)
        const setSessionProp = (key) => sessionStorage.setItem(key, guid())

        const setSessionProps = () => {
            setSessionProp(PAGE_KEY)
            setSessionProp(VISIT_KEY)
        }

        const shouldRecord = () => {
            if (getSessionProp(VISIT_KEY)) return true

            var { hash, search } = window.location;
            var queryKeys = ['gclid', 'msclkid', 'utm']
            var shouldRecord = false
            queryKeys.forEach(key => {
                if (hash.includes(key) || search.includes(key)) {
                    shouldRecord = true
                }
            })

            return shouldRecord

        }

        const JSON_BODY = ({ isStart, events }) => {
            const action = isStart ? 'start' : 'events';
            const href = location.href;
            const body = {
                action,
                page_id: getSessionProp(PAGE_KEY),
                visit_id: getSessionProp(VISIT_KEY),
                location: href,
                action_log: { events }
            }
            return JSON.stringify(body);
        }
        const getAllSizes = () => {
            let body = document.body;
            let html = document.documentElement;
            return {
                'window_inner_width': window.innerWidth,
                'window_inner_height': window.innerHeight,
                'window_outer_width': window.outerWidth,
                'window_outer_height': window.outerHeight,
                'window_screen_width': window.screen.width,
                'window_screen_height': window.screen.height,
                'body_scroll_width': body.scrollWidth,
                'body_scroll_height': body.scrollHeight,
                'body_offset_width': body.offsetWidth,
                'body_offset_height': body.offsetHeight,
                'html_client_width': html.clientWidth,
                'html_client_height': html.clientHeight,
                'html_scroll_width': html.scrollWidth,
                'html_scroll_height': html.scrollHeight,
                'html_offset_width': html.offsetWidth,
                'html_offset_height': html.offsetHeight
            };
        }

        const isValidGUID = id => {
            return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(id)
        }

        const startRecording = () => {
            let events = [];
            let saveBeforeUnload = false;
            let saveInterval = 0;
            let saveTimeMS = 5000;
            let maxSessionLength = 60000
            let sessionSaveStep = getSessionProp(STEP_KEY) || 0;

            ccWebRecorder({
                emit(event) {
                    if (event.type == 4) {
                        event.user_agent = encodeURIComponent(navigator.userAgent.replace('"', ''))
                        event.sizes = getAllSizes();
                    }
                    events.push(event);
                },
            });

            window.addEventListener('beforeunload', async () => {
                if (saveBeforeUnload) await save()
            });

            const save = () => {
                sessionSaveStep++
                sessionStorage.setItem(STEP_KEY, sessionSaveStep)
                if (saveTimeMS * sessionSaveStep > maxSessionLength) {
                    console.log('session ended')
                    sessionStorage.removeItem(VISIT_KEY)
                    sessionStorage.removeItem(PAGE_KEY)
                    return clearInterval(saveInterval)
                }

                if (events.length == 0) return
                if (!isValidGUID(getSessionProp(VISIT_KEY)) || !isValidGUID(getSessionProp(PAGE_KEY))) {
                    console.error('No visit id or page id')
                    console.log(VISIT_KEY, getSessionProp(VISIT_KEY))
                    console.log(PAGE_KEY, getSessionProp(PAGE_KEY))
                    return clearInterval(saveInterval)
                }

                const body = JSON_BODY({ isStart: !saveBeforeUnload, events })
                events = [];
                saveBeforeUnload = true;
                return fetch(EVENTS_ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body,
                });
            }

            save();
            saveInterval = setInterval(save, saveTimeMS);
        }

        const getStatsV2 = async (data) => {
            const response = await fetch(STATSV2_ENDPOINT, {
                method: 'post',
                body: JSON.stringify(data)
            }).then(res => res.json())

            if (response == 1) {
                if (!getSessionProp(VISIT_KEY)) {
                    setSessionProps()
                } else {
                    setSessionProp(PAGE_KEY)
                }
                startRecording();
            }
        }

        if (shouldRecord()) {
            const isIOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
            if (isIOS) {
                if (!getLocalStorageProp(IOS_FP_KEY)) setLocalStorageProp(IOS_FP_KEY)
                const fp = getLocalStorageProp(IOS_FP_KEY);
                const ref = decodeURI(document.referrer);
                const data = { referrer: ref, Fp: fp, href: window.location.href };
                getStatsV2(data)
            }
            else {
                try {
                    window.Fingerprint2.getV18(async (result, components) => {
                        const ref = decodeURI(document.referrer);
                        const data = { referrer: ref, Fp: result, href: window.location.href };
                        getStatsV2(data)
                    });
                }
                catch (err) {
                    console.error('err:', err)
                }
            }

        }
    }

    const shouldStartRecorder = () => {
        if (document.readyState === "complete") init_cc_recorder();
    }

    document.addEventListener('readystatechange', () => {
        shouldStartRecorder();
    })

    shouldStartRecorder();

    return {
        name: 'cc_init',
        context: this
    }
})
