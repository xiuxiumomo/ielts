import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import externalGlobals from "rollup-plugin-external-globals";
//import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
//import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import viteCompression from "vite-plugin-compression";
import postcssPresetEnv from "postcss-preset-env";

import path from "path";
export default defineConfig({
  plugins: [
    vue(),
    //支持jsx语法
    vueJsx(),
    //svg全局导入
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[dir]-[name]",
    }),
    //组件自动导入
    Components({
      dirs: ["src/components"],
      extensions: ["vue", "jsx"],
      dts: "src/components.d.ts",
      //resolvers: [ElementPlusResolver()],
    }),
    //Message Dialog等样式自动导入
    // AutoImport({
    //   resolvers: [ElementPlusResolver()],
    // }),
    //gzip压缩资源
  ],
  build: {
    minify: "terser",
    terserOptions: {
      compress: {
        //去掉console和debugger语句，但是保留log语句。
        drop_console: true,
        drop_debugger: true,
      },
    },
    //使用CDN引入第三方包
    rollupOptions: {
      external: ["lodash"],
      plugins: [
        externalGlobals({
          lodash: "_",
        }),
        viteCompression({
          verbose: true, // 是否在控制台中输出压缩结果
          disable: false,
          threshold: 10240, // 如果体积大于阈值，将被压缩，单位为b，体积过小时请不要压缩，以免适得其反
          algorithm: "gzip", // 压缩算法，可选['gzip'，' brotliccompress '，'deflate '，'deflateRaw']
          ext: ".gz",
          deleteOriginFile: false, // 保留原始资源，Cloudflare Pages 需要直接提供 JS/CSS 文件
        }),
      ],
      output: {
        chunkFileNames: "js/[name]-[hash].js", // 引入文件名的名称
        entryFileNames: "js/[name]-[hash].js", // 包的入口文件名称
        assetFileNames: "[ext]/[name]-[hash].[ext]", // 资源文件像 字体，图片等
        // 最小化拆分包
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return id.toString().split("node_modules/")[1].split("/")[0].toString();
          }
        },
      },
    },
  },

  //给样式自动添加前缀
  css: {
    postcss: {
      plugins: [postcssPresetEnv()],
    },
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        additionalData: `@import "${path.resolve(__dirname, "src/assets/less/mixins.less")}";`,
      },
    },
  },
  //短路径
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  //开发环境的代理
  server: {
    host: "0.0.0.0",
    hmr: true,
    strictPort: true,
    proxy: {
      "/api": {
        target: "",
        changeOrigin: true,
        //路径重写，将/api替换为空字符串，即去掉/api前缀。
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
