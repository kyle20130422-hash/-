# 迷幻の罐罐｜Decap CMS + GitHub Pages

這是一個依照 `你的段落文字.pdf` 草稿整理的靜態網站專案。首頁保留深咖啡黑底、白色細框、綠色選取導覽與 PDF 中的罐罐 Logo。

## 專案內容

- `index.html`：公開網站首頁
- `assets/site.css`、`assets/site.js`：樣式與前台內容載入
- `assets/logo.png`：從使用者提供的 PDF 草稿擷取的 Logo
- `assets/youtube-brand.png`：從 PDF 草稿擷取的 YouTube 標誌
- `admin/`：Decap CMS 管理介面與欄位設定
- `content/`：網站公開內容的 JSON 檔案

## 目前網站分區

1. **youtube**：頻道入口、YouTube 精選影片。
2. **其他社群區**：可在後台新增、改名、排序分類群組；預設有「社群與聯絡管道」「資源與工具下載」「遊戲作品」。每個群組可新增多個網址。
3. **邏輯區**：限時題目，支援選擇題、填充題、開始／截止時間及解答說明。
4. **故事**：一個故事可以有多張投影片，後台可新增、排序每一頁的標題、文字與圖片。

## 部署到 GitHub Pages

1. 在 GitHub 建立一個新的 Repository，例如 `my-creator-site`。
2. 把本專案全部檔案與資料夾上傳到 Repository 的 `main` 分支根目錄。不要只上傳 ZIP。
3. 開啟 `admin/config.yml`，把 `YOUR_GITHUB_USERNAME/YOUR_REPOSITORY` 換成 `你的帳號/你的Repo名稱`。
4. 設定 GitHub Pages：Repository → Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)`。
5. 等 Pages 首次部署完成後，公開首頁會是 `https://你的帳號.github.io/Repo名稱/`，管理入口是同一個網址加上 `/admin/`。

## 設定 Decap CMS 登入（必要）

GitHub Pages 只負責靜態網站，不會替 Decap 提供 GitHub OAuth 認證伺服器。GitHub backend 需要 OAuth server / proxy；不要把 Personal Access Token 或 OAuth Secret 寫進 `index.html`、`config.yml` 或任何公開檔案。

建議用 Cloudflare Worker OAuth Proxy：

1. 依照官方 Decap 文件連到 Cloudflare Worker 範本：<https://github.com/sterlingwes/decap-proxy>。
2. 在 GitHub Developer Settings 建立 OAuth App。Homepage URL 填 Worker URL；Authorization callback URL 填 `Worker URL/callback`。
3. 將 OAuth App 的 Client ID / Client Secret 設為 Cloudflare Worker Secrets：`GITHUB_OAUTH_ID`、`GITHUB_OAUTH_SECRET`。
4. 部署 Worker，取得 URL，例如 `https://your-decap-proxy.yourname.workers.dev`。
5. 把 `admin/config.yml` 中的 `base_url` 改成該 Worker URL，保留 `auth_endpoint: /auth`。
6. 將更新後的 `admin/config.yml` 推送到 GitHub Pages Repository。
7. 用具有該 Repository 寫入權限的 GitHub 帳號開啟 `/admin/`，登入後即可編輯。

> `config.yml` 預設的 `base_url` 是佔位文字，尚未設定 OAuth Proxy 前，管理介面不會完成 GitHub 登入。

## 本機預覽

建議使用本機 HTTP Server，不要直接用 `file://` 開啟，因為瀏覽器通常會阻擋 `fetch()` 讀取 JSON 檔。

在專案根目錄執行：

```bash
python -m http.server 8000
```

然後開啟：

- 網站：<http://localhost:8000/>
- 管理介面：<http://localhost:8000/admin/>

若要本機測試 Decap 寫入，可參考 Decap 的 `npx decap-server` / local backend 文件；本專案的正式 GitHub 登入仍需先部署 OAuth Proxy。

## 後台編輯方式

- **YouTube 精選影片**：新增影片標題、YouTube 網址、簡介；縮圖可留空自動使用 YouTube 縮圖，也可上傳自訂縮圖。
- **其他社群／資源／遊戲**：在「分類群組」新增分類，群組裡再新增多筆網址。這就是之前提到的可擴充「地區」。
- **邏輯區／限時題目**：題目形式選「選擇題」或「填充題」；選擇題填選項，兩種題型都要填正確答案。多個可接受答案以 `|` 分隔。時間留空代表立即開放／不設截止。
- **故事／簡報編輯**：新增故事，再於投影片內新增多頁。可以編輯每頁標題、文字及圖片，拖曳排序。

## 重要限制

- 目前題目答案會隨靜態 JSON 一起公開，適合互動小測驗，不適合保密考試或防作弊評分。
- 後台儲存是 Git commit；變更推送到 Repository 後，GitHub Pages 才會更新公開網站。
- 首頁的 Discord 與 Instagram 連結依照 PDF 草稿先填入；YouTube 頻道網址依照你提供的頻道連結設定。
