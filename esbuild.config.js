import * as esbuild from "esbuild"
import { exec } from "child_process"
import * as fs from "fs/promises"
import * as path from 'path'
import { fileURLToPath } from 'url'

const
  isServe = process.argv.includes("--serve"),
  __dirname = fileURLToPath(import.meta.resolve( './'))

// Function to pack the ZIP file
async function packZip() {
  const obj = Promise.withResolvers()
  exec("node ./pack-zip.js", (err, stdout, stderr) => {
    if (err) {
      console.error("Error packing zip:");
      obn.reject(err); return
    }
    console.log(stdout.trim());
    obj.resolve()
  });
  return await obj.promise
}

// Custom plugin to pack ZIP after build or rebuild
const zipPlugin = {
  name: "zip-plugin",
  setup(build) {
    build.onEnd(async () => {
      await fs.writeFile(
        path.join(__dirname, 'dist/webgpu-notext.svg'),
        await fs.readFile(path.join(__dirname, 'src/webgpu-notext.svg'), 'utf8')
      )
      await packZip()
    });
  },
};

// Base build configuration
let buildConfig = {
  entryPoints: ["src/main.js"],
  bundle: true,
  // minify: true,
  logLevel: "info",
  color: true,
  outdir: "dist",
  plugins: [zipPlugin],
};

// Main function to handle both serve and production builds
(async () => {
  if (isServe) {
    console.log("Starting development server...");

    // Watch and Serve Mode
    const ctx = await esbuild.context(buildConfig);

    await ctx.watch();
    const { host, port } = await ctx.serve({
      servedir: ".",
      port: 3000,
    });

  } else {
    console.log("Building for production...");
    await esbuild.build(buildConfig);
    console.log("Production build complete.");
  }
})();
