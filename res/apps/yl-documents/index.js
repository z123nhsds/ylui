YLApp.onReady(function() {
    var defaultDoc = '1.前言.md';
    var vue = new Vue({
        el: '#app',
        data: {
            currentDoc: defaultDoc,
            content: '',
            loading: true,
            docsBasePath: '',
            currentDocUrl: ''
        },
        computed: {
            renderedContent: function() {
                return this.markdownToHtml(this.content);
            }
        },
        created: function() {
            this.docsBasePath = this.detectDocsBasePath();
            this.loadDoc(defaultDoc);
        },
        methods: {
            detectDocsBasePath: function() {
                var pathname = window.location.pathname || '';
                if (/\/documents\/?$/.test(pathname)) {
                    return './';
                }
                return '../../../documents/';
            },
            normalizePath: function(path) {
                var parts = path.split('/');
                var normalized = [];
                for (var i = 0; i < parts.length; i++) {
                    var part = parts[i];
                    if (!part || part === '.') {
                        continue;
                    }
                    if (part === '..') {
                        normalized.length && normalized.pop();
                        continue;
                    }
                    normalized.push(part);
                }
                return normalized.join('/');
            },
            escapeHtml: function(text) {
                return String(text)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;');
            },
            getDocDirectory: function(docPath) {
                var index = docPath.lastIndexOf('/');
                return index > -1 ? docPath.slice(0, index + 1) : '';
            },
            resolveDocUrl: function(docPath) {
                return this.docsBasePath + this.normalizePath(docPath);
            },
            resolveRelativeUrl: function(rawUrl) {
                if (!rawUrl || /^(https?:)?\/\//.test(rawUrl) || /^(data|mailto|javascript):/i.test(rawUrl) || rawUrl.charAt(0) === '#') {
                    return rawUrl;
                }
                return this.resolveDocUrl(this.getDocDirectory(this.currentDoc) + rawUrl);
            },
            buildDocLink: function(rawUrl) {
                var docPath = this.normalizePath(this.getDocDirectory(this.currentDoc) + rawUrl).replace(/#.*$/, '').replace(/\?.*$/, '');
                return '<a href="#" onclick="window.vue && window.vue.loadDoc(\'' + this.escapeHtml(docPath).replace(/&#39;/g, '\\&#39;') + '\'); return false;">' + this.escapeHtml(rawUrl) + '</a>';
            },
            loadDoc: function(docPath) {
                var self = this;
                this.loading = true;
                this.currentDoc = this.normalizePath(docPath);
                this.currentDocUrl = this.resolveDocUrl(this.currentDoc);

                YL.util.loadContentFromUrl(this.currentDocUrl, 'GET', function(err, text) {
                    self.loading = false;
                    if (!err) {
                        self.content = text;
                    } else {
                        self.content = '# 文档加载失败\n\n无法加载文档：' + self.currentDoc + '\n\n路径：' + self.currentDocUrl + '\n\n请检查文档文件是否存在。';
                    }
                }, false);
            },
            markdownToHtml: function(md) {
                if (!md) return '';

                var self = this;
                var html = md.replace(/\r\n/g, '\n');
                var codeBlocks = [];

                html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
                    var token = '__CODE_BLOCK_' + codeBlocks.length + '__';
                    codeBlocks.push('<pre><code>' + self.escapeHtml(code.trim()) + '</code></pre>');
                    return token;
                });

                html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
                html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
                html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
                html = html.replace(/`([^`]+)`/g, function(match, code) {
                    return '<code>' + self.escapeHtml(code) + '</code>';
                });
                html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
                html = html.replace(/^\- (.*$)/gm, '<li>$1</li>');

                var lines = html.split('\n');
                var result = [];
                var inList = false;
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.indexOf('<li>') === 0) {
                        if (!inList) {
                            result.push('<ul>');
                            inList = true;
                        }
                        result.push(line);
                    } else {
                        if (inList) {
                            result.push('</ul>');
                            inList = false;
                        }
                        result.push(line);
                    }
                }
                if (inList) {
                    result.push('</ul>');
                }
                html = result.join('\n');

                html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, url) {
                    return '<img src="' + self.escapeHtml(self.resolveRelativeUrl(url)) + '" alt="' + self.escapeHtml(alt) + '">';
                });

                html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function(match, text, url) {
                    if (/\.md($|[?#])/.test(url)) {
                        var docPath = self.normalizePath(self.getDocDirectory(self.currentDoc) + url).replace(/#.*$/, '').replace(/\?.*$/, '');
                        return '<a href="#" onclick="window.vue && window.vue.loadDoc(\'' + docPath.replace(/'/g, '\\&#39;') + '\'); return false;">' + self.escapeHtml(text) + '</a>';
                    }
                    return '<a href="' + self.escapeHtml(self.resolveRelativeUrl(url)) + '" target="_blank">' + self.escapeHtml(text) + '</a>';
                });

                html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
                html = html.replace(/^(?!\s*$|<h\d|<ul>|<\/ul>|<li>|<blockquote>|<pre>|__CODE_BLOCK_)(.+)$/gm, '<p>$1</p>');

                html = html.replace(/__CODE_BLOCK_(\d+)__/g, function(match, index) {
                    return codeBlocks[parseInt(index, 10)] || '';
                });

                return html;
            }
        }
    });

    window.vue = vue;
});
