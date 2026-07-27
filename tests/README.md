# Blogify E2E Test Suite

A comprehensive end-to-end testing suite for the Blogify full-stack blogging platform, covering **200 test cases** across two technology stacks.

---

## 📁 Directory Structure

```
tests/
├── conftest.py              # Root fixtures — report hooks, directory bootstrap
├── config.py                # Shared configuration (URLs, credentials, caps)
├── pytest.ini               # pytest settings, markers, HTML report config
├── requirements.txt         # Python dependencies
├── run_tests.py             # Master CLI runner (recommended entry point)
├── generate_report.py       # Standalone report generator (Excel + HTML)
│
├── selenium/                # Web E2E Tests (TC_S_001 – TC_S_100)
│   ├── conftest.py          # Chrome WebDriver session fixture
│   ├── test_01_homepage.py          # TC_S_001–010 : Homepage & Public Landing
│   ├── test_02_auth.py              # TC_S_011–030 : Registration & Login
│   ├── test_03_explore_blogs.py     # TC_S_031–050 : Explore, Blog Reading, Search
│   ├── test_04_admin_panel.py       # TC_S_051–080 : Admin Panel (30 tests)
│   └── test_05_profile_security.py  # TC_S_081–100 : Profile, Security, Accessibility
│
├── appium/                  # Mobile E2E Tests (TC_A_001 – TC_A_100)
│   ├── conftest.py          # Appium UiAutomator2 session fixture
│   ├── test_01_app_launch.py        # TC_A_001–010 : App Launch & Splash
│   ├── test_02_registration.py      # TC_A_011–020 : User Registration Flow
│   ├── test_03_login.py             # TC_A_021–030 : Login & Authentication
│   ├── test_04_home_feed.py         # TC_A_031–040 : Home Feed & Blog List
│   ├── test_05_search_profile_nav.py # TC_A_041–060 : Search, Profile, Navigation
│   ├── test_06_blog_reading_comments.py # TC_A_061–080 : Blog Reading & Comments
│   └── test_07_security_performance.py  # TC_A_081–100 : Security & Performance
│
└── reports/                 # Auto-created — output directory
    ├── test_results.json
    ├── Blogify_E2E_Test_Report.xlsx
    └── blogify_html_report.html
```

---

## ⚙️ Prerequisites

### Install Python dependencies
```bash
cd tests
pip install -r requirements.txt
```

### Selenium (Web)
- Google Chrome browser installed
- ChromeDriver is **auto-managed** by `webdriver-manager`
- Blogify frontend running at `http://localhost:5173`
- Blogify backend/API running at `http://localhost:3000`

### Appium (Mobile)
- [Appium Server 2.x](https://appium.io) running on `http://127.0.0.1:4723`
  ```bash
  npx appium
  ```
- Android emulator named **`Blogify_Emulator`** (API 33 / Android 13)
- UiAutomator2 driver installed: `appium driver install uiautomator2`
- Blogify APK installed on the emulator with package `com.blogify.app`

---

## 🚀 Running Tests

### Using the master runner (recommended)

```bash
cd tests

# Run Selenium (Web) tests only — default
python run_tests.py

# Run Appium (Mobile) tests only
python run_tests.py --suite appium

# Run ALL tests (Selenium + Appium)
python run_tests.py --suite all

# Run only smoke tests
python run_tests.py -m smoke

# Run only security tests
python run_tests.py -m "security or performance"

# Run a specific test by keyword
python run_tests.py -k "test_tc_s_001"

# Run with 4 parallel workers
python run_tests.py --suite selenium -n 4

# Regenerate reports from existing results (no re-run)
python run_tests.py --generate-report-only
```

### Using pytest directly

```bash
cd tests

# All Selenium tests
pytest selenium/ -v

# All Appium tests
pytest appium/ -v

# Specific test file
pytest selenium/test_02_auth.py -v

# Specific test case
pytest selenium/test_02_auth.py::TestAuth::test_tc_s_022_valid_login_redirects -v

# With HTML report
pytest selenium/ --html=reports/blogify_html_report.html --self-contained-html
```

---

## 📊 Reports

After each run, three report formats are auto-generated in `reports/`:

| File | Description |
|------|-------------|
| `test_results.json` | Machine-readable JSON with all results |
| `Blogify_E2E_Test_Report.xlsx` | Colour-coded Excel workbook (3 sheets: Dashboard, All Results, Failed Tests) |
| `blogify_html_report.html` | Interactive filterable HTML report |

To regenerate reports from a previous JSON without re-running tests:
```bash
python generate_report.py
```

---

## 🏷️ Pytest Markers

| Marker | Usage |
|--------|-------|
| `selenium` | All Selenium / Web tests |
| `appium` | All Appium / Mobile tests |
| `smoke` | Critical smoke tests |
| `regression` | Full regression cases |
| `security` | Security-focused tests |
| `performance` | Performance benchmarks |
| `admin` | Admin-panel tests |
| `slow` | Tests that take > 10 seconds |

```bash
# Run only security tests across all suites
pytest -m security

# Skip slow tests
pytest -m "not slow"
```

---

## 🧪 Test Coverage Summary

| Range | File | Area Covered |
|-------|------|-------------|
| TC_S_001–010 | `selenium/test_01_homepage.py` | Homepage & Public Landing |
| TC_S_011–030 | `selenium/test_02_auth.py` | Registration & Login |
| TC_S_031–050 | `selenium/test_03_explore_blogs.py` | Explore, Reading, Search |
| TC_S_051–080 | `selenium/test_04_admin_panel.py` | Admin Panel (30 tests) |
| TC_S_081–100 | `selenium/test_05_profile_security.py` | Profile, Security, Accessibility |
| TC_A_001–010 | `appium/test_01_app_launch.py` | App Launch & Splash |
| TC_A_011–020 | `appium/test_02_registration.py` | Mobile Registration |
| TC_A_021–030 | `appium/test_03_login.py` | Mobile Login & Auth |
| TC_A_031–040 | `appium/test_04_home_feed.py` | Home Feed & Blog List |
| TC_A_041–060 | `appium/test_05_search_profile_nav.py` | Search, Profile, Navigation |
| TC_A_061–080 | `appium/test_06_blog_reading_comments.py` | Blog Reading & Comments |
| TC_A_081–100 | `appium/test_07_security_performance.py` | Security & Performance |

**Total: 200 test cases (100 Selenium + 100 Appium)**

---

## 🔧 Configuration

Edit [`config.py`](config.py) to customise:

```python
# Web
BASE_URL  = "http://localhost:5173"   # Frontend URL
API_URL   = "http://localhost:3000"   # Backend API URL

# Credentials
ADMIN_EMAIL    = "..."
TEST_USER_EMAIL = "..."

# Appium / Android
APPIUM_SERVER_URL = "http://127.0.0.1:4723"
ANDROID_CAPS = { "deviceName": "Blogify_Emulator", ... }

# Reporting
HEADLESS = False   # Set True for CI headless Chrome
```
