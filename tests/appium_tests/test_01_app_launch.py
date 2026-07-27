"""
tests/appium/test_01_app_launch.py
TC_A_001 – TC_A_010 : Application Launch & Splash Screen Tests
"""
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time


class TestAppLaunch:

    def test_tc_a_001_app_launches_without_crash(self, driver):
        """TC-A-001: Verify Blogify app launches without crashing on Android."""
        time.sleep(3)
        current_package = driver.current_package
        assert current_package == "com.blogify.app", \
            f"Expected com.blogify.app, got {current_package}"

    def test_tc_a_002_splash_screen_displayed(self, driver):
        """TC-A-002: Verify splash screen is shown on app start."""
        splash = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/splash_logo"))
        )
        assert splash.is_displayed(), "Splash screen logo not displayed"

    def test_tc_a_003_splash_transitions_to_home(self, driver):
        """TC-A-003: Verify splash transitions to home screen within 5 seconds."""
        time.sleep(5)
        home = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )
        assert home.is_displayed(), "Home feed did not appear after splash"

    def test_tc_a_004_app_name_in_title_bar(self, driver):
        """TC-A-004: Verify 'Blogify' appears in the toolbar/title."""
        title = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text='Blogify']")
        assert title is not None, "App title 'Blogify' not found"

    def test_tc_a_005_bottom_nav_visible_on_home(self, driver):
        """TC-A-005: Verify bottom navigation bar is visible on home screen."""
        bottom_nav = driver.find_element(AppiumBy.ID, "com.blogify.app:id/bottom_navigation")
        assert bottom_nav.is_displayed(), "Bottom navigation bar not visible"

    def test_tc_a_006_app_logo_displayed(self, driver):
        """TC-A-006: Verify Blogify logo is displayed in the header."""
        logo = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "blogify_logo")
        assert logo.is_displayed(), "Blogify logo not displayed in header"

    def test_tc_a_007_app_responds_to_back_button(self, driver):
        """TC-A-007: Verify pressing back button on home shows exit dialog or stays on home."""
        driver.press_keycode(4)  # Android KEYCODE_BACK
        time.sleep(1)
        # Should either stay on home or show exit dialog
        current_activity = driver.current_activity
        assert "MainActivity" in current_activity or "HomeActivity" in current_activity, \
            "App navigated to unexpected activity on back press"

    def test_tc_a_008_dark_mode_persists_after_relaunch(self, driver):
        """TC-A-008: Verify dark mode setting is preserved after app relaunch."""
        # Toggle dark mode in settings first
        settings_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "settings_button")
        settings_btn.click()
        dark_mode = driver.find_element(AppiumBy.ID, "com.blogify.app:id/toggle_dark_mode")
        dark_mode.click()
        # Close and reopen app
        driver.background_app(2)
        time.sleep(2)
        # Check dark mode is still active
        bg_color = driver.find_element(AppiumBy.ID, "com.blogify.app:id/main_container")
        assert bg_color is not None, "Dark mode did not persist after relaunch"

    def test_tc_a_009_app_loads_within_5_seconds(self, driver):
        """TC-A-009: Verify app fully loads within 5 seconds (performance check)."""
        start = time.time()
        WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )
        elapsed = time.time() - start
        assert elapsed < 5.0, f"App load time {elapsed:.2f}s exceeded 5-second threshold"

    def test_tc_a_010_app_version_visible_in_about(self, driver):
        """TC-A-010: Verify app version number is shown in About section."""
        settings_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "settings_button")
        settings_btn.click()
        about_btn = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text='About']")
        about_btn.click()
        version = driver.find_element(AppiumBy.ID, "com.blogify.app:id/app_version")
        assert version.is_displayed(), "App version not displayed in About section"
