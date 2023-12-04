// 这是一个构造函数 WechatMarkdownEdit ()，负责调用其他的方法，是一个启动函数
function WechatMarkdownEdit () {
  // init 参数
  this.editorEle = this.getElement('#editor');

  // renderMarkdown 参数
  // scrollAsync 参数
  this.textareaEle = this.getElement('#textarea');
  this.paperEle = this.getElement('#paper');

  // scrollAsync 参数
  this.editorScrollHeight = 0;
  this.paperEleScrollHeight = 0;
  this.paperWrapEle = this.getElement('#paper-wrap');

  this.editorScrollEle = null;

  // 文档高度
  this.documentHeight = 0;

  // initMarkdownIt 参数
  this.md = this.initMarkdownIt();

  this.editor = this.initEditor();

  // 关闭抽屉按钮
  this.backBtn = this.getElement('#setting-back-btn');

  // 打开抽屉按钮
  this.openBtn = this.getElement('#open-setting');

  // 折叠所有抽屉
  this.packUpBtn = this.getElement('#pack-up-btn');

  // 抽屉
  this.settingWrap = this.getElement('#setting-wrap');

  this.themeGroup = this.getElementAll('.setting-list > .setting-item');

  this.themeActiveIndex;

  this.themeListActiveIndex = [0, 1, 1];

  this.cssDir = ['styles', 'theme', 'codemirror/theme'];

  this.codeThemeLink = this.getElement('#theme-css');
  this.pageThemeLink = this.getElement('#page-theme-css');
  this.editorThemeLink = this.getElement('#editor-theme-css');

  this.codeList;
  this.pageList;
  this.editorList;

  // 自定义样式
  this.selfStyleBtn = this.getElement('#self-style-btn');
  this.styleTextareaEle = this.getElement('#style-textarea');
  this.styleWrap = this.getElement('#style-wrap');
  this.styleEditor;
}

WechatMarkdownEdit.prototype.init = function () {
  let that = this;

  // 初始化整个页面的高度
  that.editorEle.style.height = `${document.documentElement.clientHeight - 54}px`;

  this.initLocalStorage();

  that.renderMarkdown();

  that.scrollAsync();

  that.copy();

  that.buttonEvent();

  that.customizeStyle();
}

// 获取单个 dom
WechatMarkdownEdit.prototype.getElement = function (selector) {
  return document.querySelector(selector);
}

// 获取多个 dom
WechatMarkdownEdit.prototype.getElementAll = function (selector) {
  return document.querySelectorAll(selector);
}

// 初始化 localstorage
WechatMarkdownEdit.prototype.initLocalStorage = function () {
  let that = this;

  if (localStorage.getItem('activeList')) {
    let tempList = JSON.parse(localStorage.getItem('activeList'));
    that.themeListActiveIndex = tempList;
  }

  if (localStorage.getItem('defaultcss') && that.themeListActiveIndex[1] === 0) {
    that.styleWrap.innerHTML = localStorage.getItem('defaultcss');
  }

  let activeListStr = JSON.stringify(that.themeListActiveIndex)
  localStorage.setItem('activeList', activeListStr);
}

// 初始化 Markdown-it
WechatMarkdownEdit.prototype.initMarkdownIt = function () {
  let md = window.markdownit({
    typographer: true,

    breaks: true,

    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs">' +
            hljs.highlight(lang, str, true).value +
            '</pre>';
        } catch (__) {
          return __
        }
      }

      return '<pre class="hljs">' + md.utils.escapeHtml(str) + '</pre>';
    }
  });

  md.use(window.markdownitContainer, 'tips', {
    render: function (tokens, idx) {
      let m = tokens[idx].info.trim().match(/^tips(.*)$/);

      if (tokens[idx].nesting === 1) {
        return '<section class="tips"><p class="tips-title">Tip</p>' + md.utils.escapeHtml(m[1]);
      } else {
        return '</section>\n';
      }
    }
  });

  md.use(window.markdownitContainer, 'time', {
    render: function (tokens, idx) {
      let m = tokens[idx].info.trim().match(/^time(.*)$/);

      if (tokens[idx].nesting === 1) {
        return '<section class="time">' + md.utils.escapeHtml(m[1]);
      } else {
        return '</section>\n';
      }
    }
  });

  md.use(window.markdownitEmoji);

  md.use(window.markdownitSup);

  md.use(window.markdownitSub);

  md.use(window.markdownitIns);

  md.use(window.markdownitMark);

  md.use(window.markdownitFootnote);

  md.use(window.markdownitDeflist);

  md.use(window.markdownitAbbr);

  return md;
}

// 初始化 CodeMirror
WechatMarkdownEdit.prototype.initEditor = function () {
  let that = this;

  let editor = CodeMirror.fromTextArea(that.textareaEle, {
    lineNumbers: false,
    lineWrapping: true,
    styleActiveLine: true,
    scrollbarStyle: 'null',
    autofocus: true,
    theme: '3024-night',
    mode: 'text/x-markdown',
  });

  that.editorScrollEle = editor.display.scroller;

  return editor
}

// 1-自定义 css
WechatMarkdownEdit.prototype.customizeStyle = function () {
  let that = this;
  let pageListLis = that.getElementAll('#page-list > li');

  // 1.1-判断是否点击自定义样式按钮
  that.selfStyleBtn.onclick = function () {
    // 1.1.1-设置默认的编辑器，themeDefaultText为theme-text中的变量，设置编辑器中默认显示的内容
    that.editor.setValue(themeDefaultText);

    // 1.1.2-判断本地是否存储defaultcss字段，如果没有则获取默认的自定义样式，在theme-text的defaultCss变量中
    if (!localStorage.getItem('defaultcss')) {
      localStorage.setItem('defaultcss', defaultCss);
    }

    //1.1.3-进入自定义css样式编辑状态
    if (that.selfStyleBtn.innerHTML === '自定义样式') {
      // 1.1.3.1-切换按钮状态，进入自定义编辑状态
      that.editor.display.wrapper.style.display = 'none';
      that.selfStyleBtn.innerHTML = '保存';

      // 1.1.3.2-给预览器添加自定义的默认样式defaultcss
      if (that.getElement('#style-wrap') === null) {
        let style = document.createElement('style');
        style.id = 'style-wrap';

        that.getElement('head').appendChild(style);

        that.styleWrap = that.getElement('#style-wrap');

        that.styleWrap.innerHTML = localStorage.getItem('defaultcss');
      }

      //1.1.3.3-给CSS代码编辑器进行初始化，如果样式修改器没定义过就定义，定义过就直接显示出来
      if (typeof that.styleEditor === 'undefined') {
        that.styleEditor = CodeMirror.fromTextArea(that.styleTextareaEle, {
          lineNumbers: true,
          lineWrapping: true,
          styleActiveLine: true,
          scrollbarStyle: 'null',
          autofocus: true,
          theme: '3024-night',
          mode: 'text/css',
        });
      } else {
        that.styleEditor.display.wrapper.style.display = 'block';
      }
      // 1.1.4-保存返回markdown内容编辑状态
    } else {
      that.selfStyleBtn.innerHTML = '自定义样式';
      that.styleEditor.display.wrapper.style.display = 'none';
      that.editor.display.wrapper.style.display = 'block';
      localStorage.setItem('defaultcss', that.styleEditor.getValue());//本地css样式获取最新修改的

      // 1.1.4.1-将文本样式由default样式切换为自定义样式
      pageListLis[that.themeListActiveIndex[1]].classList.remove('li-active');
      pageListLis[0].classList.add('li-active');
      that.themeListActiveIndex[1] = 0;
      let activeListStr = JSON.stringify(that.themeListActiveIndex)
      // 本地存储后，下次启动会获取并判断使用哪个样式【0，1，2，3】
      localStorage.setItem('activeList', activeListStr);
    }

    that.styleEditor.setValue(localStorage.getItem('defaultcss'));//将修改过的自定义样式进行应用

    //监听样式修改器的内容是否由变化，有的话更新前端css的代码编辑器内容的显示
    that.styleEditor.on('change', function () {
      that.styleWrap.innerHTML = that.styleEditor.getValue();
    });
  }
}

// 预览示图渲染
WechatMarkdownEdit.prototype.renderMarkdown = function () {
  let that = this;

  let mdHtml = that.md.render(that.textareaEle.value);
  that.paperEle.innerHTML = mdHtml;

  that.editor.on('change', function () {
    let editorValue = that.editor.getValue();
    let value = that.md.render(editorValue);
    that.paperEle.innerHTML = value;
  });
}

// 滚动条同步滚动
WechatMarkdownEdit.prototype.scrollAsync = function () {
  let that = this;

  // 初始化文档高度
  that.documentHeight = document.documentElement.clientHeight;

  // 初始化滚动条高度
  that.editorScrollHeight = that.editorScrollEle.scrollHeight - that.documentHeight;
  that.paperEleScrollHeight = that.paperWrapEle.scrollHeight - that.documentHeight;

  window.onresize = function () {
    that.editorScrollHeight = that.editorScrollEle.scrollHeight - that.documentHeight;
    that.paperEleScrollHeight = that.paperWrapEle.scrollHeight - that.documentHeight;

    that.editorEle.style.height = `${document.documentElement.clientHeight - 54}px`;
  }

  that.editorScrollEle.onmouseenter = function () {
    that.editorScrollHeight = that.editorScrollEle.scrollHeight - that.documentHeight;
    that.paperEleScrollHeight = that.paperWrapEle.scrollHeight - that.documentHeight;

    that.editorScrollEle.onscroll = function () {
      let textareaEleScrollTop = that.editorScrollEle.scrollTop;
      let scale = textareaEleScrollTop / that.editorScrollHeight;
      scale = scale.toFixed(4);

      that.paperWrapEle.scrollTop = that.paperEleScrollHeight * scale;
    }
  }

  that.editorScrollEle.onmouseleave = function () {
    that.editorScrollEle.onscroll = null;
  }

  that.paperWrapEle.onmouseenter = function () {
    that.editorScrollHeight = that.editorScrollEle.scrollHeight - that.documentHeight;
    that.paperEleScrollHeight = that.paperWrapEle.scrollHeight - that.documentHeight;

    that.paperWrapEle.onscroll = function () {
      let paperEleScrollTop = that.paperWrapEle.scrollTop;
      let scale = paperEleScrollTop / that.paperEleScrollHeight;
      scale = scale.toFixed(4);

      that.editorScrollEle.scrollTop = that.editorScrollHeight * scale;
    }
  }

  that.paperWrapEle.onmouseleave = function () {
    that.paperWrapEle.onscroll = null;
  }
}

// 2-复制排版好的内容
WechatMarkdownEdit.prototype.copy = function () {
  // 2.1-初始化clipboard------https://clipboardjs.com/
  let clipboard = new ClipboardJS('#copy');

  clipboard.on('success', function (e) {
    // tata是弹窗属性
    tata.success('复制成功', '可前往公众号粘贴了(￣▽￣)"', {
      position: 'tm',
      duration: 1500
    });

    e.clearSelection();
  });

  clipboard.on('error', function (e) {
    tata.text('复制失败', '请重新尝试复制。', {
      position: 'tm',
      duration: 1500
    });
  });
}

WechatMarkdownEdit.prototype.buttonEvent = function () {
  let that = this;
  let themeTypeList = [themeObj, pageThemeObj, editorThemeObj];
  let ulList = [];

  that.backBtn.onclick = function () {
    that.settingWrap.style.transform = 'translateX(100%)';
    that.settingWrap.style.opacity = '0';
    if (typeof that.themeActiveIndex !== 'undefined') {
      that.themeGroup[that.themeActiveIndex].children[3].children[3].style.transform = 'rotateZ(180deg)';
      that.themeGroup[that.themeActiveIndex].children[3].classList.remove('theme-active');
      that.themeGroup[that.themeActiveIndex].children[1].style.height = '0px';
    }
  }

  that.openBtn.onclick = function () {
    that.settingWrap.style.transform = 'translateX(0)';
    that.settingWrap.style.opacity = '1';
  }

  that.packUpBtn.onclick = function () {
    that.themeGroup[that.themeActiveIndex].children[0].classList.remove('theme-active');
    that.themeGroup[that.themeActiveIndex].children[1].style.height = '0px';
  }

  for (let i = 0; i < that.themeGroup.length; i++) {
    ulList.push(that.themeGroup[i].children[1]);

    that.themeGroup[i].children[0].onclick = function (e) {
      if (that.themeActiveIndex !== i) {
        if (typeof that.themeActiveIndex !== 'undefined') {
          that.themeGroup[that.themeActiveIndex].children[0].children[0].style.transform = 'rotateZ(180deg)';
          that.themeGroup[that.themeActiveIndex].children[0].classList.remove('theme-active');
          that.themeGroup[that.themeActiveIndex].children[1].style.height = '0px';
        }
        that.themeActiveIndex = i;
        let height = 4.5 * that.themeGroup[i].children[1].children.length;
        if (that.themeGroup[i].children[1].style.height === '0px') {
          e.target.children[0].style.transform = 'rotateZ(90deg)';
          that.themeGroup[i].children[1].style.height = height + 'rem';
          e.target.classList.add('theme-active');
        }
      } else {
        let height = 4.5 * that.themeGroup[i].children[1].children.length;
        if (that.themeGroup[i].children[1].style.height === '0px') {
          e.target.children[0].style.transform = 'rotateZ(90deg)';
          that.themeGroup[i].children[1].style.height = height + 'rem';
          e.target.classList.add('theme-active');
        } else {
          e.target.children[0].style.transform = 'rotateZ(180deg)';
          that.themeGroup[i].children[1].style.height = '0px';
          that.themeGroup[that.themeActiveIndex].children[0].classList.remove('theme-active');
        }
      }
    }
  }

  for (let i = 0; i < themeTypeList.length; i++) {
    for (let item in themeTypeList[i]) {
      let li = document.createElement('li');
      let text = document.createTextNode(item);
      li.title = item;
      li.appendChild(text);
      ulList[i].appendChild(li);
    }
  }

  for (let i = 0; i < ulList.length; i++) {
    ulList[i].children[that.themeListActiveIndex[i]].classList.add('li-active');
    for (let j = 0; j < ulList[i].children.length; j++) {
      if (that.cssDir[i] === 'styles') {
        ulList[i].children[j].onclick = function (e) {
          let href = `./css/${that.cssDir[i]}/${e.target.title}.css`;

          ulList[i].children[that.themeListActiveIndex[i]].classList.remove('li-active');

          ulList[i].children[j].classList.add('li-active');

          that.themeListActiveIndex[i] = j;

          let activeListStr = JSON.stringify(that.themeListActiveIndex)
          localStorage.setItem('activeList', activeListStr);

          that.codeThemeLink.setAttribute('href', href);
        }
      } else if (that.cssDir[i] === 'theme') {
        ulList[i].children[j].onclick = function (e) {
          if (e.target.title !== '我的样式') {
            let href = `./css/${that.cssDir[i]}/${e.target.title}.css`;
            that.pageThemeLink.setAttribute('href', href);
          }

          ulList[i].children[that.themeListActiveIndex[i]].classList.remove('li-active');

          ulList[i].children[j].classList.add('li-active');

          if (that.styleWrap !== null) {
            that.styleWrap.parentElement.removeChild(that.styleWrap);
            that.styleWrap = null;
          }

          if (e.target.title === 'stormzhang') {
            that.editor.setValue(themeText);
          } else if (e.target.title === '我的样式') {
            let style = document.createElement('style');

            style.id = 'style-wrap';

            that.getElement('head').appendChild(style);

            that.styleWrap = that.getElement('#style-wrap');

            that.styleWrap.innerHTML = localStorage.getItem('defaultcss');

            that.editor.setValue(themeDefaultText);
          } else {
            that.editor.setValue(themeDefaultText);
          }

          that.themeListActiveIndex[i] = j;

          let activeListStr = JSON.stringify(that.themeListActiveIndex)
          localStorage.setItem('activeList', activeListStr);
        }
      } else {
        ulList[i].children[j].onclick = function (e) {
          let href = `./css/${that.cssDir[i]}/${e.target.title}.css`;

          ulList[i].children[that.themeListActiveIndex[i]].classList.remove('li-active');

          ulList[i].children[j].classList.add('li-active');

          that.editorThemeLink.setAttribute('href', href);

          if (that.styleEditor) {
            that.styleEditor.setOption('theme', e.target.title);
          }

          that.editor.setOption('theme', e.target.title);

          that.themeListActiveIndex[i] = j;

          let activeListStr = JSON.stringify(that.themeListActiveIndex)
          localStorage.setItem('activeList', activeListStr);
        }
      }
    }
  }

  that.codeList = that.getElementAll('#code-list > li');
  that.pageList = that.getElementAll('#page-list > li');
  that.editorList = that.getElementAll('#editor-list > li');

  if (that.pageList[that.themeListActiveIndex[1]].title === 'stormzhang') {
    that.editor.setValue(themeText);
  }

  let codeHref = `./css/styles/${that.codeList[that.themeListActiveIndex[0]].title}.css`;
  let pageHref = `./css/theme/${that.pageList[that.themeListActiveIndex[1]].title}.css`;
  let editorHref = `./css/codemirror/theme/${that.editorList[that.themeListActiveIndex[2]].title}.css`;

  that.codeThemeLink.setAttribute('href', codeHref);

  if (that.pageList[that.themeListActiveIndex[1]].title === '我的样式') {
    let style = document.createElement('style');
    style.id = 'style-wrap';
    that.getElement('head').appendChild(style);
    that.styleWrap = that.getElement('#style-wrap');
    that.styleWrap.innerHTML = localStorage.getItem('defaultcss');
    that.editor.setValue(themeDefaultText);
  } else {
    that.pageThemeLink.setAttribute('href', pageHref);
  }

  that.editorThemeLink.setAttribute('href', editorHref);
  that.editor.setOption('theme', that.editorList[that.themeListActiveIndex[2]].title);
}

window.onload = function () {
  new WechatMarkdownEdit().init();
}

// 在页面加载完后，会 将加载页面隐藏掉，将容器内容展示出来
window.addEventListener('load', function () {
  this.document.getElementById('loading').style.display = 'none';
  this.document.getElementById('container').style.visibility = 'visible';
});