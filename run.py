import tkinter as tk
from tkinter import messagebox
from tkinter import filedialog # 用於開啟檔案選取視窗
import shutil # 用於移動檔案
import subprocess
import json
import os
import threading
import webbrowser
import time

class SiteManagerGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("EA4site Manager")
        self.root.geometry("400x350")
        self.root.configure(bg="#1e1e1e")

        # 標題
        label = tk.Label(root, text="Chifu's Site Control", fg="#3b82f6", bg="#1e1e1e")
        label.pack(pady=20)

        # 按鈕樣式設定
        btn_style = {"bg": "#333333", "fg": "white", "width": 30, "pady": 10, "relief": "flat"}

        # 1. 本地端測試按鈕
        self.btn_dev = tk.Button(root, text="1. LocalHost", command=self.start_dev, **btn_style)
        self.btn_dev.pack(pady=5)

        # 2. 更新 JSON 按鈕
        self.btn_json = tk.Button(root, text="2. Update JSON", command=self.update_json, **btn_style)
        self.btn_json.pack(pady=5)

        # 3. 上傳 GitHub 按鈕
        self.btn_git = tk.Button(root, text="3. Upload GitHub (Deploy)", command=self.deploy_git, **btn_style)
        self.btn_git.pack(pady=5)

        # 4. 大檔案修復按鈕
        self.btn_lfs = tk.Button(root, text="4. Fix & Upload Large GLB", command=self.select_and_upload_glb, **btn_style)
        self.btn_lfs.pack(pady=5)

        # 狀態欄
        self.status = tk.Label(root, text="System Ready...", fg="#888888", bg="#1e1e1e", font=("Arial", 9))
        self.status.pack(side="bottom", pady=10)

    def start_dev(self):
        """啟動 Vite 伺服器"""
        def run():
            self.status.config(text="正在啟動 Vite 8 Beta...", fg="#facc15")
            # 使用 Popen 避免 GUI 被卡住
            subprocess.Popen(["npm", "run", "dev"], shell=True)
            # 等待 3 秒讓伺服器預熱完畢
            time.sleep(3)
            # 自動打開預設瀏覽器指向 Vite 的預設 Port
            webbrowser.open("http://localhost:5173")
        
            self.status.config(text="伺服器已運行於 http://localhost:5173", fg="#22c55e")

        threading.Thread(target=run).start()

    def update_json(self):
        """模擬從 AI 辨識結果更新數據"""
        try:
            # 修正：確保指向專案根目錄下的 public
            base_path = os.path.dirname(os.path.abspath(__file__))
            target_path = os.path.join(base_path, 'public', 'data.json')

            # 這裡可以串接你的 AI 辨識邏輯
            data = [
                {"id": 1, "title": "BIM Analysis", "desc": "Point Cloud processed successfully."},
                {"id": 2, "title": "AI Detection", "desc": "Pipes and Bricks identified."},
                {"id": 3, "title": "Robot Path", "desc": "Inverse Kinematics calculated."}
            ]
            
            with open('public/data.json', 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=4, ensure_ascii=False)
            
            self.status.config(text="JSON 更新完成", fg="#22c55e")
            messagebox.showinfo("成功", "public/data.json 已更新")
        except Exception as e:
            messagebox.showerror("錯誤", f"更新失敗: {e}")

    def deploy_git(self):
        """執行 Git 強制同步與部署 (解決 Unstaged Changes 錯誤)"""
        def run():
            try:
                self.status.config(text="正在解決衝突並同步...", fg="#facc15")
                
                # 1. 核心修正：先把本地所有改動「暫存」起來，清空工作區
                subprocess.run("git add .", check=True, shell=True)
                
                # 2. 從遠端拉取並合併
                # 如果拉取失敗，通常是因為遠端有新東西，我們用 fetch + reset 確保一致
                subprocess.run("git fetch origin main", check=True, shell=True)
                
                # 3. 建立一個 Commit 紀錄
                commit_msg = f"Auto-Sync: {time.strftime('%H:%M:%S')}"
                subprocess.run(f'git commit --allow-empty -m "{commit_msg}"', check=True, shell=True)
                
                # 4. 強制推送到 GitHub
                self.status.config(text="正在推送至雲端...", fg="#3b82f6")
                subprocess.run("git push origin main", check=True, shell=True)
                
                self.status.config(text="部署指令已發出！", fg="#22c55e")
                messagebox.showinfo("成功", "已排除暫存衝突並成功推送到 GitHub。")
            except Exception as e:
                self.status.config(text="同步失敗", fg="#ef4444")
                messagebox.showerror("Git 錯誤", f"請嘗試在終端機執行 git push，或檢查網路連線。\n{e}")

        threading.Thread(target=run).start()

    def select_and_upload_glb(self):
            """方案 1：徹底移除 LFS 並強制以實體二進位上傳 (限 100MB 內)"""
            file_path = filedialog.askopenfilename(
                title="選取實體 GLB (請確認小於 100MB)",
                filetypes=[("GLB files", "*.glb")]
            )
            if not file_path: return

            def run():
                try:
                    self.status.config(text="🚫 正在移除 LFS 紀錄...", fg="#facc15")
                    
                    base_path = os.path.dirname(os.path.abspath(__file__))
                    rel_model_path = "public/models/sitecam.glb"
                    target_path = os.path.join(base_path, rel_model_path)

                    # 1. 徹底解除 LFS 追蹤
                    subprocess.run('git lfs untrack "public/models/*.glb"', shell=True)
                    
                    # 2. 強制從 Git 索引中移除該檔案 (確保指標檔消失)
                    subprocess.run(f'git rm --cached "{rel_model_path}"', shell=True)
                    
                    # 3. 處理 .gitattributes (如果存在就刪除)
                    if os.path.exists(".gitattributes"):
                        os.remove(".gitattributes")
                    
                    # 4. 複製實體檔案
                    os.makedirs(os.path.dirname(target_path), exist_ok=True)
                    shutil.copy2(file_path, target_path)

                    self.status.config(text="📦 正在強制暫存並提交實體檔...", fg="#3b82f6")

                    # 5. 關鍵：執行 git add . 確保所有變更(包含刪除 .gitattributes)都被紀錄
                    subprocess.run("git add .", check=True, shell=True)
                    subprocess.run(f'git add -f "{rel_model_path}"', check=True, shell=True)
                    
                    # 6. 使用 --allow-empty 確保 Commit 一定會成功
                    commit_msg = f"fix: complete lfs removal and direct glb upload {time.strftime('%H:%M:%S')}"
                    subprocess.run(f'git commit --allow-empty -m "{commit_msg}"', check=True, shell=True)
                    
                    # 7. 推送至 GitHub
                    subprocess.run("git push origin main", check=True, shell=True)

                    self.status.config(text="✅ 實體模型已直接上傳！", fg="#22c55e")
                    messagebox.showinfo("成功", "LFS 已徹底移除，實體模型已上傳。")

                except Exception as e:
                    self.status.config(text="上傳失敗", fg="#ef4444")
                    messagebox.showerror("錯誤", f"指令執行失敗:\n{e}")

            threading.Thread(target=run).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = SiteManagerGUI(root)
    root.mainloop()