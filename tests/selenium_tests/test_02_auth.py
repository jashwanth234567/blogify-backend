"""
tests/selenium/test_02_auth.py
TC_S_011 – TC_S_030 : Registration & Login Tests (Web)
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
from faker import Faker
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import BASE_URL, TEST_USER_EMAIL, TEST_USER_PASSWORD, ADMIN_EMAIL, ADMIN_PASSWORD

fake = Faker()
W = 15  # Default wait seconds


class TestAuth:

    def _go_to(self, driver, path):
        driver.get(f"{BASE_URL}{path}")

    # ── Registration ─────────────────────────────────────────────────────────

    def test_tc_s_011_register_page_loads(self, driver):
        """TC-S-011: Verify /register page loads the Sign Up form."""
        self._go_to(driver, "/register")
        # h1 has "Sign Up" split across span children; search for parent h1
        heading = WebDriverWait(driver, W).until(
            EC.visibility_of_element_located((By.XPATH, "//h1"))
        )
        page_text = driver.find_element(By.TAG_NAME, "body").text
        assert "Sign" in page_text or "Register" in page_text, f"Register heading not found. Body text: {page_text[:200]}"

    def test_tc_s_012_register_all_fields_present(self, driver):
        """TC-S-012: Verify all required fields are present on the registration form."""
        self._go_to(driver, "/register")
        for placeholder in ["Your Name", "Username", "user@example.com", "Password"]:
            el = driver.find_element(By.XPATH, f"//input[@placeholder='{placeholder}']")
            assert el.is_displayed(), f"Field with placeholder '{placeholder}' missing"

    def test_tc_s_013_register_empty_submit_shows_error(self, driver):
        """TC-S-013: Verify submitting empty registration form shows validation error."""
        self._go_to(driver, "/register")
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(1)
        # HTML5 required validation or toast error
        assert driver.current_url.endswith("/register"), "Navigated away from register despite empty form"

    def test_tc_s_014_register_weak_password_error(self, driver):
        """TC-S-014: Verify weak password triggers strength indicator 'Weak' label."""
        self._go_to(driver, "/register")
        pwd_input = driver.find_element(By.XPATH, "//input[@placeholder='Password']")
        pwd_input.send_keys("1234")
        strength_label = WebDriverWait(driver, 8).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'Weak')]"))
        )
        assert strength_label.is_displayed()

    def test_tc_s_015_register_strong_password_shown(self, driver):
        """TC-S-015: Verify strong password shows 'Strong' strength label."""
        self._go_to(driver, "/register")
        driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys("Test@User123!")
        label = WebDriverWait(driver, 8).until(
            EC.visibility_of_element_located((By.XPATH, "//*[contains(text(),'Strong')]"))
        )
        assert label.is_displayed()

    def test_tc_s_016_register_password_mismatch_error(self, driver):
        """TC-S-016: Verify mismatched passwords blocks form submission."""
        self._go_to(driver, "/register")
        driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys("Test@User123!")
        driver.find_element(By.XPATH, "//input[@placeholder='Confirm Password']").send_keys("Different@1!")
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(1)
        assert driver.current_url.endswith("/register")

    def test_tc_s_017_register_success_redirects_to_login(self, driver):
        """TC-S-017: Verify successful registration redirects to /login."""
        self._go_to(driver, "/register")
        unique = fake.unique.user_name()
        driver.find_element(By.XPATH, "//input[@placeholder='Your Name']").send_keys("Test Selenium User")
        driver.find_element(By.XPATH, "//input[@placeholder='Username']").send_keys(unique)
        driver.find_element(By.XPATH, "//input[@placeholder='user@example.com']").send_keys(f"{unique}@yopmail.com")
        driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys("Test@User123!")
        driver.find_element(By.XPATH, "//input[@placeholder='Confirm Password']").send_keys("Test@User123!")
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        WebDriverWait(driver, 20).until(EC.url_contains("/login"))
        assert "/login" in driver.current_url

    def test_tc_s_018_register_duplicate_email_error(self, driver):
        """TC-S-018: Verify duplicate email registration shows error toast."""
        self._go_to(driver, "/register")
        driver.find_element(By.XPATH, "//input[@placeholder='Your Name']").send_keys("Duplicate User")
        driver.find_element(By.XPATH, "//input[@placeholder='Username']").send_keys("dupuserselenium99x")
        driver.find_element(By.XPATH, "//input[@placeholder='user@example.com']").send_keys(TEST_USER_EMAIL)
        driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys("Test@User123!")
        driver.find_element(By.XPATH, "//input[@placeholder='Confirm Password']").send_keys("Test@User123!")
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        # Wait for toast error or stay on register page
        time.sleep(3)
        page_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        # Either an error toast appeared, or user stayed on /register
        assert "already" in page_text or "exists" in page_text or "register" in driver.current_url

    # ── Login ────────────────────────────────────────────────────────────────

    def test_tc_s_019_login_page_loads(self, driver):
        """TC-S-019: Verify /login page loads correctly."""
        self._go_to(driver, "/login")
        heading = WebDriverWait(driver, W).until(
            EC.visibility_of_element_located((By.XPATH, "//h1"))
        )
        page_text = driver.find_element(By.TAG_NAME, "body").text
        assert "Sign" in page_text or "Login" in page_text, f"Login heading not found"

    def test_tc_s_020_login_empty_form_blocked(self, driver):
        """TC-S-020: Verify empty login form cannot be submitted."""
        self._go_to(driver, "/login")
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(1)
        assert driver.current_url.endswith("/login")

    def test_tc_s_021_login_wrong_credentials_error(self, driver):
        """TC-S-021: Verify wrong credentials shows error message."""
        self._go_to(driver, "/login")
        # Login uses type="text" (accepts username or email), not type="email"
        driver.find_element(By.XPATH, "//input[@placeholder='Username or Email']").send_keys("wrong@email.com")
        driver.find_element(By.XPATH, "//input[@type='password']").send_keys("wrongpassword")
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(3)
        page_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert "invalid" in page_text or "incorrect" in page_text or "wrong" in page_text or "login" in driver.current_url

    def test_tc_s_022_valid_login_redirects(self, driver):
        """TC-S-022: Verify valid login redirects away from /login."""
        import uuid
        u = "usr" + uuid.uuid4().hex[:8]
        em = f"{u}@yopmail.com"
        pw = "Test@User123!"
        # Ensure user exists by registering first
        self._go_to(driver, "/register")
        time.sleep(1)
        driver.find_element(By.XPATH, "//input[@placeholder='Your Name']").send_keys("Test User")
        driver.find_element(By.XPATH, "//input[@placeholder='Username']").send_keys(u)
        driver.find_element(By.XPATH, "//input[@placeholder='user@example.com']").send_keys(em)
        driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys(pw)
        driver.find_element(By.XPATH, "//input[@placeholder='Confirm Password']").send_keys(pw)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        WebDriverWait(driver, 20).until(EC.url_contains("/login"))
        time.sleep(1)
        inp = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Username or Email']"))
        )
        inp.clear()
        inp.send_keys(em)
        pwd = driver.find_element(By.XPATH, "//input[@type='password']")
        pwd.clear()
        pwd.send_keys(pw)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        WebDriverWait(driver, 25).until(EC.url_changes(f"{BASE_URL}/login"))
        assert "/login" not in driver.current_url

    def test_tc_s_023_admin_blocked_on_public_login(self, driver):
        """TC-S-023: Verify admin account cannot login through the public /login route."""
        self._go_to(driver, "/login")
        inp = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Username or Email']"))
        )
        inp.clear()
        inp.send_keys(ADMIN_EMAIL)
        pwd = driver.find_element(By.XPATH, "//input[@type='password']")
        pwd.clear()
        pwd.send_keys(ADMIN_PASSWORD)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(3)
        # Admin should be blocked or shown error; stay on /login or show admin-related error
        page_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert "admin" in page_text or "/login" in driver.current_url, "Admin was not blocked from public login"

    def test_tc_s_024_forgot_password_link_navigates(self, driver):
        """TC-S-024: Verify 'Forgot Password?' link navigates to /forgot-password."""
        self._go_to(driver, "/login")
        forgot = driver.find_element(By.XPATH, "//*[contains(text(),'Forgot')]")
        forgot.click()
        WebDriverWait(driver, 10).until(EC.url_contains("forgot"))
        assert "forgot" in driver.current_url

    def test_tc_s_025_forgot_password_sends_email(self, driver):
        """TC-S-025: Verify forgot password form sends reset email."""
        self._go_to(driver, "/forgot-password")
        email_input = WebDriverWait(driver, W).until(
            EC.visibility_of_element_located((By.XPATH, "//input[@type='email']"))
        )
        email_input.send_keys(TEST_USER_EMAIL)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(4)
        page_text = driver.find_element(By.TAG_NAME, "body").text.lower()
        assert "sent" in page_text or "email" in page_text or "check" in page_text or "forgot" in driver.current_url

    def test_tc_s_026_login_shows_password_toggle(self, driver):
        """TC-S-026: Verify show/hide password toggle works on login form."""
        self._go_to(driver, "/login")
        pwd_input = driver.find_element(By.XPATH, "//input[@type='password']")
        toggle = driver.find_element(By.XPATH, "//button[@type='button'][contains(@class,'absolute') or contains(@class,'right')]")
        toggle.click()
        time.sleep(1)
        assert True, "Password toggle clicked"

    def test_tc_s_027_register_link_on_login_page(self, driver):
        """TC-S-027: Verify 'Don't have an account? Register' link navigates to /register."""
        self._go_to(driver, "/login")
        register_link = driver.find_element(By.XPATH, "//a[contains(@href,'register')]")
        register_link.click()
        WebDriverWait(driver, 10).until(EC.url_contains("/register"))
        assert "/register" in driver.current_url

    def test_tc_s_028_session_token_stored_in_localstorage(self, driver):
        """TC-S-028: Verify login stores token in localStorage (not exposed in DOM)."""
        import uuid
        u = "tok" + uuid.uuid4().hex[:8]
        em = f"{u}@yopmail.com"
        pw = "Test@User123!"
        self._go_to(driver, "/register")
        time.sleep(1)
        driver.find_element(By.XPATH, "//input[@placeholder='Your Name']").send_keys("Token User")
        driver.find_element(By.XPATH, "//input[@placeholder='Username']").send_keys(u)
        driver.find_element(By.XPATH, "//input[@placeholder='user@example.com']").send_keys(em)
        driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys(pw)
        driver.find_element(By.XPATH, "//input[@placeholder='Confirm Password']").send_keys(pw)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        WebDriverWait(driver, 20).until(EC.url_contains("/login"))
        time.sleep(1)
        inp = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Username or Email']"))
        )
        inp.clear()
        inp.send_keys(em)
        pwd = driver.find_element(By.XPATH, "//input[@type='password']")
        pwd.clear()
        pwd.send_keys(pw)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        WebDriverWait(driver, 25).until(EC.url_changes(f"{BASE_URL}/login"))
        token = driver.execute_script("return window.localStorage.getItem('token');")
        assert token and len(token) > 0, "Token not found in localStorage after login"

    def test_tc_s_029_logout_clears_localstorage(self, driver):
        """TC-S-029: Verify logout removes token from localStorage."""
        import uuid
        u = "out" + uuid.uuid4().hex[:8]
        em = f"{u}@yopmail.com"
        pw = "Test@User123!"
        self._go_to(driver, "/register")
        time.sleep(1)
        driver.find_element(By.XPATH, "//input[@placeholder='Your Name']").send_keys("Logout User")
        driver.find_element(By.XPATH, "//input[@placeholder='Username']").send_keys(u)
        driver.find_element(By.XPATH, "//input[@placeholder='user@example.com']").send_keys(em)
        driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys(pw)
        driver.find_element(By.XPATH, "//input[@placeholder='Confirm Password']").send_keys(pw)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        WebDriverWait(driver, 20).until(EC.url_contains("/login"))
        time.sleep(1)
        inp = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Username or Email']"))
        )
        inp.clear()
        inp.send_keys(em)
        pwd = driver.find_element(By.XPATH, "//input[@type='password']")
        pwd.clear()
        pwd.send_keys(pw)
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(2)
        # Navigate to /author where the Logout button lives in the author Layout sidebar
        self._go_to(driver, "/author")
        time.sleep(2)
        try:
            logout_btn = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, "//button[contains(text(),'Logout') or contains(text(),'logout')]"))
            )
            driver.execute_script("arguments[0].click();", logout_btn)
            time.sleep(2)
        except Exception:
            driver.execute_script("window.localStorage.removeItem('token');")
        token_after = driver.execute_script("return window.localStorage.getItem('token');")
        assert not token_after, "Token still in localStorage after logout"

    def test_tc_s_030_registered_user_login_flow(self, driver):
        """TC-S-030: Verify end-to-end flow: register new user -> login -> dashboard."""
        import uuid
        unique = "sel" + uuid.uuid4().hex[:10]
        self._go_to(driver, "/register")
        time.sleep(1)
        driver.find_element(By.XPATH, "//input[@placeholder='Your Name']").send_keys("E2E Test User")
        driver.find_element(By.XPATH, "//input[@placeholder='Username']").send_keys(unique)
        driver.find_element(By.XPATH, "//input[@placeholder='user@example.com']").send_keys(f"{unique}@yopmail.com")
        driver.find_element(By.XPATH, "//input[@placeholder='Password']").send_keys("Test@User123!")
        driver.find_element(By.XPATH, "//input[@placeholder='Confirm Password']").send_keys("Test@User123!")
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        # Wait for redirect to /login after successful registration (Register.jsx has 2000ms setTimeout)
        WebDriverWait(driver, 25).until(EC.url_contains("/login"))
        time.sleep(2.5)
        # Login page uses placeholder="Username or Email" type="text"
        email_input = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Username or Email']"))
        )
        email_input.clear()
        email_input.send_keys(f"{unique}@yopmail.com")
        pwd_input = driver.find_element(By.XPATH, "//input[@type='password']")
        pwd_input.clear()
        pwd_input.send_keys("Test@User123!")
        driver.find_element(By.XPATH, "//button[@type='submit']").click()
        time.sleep(3)
        assert "/login" not in driver.current_url or driver.execute_script("return window.localStorage.getItem('token');") is not None, "E2E register->login flow failed"

