import tkinter as tk
from tkinter import messagebox
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
        def run():
            try:
                self.status.config(text="同步並上傳中...", fg="#3b82f6")
                # 先嘗試 pull，避免遠端有更新
                subprocess.run(["git", "pull", "origin", "main", "--rebase"], shell=True)
                
                subprocess.run(["git", "add", "."], check=True, shell=True)
                subprocess.run(["git", "commit", "-m", "Update site via Python GUI"], check=True, shell=True)
                subprocess.run(["git", "push", "origin", "main"], check=True, shell=True)
                
                self.status.config(text="上傳成功！", fg="#22c55e")
                messagebox.showinfo("成功", "已同步並推送到 GitHub。")
            except Exception as e:
                messagebox.showerror("錯誤", f"操作失敗:\n{e}")

        threading.Thread(target=run).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = SiteManagerGUI(root)
    root.mainloop()