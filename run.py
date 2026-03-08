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
        self.btn_json = tk.Button(root, text="2. Update JSON", command=self.open_update_window, **btn_style)
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

    def open_update_window(self):
            """彈出子視窗選擇要更新的資料類型"""
            sub_win = tk.Toplevel(self.root)
            sub_win.title("Select Data Type to Import")
            sub_win.geometry("300x350")
            sub_win.configure(bg="#2d2d2d")

            tk.Label(sub_win, text="Import from CSV", fg="#60a5fa", bg="#2d2d2d", font=("Arial", 10, "bold")).pack(pady=15)
            
            types = [
                ("Import Events", "events"),
                ("Import Advisors", "advisors"),
                ("Import Projects/Approaches", "approaches"),
                ("Import Gallery", "gallery")
            ]

            for text, data_type in types:
                btn = tk.Button(sub_win, text=text, width=25, bg="#444444", fg="white", 
                                command=lambda t=data_type: self.process_csv_import(t))
                btn.pack(pady=8)

    def process_csv_import(self, data_type):
            import glob, re, csv, shutil, os, json, threading
            from PIL import Image
            from pypinyin import pinyin, Style # 務必安裝：pip install pypinyin
            
            source_dir = filedialog.askdirectory(title="選取包含 CSV 與圖片的來源資料夾")
            if not source_dir: return

            csv_list = [f for f in glob.glob(os.path.join(source_dir, "*")) if f.lower().endswith('.csv')]
            if not csv_list:
                messagebox.showerror("錯誤", "找不到 CSV 檔案"); return
            
            file_path = csv_list[0]
            file_name = os.path.basename(file_path)

            log_win = tk.Toplevel(self.root)
            log_win.title(f"強制拼音標準化模式: {file_name}")
            log_win.geometry("600x450")
            log_text = tk.Text(log_win, bg="#1a1a1a", fg="#00ff66", font=("Consolas", 10))
            log_text.pack(expand=True, fill="both")

            def log(msg):
                log_text.insert(tk.END, f"{msg}\n"); log_text.see(tk.END); self.root.update_idletasks()

            def force_translate_name(tw_name):
                """強制轉換為 Hsiao Chi-Fu 格式"""
                # 去除姓名中的空白
                tw_name = tw_name.replace(" ", "")
                parts = pinyin(tw_name, style=Style.NORMAL)
                if len(parts) < 2: return tw_name
                
                # 姓氏 (第一字) 大寫
                surname = parts[0][0].capitalize()
                # 名字 (其餘字) 以連字號結合並大寫
                given_name_parts = [p[0].capitalize() for p in parts[1:]]
                given_name = "-".join(given_name_parts)
                
                return f"{surname} {given_name}"

            def resize_and_crop(src_path, dst_path, target_size=(750, 1334)):
                """精準縮放裁切：處理索引色透明度警告"""
                try:
                    with Image.open(src_path) as img:
                        # 修正警告：若為索引色(P)且有透明資訊，先轉為 RGBA
                        if img.mode == 'P' and 'transparency' in img.info:
                            img = img.convert('RGBA')
                        
                        # 統一轉為 RGB 模式進行後續縮放裁切 (去除透明層以符合 750x1334 PNG 標準)
                        img = img.convert('RGB')
                        
                        target_ratio = target_size[0] / target_size[1]
                        img_ratio = img.width / img.height

                        if img_ratio > target_ratio:
                            # 太寬：縮放高度，裁切兩側
                            new_h = target_size[1]
                            new_w = int(new_h * img_ratio)
                            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                            left = (new_w - target_size[0]) / 2
                            img = img.crop((left, 0, left + target_size[0], target_size[1]))
                        else:
                            # 太高：縮放寬度，裁切上下
                            new_w = target_size[0]
                            new_h = int(new_w / img_ratio)
                            img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
                            top = (new_h - target_size[1]) / 2
                            img = img.crop((0, top, target_size[0], top + target_size[1]))
                        
                        # 儲存為 PNG
                        img.save(dst_path, 'PNG', quality=95)
                        return True
                except Exception as e:
                    log(f"❌ 影像處理失敗 ({os.path.basename(src_path)}): {e}")
                    return False

            def run():
                try:
                    log(f"🚀 啟動強制拼音轉換 (規則: Hsiao Chi-Fu)...")
                    match = re.search(r'(\d{3})(\d)', file_name)
                    if match:
                        roc_year, sem_suffix = int(match.group(1)), int(match.group(2))
                        date_year = roc_year + 1911
                        semester = 2 if sem_suffix == 1 else 1
                        if sem_suffix == 2: date_year += 1
                    else: date_year, semester = 2025, 2

                    json_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'data.json')
                    target_img_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'public', 'assets', 'img', 'approaches')
                    os.makedirs(target_img_dir, exist_ok=True)

                    with open(json_path, 'r', encoding='utf-8') as f:
                        full_data = json.load(f)

                    advisors_list = full_data.get('data', {}).get('advisors', [])
                    advisor_map = {adv.get('name_tw'): (adv.get('name'), adv.get('name_tw')) for adv in advisors_list}

                    temp_batch_data, image_process_queue = [], []

                    with open(file_path, 'r', encoding='utf-8-sig') as f:
                        reader = csv.DictReader(f)
                        all_source_files = os.listdir(source_dir)
                        
                        for i, row in enumerate(reader):
                            name_tw = row.get('您的姓名(中文)', '').strip()
                            # 核心變更：不再理會 CSV 裡的英文名，全部強制生成
                            name_en = force_translate_name(name_tw)
                            
                            cover_info = row.get('本作品的封面 (直式、解析度： 750 x 1334、檔案格式為png)', '')
                            cover_id = re.search(r'id=([\w-]+)', cover_info)
                            cover_id = cover_id.group(1) if cover_id else cover_info

                            # 圖片命名：使用強制生成的標準英文名
                            safe_en = name_en.replace(' ', '_').replace('-', '_')
                            new_img_name = f"{date_year}_{semester}_{safe_en}.png"
                            
                            found_file = None
                            for f_name in all_source_files:
                                if not f_name.lower().endswith(('.png', '.jpg', '.jpeg')): continue
                                if cover_id in f_name or name_tw in f_name:
                                    found_file = f_name; break
                            
                            if found_file:
                                image_process_queue.append((os.path.join(source_dir, found_file), os.path.join(target_img_dir, new_img_name)))
                                log(f"✅ [{i+1}] {name_tw} -> {name_en} (匹配成功)")
                            else:
                                log(f"⚠️ [{i+1}] {name_tw} 找不到對應圖片")

                            raw_adv = row.get('您的指導老師', '').replace(' 老師', '').strip()
                            adv_en, adv_tw = advisor_map.get(raw_adv, (raw_adv, raw_adv))
                            
                            item = {
                                "date_year": date_year, "semester": semester,
                                "name": name_en, "name_tw": name_tw,
                                "advisor": adv_en, "advisor_tw": adv_tw,
                                "title": row.get('本學期的題目(英文)', '').strip(),
                                "title_tw": row.get('本學期的題目(中文)', '').strip(),
                                "descript": row.get('本學期作品的設計說明(英文)，30-50字 ', '').strip(),
                                "descript_tw": row.get('本學期作品的設計說明(中文)，30-50字', '').strip(),
                                "tags": ["architecture"],
                                "img_path": f"assets/img/approaches/{new_img_name}"
                            }
                            temp_batch_data.append(item)

                    log("\n--- 執行影像裁切與 750x1334 儲存 ---")
                    for src, dst in image_process_queue: resize_and_crop(src, dst)

                    existing = full_data['data'].get('approaches', [])
                    for new_item in temp_batch_data:
                        dup_idx = next((idx for idx, x in enumerate(existing) if x['name_tw'] == new_item['name_tw'] and x['title_tw'] == new_item['title_tw']), -1)
                        if dup_idx >= 0: existing[dup_idx] = new_item
                        else: existing.append(new_item)
                    full_data['data']['approaches'] = existing

                    with open(json_path, 'w', encoding='utf-8') as f:
                        json.dump(full_data, f, indent=4, ensure_ascii=False)

                    log("\n✨ 處理完畢！"); messagebox.showinfo("成功", f"強制拼音化處理完成！\n總共同步 {len(temp_batch_data)} 筆資料。")
                except Exception as e: log(f"❌ 錯誤: {e}")

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
            """方案 1：徹底移除 LFS 並『強制』覆蓋雲端 (解決 rejected 錯誤)"""
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

                    # 1. 移除 LFS 追蹤
                    subprocess.run('git lfs untrack "public/models/*.glb"', shell=True)
                    
                    # 2. 強制移除指標紀錄並處理屬性檔
                    subprocess.run(f'git rm --cached "{rel_model_path}"', shell=True)
                    if os.path.exists(".gitattributes"):
                        os.remove(".gitattributes")
                    
                    # 3. 複製實體檔案
                    os.makedirs(os.path.dirname(target_path), exist_ok=True)
                    shutil.copy2(file_path, target_path)

                    self.status.config(text="🚀 正在強制覆蓋雲端數據...", fg="#3b82f6")

                    # 4. 加入所有變更
                    subprocess.run("git add .", check=True, shell=True)
                    subprocess.run(f'git add -f "{target_path}"', check=True, shell=True)
                    
                    # 5. 提交
                    commit_msg = f"fix: force upload binary glb {time.strftime('%H:%M:%S')}"
                    subprocess.run(f'git commit --allow-empty -m "{commit_msg}"', check=True, shell=True)
                    
                    # 6. 核心修正：使用 --force 強制推送到 GitHub
                    # 這會直接蓋掉雲端那些錯誤的 LFS 指標紀錄
                    subprocess.run("git push origin main --force", check=True, shell=True)

                    self.status.config(text="✅ 實體模型已強制上傳成功！", fg="#22c55e")
                    messagebox.showinfo("成功", "已強制覆蓋雲端紀錄，實體模型已上傳。")

                except Exception as e:
                    self.status.config(text="上傳失敗", fg="#ef4444")
                    messagebox.showerror("錯誤", f"指令執行失敗:\n{e}")

            threading.Thread(target=run).start()

if __name__ == "__main__":
    root = tk.Tk()
    app = SiteManagerGUI(root)
    root.mainloop()