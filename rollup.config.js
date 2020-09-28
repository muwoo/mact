import { terser } from "rollup-plugin-terser"

export default {
  input: "src/index.js",
  output: [
    { file: "dist/mact.js", format: "umd", esModule: false, name: "mact", sourcemap: true },
    { file: "dist/mact.esm.js", format: "esm", esModule: false, sourcemap: true },
  ],
  plugins: [
    terser({
      include: ["mact.js"],
    })
  ]
}
