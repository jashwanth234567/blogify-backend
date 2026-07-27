"""
tests/appium/test_02_registration.py
TC_A_011 – TC_A_020 : User Registration Flow Tests (Mobile)
"""
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
from faker import Faker

fake = Faker()


class TestRegistration:

    def _navigate_to_register(self, driver):
        """Helper: navigate to the Register screen."""
        login_btn = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "login_button"))
        )
        login_btn.click()
        register_link = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text=\"Don't have an account? Sign Up\"]")
        register_link.click()

    def test_tc_a_011_register_screen_opens(self, driver):
        """TC-A-011: Verify Register screen opens from Login screen."""
        self._navigate_to_register(driver)
        heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Sign Up']"))
        )
        assert heading.is_displayed(), "Register screen heading 'Sign Up' not visible"

    def test_tc_a_012_all_registration_fields_present(self, driver):
        """TC-A-012: Verify all required registration form fields are present."""
        self._navigate_to_register(driver)
        fields = ["full_name_input", "username_input", "email_input", "password_input", "confirm_password_input"]
        for field_id in fields:
            el = driver.find_element(AppiumBy.ACCESSIBILITY_ID, field_id)
            assert el.is_displayed(), f"Field '{field_id}' is not displayed on registration screen"

    def test_tc_a_013_register_empty_form_shows_error(self, driver):
        """TC-A-013: Verify submitting empty form shows validation error."""
        self._navigate_to_register(driver)
        submit_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "register_submit_button")
        submit_btn.click()
        error = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'required')]"))
        )
        assert error.is_displayed(), "Validation error not shown for empty form"

    def test_tc_a_014_register_invalid_email_shows_error(self, driver):
        """TC-A-014: Verify invalid email format shows an error message."""
        self._navigate_to_register(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys("not-an-email")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "register_submit_button").click()
        error = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'valid email')]"))
        )
        assert error.is_displayed(), "No error shown for invalid email"

    def test_tc_a_015_register_weak_password_shows_error(self, driver):
        """TC-A-015: Verify weak password triggers password strength error."""
        self._navigate_to_register(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys("1234")
        strength = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Weak']"))
        )
        assert strength.is_displayed(), "Password strength indicator 'Weak' not shown"

    def test_tc_a_016_register_mismatched_passwords_shows_error(self, driver):
        """TC-A-016: Verify mismatched passwords shows confirmation error."""
        self._navigate_to_register(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys("Test@1234!")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "confirm_password_input").send_keys("Different@1!")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "register_submit_button").click()
        error = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'do not match')]"))
        )
        assert error.is_displayed(), "Mismatch password error not shown"

    def test_tc_a_017_successful_registration_redirects_to_login(self, driver):
        """TC-A-017: Verify successful registration navigates to Login screen."""
        self._navigate_to_register(driver)
        unique = fake.unique.user_name()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "full_name_input").send_keys("Test User")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "username_input").send_keys(unique)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys(f"{unique}@yopmail.com")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys("Test@User123!")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "confirm_password_input").send_keys("Test@User123!")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "register_submit_button").click()
        login_heading = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Login']"))
        )
        assert login_heading.is_displayed(), "Did not navigate to login after successful registration"

    def test_tc_a_018_duplicate_email_register_shows_error(self, driver):
        """TC-A-018: Verify duplicate email registration shows 'already exists' error."""
        self._navigate_to_register(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "full_name_input").send_keys("Duplicate User")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "username_input").send_keys("dupuser99")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys("testuser_blogify@yopmail.com")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys("Test@User123!")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "confirm_password_input").send_keys("Test@User123!")
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "register_submit_button").click()
        error = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'already')]"))
        )
        assert error.is_displayed(), "Duplicate email error not shown"

    def test_tc_a_019_password_visibility_toggle_works(self, driver):
        """TC-A-019: Verify show/hide password toggle on registration form."""
        self._navigate_to_register(driver)
        pwd_input = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input")
        toggle = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_toggle")
        # Initially password is hidden
        assert pwd_input.get_attribute("password") == "true"
        toggle.click()
        assert pwd_input.get_attribute("password") == "false", "Password not revealed after toggle"

    def test_tc_a_020_login_link_on_register_screen(self, driver):
        """TC-A-020: Verify 'Already have an account? Login' link navigates to Login."""
        self._navigate_to_register(driver)
        login_link = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text='Login']")
        login_link.click()
        heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Login']"))
        )
        assert heading.is_displayed(), "Did not navigate to Login from Register screen"
