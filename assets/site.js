(() => {
  'use strict';

  const CONTENT = {
    settings: {
      siteTitle: '迷幻の罐罐',
      tagline: '迷幻の罐罐的個人創作入口',
      channelUrl: 'https://www.youtube.com/@迷幻の罐罐',
      channelLabel: '前往頻道',
      logo: 'assets/logo.png'
    },
    videos: { items: [] },
    socials: {
      groups: [
        { title: '社群與聯絡管道', description: '', links: [
          { title: '迷幻國境內', url: 'https://discord.gg/2X5VYujAX', description: '加入 Discord 社群。', icon: 'discord' },
          { title: '迷幻 Instagram', url: 'https://www.instagram.com/kyle20130422/', description: '追蹤 Instagram。', icon: 'instagram' }
        ] },
        { title: '資源與工具下載', description: '整理實用工具、素材與下載資源。', links: [] },
        { title: '遊戲作品', description: '展示遊戲作品與可遊玩的版本。', links: [] }
      ]
    },
    logic: { title: '限時題目', intro: '試著解開目前開放的題目。', questions: [] },
    stories: { title: '故事', intro: '以簡報的方式，一頁一頁閱讀故事。', stories: [] }
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escapeHTML = (value = '') => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const safeHref = value => {
    try {
      const url = new URL(String(value || ''), location.href);
      return ['https:', 'http:'].includes(url.protocol) ? url.href : '#';
    } catch { return '#'; }
  };
  const safeAsset = value => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    if (/^(https?:|data:image\/)/i.test(raw)) return raw;
    return raw.replace(/^\/+/, '');
  };
  const readJSON = async (path, fallback) => {
    try {
      const response = await fetch(`${path}?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${path}: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn('Content fallback:', error.message);
      return fallback;
    }
  };
  const toast = message => {
    const node = $('#toast');
    node.textContent = message;
    node.classList.add('show');
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => node.classList.remove('show'), 2200);
  };

  function setupNavigation() {
    const activate = id => {
      const known = ['youtube', 'community', 'logic', 'stories'];
      const sectionId = known.includes(id) ? id : 'youtube';
      $$('.nav-tab').forEach(button => {
        const active = button.dataset.section === sectionId;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-current', active ? 'page' : 'false');
      });
      $$('.page-section').forEach(section => {
        const active = section.id === `section-${sectionId}`;
        section.classList.toggle('is-active', active);
        section.hidden = !active;
      });
      if (location.hash !== `#${sectionId}`) history.replaceState(null, '', `#${sectionId}`);
    };
    $$('.nav-tab').forEach(button => button.addEventListener('click', () => activate(button.dataset.section)));
    window.addEventListener('hashchange', () => activate(location.hash.slice(1)));
    activate(location.hash.slice(1) || 'youtube');
  }

  function applySettings(settings) {
    const title = settings.siteTitle || '迷幻の罐罐';
    document.title = title;
    $('#brand-name').textContent = title;
    $('#footer-name').textContent = title;
    if (settings.logo) $('#site-logo').src = safeAsset(settings.logo);
    if (settings.channelUrl) $('#channel-link').href = safeHref(settings.channelUrl);
    $('#channel-link-label').textContent = settings.channelLabel || '前往頻道';
  }

  function youtubeId(url) {
    try {
      const parsed = new URL(url);
      if (parsed.hostname.includes('youtu.be')) return parsed.pathname.split('/').filter(Boolean)[0] || '';
      if (parsed.searchParams.get('v')) return parsed.searchParams.get('v');
      const parts = parsed.pathname.split('/').filter(Boolean);
      const marker = parts.findIndex(part => ['embed', 'shorts', 'live'].includes(part));
      return marker >= 0 ? (parts[marker + 1] || '') : '';
    } catch { return ''; }
  }

  function renderVideos(data) {
    const root = $('#video-list');
    const videos = (data.items || []).filter(item => item && item.visible !== false && item.url);
    if (!videos.length) {
      root.innerHTML = '<p class="empty-state">目前還沒有精選影片，之後可以從後台新增。</p>';
      return;
    }
    root.innerHTML = videos.map(video => {
      const id = youtubeId(video.url);
      const thumb = safeAsset(video.thumbnail) || (id ? `https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg` : '');
      const image = thumb ? `<img class="video-thumb" src="${escapeHTML(thumb)}" alt="${escapeHTML(video.title || '影片縮圖')}" loading="lazy" onerror="this.outerHTML='<div class=&quot;video-placeholder&quot;>▶</div>'">` : '<div class="video-placeholder">▶</div>';
      return `<a class="video-card" href="${escapeHTML(safeHref(video.url))}" target="_blank" rel="noopener noreferrer">${image}<div class="video-meta"><h2 class="video-title">${escapeHTML(video.title || '未命名影片')}</h2><p class="video-description">${escapeHTML(video.description || '')}</p></div></a>`;
    }).join('');
  }

  function renderCommunity(data) {
    const root = $('#community-groups');
    const groups = (data.groups || []).filter(group => group && group.visible !== false);
    if (!groups.length) {
      root.innerHTML = '<p class="empty-state">目前還沒有社群或資源連結。</p>';
      return;
    }
    root.innerHTML = groups.map(group => {
      const links = (group.links || []).filter(link => link && link.visible !== false && link.url);
      const cards = links.length ? `<div class="link-grid">${links.map(link => `<a class="link-card" href="${escapeHTML(safeHref(link.url))}" target="_blank" rel="noopener noreferrer"><span class="link-title"><span>${escapeHTML(link.title || '未命名連結')}</span><span aria-hidden="true">↗</span></span><span class="link-url">${escapeHTML(link.url)}</span>${link.description ? `<p class="link-description">${escapeHTML(link.description)}</p>` : ''}</a>`).join('')}</div>` : `<div class="empty-group">${escapeHTML(group.description || '這個分類目前還沒有內容。可以從後台新增連結。')}</div>`;
      return `<section class="community-group"><div class="group-heading"><h2>${escapeHTML(group.title || '未命名分類')}</h2><span class="group-count">${links.length} LINKS</span></div>${cards}</section>`;
    }).join('');
  }

  function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  function normalizeAnswer(value) { return String(value ?? '').trim().toLocaleLowerCase().replace(/\s+/g, ' '); }
  function isQuestionOpen(question, now = new Date()) {
    if (question.visible === false) return false;
    const start = parseDate(question.startsAt);
    const end = parseDate(question.endsAt);
    return (!start || start <= now) && (!end || end >= now);
  }
  function questionStatus(question, now = new Date()) {
    const start = parseDate(question.startsAt);
    const end = parseDate(question.endsAt);
    if (start && start > now) return `開放時間：${start.toLocaleString('zh-TW')}`;
    if (end) return `截止時間：${end.toLocaleString('zh-TW')}`;
    return 'OPEN QUESTION';
  }

  function renderLogic(data) {
    const root = $('#quiz-list');
    const now = new Date();
    const open = (data.questions || []).filter(item => isQuestionOpen(item, now));
    if (!open.length) {
      root.innerHTML = '<p class="empty-state">目前沒有開放中的題目。請留意之後更新的限時題目。</p>';
      return;
    }
    root.innerHTML = open.map((question, index) => {
      const type = question.type === 'fill' ? 'fill' : 'choice';
      const options = (question.options || []).filter(Boolean);
      const input = type === 'choice'
        ? `<div class="quiz-options">${options.map((option, optionIndex) => `<label class="quiz-option"><input type="radio" name="quiz-${index}" value="${escapeHTML(option)}"><span>${escapeHTML(option)}</span></label>`).join('') || '<p class="empty-state">這道選擇題尚未設定選項。</p>'}</div>`
        : `<input class="quiz-answer" type="text" name="quiz-answer-${index}" placeholder="輸入你的答案" autocomplete="off">`;
      const endDate = parseDate(question.endsAt);
      const countdown = endDate ? `<span class="quiz-clock" data-countdown="${endDate.toISOString()}"></span>` : '';
      return `<article class="quiz-card" data-question-index="${index}"><div class="quiz-topline"><span>${escapeHTML(questionStatus(question, now))}</span>${countdown}</div><h2 class="quiz-title">${escapeHTML(question.title || `題目 ${index + 1}`)}</h2><p class="quiz-prompt">${escapeHTML(question.prompt || '')}</p>${input}<button class="action-button" type="button" data-check-answer="${index}">提交答案</button><p class="quiz-result" id="quiz-result-${index}" aria-live="polite"></p><span class="answer-data" hidden>${escapeHTML(question.answer || '')}</span><span class="explanation-data" hidden>${escapeHTML(question.explanation || '')}</span></article>`;
    }).join('');

    $$('[data-check-answer]', root).forEach(button => button.addEventListener('click', () => {
      const index = Number(button.dataset.checkAnswer);
      const card = button.closest('.quiz-card');
      const answer = card.querySelector('.answer-data').textContent;
      const explanation = card.querySelector('.explanation-data').textContent;
      const selected = card.querySelector('input[type="radio"]:checked');
      const fill = card.querySelector('input[type="text"]');
      const value = selected ? selected.value : (fill ? fill.value : '');
      const result = $(`#quiz-result-${index}`);
      if (!String(value).trim()) {
        result.className = 'quiz-result bad';
        result.textContent = '請先選擇或輸入答案。';
        return;
      }
      const accepted = answer.split('|').map(normalizeAnswer).filter(Boolean);
      const correct = accepted.includes(normalizeAnswer(value));
      result.className = `quiz-result ${correct ? 'good' : 'bad'}`;
      result.textContent = `${correct ? '答對了！' : '再想一想。'}${explanation ? ` ${explanation}` : ''}`;
    }));
    updateCountdowns();
  }

  function updateCountdowns() {
    $$('[data-countdown]').forEach(node => {
      const end = new Date(node.dataset.countdown).getTime();
      const remain = Math.max(0, end - Date.now());
      const totalSeconds = Math.floor(remain / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      node.textContent = remain <= 0 ? '已截止' : `剩餘 ${days ? `${days}天 ` : ''}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    });
  }

  let storiesData = [];
  let activeStory = 0;
  let activeSlide = 0;
  function renderStoryArea(data) {
    storiesData = (data.stories || []).filter(story => story && story.visible !== false && (story.slides || []).length);
    const root = $('#story-area');
    if (!storiesData.length) {
      root.innerHTML = '<p class="empty-state">目前還沒有故事，之後可以從後台新增故事與投影片。</p>';
      return;
    }
    root.innerHTML = `<div class="story-selector">${storiesData.map((story, index) => `<button class="story-select-button ${index === 0 ? 'is-active' : ''}" type="button" data-story="${index}">${escapeHTML(story.title || `故事 ${index + 1}`)}</button>`).join('')}</div><div id="slide-viewer"></div>`;
    $$('[data-story]', root).forEach(button => button.addEventListener('click', () => {
      activeStory = Number(button.dataset.story);
      activeSlide = 0;
      $$('[data-story]', root).forEach(item => item.classList.toggle('is-active', item === button));
      renderSlide();
    }));
    activeStory = 0;
    activeSlide = 0;
    renderSlide();
  }
  function renderSlide() {
    const viewer = $('#slide-viewer');
    if (!viewer || !storiesData[activeStory]) return;
    const story = storiesData[activeStory];
    const slides = story.slides || [];
    const slide = slides[activeSlide] || {};
    const image = slide.image ? `<img class="slide-image" src="${escapeHTML(safeAsset(slide.image))}" alt="${escapeHTML(slide.title || story.title || '故事圖片')}" loading="lazy">` : '';
    viewer.innerHTML = `<article class="slide-card">${image}<div class="slide-content"><p class="slide-number">${escapeHTML(story.subtitle || 'STORY')} · ${String(activeSlide + 1).padStart(2, '0')}</p><h2 class="slide-title">${escapeHTML(slide.title || '')}</h2><p class="slide-text">${escapeHTML(slide.text || '')}</p></div></article><div class="slide-controls"><button class="action-button" type="button" id="slide-prev" ${activeSlide === 0 ? 'disabled' : ''}>← 上一頁</button><span class="slide-progress">${activeSlide + 1} / ${slides.length}</span><button class="action-button" type="button" id="slide-next" ${activeSlide >= slides.length - 1 ? 'disabled' : ''}>下一頁 →</button></div>`;
    $('#slide-prev').addEventListener('click', () => { activeSlide = Math.max(0, activeSlide - 1); renderSlide(); });
    $('#slide-next').addEventListener('click', () => { activeSlide = Math.min(slides.length - 1, activeSlide + 1); renderSlide(); });
  }

  async function init() {
    setupNavigation();
    const [settings, videos, socials, logic, stories] = await Promise.all([
      readJSON('content/settings.json', CONTENT.settings),
      readJSON('content/videos.json', CONTENT.videos),
      readJSON('content/socials.json', CONTENT.socials),
      readJSON('content/logic.json', CONTENT.logic),
      readJSON('content/stories.json', CONTENT.stories)
    ]);
    applySettings({ ...CONTENT.settings, ...settings });
    renderVideos(videos);
    renderCommunity(socials);
    $('#logic-heading').textContent = logic.title || '限時題目';
    $('.centered-intro .section-description', $('#section-logic')).textContent = logic.intro || '試著解開目前開放的題目。';
    renderLogic(logic);
    $('#stories-heading').textContent = stories.title || '故事';
    $('.centered-intro .section-description', $('#section-stories')).textContent = stories.intro || '以簡報的方式，一頁一頁閱讀故事。';
    renderStoryArea(stories);
    window.setInterval(updateCountdowns, 1000);
  }

  init().catch(error => {
    console.error(error);
    toast('網站內容載入時發生問題。');
  });
})();
