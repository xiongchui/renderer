# renderer

a stl renderer using `three.js` and `electron`


## 使用说明

0. 使用 `yarn` or `npm`
1. 运行命令 `yarn` or `npm` 安装所有依赖
2. 运行命令 `yarn run start` or `npm run start`


## 打包说明

```js
// 「start」 测试启动方式 不要修改
// 「package」中的 Minesweeper 修改为你的项目名称
// 「--all」是你要打包的平台 如果是 all 会打包为全平台
// 如果改为 「--Mac」则只打包为 mac 应用
// --platform=win32 --arch=x64 打包win应用
// 「~/Desktop/renderer」是打包后文件的生成地址 默认是桌面 可自行修改
// 「C:\\Desktop\\renderer」为 Windows 系统下的路径写法「--icon=」后面的部分是你打包应用的图标地址 自行替换
```

输入 `yarn run package` 执行打包操作
如需修改 `package` 命令请参照上述说明