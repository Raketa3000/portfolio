    <script>
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
              stats: $('#case-stage-stats'),
              cat: $('#cs-cat'),
              brand: $('#cs-brand'),
              title: $('#cs-title'),
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
                title: ['Презервативы']
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
                flowOrder: ['context', 'task', 'insight', 'strategy', 'strategic_solution', 'solution', 'result'],
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
              fieldTitles: {
                context: 'Контекст',
                task: 'Задача',
                insight: 'Инсайт',
                strategy: 'Стратегия',
                solution: 'Решение',
                strategic_solution: 'Стратегическое решение',
                result: 'Результат'
              }
            },
            D = {
              cases: [],
              casesPromise: null,
              heroWords: ['ПРОБОВАТЬ', 'СМОТРЕТЬ', 'ИСКАТЬ', 'ПОКУПАТЬ'],
              contactWords: ['СТРАТЕГИЮ', 'КРЕАТИВ', 'ПРОЕКТ', 'КАМПАНИЮ'],
              glyphs: 'АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯABCDEFGHIJKLMNOPQRSTUVWXYZ',
              heroIntroDelayMs: 1600,
              heroLoopStartDelayMs: 2000,
              scrambleMs: 1100,
              loopMs: 1750,
              transitionMs: 750,
              menuAnimationMs: 900,
              sectionLock: 650,
              backIcon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"></path><path d="M3 3v6h6"></path></svg>',
              caseFiles: ['beeline-eto-vyshka', 'beeline-kiberbitva-s-moshennikami', 'letual-prohor-shalyapin',
                'burger-king', 'condoms'
              ]
            },
            T = {},
            S = {
              section: 's0',
              busy: false,
              wheel: 0,
              contactWord: 0,
              revealed: {},
              heroMenuPlayed: false,
              overlay: {
                open: false,
                caseIndex: null
              },
              ui: {
                dev: false
              }
            },
            measureCache = {};
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
            escapeHtml = function(s) {
              return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g,
                '&quot;')
            },
            screenCfg = function(id) {
              return SITE_DATA.screens[id] || {}
            },
            toRawUrl = function(v) {
              return 'assets/cases/' + v + '.json'
            };

          function nbsp(s) {
            var a = s.split(' '),
              o = [],
              i = 0,
              w, n, t =
              ',а,и,к,с,у,о,в,я,ты,мы,вы,он,но,не,ни,на,по,из,от,до,во,со,ко,за,под,над,об,без,для,при,про,или,как,так,это,эта,этот,эти,того,чем,тем,что,чтоб,чтобы,все,всё,еще,ещё,уже,где,где-то,там,тут,вот,ведь,бы,же,ли,либо,его,её,ее,их,ей,ему,нас,вас,наш,ваш,мой,твой,свой,кто,вся,всех,между,через,перед,после,около,среди,ради,вдоль,насчёт,вместо,помимо,кроме,также,тоже,'
              .toLowerCase();
            for (; i < a.length; i++) {
              w = a[i];
              n = a[i + 1];
              if (!w) continue;
              if (i < a.length - 1 && ((t.indexOf(',' + w.toLowerCase() + ',') > -1) || (/^[0-9]+$/.test(w) &&
                  /^(?:[%A-Za-zА-Яа-яЁё₽€$]|№)/.test(n)) || (w.length <= 2 && /^[А-Яа-яЁё]/.test(w)))) o.push(w + String.fromCharCode(160) + a[++i]);
              else o.push(w)
            }
            return o.join(' ')
          }

          function walk(n) {
            for (var i = 0, c; i < n.childNodes.length; i++)
              if ((c = n.childNodes[i]).nodeType === 3) c.nodeValue = nbsp(c.nodeValue);
              else if (c.nodeType === 1 && c.tagName !== 'SCRIPT' && c.tagName !== 'STYLE') walk(c)
          }

          function fmt(s) {
            return escapeHtml(nbsp(String(s))).replace(/ /g, '&nbsp;')
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
              E.stage.setAttribute('data-overlay', open ? 'open' : 'closed');
              E.stage.setAttribute('data-stats', E.stage.classList.contains('no-stats') ? 'off' : 'on')
            }
          }

          function renderCaseCards() {
            if (!E.grid) return;
            E.grid.innerHTML = SITE_DATA.previews.map(function(x, i) {
              var title = x.title.map(function(line) {
                return '<span class="case-title__line">' + escapeHtml(line) + '</span>'
              }).join('');
              return '<article class="case-card fu' + (i ? ' td-' + i : '') + '" data-case-index="' + i +
                '"><div class="case-title heading">' + title + '</div></article>'
            }).join('');
            E.cards = $$('.case-card')
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
              stats: Array.isArray(item.stats) ? item.stats : []
            }
          }

          function fetchCases() {
            if (D.cases.length) return Promise.resolve(D.cases);
            if (D.casesPromise) return D.casesPromise;
            D.casesPromise = Promise.all(D.caseFiles.map(function(v) {
              return fetch(toRawUrl(v)).then(function(r) {
                if (!r.ok) throw new Error(v);
                return r.json()
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
            clear(key);
            var chars = String(target).split(''),
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
                return ch === ' ' ? ' ' : shown[idx] ? target[idx] : D.glyphs[Math.floor(Math.random() * D
                  .glyphs.length)]
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

          function resetHero() {
            ['heroScramble', 'contactScramble'].forEach(function(k) {
              if (T[k]) {
                cancelAnimationFrame(T[k]);
                T[k] = null
              }
            });
            clear('heroIntro');
            clear('heroSecondLine');
            clear('heroLoopTicker', true);
            clear('contactLoopTicker', true);
            E.heroA && E.heroA.classList.remove('off', 'hide');
            if (E.heroB) {
              E.heroB.classList.remove('off', 'hide');
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
            clear('heroSecondLine');
            if (curr() !== 's0') return;
            T.heroIntro = setTimeout(function() {
              if (curr() === 's0') {
                cls(E.heroA, 'off', true);
                cls(E.heroB, 'hide', false)
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
              gap = parseFloat(getComputedStyle(E.root).getPropertyValue('--g')) || 20,
              col = (width - 11 * gap) / 12,
              lefts = [0, 3, 6, 9].map(function(i) {
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
            var hero = $('#s0'),
              btn = $('.menu__item[data-target="s1"]');
            if (hero && btn) E.root.style.setProperty('--master-top', Math.max(0, btn.getBoundingClientRect()
              .top - hero.getBoundingClientRect().top) + 'px')
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
            if (id === 's3' && !T.contactLoopTicker) {
              animateScramble(E.contactLoop, D.contactWords[0], 'contactScramble');
              T.contactLoopTicker = setInterval(function() {
                S.contactWord = (S.contactWord + 1) % D.contactWords.length;
                animateScramble(E.contactLoop, D.contactWords[S.contactWord], 'contactScramble')
              }, D.loopMs)
            }
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
            if (next !== 's0') {
              clear('heroIntro');
              clear('heroSecondLine')
            } else if (!S.heroMenuPlayed) scheduleHero()
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
            var blocks = Array.isArray(item.detail && item.detail.blocks) ? item.detail.blocks : null;
            if (blocks && blocks.length) return blocks.map(function(block) {
              var blockId = block.id || block.type || 'custom';
              return {
                text: block.text || '',
                id: blockId,
                title: block.title || SITE_DATA.fieldTitles[blockId] || blockId,
                wide: block.wide === true
              }
            }).filter(function(block) {
              return block.text
            });
            return SITE_DATA.layout.flowOrder.map(function(id) {
              var text = item.detail && item.detail[id];
              return text ? {
                id: id,
                title: SITE_DATA.fieldTitles[id] || id,
                text: text,
                wide: id === 'solution' && (item.title === 'Это вышка' || item.title ===
                  'Кибербитва с мошенниками')
              } : null
            }).filter(Boolean)
          }

          function renderSegments(segments) {
            return segments.map(function(seg) {
              return '<div class="case-col__segment"><div class="case-col__title trim-inter">' + fmt(seg
                .title) + '</div><div class="case-col__text trim-inter">' + fmt(seg.text) + '</div></div>'
            }).join('')
          }

          function measureCaseBlockWide(seg) {
            if (seg.wide === true) return true;
            if (seg.wide === false) return false;
            var frame = E.stage && E.stage.querySelector('.case-stage__frame');
            if (!frame) return (seg.text || '').length > SITE_DATA.layout.fallbackWideChars;
            var frameWidth = Math.round(frame.getBoundingClientRect().width || 0),
              cacheKey = [S.overlay.caseIndex, frameWidth, seg.id].join('|');
            if (measureCache[cacheKey] != null) return measureCache[cacheKey];
            var probe = document.createElement('div'),
              gap = parseFloat(getComputedStyle(E.root).getPropertyValue('--g')) || 20,
              colWidth = (frameWidth - 11 * gap) / 12,
              halfWidth = 3 * colWidth + 2 * gap;
            probe.className = 'case-col';
            probe.style.cssText =
              'position:absolute;visibility:hidden;pointer-events:none;left:-9999px;top:0;width:' + halfWidth +
              'px;min-width:0;max-width:none';
            probe.innerHTML = renderSegments([seg]);
            frame.appendChild(probe);
            measureCache[cacheKey] = probe.getBoundingClientRect().height > SITE_DATA.layout.wideHeightThreshold;
            probe.remove();
            return measureCache[cacheKey]
          }

          function measureCaseFlow(flow) {
            return flow.map(function(seg) {
              return {
                id: seg.id,
                title: seg.title,
                text: seg.text,
                wide: measureCaseBlockWide(seg)
              }
            })
          }

          function placeCaseFlow(flow) {
            var placed = [],
              states = SITE_DATA.layout.zones.map(function(z) {
                return {
                  row: z.startRow,
                  col: 0
                }
              }),
              zoneIndex = 0,
              lastRow = 1;
            flow.forEach(function(seg) {
              var wide = !!seg.wide,
                zone = SITE_DATA.layout.zones[zoneIndex],
                state = states[zoneIndex],
                currentRow, gridColumn;
              while (zone && state.row > zone.endRow) {
                zoneIndex++;
                zone = SITE_DATA.layout.zones[zoneIndex];
                state = states[zoneIndex]
              }
              if (!zone) return;
              if (wide && state.col === 1) {
                state.row++;
                state.col = 0;
                while (zone && state.row > zone.endRow) {
                  zoneIndex++;
                  zone = SITE_DATA.layout.zones[zoneIndex];
                  state = states[zoneIndex]
                }
              }
              if (!zone) return;
              currentRow = state.row;
              if (wide) {
                gridColumn = zone.wide;
                state.row++;
                state.col = 0
              } else {
                gridColumn = zone.half[state.col];
                if (state.col === 0) state.col = 1;
                else {
                  state.col = 0;
                  state.row++
                }
              }
              lastRow = Math.max(lastRow, currentRow);
              placed.push({
                seg: seg,
                row: currentRow,
                col: gridColumn,
                wide: wide
              })
            });
            return {
              placed: placed,
              lastRow: lastRow
            }
          }

          function renderPlacedFlow(placed) {
            var frag = document.createDocumentFragment();
            placed.forEach(function(p) {
              var col = document.createElement('div');
              col.className = 'case-col' + (p.wide ? ' is-wide' : '');
              col.style.setProperty('--gc', p.col);
              col.style.setProperty('--gr', String(p.row));
              col.innerHTML = renderSegments([p.seg]);
              frag.appendChild(col)
            });
            return frag
          }

          function renderStatLabel(label) {
            return (label || []).map(function(x) {
              return '<span>' + fmt(String(x).toLowerCase()) + '</span>'
            }).join('<br>')
          }

          function renderStats(stats) {
            return stats.map(function(pair) {
              return '<div class="case-stat"><div class="case-stat__value trim-inter">' + escapeHtml(pair[
                0]) + '</div><div class="case-stat__label trim-inter">' + renderStatLabel(pair[1]) +
                '</div></div>'
            }).join('')
          }

          function renderCase(i) {
            var item = D.cases[i];
            if (!item) return;
            var measured = measureCaseFlow(buildCaseFlow(item)),
              layout = placeCaseFlow(measured),
              statsRow = Math.max(4, layout.lastRow + 1);
            cls(E.stage, 'no-stats', !item.stats.length);
            html(E.cat, fmt(item.cat || ''));
            html(E.brand, fmt((item.brand || '').replace('Burger King', 'Бургер Кинг')));
            html(E.title, fmt(item.title || ''));
            E.bodyPane.innerHTML = '';
            E.bodyPane.appendChild(renderPlacedFlow(layout.placed));
            E.stats.style.gridRow = String(statsRow);
            html(E.stats, renderStats(item.stats || []));
            syncUiState()
          }

          function toggleStage(open) {
            S.overlay.open = !!open;
            cls(E.grid, 'case-focus-active', open);
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
            E.cards.forEach(function(card, n) {
              cls(card, 'is-active', n === i)
            });
            toggleStage(true)
          }

          function closeCase() {
            if (S.overlay.caseIndex == null) return;
            S.overlay.caseIndex = null;
            E.cards.forEach(function(card) {
              card.classList.remove('is-active')
            });
            E.stage.classList.remove('no-stats');
            toggleStage(false)
          }

          function injectDev() {
            if (E.body.getAttribute('data-dev-ready')) return;
            E.body.setAttribute('data-dev-ready', '1');
            var colsMarkup = Array.apply(null, Array(12)).map(function(_, i) {
                return '<div data-i="' + (i + 1) + '"></div>'
              }).join(''),
              rowsMarkup = Array.apply(null, Array(4)).map(function(_, i) {
                return '<div data-r="' + (i + 1) + '"></div>'
              }).join(''),
              markup = '<div class="dev-cols">' + colsMarkup + '</div><div class="dev-rows">' + rowsMarkup +
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
            appendFrame(E.stage && E.stage.querySelector('.case-stage__frame'))
          }

          function resetMeasurements() {
            measureCache = {}
          }
          renderCaseCards();
          var casesReady = fetchCases(),
            frameObserver = window.ResizeObserver ? new ResizeObserver(function() {
              resetMeasurements();
              if (S.overlay.open && S.overlay.caseIndex != null) renderCase(S.overlay.caseIndex)
            }) : null;
          if (frameObserver && E.stage) {
            var frame = E.stage.querySelector('.case-stage__frame');
            frame && frameObserver.observe(frame)
          }
          addEventListener('resize', function() {
            setMenu(false);
            updateMaster();
            resetMeasurements();
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
          E.btn && E.btn.addEventListener('click', function() {
            go(curr() === 's3' ? 's0' : curr() === 's2' ? 's3' : 's2')
          });
          E.menuItems.forEach(function(item) {
            item.addEventListener('click', function() {
              go(item.getAttribute('data-target'))
            })
          });
          E.cards.forEach(function(card) {
            card.addEventListener('click', function() {
              casesReady.then(function() {
                openCase(+card.getAttribute('data-case-index'))
              })
            })
          });
          E.close && E.close.addEventListener('click', closeCase);
          E.stage && E.stage.addEventListener('click', function(e) {
            if (e.target === E.stage || e.target.classList.contains('case-stage__blur')) closeCase()
          });

          // Touch/swipe support for mobile
          var touchStartY = 0, touchStartTime = 0;
          addEventListener('touchstart', function(e) {
            if (S.overlay.open) return;
            touchStartY = e.touches[0].clientY;
            touchStartTime = Date.now();
          }, { passive: true });
          addEventListener('touchend', function(e) {
            if (S.overlay.open) return;
            var deltaY = touchStartY - e.changedTouches[0].clientY;
            var deltaTime = Date.now() - touchStartTime;
            if (Math.abs(deltaY) > 50 && deltaTime < 500) {
              step(deltaY > 0 ? 1 : -1);
            }
          }, { passive: true });
          walk(E.w);
          walk(E.stage);
          updateMaster();
          syncUiState();
          go('s0', false);
          scheduleHero()
