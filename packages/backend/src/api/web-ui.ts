import fs from "node:fs";
import path from "node:path";
import express from "express";

export function webUi(dist?: string) {
  const router = express.Router();
  if (dist) {
    // 启动时一次性读取 index.html 模板，避免每次请求都进行磁盘 IO
    const indexPath = path.resolve(dist, "index.html");
    const template = fs.readFileSync(indexPath, "utf8");
    const index = replaceBase(template);
    router.get("/", index);
    router.get("/index.html", index);
    router.use(express.static(dist));
    router.get(/.*/, index);
  }
  return router;
}

function replaceBase(
  template: string,
): (req: express.Request, res: express.Response) => void {
  return (req, res) => {
    let baseUrl = req.baseUrl;
    if (!baseUrl.endsWith("/")) {
      baseUrl += "/";
    }
    const content = template.replace(
      /<!-- BASE -->[\s\S]*<!-- \/BASE -->/,
      `<base href='${baseUrl}' />`,
    );
    res.status(200).contentType("text/html").send(content);
  };
}
