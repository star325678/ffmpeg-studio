using System;
using System.ComponentModel;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.IO.Compression;
using System.Net.Sockets;
using System.Reflection;
using System.Text.RegularExpressions;
using System.Threading;
using System.Windows.Forms;

[assembly: AssemblyTitle("FFmpeg Studio Portable")]
[assembly: AssemblyDescription("Single-file portable launcher for FFmpeg Studio")]
[assembly: AssemblyProduct("FFmpeg Studio")]
[assembly: AssemblyCompany("FFmpeg Studio contributors")]
[assembly: AssemblyCopyright("MIT licensed. FFmpeg is GPLv3; Node.js is MIT.")]
[assembly: AssemblyVersion("1.0.1.0")]
[assembly: AssemblyFileVersion("1.0.1.0")]
[assembly: AssemblyInformationalVersion("1.0.1")]

namespace FFmpegStudio.Portable
{
    internal static class Program
    {
        internal const string AppName = "FFmpeg Studio";
        internal const string AppVersion = "1.0.1";
        internal const string PayloadResource = "FFmpegStudio.Payload.zip";
        internal const string IconResource = "FFmpegStudio.App.ico";

        private const string MutexName = "Local\\FFmpegStudioPortable_1_0_1";

        [STAThread]
        private static void Main()
        {
            bool createdNew;
            using (Mutex mutex = new Mutex(true, MutexName, out createdNew))
            {
                if (!createdNew)
                {
                    OpenExistingInstance();
                    return;
                }

                Application.EnableVisualStyles();
                Application.SetCompatibleTextRenderingDefault(false);

                try
                {
                    if (!Extractor.IsReady())
                    {
                        using (SplashForm splash = new SplashForm())
                        {
                            if (splash.ShowDialog() != DialogResult.OK)
                            {
                                return;
                            }
                        }
                    }

                    using (TrayContext context = new TrayContext())
                    {
                        Application.Run(context);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show(
                        "启动失败：\r\n" + ex.Message,
                        AppName,
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error);
                }
            }
        }

        internal static string BaseDir
        {
            get
            {
                return Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
                    "FFmpegStudio");
            }
        }

        internal static string AppDir
        {
            get { return Path.Combine(BaseDir, "app-" + AppVersion); }
        }

        internal static string DataDir
        {
            get { return Path.Combine(BaseDir, "data"); }
        }

        internal static Icon LoadIcon()
        {
            try
            {
                using (Stream stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(IconResource))
                {
                    if (stream != null)
                    {
                        return new Icon(stream);
                    }
                }
            }
            catch
            {
            }
            return SystemIcons.Application;
        }

        internal static int ReadPort()
        {
            try
            {
                string state = Path.Combine(DataDir, "server.json");
                if (!File.Exists(state))
                {
                    return 4318;
                }

                string text = File.ReadAllText(state);
                Match match = Regex.Match(text, "\"port\"\\s*:\\s*(\\d+)");
                if (match.Success)
                {
                    int port;
                    if (int.TryParse(match.Groups[1].Value, out port) && port > 0 && port < 65536)
                    {
                        return port;
                    }
                }
            }
            catch
            {
            }
            return 4318;
        }

        internal static void OpenWorkspace()
        {
            int port = ReadPort();
            string url = "http://127.0.0.1:" + port.ToString();
            try
            {
                Process.Start(new ProcessStartInfo(url) { UseShellExecute = true });
            }
            catch
            {
                try
                {
                    Process.Start("cmd.exe", "/c start \"\" \"" + url + "\"");
                }
                catch
                {
                }
            }
        }

        internal static void OpenFolder(string path)
        {
            try
            {
                Directory.CreateDirectory(path);
                Process.Start("explorer.exe", "\"" + path + "\"");
            }
            catch
            {
            }
        }

        private static void OpenExistingInstance()
        {
            string state = Path.Combine(DataDir, "server.json");
            if (File.Exists(state))
            {
                try
                {
                    using (TcpClient client = new TcpClient())
                    {
                        client.Connect("127.0.0.1", ReadPort());
                        OpenWorkspace();
                        return;
                    }
                }
                catch
                {
                }
            }

            MessageBox.Show(
                "FFmpeg Studio 已经在运行，但本地服务尚未就绪。请稍等片刻，再从托盘图标打开。",
                AppName,
                MessageBoxButtons.OK,
                MessageBoxIcon.Information);
        }
    }

    internal static class Extractor
    {
        internal static bool IsReady()
        {
            try
            {
                string marker = Path.Combine(Program.AppDir, "VERSION.txt");
                return File.Exists(marker)
                    && File.ReadAllText(marker).IndexOf(Program.AppVersion, StringComparison.OrdinalIgnoreCase) >= 0;
            }
            catch
            {
                return false;
            }
        }

        internal static void Extract(Action<int, string> report)
        {
            string appDir = Program.AppDir;
            string fullAppRoot = Path.GetFullPath(appDir).TrimEnd(Path.DirectorySeparatorChar);
            string fullApp = fullAppRoot + Path.DirectorySeparatorChar;
            string tempZip = Path.Combine(
                Path.GetTempPath(),
                "FFmpegStudio-payload-" + Program.AppVersion + ".zip");

            try
            {
                if (Directory.Exists(appDir))
                {
                    Directory.Delete(appDir, true);
                }
                Directory.CreateDirectory(appDir);

                using (Stream input = Assembly.GetExecutingAssembly().GetManifestResourceStream(Program.PayloadResource))
                {
                    if (input == null)
                    {
                        throw new InvalidOperationException("内置 payload 缺失。");
                    }
                    using (FileStream output = File.Create(tempZip))
                    {
                        input.CopyTo(output);
                    }
                }

                using (ZipArchive archive = ZipFile.OpenRead(tempZip))
                {
                    long total = 0;
                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        total += entry.Length;
                    }

                    long done = 0;
                    int lastPercent = -1;
                    foreach (ZipArchiveEntry entry in archive.Entries)
                    {
                        string relative = entry.FullName.Replace('/', Path.DirectorySeparatorChar);
                        string destination = Path.GetFullPath(Path.Combine(appDir, relative));
                        if (!destination.Equals(fullAppRoot, StringComparison.OrdinalIgnoreCase)
                            && !destination.StartsWith(fullApp, StringComparison.OrdinalIgnoreCase))
                        {
                            throw new InvalidDataException("payload 路径非法：" + entry.FullName);
                        }

                        if (string.IsNullOrEmpty(entry.Name))
                        {
                            Directory.CreateDirectory(destination);
                        }
                        else
                        {
                            Directory.CreateDirectory(Path.GetDirectoryName(destination));
                            entry.ExtractToFile(destination, true);
                            done += entry.Length;
                        }

                        int percent = total > 0
                            ? (int)Math.Min(99L, done * 100L / total)
                            : 0;
                        if (percent != lastPercent)
                        {
                            lastPercent = percent;
                            if (report != null)
                            {
                                report(percent, "正在解压内置组件…");
                            }
                        }
                    }
                }

                if (report != null)
                {
                    report(100, "准备完成");
                }
            }
            catch
            {
                try
                {
                    if (Directory.Exists(appDir))
                    {
                        Directory.Delete(appDir, true);
                    }
                }
                catch
                {
                }
                throw;
            }
            finally
            {
                try
                {
                    if (File.Exists(tempZip))
                    {
                        File.Delete(tempZip);
                    }
                }
                catch
                {
                }
            }
        }
    }

    internal sealed class SplashForm : Form
    {
        private readonly Label statusLabel;
        private readonly ProgressBar progressBar;
        private readonly BackgroundWorker worker;
        private bool finished;

        internal SplashForm()
        {
            Text = Program.AppName;
            FormBorderStyle = FormBorderStyle.None;
            StartPosition = FormStartPosition.CenterScreen;
            ClientSize = new Size(520, 210);
            BackColor = Color.FromArgb(11, 14, 18);
            TopMost = true;
            ShowInTaskbar = false;
            DoubleBuffered = true;
            Icon = Program.LoadIcon();

            Label title = new Label();
            title.Text = Program.AppName;
            title.Font = new Font("Segoe UI", 17F, FontStyle.Bold);
            title.ForeColor = Color.FromArgb(238, 246, 241);
            title.AutoSize = true;
            title.Location = new Point(30, 26);
            Controls.Add(title);

            Label subtitle = new Label();
            subtitle.Text = "Portable " + Program.AppVersion + " · 首次启动准备";
            subtitle.Font = new Font("Segoe UI", 9F);
            subtitle.ForeColor = Color.FromArgb(126, 143, 134);
            subtitle.AutoSize = true;
            subtitle.Location = new Point(32, 62);
            Controls.Add(subtitle);

            statusLabel = new Label();
            statusLabel.Text = "正在解压内置组件…";
            statusLabel.Font = new Font("Microsoft YaHei UI", 9F);
            statusLabel.ForeColor = Color.FromArgb(201, 214, 207);
            statusLabel.AutoSize = true;
            statusLabel.Location = new Point(32, 105);
            Controls.Add(statusLabel);

            progressBar = new ProgressBar();
            progressBar.Location = new Point(32, 133);
            progressBar.Size = new Size(456, 8);
            progressBar.Style = ProgressBarStyle.Continuous;
            progressBar.Minimum = 0;
            progressBar.Maximum = 100;
            Controls.Add(progressBar);

            Label note = new Label();
            note.Text = "只需要一次，之后启动会直接复用。";
            note.Font = new Font("Microsoft YaHei UI", 8F);
            note.ForeColor = Color.FromArgb(95, 108, 101);
            note.AutoSize = true;
            note.Location = new Point(32, 158);
            Controls.Add(note);

            worker = new BackgroundWorker();
            worker.WorkerReportsProgress = true;
            worker.DoWork += WorkerDoWork;
            worker.ProgressChanged += WorkerProgressChanged;
            worker.RunWorkerCompleted += WorkerCompleted;

            Shown += delegate { worker.RunWorkerAsync(); };
            FormClosing += SplashClosing;
            Paint += SplashPaint;
        }

        private void SplashPaint(object sender, PaintEventArgs e)
        {
            using (Pen pen = new Pen(Color.FromArgb(31, 43, 37)))
            {
                e.Graphics.DrawRectangle(pen, 0, 0, Width - 1, Height - 1);
            }
        }

        private void SplashClosing(object sender, FormClosingEventArgs e)
        {
            if (!finished && worker.IsBusy)
            {
                e.Cancel = true;
            }
        }

        private void WorkerDoWork(object sender, DoWorkEventArgs e)
        {
            Extractor.Extract(delegate(int percent, string status)
            {
                worker.ReportProgress(percent, status);
            });
        }

        private void WorkerProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            progressBar.Value = Math.Max(0, Math.Min(100, e.ProgressPercentage));
            string status = e.UserState as string;
            if (!string.IsNullOrEmpty(status))
            {
                statusLabel.Text = status;
            }
        }

        private void WorkerCompleted(object sender, RunWorkerCompletedEventArgs e)
        {
            finished = true;
            if (e.Error != null)
            {
                MessageBox.Show(
                    "解压失败：\r\n" + e.Error.Message,
                    Program.AppName,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error);
                DialogResult = DialogResult.Abort;
            }
            else
            {
                DialogResult = DialogResult.OK;
            }
            Close();
        }
    }

    internal sealed class TrayContext : ApplicationContext
    {
        private readonly NotifyIcon tray;
        private readonly Icon icon;
        private Process server;

        internal TrayContext()
        {
            icon = Program.LoadIcon();

            ContextMenuStrip menu = new ContextMenuStrip();
            ToolStripMenuItem open = new ToolStripMenuItem("打开工作台");
            open.Click += delegate { Program.OpenWorkspace(); };
            menu.Items.Add(open);

            menu.Items.Add(new ToolStripSeparator());

            ToolStripMenuItem output = new ToolStripMenuItem("打开输出目录");
            output.Click += delegate { Program.OpenFolder(Path.Combine(Program.DataDir, "outputs")); };
            menu.Items.Add(output);

            ToolStripMenuItem data = new ToolStripMenuItem("打开数据目录");
            data.Click += delegate { Program.OpenFolder(Program.DataDir); };
            menu.Items.Add(data);

            ToolStripMenuItem app = new ToolStripMenuItem("打开程序目录");
            app.Click += delegate { Program.OpenFolder(Program.AppDir); };
            menu.Items.Add(app);

            menu.Items.Add(new ToolStripSeparator());

            ToolStripMenuItem exit = new ToolStripMenuItem("退出 FFmpeg Studio");
            exit.Click += delegate { ExitApplication(); };
            menu.Items.Add(exit);

            tray = new NotifyIcon();
            tray.Icon = icon;
            tray.Text = Program.AppName + " " + Program.AppVersion;
            tray.ContextMenuStrip = menu;
            tray.Visible = true;
            tray.DoubleClick += delegate { Program.OpenWorkspace(); };

            try
            {
                StartServer();
            }
            catch
            {
                tray.Visible = false;
                tray.Dispose();
                icon.Dispose();
                StopServer();
                throw;
            }
        }

        private void StartServer()
        {
            Directory.CreateDirectory(Program.DataDir);

            string state = Path.Combine(Program.DataDir, "server.json");
            try
            {
                if (File.Exists(state))
                {
                    File.Delete(state);
                }
            }
            catch
            {
            }

            ProcessStartInfo info = new ProcessStartInfo();
            info.FileName = Path.Combine(Program.AppDir, "runtime", "node.exe");
            info.Arguments = "\"app\\server.js\" --open";
            info.WorkingDirectory = Program.AppDir;
            info.UseShellExecute = false;
            info.CreateNoWindow = true;
            info.EnvironmentVariables["FFSTUDIO_DATA"] = Program.DataDir;

            server = Process.Start(info);
            if (server == null)
            {
                throw new InvalidOperationException("无法启动内置 Node.js。");
            }

            DateTime deadline = DateTime.UtcNow.AddSeconds(30);
            while (DateTime.UtcNow < deadline)
            {
                if (server.HasExited)
                {
                    throw new InvalidOperationException("本地服务启动失败，退出码 " + server.ExitCode.ToString() + "。");
                }

                if (File.Exists(state) && PortIsOpen(Program.ReadPort()))
                {
                    return;
                }

                Thread.Sleep(200);
            }

            throw new InvalidOperationException("本地服务启动超时。");
        }

        private static bool PortIsOpen(int port)
        {
            try
            {
                using (TcpClient client = new TcpClient())
                {
                    client.Connect("127.0.0.1", port);
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        private void ExitApplication()
        {
            StopServer();
            tray.Visible = false;
            ExitThread();
        }

        private void StopServer()
        {
            if (server == null)
            {
                return;
            }

            try
            {
                if (!server.HasExited)
                {
                    ProcessStartInfo kill = new ProcessStartInfo(
                        "taskkill.exe",
                        "/PID " + server.Id.ToString() + " /T /F");
                    kill.UseShellExecute = false;
                    kill.CreateNoWindow = true;
                    using (Process process = Process.Start(kill))
                    {
                        if (process != null)
                        {
                            process.WaitForExit(5000);
                        }
                    }
                }
            }
            catch
            {
            }

            try
            {
                server.Dispose();
            }
            catch
            {
            }
            server = null;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                StopServer();
                if (tray != null)
                {
                    tray.Visible = false;
                    tray.Dispose();
                }
                if (icon != null)
                {
                    icon.Dispose();
                }
            }
            base.Dispose(disposing);
        }
    }
}
