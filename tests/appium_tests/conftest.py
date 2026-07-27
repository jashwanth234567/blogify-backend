"""
tests/appium/conftest.py
Shared Appium fixtures — driver setup and teardown.
"""
import pytest
from appium import webdriver
from appium.options.android import UiAutomator2Options
import sys, os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import APPIUM_SERVER_URL, ANDROID_CAPS


@pytest.fixture(scope="session")
def appium_driver():
    """Session-scoped Appium driver (reuse across all test files)."""
    options = UiAutomator2Options()
    for key, value in ANDROID_CAPS.items():
        options.__setattr__(key, value)

    driver = webdriver.Remote(APPIUM_SERVER_URL, options=options)
    driver.implicitly_wait(10)
    yield driver
    driver.quit()


@pytest.fixture(scope="function")
def driver(appium_driver):
    """Function-scoped: resets app to a clean state before each test."""
    appium_driver.reset()
    yield appium_driver
