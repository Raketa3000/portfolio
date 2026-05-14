(function() {
        addEventListener('DOMContentLoaded', function() {
          var $ = function(s, r) {
              return (r || document).querySelector(s)
            },
            $$ = function(s, r) {
              return [...((r || document).querySelectorAll(s))]
            },
            E = {
              body: document.body,
              root: document.documentElement,
              w: $('#w'),
              secs: $$('.section'),
              nav: $('nav'),
              menu: $('#menu-overlay'),
              menuIn: $('.menu__inner'),
              menuItems: $$('.menu__item'),
              menuMask: $('.menu__mask'),
              lang: $('#lang-switcher'),
              langButtons: $$('.lang-switcher__item'),
              btn: $('#btn-cases'),
              dev: $('#dev-toggle'),
              heroA: $('#h-a'),
              heroB: $('#h-b'),
              heroLoop: $('#h-loop'),
              heroFly: $$('[data-fly]'),
              contactLoop: $('#contact-loop'),
              grid: $('#cases-grid'),
              stage: $('#case-stage'),
              close: $('#case-stage-close'),
              bodyPane: $('#case-stage-body'),
              mediaCursor: null,
              cat: $('#cs-cat'),
              brand: $('#cs-brand'),
              title: $('#cs-title'),
              baClock: $('#ba-clock'),
              mskClock: $('#msk-clock'),
              baStatus: $('#ba-status'),
              mskStatus: $('#msk-status'),
              cards: []
            };
          if (!E.w || !E.secs.length) return;
          var SITE_DATA = {
              previews: [{
                title: ['Это вышка']
              }, {
                title: ['Кибербитва с мошенниками']
              }, {
                title: ['Как не уработаться в декабре', 'с Прохором Шаляпиным?']
              }, {
                title: ['Атака титанов']
              }, {
                title: ['Стратегия для бренда', 'презервативов']
              }],
              screens: {
                s0: {
                  reveal: 100,
                  nav: 'hero-only'
                },
                s1: {
                  reveal: 80
                },
                's1-2': {
                  reveal: 80
                },
                s2: {
                  reveal: 80
                },
                s3: {
                  reveal: 110,
                  navIcon: 'back'
                }
              },
              layout: {
                flowOrder: ['context', 'task', 'insight', 'strategy', 'strategic_solution', 'solution', 'result',
                  'awards'
                ],
                zones: [{
                  startRow: 2,
                  endRow: 4,
                  half: ['1/span 3', '4/span 3'],
                  wide: '1/span 6'
                }, {
                  startRow: 4,
                  endRow: Infinity,
                  half: ['7/span 3', '10/span 3'],
                  wide: '7/span 6'
                }],
                wideHeightThreshold: 210,
                fallbackWideChars: 300
              },
              fieldTitles: {}
            },
            D = {
              cases: [],
              casesPromise: null,
              heroWords: ['ПРОБОВАТЬ', 'СМОТРЕТЬ', 'ИСКАТЬ', 'ПОКУПАТЬ'],
              contactWords: ['СТРАТЕГИЮ', 'КРЕАТИВ', 'ПРОЕКТ', 'КАМПАНИЮ'],
              contactIntroDelayMs: 1600,
              contactLoopStartDelayMs: 2400,
              glyphsByLocale: {
                ru: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ',
                en: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                'es-la': 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'
              },
              heroIntroDelayMs: 1600,
              heroLoopStartDelayMs: 2400,
              scrambleMs: 1100,
              loopMs: 1750,
              transitionMs: 750,
              menuAnimationMs: 900,
              sectionLock: 650,
              backIcon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 3v6h6"></path></svg>',
              caseDataVersion: '2026-05-14-case-localization',
              caseFiles: ['beeline-eto-vyshka', 'beeline-kiberbitva-s-moshennikami', 'letual-prohor-shalyapin',
                'burger-king', 'condoms'
              ],
              caseBrandIds: ['beeline', 'beeline', 'letual', 'burgerKing', ''],
              supportedLocales: ['ru', 'en', 'es-la'],
              defaultLocale: 'ru'
            },
            T = {},
            S = {
              section: 's0',
              busy: false,
              wheel: 0,
              contactWord: 0,
              revealed: {},
              clientCountsPlayed: false,
              heroMenuPlayed: false,
              overlay: {
                open: false,
                caseIndex: null,
                openOrder: 0
              },
              ui: {
                dev: false
              },
              locale: D.defaultLocale,
              i18n: null
            };
          var ids = E.secs.map(function(s) {
              return s.id
            }),
            curr = function() {
              return S.section
            },
            txt = function(el, v) {
              if (el) el.textContent = v
            },
            html = function(el, v) {
              if (el) el.innerHTML = v
            },
            cls = function(el, c, on) {
              if (el) el.classList.toggle(c, !!on)
            },
            clear = function(k, interval) {
              if (!T[k]) return;
              (interval ? clearInterval : clearTimeout)(T[k]);
              T[k] = null
            },
            cancelFrame = function(k) {
              if (!T[k]) return;
              cancelAnimationFrame(T[k]);
              T[k] = null
            },
            escapeHtml = function(s) {
              return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g,
                '&quot;')
            },
            screenCfg = function(id) {
              return SITE_DATA.screens[id] || {}
            },
            scrambleGlyphs = function() {
              return D.glyphsByLocale[S.locale] || D.glyphsByLocale.en
            },
            toRawUrl = function(v) {
              return 'assets/cases/' + v + '.json?v=' + encodeURIComponent(D.caseDataVersion)
            },
            toLocalizedCaseUrl = function(v, locale) {
              return 'assets/cases/' + locale + '/' + v + '.json?v=' + encodeURIComponent(D.caseDataVersion)
            };

          function mergeDeep(base, extra) {
            var out = Array.isArray(base) ? base.slice() : Object.assign({}, base || {});
            Object.keys(extra || {}).forEach(function(key) {
              var value = extra[key],
                prev = out[key];
              out[key] = value && typeof value === 'object' && !Array.isArray(value) && prev && typeof prev ===
                'object' && !Array.isArray(prev) ? mergeDeep(prev, value) : value
            });
            return out
          }

          function localeFromRequest() {
            var fromUrl = new URLSearchParams(location.search).get('lang'),
              requested = String(fromUrl || '').toLowerCase(),
              stored = String(localStorage.getItem('site-lang') || '').toLowerCase(),
              languages = Array.prototype.slice.call(navigator.languages || [navigator.language || '']),
              detected;
            if (D.supportedLocales.indexOf(requested) > -1) return requested;
            if (D.supportedLocales.indexOf(stored) > -1) return stored;
            detected = languages.map(function(lang) {
              lang = String(lang || '').toLowerCase();
              if (lang === 'es-la' || lang === 'es-419' || lang.indexOf('es-') === 0 || lang === 'es') return 'es-la';
              if (lang.indexOf('en') === 0) return 'en';
              if (lang.indexOf('ru') === 0) return 'ru';
              return ''
            }).find(function(lang) {
              return D.supportedLocales.indexOf(lang) > -1
            });
            return detected || D.defaultLocale
          }

          function fetchLocale(locale) {
            return fetch('assets/i18n/' + locale + '.json?v=' + encodeURIComponent(D.caseDataVersion)).then(function(r) {
              if (!r.ok) throw new Error(locale);
              return r.json()
            })
          }

          function loadLocale(localeOverride) {
            var locale = localeOverride || localeFromRequest();
            return fetchLocale(D.defaultLocale).then(function(base) {
              if (locale === D.defaultLocale) return base;
              return fetchLocale(locale).then(function(extra) {
                return mergeDeep(base, extra)
              }).catch(function() {
                return base
              })
            }).then(function(dict) {
              S.locale = dict.locale || locale;
              S.i18n = dict;
              return dict
            })
          }

          function setHtml(selector, value, root) {
            var el = $(selector, root);
            if (el && value != null) html(el, value)
          }

          function setText(selector, value, root) {
            var el = $(selector, root);
            if (el && value != null) txt(el, value)
          }

          function applyLocale(dict) {
            var meta = dict.meta || {},
              nav = dict.nav || {},
              languages = dict.languages || {},
              hero = dict.hero || {},
              services = dict.services || {},
              clients = dict.clients || {},
              works = dict.works || {},
              contact = dict.contact || {},
              caseStage = dict.caseStage || {};
            E.root.lang = dict.htmlLang || dict.locale || D.defaultLocale;
            E.root.setAttribute('xml:lang', dict.htmlLang || dict.locale || D.defaultLocale);
            E.body.setAttribute('data-locale', dict.locale || D.defaultLocale);
            if (meta.title) document.title = meta.title;
            setAttr('meta[name="description"]', 'content', meta.description);
            setAttr('meta[name="keywords"]', 'content', meta.keywords);
            if (E.nav && nav.label) E.nav.setAttribute('aria-label', nav.label);
            if (E.btn && nav.next) E.btn.setAttribute('aria-label', nav.next);
            if (E.dev && nav.dev) E.dev.setAttribute('aria-label', nav.dev);
            if (E.lang && languages.label) E.lang.setAttribute('aria-label', languages.label);
            E.langButtons.forEach(function(button) {
              var lang = button.getAttribute('data-lang');
              button.classList.toggle('is-active', lang === S.locale);
              button.setAttribute('aria-pressed', String(lang === S.locale));
              if (languages.options && languages.options[lang]) button.setAttribute('aria-label', languages.options[lang])
            });
            Object.keys(nav.items || {}).forEach(function(id) {
              setText('.menu__item[data-target="' + id + '"]', nav.items[id])
            });
            setHtml('#h-a', hero.first);
            if (E.heroB) E.heroB.innerHTML = (hero.secondLead || '') + '<br><span class="hero-inline-wrap">' +
              (hero.desire || '') + '</span><br><span class="hero-loop-line"><span id="h-loop"></span></span>';
            E.heroLoop = $('#h-loop');
            setHtml('.hero-copy', hero.copy);
            D.heroWords = hero.words || D.heroWords;
            setText('#s1 .services-label', services.label);
            $$('#s1 .service-card').forEach(function(card, i) {
              var data = services.cards && services.cards[i];
              if (!data) return;
              setHtml('.card-title', data.title, card);
              setHtml('.card-desc', data.description, card)
            });
            setText('#s1-2 .services-label', clients.label);
            Object.keys(clients.items || {}).forEach(function(id) {
              setClientLabel(id, clients.items[id])
            });
            setText('#s2 .services-label', works.label);
            setHtml('#contact-a', contact.first);
            if ($('#contact-b')) $('#contact-b').innerHTML = (contact.secondPrefix || '') + '<br><span id="contact-loop"></span><br>' +
              (contact.secondSuffix || '');
            E.contactLoop = $('#contact-loop');
            D.contactWords = contact.words || D.contactWords;
            var profiles = contact.profiles || {};
            setAttr('.contact-photo--left img', 'alt', profiles.leftAlt);
            setAttr('.contact-photo--right img', 'alt', profiles.rightAlt);
            setHtml('.contact-member--left .case-cat', profiles.leftRole);
            setHtml('.contact-member--left .card-title', profiles.leftName);
            setHtml('.contact-member--right .case-cat', profiles.rightRole);
            setHtml('.contact-member--right .card-title', profiles.rightName);
            var locations = contact.locations || {};
            setText('.contact-info--ba .contact-info__label', locations.ba);
            setText('.contact-info--msk .contact-info__label', locations.msk);
            var briefs = contact.briefs || {};
            setText('.contact-info--telegram .contact-info__label', briefs.strategyLabel);
            setText('.contact-info--email .contact-info__label', briefs.creativeLabel);
            $$('.contact-info__link-word').forEach(function(el) { txt(el, briefs.send || el.textContent) });
            $$('.contact-info__subvalue').forEach(function(el) {
              if (el.id !== 'ba-status' && el.id !== 'msk-status') txt(el, briefs.channel || el.textContent)
            });
            if (E.close && caseStage.close) E.close.setAttribute('aria-label', caseStage.close);
            SITE_DATA.fieldTitles = caseStage.fieldTitles || SITE_DATA.fieldTitles;
            SITE_DATA.previewsMoreLabel = works.more || SITE_DATA.previewsMoreLabel
          }

          function resetNeonReady() {
            [E.heroA, E.heroB, $('#contact-a'), $('#contact-b')].concat($$('.services-label')).forEach(function(el) {
              if (el) el.removeAttribute('data-neon-ready')
            })
          }

          function updateBrowserLocaleParam(locale) {
            var params = new URLSearchParams(location.search),
              next;
            params.set('lang', locale);
            next = location.pathname + '?' + params.toString() + location.hash;
            history.replaceState(null, document.title, next)
          }

          function restartCurrentScreenAnimations() {
            var section = curr(),
              current = $('#' + section);
            stopHeroMotion(true);
            stopContactMotion(true);
            if (current) {
              $$('.fu', current).forEach(function(el) {
                el.classList.remove('on')
              });
              void current.offsetWidth;
              delete S.revealed[section];
              reveal(section)
            }
            if (section === 's0') scheduleHero();
            if (section === 's3') startContactLoop()
          }

          function switchLocale(locale) {
            if (D.supportedLocales.indexOf(locale) < 0 || locale === S.locale) return;
            localStorage.setItem('site-lang', locale);
            loadLocale(locale).then(function(dict) {
              applyLocale(dict);
              resetNeonReady();
              setupNeonLetters();
              updateContactClocks();
              setMenu(false);
              updateMaster();
              updateBrowserLocaleParam(S.locale);
              if ($('.cases-more .case-title__line', E.grid)) {
                html($('.cases-more .case-title__line', E.grid), fmt(SITE_DATA.previewsMoreLabel || 'Еще больше кейсов'))
              }
              D.cases = [];
              D.casesPromise = null;
              fetchCases().then(function() {
                renderCaseCards();
                bindCaseCards();
                if (S.overlay.open && S.overlay.caseIndex != null) renderCase(S.overlay.caseIndex)
              });
              restartCurrentScreenAnimations();
            })
          }

          function setAttr(selector, attr, value) {
            var el = $(selector);
            if (el && value != null) el.setAttribute(attr, value)
          }

          function setClientLabel(id, value) {
            var el = $('.client-item[data-client-id="' + id + '"]'),
              sup,
              name;
            if (!el || value == null) return;
            sup = $('sup', el);
            Array.from(el.childNodes).forEach(function(node) {
              if (node !== sup) node.remove()
            });
            name = document.createElement('span');
            name.className = 'client-item__name';
            name.textContent = value;
            el.insertBefore(name, sup || null)
          }

          function whenFontsReady(fn) {
            if (!document.fonts || !document.fonts.ready) {
              fn();
              return
            }
            document.fonts.ready.then(fn, fn)
          }

          function cssNumber(name, fallback) {
            var value = parseFloat(getComputedStyle(E.root).getPropertyValue(name));
            return Number.isFinite(value) ? value : fallback
          }

          function gridColumnCount() {
            var fallback = 12;
            if (matchMedia('(max-width: 480px)').matches) fallback = cssNumber('--grid-columns-mobile', 4);
            else if (matchMedia('(max-width: 768px)').matches) fallback = cssNumber('--grid-columns-tablet', 6);
            else fallback = cssNumber('--grid-columns-desktop', 12);
            return Math.max(1, Math.round(cssNumber('--grid-columns', fallback)))
          }

          function gridGap() {
            var fallback = 20;
            if (matchMedia('(max-width: 480px)').matches) fallback = cssNumber('--grid-gap-mobile', 8);
            else if (matchMedia('(max-width: 768px)').matches) fallback = cssNumber('--grid-gap-tablet', 10);
            else fallback = cssNumber('--grid-gap-desktop', 20);
            return cssNumber('--grid-gap', fallback)
          }

          function gridTracks(count) {
            return Array.apply(null, Array(count)).map(function(_, i) {
              return '<div data-i="' + (i + 1) + '"></div>'
            }).join('')
          }

          function typographText(s) {
            var a = s.split(' '),
              o = [],
              i = 0,
              w, n,
              t =
              ',а,и,к,с,у,о,в,я,ты,мы,вы,он,она,оно,они,но,не,ни,на,по,из,от,до,во,со,ко,за,под,над,об,без,для,при,про,или,как,так,это,эта,этот,эти,тот,та,то,те,того,чем,тем,что,чтоб,чтобы,все,всё,еще,ещё,уже,где,где-то,там,тут,вот,ведь,бы,же,ли,либо,его,её,ее,их,ей,ему,им,меня,тебя,себя,мне,тебе,нам,вам,нас,вас,наш,ваш,мой,твой,свой,кто,вся,всех,между,через,перед,после,около,среди,ради,вдоль,насчёт,вместо,помимо,кроме,также,тоже,ну,ах,ох,ой,эй,эх,ух,ого,ага,угу,вау,'
              .toLowerCase(),
              key = function(v) {
                return String(v).toLowerCase().replace(/^[«„“”"'([{]+|[.,:;!?…»“”"')\]}]+$/g, '')
              },
              tightNext = /^(?:[%A-Za-zА-Яа-яЁё₽€$]|№|лет|года|год|дней|дня|день|часов|часа|час|минут|минуты|минута|секунд|секунды|секунда|раз|раза|разов|тыс|млн|млрд)/i,
              result;
            for (; i < a.length; i++) {
              w = a[i];
              n = a[i + 1];
              if (!w) continue;
              if (i < a.length - 1 && ((t.indexOf(',' + key(w) + ',') > -1) || (/^[0-9]+$/.test(key(w)) &&
                  /^[«„“”"'([{]*/.test(n) && tightNext.test(key(n))) || (key(w).length <= 2 &&
                  /^[«„“”"'([{]*[А-Яа-яЁё]/.test(n)))) o.push(w + String.fromCharCode(160) + a[++i]);
              else o.push(w)
            }
            result = o.join(' ');
            return result.replace(/\s+-\s+/g, String.fromCharCode(160) + '— ')
          }

          function walk(n) {
            for (var i = 0, c; i < n.childNodes.length; i++)
              if ((c = n.childNodes[i]).nodeType === 3) c.nodeValue = typographText(c.nodeValue);
              else if (c.nodeType === 1 && c.tagName !== 'SCRIPT' && c.tagName !== 'STYLE') walk(c)
          }

          function fmt(s) {
            return escapeHtml(typographText(String(s))).replace(/\n/g, '<br>').replace(/ /g, '&nbsp;').replace(/\[redact:5\]/g,
              '<span class="case-title-redact" aria-label="замазано"></span>')
          }

          function syncUiState() {
            var open = S.overlay.open,
              section = curr();
            E.body.classList.toggle('nav-hidden', screenCfg(section).nav !== 'hero-only' || open);
            E.body.classList.toggle('dev-on', !!S.ui.dev);
            E.body.setAttribute('data-section', section);
            E.body.setAttribute('data-overlay', open ? 'open' : 'closed');
            E.body.setAttribute('data-dev', S.ui.dev ? 'on' : 'off');
            if (E.stage) {
              E.stage.setAttribute('data-overlay', open ? 'open' : 'closed')
            }
          }

          function renderCaseCards() {
            if (!E.grid) return;
            var previews = D.cases.length ? D.cases.map(function(item) {
              return { title: String(item && item.title || '').split('\n') }
            }) : SITE_DATA.previews;
            E.grid.innerHTML = previews.map(function(x, i) {
              var title = x.title.map(function(line) {
                return '<span class="case-title__line">' + fmt(line) + '</span>'
              }).join('');
              return '<article class="case-card fu' + (i ? ' td-' + i : '') + '" data-case-index="' + i +
                '"><div class="case-title heading">' + title + '</div></article>'
            }).join('') +
              '<button class="cases-more fu td-5" type="button"><span class="case-title heading"><span class="case-title__line">' +
              fmt(SITE_DATA.previewsMoreLabel || 'Еще больше кейсов') + '</span></span></button>';
            E.cards = $$('.case-card');
            if (S.revealed.s2) $$('.fu', E.grid).forEach(function(el) {
              el.classList.add('on')
            })
          }

          function bindCaseCards() {
            E.cards.forEach(function(card) {
              if (card.getAttribute('data-case-bound')) return;
              card.setAttribute('data-case-bound', '1');
              card.addEventListener('click', function() {
                fetchCases().then(function() {
                  openCase(+card.getAttribute('data-case-index'))
                })
              })
            });
            var more = $('.cases-more', E.grid);
            if (more && !more.getAttribute('data-case-bound')) {
              more.setAttribute('data-case-bound', '1');
              more.addEventListener('click', openMoreCases)
            }
          }

          function normalizeCase(item) {
            if (!item || typeof item !== 'object') return null;
            var detail = item.detail || {},
              normalizedDetail = {
                context: detail.context || '',
                task: detail.task || '',
                insight: detail.insight || '',
                strategy: detail.strategy || '',
                strategic_solution: detail.strategic_solution || '',
                solution: detail.solution || '',
                result: detail.result || ''
              };
            if (Array.isArray(detail.blocks)) normalizedDetail.blocks = detail.blocks;
            return {
              cat: item.cat || '',
              brand: item.brand || '',
              title: item.title || '',
              detail: normalizedDetail,
              media: Array.isArray(item.media) ? item.media.filter(function(media) {
                return media && typeof media === 'object' && (media.src || media.sources || media.html || media.id)
              }).map(function(media) {
                return {
                  type: media.type || 'image',
                  id: media.id || '',
                  src: media.src || '',
                  sources: Array.isArray(media.sources) ? media.sources : [],
                  poster: media.poster || '',
                  alt: media.alt || item.title || '',
                  caption: media.caption || '',
                  fit: media.fit || 'contain',
                  layout: media.layout || 'full',
                  aspect: media.aspect || '',
                  gridColumn: media.gridColumn || '',
                  gridRow: media.gridRow || '',
                  alignSelf: media.alignSelf || '',
                  justifySelf: media.justifySelf || '',
                  html: media.html || ''
                }
              }) : [],
              stats: Array.isArray(item.stats) ? item.stats : [],
              awards: Array.isArray(item.awards) ? item.awards : []
            }
          }

          function fetchCases() {
            if (D.cases.length) return Promise.resolve(D.cases);
            if (D.casesPromise) return D.casesPromise;
            D.casesPromise = Promise.all(D.caseFiles.map(function(v) {
              return fetch(toRawUrl(v)).then(function(r) {
                if (!r.ok) throw new Error(v);
                return r.json()
              }).then(function(base) {
                if (S.locale === D.defaultLocale) return base;
                return fetch(toLocalizedCaseUrl(v, S.locale)).then(function(r) {
                  if (!r.ok) throw new Error(v);
                  return r.json()
                }).then(function(extra) {
                  return mergeDeep(base, extra)
                }).catch(function() {
                  return base
                })
              }).then(normalizeCase).catch(function() {
                return null
              })
            })).then(function(loaded) {
              D.cases = loaded;
              D.casesPromise = null;
              return loaded
            }, function(e) {
              D.casesPromise = null;
              throw e
            });
            return D.casesPromise
          }

          function animateScramble(el, target, key) {
            if (!el) return;
            cancelFrame(key);
            var chars = String(target).split(''),
              glyphs = scrambleGlyphs(),
              pool = [],
              shown = {},
              start = performance.now();
            chars.forEach(function(ch, i) {
              if (ch !== ' ') pool.push(i)
            });
            for (var i = pool.length - 1; i > 0; i--) {
              var j = Math.floor(Math.random() * (i + 1)),
                tmp = pool[i];
              pool[i] = pool[j];
              pool[j] = tmp
            }

            function frame(now) {
              var p = Math.min(1, (now - start) / D.scrambleMs),
                revealCount = Math.floor(p * pool.length);
              for (var k = 0; k < revealCount; k++) shown[pool[k]] = 1;
              txt(el, chars.map(function(ch, idx) {
                return ch === ' ' ? ' ' : shown[idx] ? target[idx] : glyphs[Math.floor(Math.random() * glyphs.length)]
              }).join(''));
              if (p < 1) {
                T[key] = requestAnimationFrame(frame)
              } else {
                T[key] = null;
                txt(el, target)
              }
            }
            T[key] = requestAnimationFrame(frame)
          }

          function applyNeonLetters(root, state) {
            var isTop = !state;
            if (!root || (isTop && root.getAttribute('data-neon-ready'))) return;
            state = state || {
              seed: Math.floor(Math.random() * 997),
              wordIndex: 0,
              candidates: []
            };
            root.setAttribute('data-neon-ready', '1');
            Array.from(root.childNodes).forEach(function(node) {
              if (node.nodeType === 3) {
                var frag = document.createDocumentFragment();
                node.nodeValue.split('').forEach(function(ch, i) {
                  if (/\s/.test(ch)) {
                    var space = document.createElement('span');
                    space.className = 'neon-space';
                    space.setAttribute('aria-hidden', 'true');
                    space.textContent = ' ';
                    frag.appendChild(space);
                    state.wordIndex++;
                    return
                  }
                  var span = document.createElement('span'),
                    r = Math.abs(Math.sin((state.seed + i + ch.charCodeAt(0)) * 12.9898) * 43758.5453) % 1,
                    canAnimate = /[A-ZА-ЯЁ]/.test(ch);
                  if (canAnimate) {
                    state.candidates.push({
                      el: span,
                      r: r,
                      word: state.wordIndex
                    })
                  }
                  span.className = 'neon-letter';
                  span.textContent = ch;
                  frag.appendChild(span)
                });
                node.replaceWith(frag)
              } else if (node.nodeType === 1 && node.tagName === 'BR') {
                state.wordIndex++
              } else if (node.nodeType === 1 && !node.id) {
                applyNeonLetters(node, state)
              }
            });
            if (isTop) {
              var byWord = {};
              state.candidates.forEach(function(item) {
                if (!byWord[item.word] || item.r > byWord[item.word].r) byWord[item.word] = item
              });
              Object.keys(byWord).map(function(word) {
                return byWord[word]
              }).sort(function(a, b) {
                return b.r - a.r
              }).slice(0, 2).forEach(function(item, i) {
                item.el.classList.add(item.r > .58 ? 'neon-letter--drop' : 'neon-letter--dim');
                item.el.style.setProperty('--neon-letter-delay', (-(item.r * 9.5 + i * .8)).toFixed(2) + 's');
                item.el.style.setProperty('--neon-letter-duration', (9.5 + (item.r * 4)).toFixed(2) + 's')
              })
            }
          }

          function setupNeonLetters() {
            [E.heroA, E.heroB, $('#contact-a'), $('#contact-b')].forEach(function(el) {
              applyNeonLetters(el)
            });
            $$('.services-label').forEach(function(el) {
              applyNeonLetters(el)
            })
          }

          function resetHero() {
            ['heroScramble', 'contactScramble'].forEach(function(k) {
              cancelFrame(k)
            });
            clear('heroIntro');
            clear('heroSwap');
            clear('heroEnterDone');
            clear('heroSecondLine');
            clear('heroLoopTicker', true);
            clear('contactLoopTicker', true);
            clear('contactIntro');
            clear('contactSecondLine');
            clear('contactSwap');
            clear('contactEnterDone');
            E.heroA && E.heroA.classList.remove('off', 'hide', 'hero-title--dissolve-out', 'hero-title--dissolve-in');
            if (E.heroB) {
              E.heroB.classList.remove('off', 'hide', 'hero-title--dissolve-out', 'hero-title--dissolve-in');
              E.heroB.classList.add('hide')
            }
            if (E.heroLoop) {
              E.heroLoop.classList.remove('on');
              txt(E.heroLoop, '')
            }
            var contactA = $('#contact-a'),
              contactB = $('#contact-b');
            contactA && contactA.classList.remove('off', 'hide', 'contact-title--dissolve-out', 'contact-title--dissolve-in');
            if (contactB) {
              contactB.classList.remove('off', 'hide', 'contact-title--dissolve-out', 'contact-title--dissolve-in');
              contactB.classList.add('hide')
            }
            if (E.contactLoop) {
              E.contactLoop.classList.remove('on');
              txt(E.contactLoop, '')
            }
            E.heroFly.forEach(function(el) {
              el.classList.remove('on')
            })
          }

          function resetHeroTitle() {
            E.heroA && E.heroA.classList.remove('off', 'hide', 'hero-title--dissolve-out', 'hero-title--dissolve-in');
            if (E.heroB) {
              E.heroB.classList.remove('off', 'hide', 'hero-title--dissolve-out', 'hero-title--dissolve-in');
              E.heroB.classList.add('hide')
            }
            if (E.heroLoop) {
              E.heroLoop.classList.remove('on');
              txt(E.heroLoop, '')
            }
            E.heroFly.forEach(function(el) {
              el.classList.remove('on')
            })
          }

          function resetContactTitle() {
            var contactA = $('#contact-a'),
              contactB = $('#contact-b');
            contactA && contactA.classList.remove('off', 'hide', 'contact-title--dissolve-out', 'contact-title--dissolve-in');
            if (contactB) {
              contactB.classList.remove('off', 'hide', 'contact-title--dissolve-out', 'contact-title--dissolve-in');
              contactB.classList.add('hide')
            }
            if (E.contactLoop) {
              E.contactLoop.classList.remove('on');
              txt(E.contactLoop, '')
            }
          }

          function stopHeroMotion(resetVisual) {
            cancelFrame('heroScramble');
            clear('heroIntro');
            clear('heroSwap');
            clear('heroEnterDone');
            clear('heroSecondLine');
            clear('heroLoopTicker', true);
            if (resetVisual) resetHeroTitle()
          }

          function stopContactMotion(resetVisual) {
            cancelFrame('contactScramble');
            clear('contactLoopTicker', true);
            clear('contactIntro');
            clear('contactSecondLine');
            clear('contactSwap');
            clear('contactEnterDone');
            clear('morePromptSwap');
            clear('morePromptEnterDone');
            if (resetVisual) resetContactTitle()
          }

          function startHeroLoop() {
            if (!E.heroLoop || T.heroLoopTicker) return;
            cls(E.heroLoop, 'on', true);
            var i = 0;
            animateScramble(E.heroLoop, D.heroWords[i], 'heroScramble');
            T.heroLoopTicker = setInterval(function() {
              i = (i + 1) % D.heroWords.length;
              animateScramble(E.heroLoop, D.heroWords[i], 'heroScramble')
            }, D.loopMs)
          }

          function scheduleHero() {
            clear('heroIntro');
            clear('heroSwap');
            clear('heroEnterDone');
            clear('heroSecondLine');
            if (curr() !== 's0') return;
            T.heroIntro = setTimeout(function() {
              if (curr() === 's0' && E.heroA) {
                E.heroA.classList.add('hero-title--dissolve-out');
                T.heroSwap = setTimeout(function() {
                  if (curr() !== 's0') return;
                  E.heroA.classList.add('off');
                  E.heroA.classList.remove('hero-title--dissolve-out');
                  if (E.heroB) {
                    E.heroB.classList.remove('hide', 'off');
                    E.heroB.classList.add('hero-title--dissolve-in');
                    T.heroEnterDone = setTimeout(function() {
                      E.heroB.classList.remove('hero-title--dissolve-in')
                    }, 440)
                  }
                }, 500)
              } else if (curr() === 's0' && E.heroB) {
                E.heroB.classList.remove('hide', 'off');
                E.heroB.classList.add('hero-title--dissolve-in');
                T.heroEnterDone = setTimeout(function() {
                  E.heroB.classList.remove('hero-title--dissolve-in')
                }, 440)
              }
            }, D.heroIntroDelayMs);
            T.heroSecondLine = setTimeout(function() {
              if (curr() !== 's0') return;
              startHeroLoop();
              E.heroFly.forEach(function(el) {
                el.classList.add('on')
              })
            }, D.heroLoopStartDelayMs)
          }

          function setMenu(stacked) {
            if (!E.menu || !E.menuIn || E.menuItems.length !== 4) return;
            var width = E.menuIn.getBoundingClientRect().width,
              cols = gridColumnCount(),
              gap = gridGap(),
              col = (width - (cols - 1) * gap) / cols,
              lefts = E.menuItems.map(function(_, i) {
                if (cols >= 12) return i * 3;
                return Math.round(i * (cols - 1) / (E.menuItems.length - 1))
              }).map(function(i) {
                return i * (col + gap)
              }),
              clamp = function(x, w) {
                return Math.max(0, Math.min(x, width - w))
              },
              firstWidth = E.menuItems[0].offsetWidth,
              anchor = clamp(lefts[0], firstWidth),
              offsets = [0].concat(lefts.slice(1).map(function(v) {
                return anchor - v
              }));
            E.menuItems.forEach(function(item, i) {
              var w = item.offsetWidth;
              item.style.left = clamp(lefts[i], w) + 'px';
              item.style.setProperty('--stack-offset', (stacked ? offsets[i] : 0) + 'px');
              item.style.setProperty('--menu-delay', '0ms');
              item.style.setProperty('--menu-total', D.menuAnimationMs + 'ms')
            });
            if (E.menuMask) {
              E.menuMask.style.left = anchor + 'px';
              E.menuMask.style.width = firstWidth + 'px'
            }
          }

          function updateMaster() {
            var btn = $('.menu__item[data-target="s1"]');
            if (btn) E.root.style.setProperty('--master-top', Math.max(0, btn.getBoundingClientRect().top) + 'px')
          }

          function animateMenu() {
            if (!E.menu) return;
            clear('menuReset');
            setMenu(true);
            updateMaster();
            E.menu.classList.remove('is-idle', 'is-animating');
            void E.menu.offsetWidth;
            E.menu.classList.add('is-animating');
            T.menuReset = setTimeout(function() {
              setMenu(false);
              updateMaster();
              E.menu.classList.remove('is-animating');
              E.menu.classList.add('is-idle')
            }, D.menuAnimationMs + 60)
          }

          function reveal(id) {
            if (S.revealed[id]) return;
            S.revealed[id] = 1;
            var delay = screenCfg(id).reveal;
            if (delay != null) $$('#' + id + ' .fu').forEach(function(el, i) {
              setTimeout(function() {
                el.classList.add('on')
              }, i * delay)
            });
            if (id === 's1-2') animateClientCounts();
          }

          function startContactLoop() {
            var first = $('#contact-a'),
              second = $('#contact-b');
            if (!E.contactLoop || T.contactLoopTicker) return;
            clear('contactIntro');
            clear('contactSecondLine');
            clear('contactSwap');
            clear('contactEnterDone');
            first && first.classList.remove('off', 'hide', 'contact-title--dissolve-out', 'contact-title--dissolve-in');
            if (second) {
              second.classList.remove('off', 'hide', 'contact-title--dissolve-out', 'contact-title--dissolve-in');
              second.classList.add('hide')
            }
            E.contactLoop.classList.remove('on');
            S.contactWord = 0;
            txt(E.contactLoop, D.contactWords[S.contactWord] || '');
            T.contactIntro = setTimeout(function() {
              if (first) {
                first.classList.add('contact-title--dissolve-out');
                T.contactSwap = setTimeout(function() {
                  first.classList.add('off');
                  first.classList.remove('contact-title--dissolve-out');
                  if (second) {
                    second.classList.remove('hide', 'off');
                    second.classList.add('contact-title--dissolve-in');
                    T.contactEnterDone = setTimeout(function() {
                      second.classList.remove('contact-title--dissolve-in')
                }, 440)
              }
                }, 500)
              } else if (second) {
                second.classList.remove('hide', 'off');
                second.classList.add('contact-title--dissolve-in');
                T.contactEnterDone = setTimeout(function() {
                  second.classList.remove('contact-title--dissolve-in')
                }, 440)
              }
            }, D.contactIntroDelayMs);
            T.contactSecondLine = setTimeout(function() {
              E.contactLoop.classList.add('on');
              S.contactWord = (S.contactWord + 1) % D.contactWords.length;
              animateScramble(E.contactLoop, D.contactWords[S.contactWord], 'contactScramble');
              T.contactLoopTicker = setInterval(function() {
                S.contactWord = (S.contactWord + 1) % D.contactWords.length;
                animateScramble(E.contactLoop, D.contactWords[S.contactWord], 'contactScramble')
              }, D.loopMs)
            }, D.contactLoopStartDelayMs)
          }

          function setupClientCounts() {
            $$('.client-item sup').forEach(function(el) {
              var value = parseInt(el.textContent.replace(/\D/g, ''), 10);
              if (!Number.isFinite(value)) return;
              el.setAttribute('data-count-target', String(value));
              el.innerHTML = '(<span class="client-count__digit">0</span>)'
            })
          }

          function animateClientCounts() {
            if (S.clientCountsPlayed) return;
            S.clientCountsPlayed = true;
            var items = $$('.client-item sup'),
              reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
            items.forEach(function(el, i) {
              var target = parseInt(el.getAttribute('data-count-target') || '0', 10),
                digit = $('.client-count__digit', el),
                duration = 1150 + Math.random() * 350,
                delay = i * 55;
              if (!digit) return;
              if (reduce) {
                txt(digit, target);
                return
              }
              setTimeout(function() {
                var t0 = performance.now(),
                  lastSlot = -1,
                  shown = 0;
                txt(digit, 0);

                function tick(now) {
                  var p = Math.min(1, (now - t0) / duration),
                    slot = Math.floor((now - t0) / 55);
                  if (slot !== lastSlot) {
                    lastSlot = slot;
                    shown = p < .9 ? Math.floor(Math.random() * 11) : target;
                    txt(digit, shown)
                  }
                  if (p < 1) requestAnimationFrame(tick);
                  else txt(digit, target)
                }
                requestAnimationFrame(tick)
              }, delay)
            })
          }

          function updateNav() {
            var hero = curr() === 's0';
            syncUiState();
            clear('menuReset');
            if (E.menu) {
              E.menu.classList.remove('is-animating');
              E.menu.classList.add('is-idle')
            }
            hero ? (S.heroMenuPlayed ? setMenu(false) : (animateMenu(), S.heroMenuPlayed = true)) : setMenu(
            false);
            if (!E.btn) return;
            E.btn.classList.add('is-icon');
            if (hero) {
              E.btn.style.visibility = 'hidden';
              E.btn.style.pointerEvents = 'none';
              E.btn.innerHTML = '';
              return
            }
            E.btn.style.visibility = 'visible';
            E.btn.style.pointerEvents = 'auto';
            E.btn.innerHTML = screenCfg(curr()).navIcon === 'back' ? D.backIcon : ''
          }

          function go(target, anim) {
            var next = typeof target === 'number' ? ids[target] : target;
            if (anim === undefined) anim = true;
            if (ids.indexOf(next) < 0) return;
            S.section = next;
            E.w.style.transition = anim ? 'var(--sec)' : 'none';
            E.w.style.transform = 'translateY(-' + (ids.indexOf(next) * 100) + 'vh)';
            updateNav();
            reveal(curr());
            if (next === 's0') {
              stopContactMotion(true);
              stopHeroMotion(true);
              scheduleHero()
            } else {
              stopHeroMotion(true)
            }
            if (next === 's3') startContactLoop();
            else stopContactMotion(true)
          }

          function step(dir) {
            var next = ids.indexOf(S.section) + dir;
            if (S.busy || S.overlay.open || next < 0 || next >= ids.length) return;
            S.busy = true;
            go(ids[next]);
            setTimeout(function() {
              S.busy = false
            }, D.transitionMs)
          }

          function buildCaseFlow(item) {
            var blocks = Array.isArray(item.detail && item.detail.blocks) ? item.detail.blocks : null,
              hasStats = !!(item.stats && item.stats.length),
              hasAwards = !!(item.awards && item.awards.length),
              flow;
            if (blocks && blocks.length) {
              flow = blocks.map(function(block) {
              var blockId = block.id || block.type || 'custom';
              return {
                text: block.text || '',
                id: blockId,
                title: block.title || SITE_DATA.fieldTitles[blockId] || blockId,
                wide: block.wide === true
              }
              }).filter(function(block) {
                return block.text || (block.id === 'result' && hasStats) || (block.id === 'awards' && hasAwards)
              })
            } else {
              flow = SITE_DATA.layout.flowOrder.map(function(id) {
              var text = item.detail && item.detail[id];
              return text || (id === 'result' && hasStats) || (id === 'awards' && hasAwards) ? {
                id: id,
                title: SITE_DATA.fieldTitles[id] || id,
                text: text,
                wide: id === 'solution' && (item.title === 'Это вышка' || item.title ===
                  'Кибербитва с мошенниками')
              } : null
              }).filter(Boolean)
            }
            if (hasStats && !flow.some(function(block) { return block.id === 'result' })) {
              flow.push({
                id: 'result',
                title: SITE_DATA.fieldTitles.result,
                text: '',
                wide: false
              })
            }
            if (hasAwards && !flow.some(function(block) { return block.id === 'awards' })) {
              flow.push({
                id: 'awards',
                title: SITE_DATA.fieldTitles.awards,
                text: '',
                wide: false
              })
            }
            return flow
          }

          function renderAccordion(flow, stats, awards) {
            return flow.map(function(seg, i) {
              var num = String(i + 1).padStart(2, '0'),
                hasStats = seg.id === 'result' && stats.length,
                hasAwards = seg.id === 'awards' && awards.length,
                body = (seg.text ? '<div class="case-col__text trim-inter">' + fmt(seg.text) + '</div>' : '') +
                  (hasStats ? '<div class="case-stage__stats">' + renderStats(stats) + '</div>' : '') +
                  (hasAwards ? '<div class="case-stage__stats case-stage__stats--awards">' +
                    renderStats(awards, true) + '</div>' : '');
              return '<div class="case-disclosure' + (i === 0 ? ' is-open' : '') +
                '"><button class="case-disclosure__toggle trim-inter" type="button" aria-expanded="' + (i === 0 ?
                  'true' : 'false') + '"><span class="case-disclosure__head"><span class="case-disclosure__num">' +
                num + '</span><span class="case-disclosure__title">' + fmt(seg.title) +
                '</span></span><span class="case-disclosure__mark" aria-hidden="true"></span></button><div class="case-disclosure__panel">' +
                '<div class="case-disclosure__inner">' + body + '</div></div></div>'
            }).join('')
          }

          function renderCaseAccordion(flow, stats, awards) {
            var wrap = document.createElement('div'),
              cols = gridColumnCount(),
              compact = cols <= 6;
            wrap.className = 'case-accordion';
            wrap.style.setProperty('--gc', compact ? '1/span ' + cols : '1/span 6');
            wrap.style.setProperty('--gr', compact ? '3' : '2');
            wrap.innerHTML = renderAccordion(flow, stats, awards);
            return wrap
          }

          function renderStatLabel(label, keepCase) {
            return (label || []).map(function(x) {
              return '<span>' + fmt(keepCase ? String(x) : String(x).toLowerCase()) + '</span>'
            }).join('<br>')
          }

          function renderStatValue(value) {
            return escapeHtml(value).replace(/([+-]?\d+(?:[.,]\d+)?)/g, function(match) {
              return '<span class="case-stat__number" data-stat-target="' + match + '" data-stat-animated="off">0</span>'
            })
          }

          function renderStats(stats, keepCase) {
            return stats.map(function(pair) {
              return '<div class="case-stat"><div class="case-stat__value trim-inter">' + renderStatValue(String(pair[
                0])) + '</div><div class="case-stat__label trim-inter">' + renderStatLabel(pair[1], keepCase) +
                '</div></div>'
            }).join('')
          }

          function setDisclosureOpen(disclosure, open, userAction) {
            if (!disclosure) return;
            disclosure.classList.toggle('is-open', open);
            if (userAction) disclosure.classList.toggle('is-user-closed', !open);
            if (open) disclosure.setAttribute('data-open-order', String(++S.overlay.openOrder));
            else disclosure.removeAttribute('data-open-order');
            var btn = disclosure.querySelector('.case-disclosure__toggle');
            if (btn) btn.setAttribute('aria-expanded', String(open));
            if (open) animateCaseStats(disclosure)
          }

          function fitCaseAccordion() {
            if (!S.overlay.open || !E.stage) return;
            var frame = E.stage.querySelector('.case-stage__frame'),
              accordion = E.bodyPane && E.bodyPane.querySelector('.case-accordion');
            if (!frame || !accordion) return;
            var frameBox = frame.getBoundingClientRect(),
              accordionBox = accordion.getBoundingClientRect();
            if (accordionBox.bottom <= frameBox.bottom + 1) return;
            var closed = 0;
            while (accordionBox.bottom > frameBox.bottom + 1 && closed < 2) {
              var openItems = $$('.case-disclosure.is-open', accordion),
                latestItems = openItems.slice().sort(function(a, b) {
                  return Number(b.getAttribute('data-open-order') || 0) - Number(a.getAttribute(
                    'data-open-order') || 0)
                }).slice(0, 2),
                target = openItems.find(function(item) {
                  return latestItems.indexOf(item) === -1
                });
              if (!target) return;
              setDisclosureOpen(target, false, false);
              accordionBox = accordion.getBoundingClientRect();
              closed++
            }
          }

          function scheduleCaseFit() {
            if (T.caseFit) cancelAnimationFrame(T.caseFit);
            T.caseFit = requestAnimationFrame(function() {
              T.caseFit = null;
              fitCaseAccordion()
            })
          }

          function scheduleCaseFitAfterMotion() {
            if (T.caseFitMotion) clearTimeout(T.caseFitMotion);
            T.caseFitMotion = setTimeout(function() {
              T.caseFitMotion = null;
              fitCaseAccordion()
            }, 260)
          }

          function animateCaseStats(root) {
            var items = $$('.case-stat__number[data-stat-animated="off"]', root || E.bodyPane),
              reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
            items.forEach(function(el, i) {
              var target = el.getAttribute('data-stat-target') || '0',
                numericTarget = parseFloat(target.replace(',', '.')),
                decimals = (target.split(/[.,]/)[1] || '').length,
                hasSign = /^[+-]/.test(target),
                sign = hasSign ? target.charAt(0) : '',
                duration = 900 + Math.random() * 300,
                delay = i * 65;
              if (!Number.isFinite(numericTarget)) return;
              el.setAttribute('data-stat-animated', 'on');
              if (reduce) {
                txt(el, target);
                return
              }
              setTimeout(function() {
                var t0 = performance.now(),
                  lastSlot = -1;
                txt(el, hasSign ? sign + '0' : '0');

                function tick(now) {
                  var p = Math.min(1, (now - t0) / duration),
                    slot = Math.floor((now - t0) / 55),
                    shown;
                  if (slot !== lastSlot) {
                    lastSlot = slot;
                    shown = p < .9 ? Math.random() * numericTarget : numericTarget;
                    shown = decimals ? shown.toFixed(decimals) : String(Math.round(shown));
                    if (target.indexOf(',') > -1) shown = shown.replace('.', ',');
                    txt(el, hasSign && shown.charAt(0) !== sign ? sign + shown.replace(/^[+-]/, '') : shown)
                  }
                  if (p < 1) requestAnimationFrame(tick);
                  else txt(el, target)
                }
                requestAnimationFrame(tick)
              }, delay)
            })
          }

          function renderMediaItem(media) {
            var cls = 'case-media__item case-media__item--' + (media.type === 'video' || media.type === 'tiktok' ? 'video' : 'image'),
              fit = media.fit === 'cover' ? 'cover' : 'contain',
              layout = media.layout === 'third' || media.layout === 'half' ? media.layout : 'full',
              aspect = media.aspect === 'portrait' || media.type === 'tiktok' ? 'portrait' : media.aspect === 'wide' ? 'wide' : 'default',
              src = escapeHtml(media.src || '');
            if (media.type === 'tiktok') {
              var videoId = escapeHtml(media.id || ''),
                url = src || (videoId ? 'https://www.tiktok.com/@letoile_official/video/' + videoId : ''),
                player = 'https://www.tiktok.com/player/v1/' + videoId +
                  '?autoplay=0&muted=0&controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0';
              return '<figure class="' + cls + '" data-fit="' + fit + '" data-layout="' + layout + '" data-aspect="' +
                aspect + '"><iframe class="case-media__tiktok-player" src="' + player +
                '" title="TikTok video" allow="fullscreen" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe><a class="case-media__fallback-link" target="_blank" rel="noopener noreferrer" href="' +
                url + '">' + fmt((S.i18n && S.i18n.caseStage && S.i18n.caseStage.tiktokFallback) ||
                'Смотреть TikTok') + '</a></figure>'
            }
            if (media.html) {
              return '<figure class="' + cls + '" data-fit="' + fit + '" data-layout="' + layout + '" data-aspect="' +
                aspect + '"><div class="case-media__embed">' +
                optimizeEmbedHtml(media.html) + '</div></figure>'
            }
            if (media.type === 'video') {
              var sources = media.sources.length ? media.sources.map(function(source) {
                return '<source src="' + escapeHtml(source.src || '') + '"' + (source.type ? ' type="' +
                  escapeHtml(source.type) + '"' : '') + '>'
              }).join('') : (src ? '<source src="' + src + '">' : '');
              return '<figure class="' + cls + '" data-fit="' + fit + '" data-layout="' + layout + '" data-aspect="' + aspect +
                '"><video autoplay muted loop playsinline preload="metadata"' + (media.poster ? ' poster="' +
                  escapeHtml(media.poster) + '"' : '') + '>' + sources + '</video></figure>'
            }
            return '<figure class="' + cls + '" data-fit="' + fit + '" data-layout="' + layout + '" data-aspect="' + aspect + '"><img src="' + src + '" alt="' +
              escapeHtml(media.alt || '') + '" loading="lazy" decoding="async" fetchpriority="low"></figure>'
          }

          function optimizeEmbedHtml(value) {
            return String(value || '').replace(/<iframe\b([^>]*)>/gi, function(match, attrs) {
              var out = '<iframe' + attrs;
              if (!/\sloading=/i.test(attrs)) out += ' loading="lazy"';
              if (!/\sreferrerpolicy=/i.test(attrs)) out += ' referrerpolicy="strict-origin-when-cross-origin"';
              return out + '>'
            })
          }


          function renderMedia(media) {
            if (!media.length) return null;
            var wrap = document.createElement('div'),
              cols = gridColumnCount(),
              compact = cols <= 6;
            wrap.className = 'case-media';
            wrap.style.setProperty('--gc', compact ? '1/span ' + cols : '7/span 6');
            wrap.style.setProperty('--gr', '1/span 4');
            if (media[0].gridColumn && !compact) wrap.style.setProperty('--gc', media[0].gridColumn);
            if (media[0].gridRow && !compact) wrap.style.setProperty('--gr', media[0].gridRow);
            if (media[0].alignSelf) wrap.style.alignSelf = media[0].alignSelf;
            if (media[0].justifySelf) wrap.style.justifySelf = media[0].justifySelf;
            wrap.innerHTML = media.map(renderMediaItem).join('');
            return wrap
          }

          function ensureMediaCursor() {
            if (E.mediaCursor) return E.mediaCursor;
            E.mediaCursor = document.createElement('div');
            E.mediaCursor.className = 'media-scroll-cursor';
            E.mediaCursor.setAttribute('aria-hidden', 'true');
            E.mediaCursor.innerHTML =
              '<span class="media-scroll-cursor__chevron"></span><span class="media-scroll-cursor__chevron"></span><span class="media-scroll-cursor__chevron"></span>';
            E.body.appendChild(E.mediaCursor);
            return E.mediaCursor
          }

          function moveMediaCursor(e) {
            var cursor = ensureMediaCursor();
            cursor.style.setProperty('--x', e.clientX + 'px');
            cursor.style.setProperty('--y', e.clientY + 'px')
          }

          function renderCase(i) {
            var item = D.cases[i];
            if (!item) return;
            var flow = buildCaseFlow(item),
              hasMedia = item.media && item.media.length;
            S.overlay.openOrder = 0;
            html(E.cat, fmt(item.cat || ''));
            html(E.brand, fmt(item.brand || ''));
            html(E.title, fmt(item.title || ''));
            E.bodyPane.innerHTML = '';
            if (hasMedia) E.bodyPane.appendChild(renderMedia(item.media));
            E.bodyPane.appendChild(renderCaseAccordion(flow, item.stats || [], item.awards || []));
            scheduleCaseFit();
            syncUiState()
          }

          function toggleStage(open) {
            S.overlay.open = !!open;
            cls(E.stage, 'open', open);
            E.stage.setAttribute('aria-hidden', String(!open));
            [E.w, E.nav, E.menu].forEach(function(el) {
              if (el) el.classList.toggle('ui-hidden', open)
            });
            E.body.style.overflow = open ? 'hidden' : '';
            syncUiState()
          }

          function openCase(i) {
            if (S.overlay.caseIndex === i || !D.cases[i]) return;
            S.overlay.caseIndex = i;
            renderCase(i);
            toggleStage(true)
          }

          function openMoreCases() {
            if (S.overlay.caseIndex === -1) return;
            S.overlay.caseIndex = -1;
            clear('morePromptSwap');
            clear('morePromptEnterDone');
            var caseStage = S.i18n && S.i18n.caseStage || {};
            html(E.cat, caseStage.moreAccess || 'Доступ по паролю');
            html(E.brand, '');
            html(E.title, caseStage.moreTitle || SITE_DATA.previewsMoreLabel || 'Еще больше кейсов');
            E.bodyPane.innerHTML =
              '<div class="case-password-promo">' +
              '<div class="case-password-promo__stack">' +
              '<div class="case-password-promo__title heading" id="case-password-promo-a">' + (caseStage.promptA || 'ОТПРАВЬТЕ<br>НАМ СВОЙ<br>БРИФ') + '</div>' +
              '<div class="case-password-promo__title heading hide" id="case-password-promo-b">' + (caseStage.promptB || 'МЫ ПРИШЛЕМ<br>ВАМ<br>ПАРОЛЬ') + '</div>' +
              '</div>' +
              '</div>' +
              '<form class="case-password" id="case-password-form">' +
              '<label class="case-password__label" for="case-password-input">' + (caseStage.passwordLabel || 'Введите пароль') + '</label>' +
              '<div class="case-password__row">' +
              '<input class="case-password__input" id="case-password-input" type="password" autocomplete="current-password" inputmode="text">' +
              '<button class="case-password__submit" type="submit">' + (caseStage.passwordSubmit || 'Открыть') + '</button>' +
              '</div>' +
              '<p class="case-password__message" aria-live="polite"></p>' +
              '</form>';
            toggleStage(true);
            var form = $('#case-password-form'),
              input = $('#case-password-input', form),
              message = $('.case-password__message', form);
            input && input.focus({
              preventScroll: true
            });
            var promptA = $('#case-password-promo-a'),
              promptB = $('#case-password-promo-b');
            applyNeonLetters(promptA);
            applyNeonLetters(promptB);
            T.morePromptSwap = setTimeout(function() {
              if (promptA) promptA.classList.add('contact-title--dissolve-out');
              T.morePromptEnterDone = setTimeout(function() {
                if (promptA) {
                  promptA.classList.add('off');
                  promptA.classList.remove('contact-title--dissolve-out')
                }
                if (promptB) {
                  promptB.classList.remove('hide', 'off');
                  promptB.classList.add('contact-title--dissolve-in');
                  setTimeout(function() {
                    promptB.classList.remove('contact-title--dissolve-in')
                  }, 440)
                }
              }, 500)
            }, D.heroIntroDelayMs);
            form && form.addEventListener('submit', function(e) {
              e.preventDefault();
              form.classList.add('is-invalid');
              txt(message, caseStage.passwordError || 'Пароль нужен для доступа к закрытым кейсам.')
            })
          }

          function closeCase() {
            if (S.overlay.caseIndex == null) return;
            S.overlay.caseIndex = null;
            clear('morePromptSwap');
            clear('morePromptEnterDone');
            toggleStage(false)
          }

          function injectDev() {
            if (E.body.getAttribute('data-dev-ready')) return;
            E.body.setAttribute('data-dev-ready', '1');
            var rowsMarkup = Array.apply(null, Array(4)).map(function(_, i) {
                return '<div data-r="' + (i + 1) + '"></div>'
              }).join(''),
              markup = '<div class="dev-cols"></div><div class="dev-rows">' + rowsMarkup +
              '</div>',
              appendFrame = function(host) {
                if (!host || host.querySelector(':scope > .dev-frame')) return;
                var frame = document.createElement('div');
                frame.className = 'dev-frame';
                frame.innerHTML = markup;
                host.appendChild(frame)
              };
            E.secs.forEach(function(section) {
              appendFrame(section.querySelector('.container'))
            });
            appendFrame(E.stage && E.stage.querySelector('.case-stage__frame'));
            updateDevGrid()
          }

          function updateDevGrid() {
            if (!E.body.getAttribute('data-dev-ready')) return;
            $$('.dev-cols').forEach(function(cols) {
              cols.innerHTML = gridTracks(gridColumnCount())
            })
          }

          function formatZoneTime(zone) {
            return new Intl.DateTimeFormat((S.i18n && S.i18n.htmlLang) || 'ru-RU', {
              hour: '2-digit',
              minute: '2-digit',
              timeZone: zone
            }).format(new Date())
          }

          function renderClockTime(zone) {
            return formatZoneTime(zone).replace(':', '<span class="contact-clock__colon">:</span>')
          }

          function zoneHour(zone) {
            return Number(new Intl.DateTimeFormat('en-US', {
              hour: '2-digit',
              hour12: false,
              timeZone: zone
            }).format(new Date()))
          }

          function zoneStatus(zone) {
            var hour = zoneHour(zone),
              awake = hour >= 9 && hour < 23,
              locations = S.i18n && S.i18n.contact && S.i18n.contact.locations || {};
            return awake ? (locations.working || 'работает') : (locations.sleeping || 'спит')
          }

          function updateContactClocks() {
            var baZone = 'America/Argentina/Buenos_Aires',
              mskZone = 'Europe/Moscow';
            html(E.baClock, renderClockTime(baZone));
            html(E.mskClock, renderClockTime(mskZone));
            txt(E.baStatus, zoneStatus(baZone));
            txt(E.mskStatus, zoneStatus(mskZone))
          }

          function init() {
            setupNeonLetters();
            setupClientCounts();
            renderCaseCards();
            var casesReady = fetchCases();
            casesReady.then(function() {
              renderCaseCards();
              bindCaseCards()
            });
            addEventListener('resize', function() {
              setMenu(false);
              updateMaster();
              updateDevGrid();
              if (S.overlay.open && S.overlay.caseIndex != null) renderCase(S.overlay.caseIndex)
            });
            addEventListener('wheel', function(e) {
              if (S.overlay.open) return;
              var dir = Math.sign ? Math.sign(e.deltaY) : (e.deltaY > 0 ? 1 : e.deltaY < 0 ? -1 : 0);
              if (S.busy || !dir) return;
              e.preventDefault();
              S.wheel += e.deltaY;
              if (Math.abs(S.wheel) < D.sectionLock) return;
              step(S.wheel > 0 ? 1 : -1);
              S.wheel = 0
            }, {
              passive: false
            });
            addEventListener('keydown', function(e) {
              if (S.overlay.open) {
                if (e.key === 'Escape') closeCase();
                return
              }
              if (['ArrowDown', 'PageDown', ' '].includes(e.key)) {
                e.preventDefault();
                step(1)
              }
              if (['ArrowUp', 'PageUp'].includes(e.key)) {
                e.preventDefault();
                step(-1)
              }
            });
            E.dev && E.dev.addEventListener('click', function() {
              injectDev();
              S.ui.dev = !S.ui.dev;
              E.dev.setAttribute('aria-pressed', String(S.ui.dev));
              syncUiState()
            });
            E.langButtons.forEach(function(button) {
              button.addEventListener('click', function() {
                switchLocale(button.getAttribute('data-lang'))
              })
            });
            E.btn && E.btn.addEventListener('click', function() {
              go(curr() === 's3' ? 's0' : curr() === 's2' ? 's3' : 's2')
            });
            E.menuItems.forEach(function(item) {
              item.addEventListener('click', function() {
                go(item.getAttribute('data-target'))
              })
            });
            $$('[data-random-brand]').forEach(function(item) {
              item.addEventListener('click', function() {
                var brand = item.getAttribute('data-random-brand').toLowerCase(),
                  clientId = item.getAttribute('data-client-id') || '';
                casesReady.then(function() {
                  var matches = D.cases.map(function(caseItem, index) {
                    return caseItem && (D.caseBrandIds[index] === clientId || String(caseItem.brand || '')
                      .toLowerCase() === brand) ? index : null
                  }).filter(function(index) {
                    return index != null
                  });
                  if (!matches.length) return;
                  go('s2');
                  openCase(matches[Math.floor(Math.random() * matches.length)])
                })
              })
            });
            bindCaseCards();
            E.close && E.close.addEventListener('click', closeCase);
            E.stage && E.stage.addEventListener('click', function(e) {
              var disclosureBtn = e.target.closest && e.target.closest('.case-disclosure__toggle');
              if (disclosureBtn) {
                var disclosure = disclosureBtn.closest('.case-disclosure'),
                  open = !disclosure.classList.contains('is-open');
                setDisclosureOpen(disclosure, open, true);
                if (open) scheduleCaseFitAfterMotion();
                else scheduleCaseFit();
                return
              }
              if (e.target === E.stage || e.target.classList.contains('case-stage__blur')) closeCase()
            });
            E.stage && E.stage.addEventListener('mouseover', function(e) {
              var disclosure = e.target.closest && e.target.closest('.case-disclosure');
              if (!disclosure || disclosure.classList.contains('is-open') || disclosure.classList.contains('is-user-closed')) return;
              setDisclosureOpen(disclosure, true, false);
              scheduleCaseFitAfterMotion()
            });
            E.stage && E.stage.addEventListener('pointerenter', function(e) {
              var media = e.target.closest && e.target.closest('.case-media');
              if (!media || matchMedia('(pointer: coarse)').matches) return;
              moveMediaCursor(e);
              ensureMediaCursor().classList.add('is-visible')
            }, true);
            E.stage && E.stage.addEventListener('pointermove', function(e) {
              if (!E.mediaCursor || !E.mediaCursor.classList.contains('is-visible')) return;
              if (!(e.target.closest && e.target.closest('.case-media'))) {
                E.mediaCursor.classList.remove('is-visible');
                return
              }
              moveMediaCursor(e)
            });
            E.stage && E.stage.addEventListener('pointerleave', function(e) {
              if (e.target.closest && e.target.closest('.case-media') && E.mediaCursor) E.mediaCursor.classList.remove(
                'is-visible')
            }, true);
            var touchStartY = 0, touchStartTime = 0;
            addEventListener('touchstart', function(e) {
              if (S.overlay.open) return;
              touchStartY = e.touches[0].clientY;
              touchStartTime = Date.now()
            }, { passive: true });
            addEventListener('touchend', function(e) {
              if (S.overlay.open) return;
              var deltaY = touchStartY - e.changedTouches[0].clientY,
                deltaTime = Date.now() - touchStartTime;
              if (Math.abs(deltaY) > 50 && deltaTime < 500) step(deltaY > 0 ? 1 : -1)
            }, { passive: true });
            walk(E.w);
            walk(E.stage);
            updateContactClocks();
            T.contactClock = setInterval(updateContactClocks, 1000);
            updateMaster();
            syncUiState();
            go('s0', false);
            whenFontsReady(scheduleHero)
          }

          loadLocale().then(function(dict) {
            applyLocale(dict);
            init()
          }).catch(function() {
            init()
          });
        });
})();
