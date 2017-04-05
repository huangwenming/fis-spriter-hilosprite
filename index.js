/**
 * @author fis
 * @site fis.baidu.com
 * @type {*}
 */

'use strict';

var cssParser = require('./libs/cssParser.js');
var util = require('./libs/util.js');
var imgGen;
try {
    imgGen = require('./libs/image.js');
} catch (e) {
    fis.log.warning('csssprites does not support your node ' + process.version +
        ', report it to https://github.com/xiangshouding/fis-spriter-csssprites/issues');
}

module.exports = function(ret, conf, settings, opt) {
    if (!imgGen) {
        return;
    }
    //文件属性中useHilosprite == true的js做图片合并
    fis.util.map(ret.src, function(subpath, file) {
        if (file.isJsLike && file.useHilosprite) {
            processCss(file, ret, settings, opt);
        }
    });

    //打包后的js文件做图片合并
    fis.util.map(ret.pkg, function (subpath, file) {
        if (file.rExt == '.js') {
            processCss(file, ret, settings, opt);
        }
    });
};

function processCss(file, ret, settings, opt) {
    var content = _process(file.getContent(), file, null, ret, settings, opt);
    file.setContent(content);
}


function _processPart(content, file, index, ret, settings, opt){
    var images = {};
    fis.util.map(ret.src, function (subpath, item) {
        if (item.isImage()) {
            images[util.getUrl(item, file, opt)] = item;
        }
    });
    var res = cssParser(content, images);
    var content = res.content;
    if (res.map) {
        var css = imgGen(file, index, res.map, images, ret, settings, opt);
        // 将content中的内容采用css中的内容进行替换
        var __sprites_hook_re = /<<<([\s\S]*?)>>>/g;
        var __sprites_id_re = /spriteId:(.*)/g;
        // console.log('*********css:' + JSON.stringify(css));
        content = content.replace(__sprites_hook_re, function(m, src) {
            src = src.replace(__sprites_id_re, function (index, id) {
                return css[id];
            });
            return src;
        });

        // console.log('*********content:' + content);
    }
    return content;
}

function _process(content, file, index, ret, settings, opt){

	var css = _processPart(content, file, index, ret, settings, opt);

	return css;
}
