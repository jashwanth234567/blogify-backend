"""
tests/selenium/conftest.py
Shared Selenium WebDriver fixtures with Selenium Manager.
"""

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
import sys, os
import platform

# Ensure project root is on PYTHONPATH for config import
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from config import BASE_URL, HEADLESS, IMPLICIT_WAIT, PAGE_LOAD_TIMEOUT

# Diagnostic fixture (runs once per session) to print environment info
@pytest.fixture(scope="session", autouse=True)
def diagnostics():
    print("--- Selenium Environment Diagnostics ---")
    print(f"Python: {sys.version.splitlines()[0]}")
    print(f"Python bits: {platform.architecture()[0]}")
    print(f"OS: {platform.system()} {platform.release()} ({platform.machine()})")
    try:
        import selenium
        print(f"Selenium version: {selenium.__version__}")
    except Exception:
        print("Selenium version: unknown")
    print("--- End Diagnostics ---")
    yield

@pytest.fixture(scope="session")
def base_url():
    return BASE_URL

@pytest.fixture(scope="session")
def web_driver():
    """Session‑scoped Chrome WebDriver using Selenium Manager."""
    options = ChromeOptions()
    if HEADLESS:
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("--disable-blink-features=AutomationControlled")
    options.add_experimental_option("excludeSwitches", ["enable-automation"]) 
    # Selenium Manager will automatically download a compatible driver
    driver = webdriver.Chrome(options=options)
    driver.implicitly_wait(IMPLICIT_WAIT)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    driver.maximize_window()
    yield driver
    driver.quit()

@pytest.fixture(scope="function")
def driver(web_driver, base_url):
    """Function‑scoped: navigate to base URL before each test."""
    web_driver.get(base_url)
    yield web_driver
    # Clear local storage & cookies after each test
    web_driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
