using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Runtime.InteropServices;

using Windows;

namespace xglass
{
    public static class SetTransParency
    {
        public static bool SetTransparency(int pid, byte alpha)
        {
            string processName;
            try
            {
                processName = Process.GetProcessById(pid).ProcessName;
            }
            catch
            {
                return false;
            }

            HashSet<int> targetPids = new HashSet<int>();
            foreach (Process proc in Process.GetProcessesByName(processName))
            {
                targetPids.Add(proc.Id);
            }
            if (targetPids.Count == 0)
            {
                return false;
            }

            bool result = User32.EnumWindows(delegate(IntPtr hWnd, IntPtr lParam)
            {
                int windowPid;
                User32.GetWindowThreadProcessId(hWnd, out windowPid);
                if (!targetPids.Contains(windowPid) || !User32.IsWindowVisible(hWnd))
                {
                    return true;
                }

                WS windowLong = User32.GetWindowLong(hWnd, GWL.EXSTYLE);
                User32.SetWindowLong(hWnd, GWL.EXSTYLE, windowLong | WS.EX_LAYERED);
                return User32.SetLayeredWindowAttributes(hWnd, 0, alpha, LWA.ALPHA);
            }, IntPtr.Zero);

            return result;
        }
    }
}

namespace Windows
{
    internal static class User32
    {
        public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

        [DllImport("user32.dll")]
        public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);

        [DllImport("user32.dll")]
        public static extern bool IsWindowVisible(IntPtr hWnd);

        [DllImport("user32.dll")]
        public static extern WS GetWindowLong(IntPtr hWnd, GWL nIndex);

        [DllImport("user32.dll")]
        public static extern int SetWindowLong(IntPtr hWnd, GWL nIndex, WS dwNewLong);

        [DllImport("user32.dll")]
        public static extern bool SetLayeredWindowAttributes(IntPtr hWnd, uint crKey, byte bAlpha, LWA dwFlags);
    }

    internal enum GWL : int
    {
        EXSTYLE = -20,
    }

    [Flags]
    internal enum WS : int
    {
        EX_LAYERED = 0x80000,
    }

    internal enum LWA : int
    {
        COLORKEY = 1,
        ALPHA = 2,
    }
}
