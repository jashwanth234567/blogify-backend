# ─────────────────────────────────────────────────────────────────────────────
# tests/config.py — Shared test configuration
# ─────────────────────────────────────────────────────────────────────────────

# ── Web (Selenium) ────────────────────────────────────────────────────────────
BASE_URL = "http://localhost:5173"
ADMIN_URL = f"{BASE_URL}/admin"
API_URL   = "http://localhost:3000"

# ── Test credentials ──────────────────────────────────────────────────────────
ADMIN_EMAIL    = "domakondajashwanth12k@gmail.com"
ADMIN_PASSWORD = "Jashwanth@12"
TEST_USER_EMAIL    = "testuser_blogify@yopmail.com"
TEST_USER_PASSWORD = "Test@User123!"
TEST_USERNAME      = "testblogify"

# ── Appium / Android ─────────────────────────────────────────────────────────
APPIUM_SERVER_URL = "http://127.0.0.1:4723"
ANDROID_CAPS = {
    "platformName":        "Android",
    "platformVersion":     "13",
    "deviceName":          "Blogify_Emulator",
    "appPackage":          "com.blogify.app",
    "appActivity":         "com.blogify.app.MainActivity",
    "automationName":      "UiAutomator2",
    "newCommandTimeout":   300,
    "noReset":             False,
    "autoGrantPermissions": True,
}

# ── Selenium browser ─────────────────────────────────────────────────────────
BROWSER            = "chrome"       # "chrome" | "firefox" | "edge"
HEADLESS           = False
IMPLICIT_WAIT      = 10             # seconds
EXPLICIT_WAIT      = 20             # seconds
PAGE_LOAD_TIMEOUT  = 30             # seconds

# ── Report paths ─────────────────────────────────────────────────────────────
import os
REPORTS_DIR   = os.path.join(os.path.dirname(__file__), "reports")
EXCEL_REPORT  = os.path.join(REPORTS_DIR, "Blogify_E2E_Test_Report.xlsx")
HTML_REPORT   = os.path.join(REPORTS_DIR, "blogify_html_report.html")
