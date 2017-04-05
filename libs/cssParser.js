/**
 * fis.baidu.com
 * @type {Function}
 */

'use strict';

var Rules = require('./css/rules.js');
module.exports = function (content, images) {
    var _file_map = {}
        , _content;
    // 针对hilo中的assert文件中引用的资源进行正则匹配:匹配src:后的文件地址
    var reg = /src\s*:([^,\}\{]*)/gi;
    _content = content.replace(reg, function(m, src) {
        if (src) {
            var id = fis.util.stringQuote(src.trim()).rest;
            var rules = Rules.wrap(id, src.trim()),
                group = rules.getGroup();
            if (rules.isSprites()) {
                console.log('hilo-sprite image:' + images[rules.getImageUrl()]);
            }

            if (rules.isSprites() && images.hasOwnProperty(rules.getImageUrl())) {
                // console.log('*****' + images[rules.getImageUrl()]);
                // console.log('********' + m);
                if(_file_map[group]) {
                    _file_map[group].push(rules);
                }else {
                    _file_map[group] = [rules];
                }
                src = rules.getCss();
            }
            return 'src:' + src;
        }
        return m;
    });
    return {
        content: _content,
        map: _file_map
    };
};
