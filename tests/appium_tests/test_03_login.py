"""
tests/appium/test_03_login.py
TC_A_021 – TC_A_030 : Login & Authentication Tests (Mobile)
"""
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import TEST_USER_EMAIL, TEST_USER_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD


class TestLogin:

    def _navigate_to_login(self, driver):
        login_btn = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "login_button"))
        )
        login_btn.click()

    def test_tc_a_021_login_screen_opens(self, driver):
        """TC-A-021: Verify Login screen opens correctly."""
        self._navigate_to_login(driver)
        heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Login']"))
        )
        assert heading.is_displayed()

    def test_tc_a_022_login_empty_fields_shows_error(self, driver):
        """TC-A-022: Verify empty login submission shows validation error."""
        self._navigate_to_login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        error = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'required')]"))
        )
        assert error.is_displayed()

    def test_tc_a_023_login_invalid_credentials_shows_error(self, driver):
        """TC-A-023: Verify incorrect credentials shows 'Invalid credentials' error."""
        self._navigate_to_login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys("wrong@email.com")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys("wrongpass")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        error = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'Invalid')]"))
        )
        assert error.is_displayed()

    def test_tc_a_024_valid_login_navigates_to_home(self, driver):
        """TC-A-024: Verify valid credentials logs in and navigates to home feed."""
        self._navigate_to_login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys(TEST_USER_EMAIL)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys(TEST_USER_PASSWORD)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        home = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )
        assert home.is_displayed()

    def test_tc_a_025_admin_blocked_from_public_login(self, driver):
        """TC-A-025: Verify admin account cannot login via public login screen."""
        self._navigate_to_login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys(ADMIN_EMAIL)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys(ADMIN_PASSWORD)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        error = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'admin')]"))
        )
        assert error.is_displayed(), "Admin was allowed to login via public app — security violation"

    def test_tc_a_026_remember_me_persists_session(self, driver):
        """TC-A-026: Verify 'Remember Me' keeps user logged in after app restart."""
        self._navigate_to_login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys(TEST_USER_EMAIL)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys(TEST_USER_PASSWORD)
        remember = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "remember_me_checkbox")
        remember.click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )
        driver.background_app(3)
        time.sleep(2)
        home = driver.find_element(AppiumBy.ID, "com.blogify.app:id/home_feed")
        assert home.is_displayed(), "User not persisted after app restart with Remember Me"

    def test_tc_a_027_forgot_password_link_navigates(self, driver):
        """TC-A-027: Verify 'Forgot Password' link opens password reset screen."""
        self._navigate_to_login(driver)
        forgot = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text='Forgot Password?']")
        forgot.click()
        reset_heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'Reset')]"))
        )
        assert reset_heading.is_displayed()

    def test_tc_a_028_logout_clears_session(self, driver):
        """TC-A-028: Verify logout clears user session and redirects to home."""
        self._navigate_to_login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys(TEST_USER_EMAIL)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys(TEST_USER_PASSWORD)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )
        profile_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav")
        profile_btn.click()
        logout_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "logout_button")
        logout_btn.click()
        confirm = driver.find_element(AppiumBy.XPATH, "//android.widget.Button[@text='Logout']")
        confirm.click()
        home = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "login_button"))
        )
        assert home.is_displayed(), "User still appears logged in after logout"

    def test_tc_a_029_suspended_user_cannot_login(self, driver):
        """TC-A-029: Verify suspended user account sees suspension error on login."""
        self._navigate_to_login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys("suspended@test.com")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys("Suspend@1234!")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        error = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'suspended')]"))
        )
        assert error.is_displayed()

    def test_tc_a_030_blocked_user_cannot_login(self, driver):
        """TC-A-030: Verify blocked user account receives blocked error on login."""
        self._navigate_to_login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys("blocked@test.com")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys("Blocked@1234!")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        error = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'blocked')]"))
        )
        assert error.is_displayed()
