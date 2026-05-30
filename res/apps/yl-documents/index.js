YLApp.onReady(function() {
    var vue = new Vue({
        el: '#app',
        data: {
            currentDoc: '1.前言.md',
            content: '',
            loading: true
        },
        computed: {
            renderedContent: function() {
                return this.markdownToHtml(this.content);
            }
        },
        created: function() {
            this.loadDoc('1.前言.md');
        },
        methods: {
            loadDoc: function(docPath) {
                var self = this;
                this.loading = true;
                this.currentDoc = docPath;
                
                var url = '../../../documents/' + docPath;
                
                YL.util.loadContentFromUrl(url, 'GET', function(err, text) {
                    self.loading = false;
                    if (!err) {
                        self.content = text;
                    } else {
                        self.content = '# 文档加载失败\n\n无法加载文档：' + docPath + '\n\n请检查文档文件是否存在。';
                    }
                }, false);
            },
            
            markdownToHtml: function(md) {
                if (!md) return '';
                
                var html = md;
                
                // 转换标题
                html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
                html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
                html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
                
                // 转换代码块 (```)
                html = html.replace(/```([\s\S]*?)```/g, function(match, code) {
                    return '<pre><code>' + code.trim() + '</code></pre>';
                });
                
                // 转换行内代码 (`code`)
                html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
                
                // 转换列表
                html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
                
                // 处理列表容器
                var lines = html.split('\n');
                var inList = false;
                var result = [];
                
                for (var i = 0; i < lines.length; i++) {
                    var line = lines[i];
                    if (line.startsWith('<li>')) {
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
                
                // 转换引用块
                html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
                
                // 转换段落
                html = html.replace(/^(?!<[hulbpr])(.*)$/gm, function(match, p1) {
                    if (p1.trim() === '') return '';
                    return '<p>' + p1 + '</p>';
                });
                
                // 转换链接 [text](url)
                html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
                
                // 转换粗体 **text**
                html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                
                // 转换斜体 *text*
                html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
                
                return html;
            }
        }
    });
    
    window.vue = vue;
});