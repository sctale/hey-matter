import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { rimraf } from "rimraf";

const projectRoot = path.join(import.meta.dirname, "../..");

const frontend = packageDir("@hey-matter/frontend", "dist");
const backend = packageDir("@hey-matter/backend", "dist");

const dist = path.resolve(import.meta.dirname, "dist");
await rimraf(dist);

fs.cpSync(frontend, path.join(dist, "frontend"), {
  recursive: true,
});
fs.cpSync(backend, path.join(dist, "backend"), {
  recursive: true,
});

fs.cpSync(
  path.join(projectRoot, "README.md"),
  path.join(import.meta.dirname, "README.md"),
);
fs.cpSync(
  path.join(projectRoot, "LICENSE"),
  path.join(import.meta.dirname, "LICENSE"),
);

// 将 apps/hey-matter/package.json 的版本号同步到 hey-matter/config.yaml
const packageJsonPath = path.join(import.meta.dirname, "package.json");
const addonConfigPath = path.join(projectRoot, "hey-matter", "config.yaml");
const addonPackageTgzPath = path.join(projectRoot, "hey-matter", "package.tgz");
const appPackageTgzPath = path.join(import.meta.dirname, "package.tgz");

const packageVersion = JSON.parse(
  fs.readFileSync(packageJsonPath, "utf8"),
).version;

const addonConfig = fs.readFileSync(addonConfigPath, "utf8");
const updatedAddonConfig = addonConfig.replace(
  /^version:\s*"[^"]*"/m,
  `version: "${packageVersion}"`,
);
fs.writeFileSync(addonConfigPath, updatedAddonConfig, "utf8");

// 将构建产物 package.tgz 同步复制到 addon Dockerfile 上下文，便于本地/CI 构建镜像
if (fs.existsSync(appPackageTgzPath)) {
  fs.copyFileSync(appPackageTgzPath, addonPackageTgzPath);
}

/**
 * Resolve a directory in a package
 * @param {string} packageName The path of the package json
 * @param {string} directory The dist dir in the package
 * @returns {string}
 */
function packageDir(packageName, directory) {
  // 模块 specifier 必须用正斜杠，path.join 在 Windows 会生成反斜杠导致 resolve 失败
  const packageJsonPath = fileURLToPath(
    import.meta.resolve(`${packageName}/package.json`),
  );
  const packagePath = path.dirname(packageJsonPath);
  return path.join(packagePath, directory);
}
