# fis-spriter-hilosprite

针对Hilo的基于FIS的csssprites，由[fis-spriter-csssprites](https://github.com/fex-team/fis-spriter-csssprites) 修改而来，具体说明请访问原项目了解

### 特性
结合[Hilo](https://github.com/hiloteam/Hilo)使用图片的实际情况，对原有csssprites插件进行改造，支持Hilo素材类中的图片分组合并、合并路径指定

<table>
    <tr>
        <th>query</th>
        <th>说明</th>
    </tr>
    <tr>
        <td>?__hilosprite</td>
        <td>标识图片要做合并</td>
    </tr>
    <tr>
        <td>?__hilosprite=group</td>
        <td>标识图片合并到"group_(x|y|z).png"</td>
    </tr>
</table>

> `group`只支持“字母、数字、-、_”

### 配置

* 启用 fis-spriter-hilosprite 插件

```javascript
fis.match('::package', {
    spriter: fis.plugin('hilosprite')
});
```

* 其他设置，更多详细设置请参考[fis-spriter-csssprites](https://github.com/fex-team/fis-spriter-csssprites)

```javascript
fis.config.set('settings.spriter.hilosprite', {
	// 图片缩放比例
	scale: 1,
    // 表示图片最后输出的矩形区域不带单位（如px和rem）
    units: 'none',
	// 1rem像素值，为空时表示使用px
	rem: '',
    // 图之间的边距
    margin: 10,
    // 使用矩阵排列方式，默认为线性`linear`
    layout: 'matrix',
    // 合并图片存到/img/
    to: '/img'
});
// hilosprite插件主要针对js文件进行处理
fis
.match('game/assert.js', {
	// 这里的spriteTo为最高优先匹配，会覆盖全局的to设置
	spriteTo : 'img/pkg',
	// 表示对文件进行hilosprite处理
	useHilosprite: true
})
```

> `to` 参数可以为相对路径（相对当前css路径）、绝对路径（项目根路径）

> `spriteTo` 作为文件的to设置，为最高优先匹配，与`to`一样支持相对、绝对路径

### 代码效果
原来的csssprite主要针对css中的图片进行sprite处理；而Hilo开发过程中，素材一般通过assert类进行管理，一般通过指定图片src向loadqueue添加素材；
```javascript
var resources = [
	// 新手提示
	{id: 'hand', src: __uri('../../../static/images/snake/hand.png')},
	{id: 'arrow', src: __uri('../../../static/images/snake/arrow.png')}
];
this.queue.add(resources);
```
然后在资源加载完毕时获取图片
```javascript
this.gameImages = {
	hand: this.queue.get('hand').content,
	arrow: this.queue.get('arrow').content
}
```
原来的csssprite插件无法针对该情况进行sprite处理，所以对hilosprite对csssprite做了改造，如下：
```javascript
var resources = [
	// 新手提示
	{id: 'hand', src: __uri('../../../static/images/snake/hand.png?__hilosprite=game-sprite')},
	{id: 'arrow', src: __uri('../../../static/images/snake/arrow.png?__hilosprite=game-sprite')}
	];
this.queue.add(resources);
```
获取图片
```javascript
this.gameImages = {
	hand: {img: this.queue.get('hand').content, rect: this.queue.get('hand').rect},
	arrow: {img: this.queue.get('arrow').content, rect: this.queue.get('arrow').rect}
}
```
主要是hilosprite插件一旦发现图片的src上带有__hilosprite=，就会进行sprite分组处理，然后给出该图片在sprite图片的区域，用rect属性来表示；
```javascript
var resources = [
	// 新手提示
	{id: 'hand', src: "/caractivity/games/static/images/newCar/snakeScene1_game-sprite_1_z_98da4ba.png", rect: [0, 400, 125, 82]},
	{id: 'arrow', src: "/caractivity/games/static/images/newCar/snakeScene1_game-sprite_1_z_98da4ba.png", rect: [466, 0, 38, 85]},
];
```