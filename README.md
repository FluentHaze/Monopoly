# Vue3 + Vite + TypeScript H5 项目

这是一个基于 **Vue 3**、**Vite** 和 **TypeScript** 的 H5 项目模板，使用了 **PostCSS** 进行 H5 适配，**Vue Router**
进行路由管理，并预设了 **Prettier** 格式化配置。

## 技术栈

- **Vue 3**：构建现代化的前端应用，使用 Composition API。
- **Vite**：快速的构建工具，支持快速热更新和开发模式。
- **TypeScript**：静态类型检查，提高代码质量和可维护性。
- **PostCSS**：处理 CSS，进行 H5 响应式适配，使用 px 转 rem 等工具。
- **Vue Router**：路由管理，支持页面导航和动态路由。
- **Prettier**：代码格式化工具，保持代码风格一致。

## 项目结构

```
.
├── src/
│   ├── assets/            # 静态资源，如图片、样式等
│   ├── components/        # 公共组件
│   ├── router/            # Vue Router 配置
│   ├── store/             # Vuex 或 Pinia 状态管理
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.ts            # 项目入口
├── public/                # 公共文件，如 HTML 模板
├── .gitignore             # Git 忽略文件
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 配置
├── postcss.config.js      # PostCSS 配置
├── .prettierrc            # Prettier 配置
└── README.md              # 项目说明文档
```

## 安装与使用

1. **克隆项目**：

2. **安装依赖**：

   使用 `npm` 或 `yarn` 安装依赖。

   ```bash
   npm install
   # 或者
   yarn install
   ```

3. **运行开发服务器**：

   启动开发模式，开启本地开发服务器。

   ```bash
   npm run dev
   # 或者
   yarn dev
   ```

   访问 `http://localhost:5173` 即可在浏览器中查看项目。

4. **打包构建**：

   构建生产版本。

   ```bash
   npm run build
   # 或者
   yarn build
   ```

   构建后的文件将会放在 `dist/` 目录下。

## 配置说明

### TypeScript 配置

- **`tsconfig.json`**：配置了 TypeScript 编译选项，支持模块解析和路径别名。
- **路径别名**：使用了 `@` 作为 `src/` 目录的别名。

### PostCSS 配置

项目使用 **PostCSS** 对样式进行处理，尤其是 H5 适配，支持 **px 转 rem**。

- **`postcss.config.js`** 配置了 `postcss-pxtorem` 插件，将设计稿中的 px 单位转换为 rem 单位，支持移动端适配。

```js
module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 75, // 基准值，适合移动端设计稿为 75
      propList: ['*', '!border'], // 所有属性都会转换为 rem，除非是 border
      selectorBlackList: ['.norem'], // 排除包含 `.norem` 类名的元素
      unitPrecision: 2, // 转换精度，小数点后两位
      replace: true, // 是否直接替换
      mediaQuery: false, // 是否在媒体查询中进行 px 转 rem
      minPixelValue: 0, // 最小像素值
    },
  },
};
```

### Vue Router 配置

项目使用 **Vue Router** 进行路由管理，支持动态路由和嵌套路由。

- **`src/router/index.ts`** 配置了所有的路由信息：

```ts
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import About from '../views/About.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
```

### Prettier 配置

项目已经预设了 **Prettier** 格式化配置，确保代码风格一致。配置文件为 **`.prettierrc`**，你可以在项目中使用 Prettier 来格式化代码。

```json lines
{
  "printWidth": 100,
  // 一行的字符数换行
  "tabWidth": 2,
  // 一个tab代表几个空格数
  "useTabs": false,
  // 是否使用tab进行缩进
  "singleQuote": true,
  // 字符串是否使用单引号
  "semi": true,
  // 行尾是否使用分号，默认为true
  "trailingComma": "all",
  // 是否使用尾逗号
  "arrowParens": "avoid",
  // 箭头函数单变量省略括号
  "bracketSpacing": true,
  // 对象大括号直接是否有空格，默认为true，效果：{ foo: bar }
  "endOfLine": "lf"
  // 保留在 Windows 和 Unix 下的换行符
}
```

## 常用脚本

- **开发模式**：`npm run dev` 启动开发服务器
- **打包构建**：`npm run build` 构建生产版本
