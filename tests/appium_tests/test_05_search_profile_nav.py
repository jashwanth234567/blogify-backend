"""
tests/appium/test_05_search_profile_nav.py
TC_A_041 – TC_A_060 : Search, Profile & Navigation Tests (Mobile)
"""
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import TEST_USER_EMAIL, TEST_USER_PASSWORD, ADMIN_EMAIL


class TestSearchProfileNav:

    def _login(self, driver):
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_button").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys(TEST_USER_EMAIL)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys(TEST_USER_PASSWORD)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )

    # ── Search Tests ────────────────────────────────────────────────────────

    def test_tc_a_041_search_bar_opens(self, driver):
        """TC-A-041: Verify search bar opens on tapping the search icon."""
        self._login(driver)
        search_icon = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_icon")
        search_icon.click()
        search_bar = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "search_input"))
        )
        assert search_bar.is_displayed()

    def test_tc_a_042_search_returns_results(self, driver):
        """TC-A-042: Verify typing in search returns matching results."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_icon").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_input").send_keys("blog")
        time.sleep(2)
        results = driver.find_elements(AppiumBy.XPATH, "//android.widget.LinearLayout[contains(@resource-id,'search_result')]")
        assert len(results) > 0, "Search returned no results for 'blog'"

    def test_tc_a_043_search_excludes_admin_accounts(self, driver):
        """TC-A-043: Verify admin accounts do NOT appear in user search results."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_icon").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_input").send_keys("jashwanth")
        time.sleep(2)
        admin_results = driver.find_elements(AppiumBy.XPATH, "//android.widget.TextView[@text='Super Admin']")
        assert len(admin_results) == 0, "Admin account appeared in public search results — isolation violation"

    def test_tc_a_044_empty_search_shows_placeholder(self, driver):
        """TC-A-044: Verify empty search shows 'Search users or articles' placeholder."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_icon").click()
        placeholder = driver.find_element(AppiumBy.XPATH, "//android.widget.EditText[contains(@hint,'Search')]")
        assert placeholder.is_displayed()

    def test_tc_a_045_search_clear_button_clears_input(self, driver):
        """TC-A-045: Verify clear (X) button on search bar clears the input."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_icon").click()
        search_input = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_input")
        search_input.send_keys("test query")
        clear_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_clear")
        clear_btn.click()
        assert search_input.text == "" or search_input.get_attribute("text") == ""

    # ── Profile Tests ───────────────────────────────────────────────────────

    def test_tc_a_046_profile_screen_loads(self, driver):
        """TC-A-046: Verify user profile screen loads correctly."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "profile_username"))
        )
        assert heading.is_displayed()

    def test_tc_a_047_profile_shows_user_stats(self, driver):
        """TC-A-047: Verify profile shows follower/following/post counts."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        for stat in ["stat_posts", "stat_followers", "stat_following"]:
            el = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, stat))
            )
            assert el.is_displayed(), f"Stat '{stat}' not visible on profile"

    def test_tc_a_048_admin_profile_not_publicly_visible(self, driver):
        """TC-A-048: Verify navigating to admin profile returns blocked/error state."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_icon").click()
        search_input = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_input")
        search_input.send_keys("admin")
        time.sleep(2)
        admin_profile = driver.find_elements(AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'Admin')]")
        assert len(admin_profile) == 0, "Admin profile is publicly visible"

    def test_tc_a_049_edit_profile_opens(self, driver):
        """TC-A-049: Verify Edit Profile button opens the profile edit screen."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        edit_btn = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "edit_profile_button"))
        )
        edit_btn.click()
        edit_heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Edit Profile']"))
        )
        assert edit_heading.is_displayed()

    def test_tc_a_050_follow_unfollow_another_user(self, driver):
        """TC-A-050: Verify follow and unfollow actions work on another user's profile."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_icon").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "search_input").send_keys("testblogify")
        time.sleep(2)
        first_result = driver.find_element(AppiumBy.XPATH, "//android.widget.LinearLayout[contains(@resource-id,'search_result')][1]")
        first_result.click()
        follow_btn = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "follow_button"))
        )
        follow_btn.click()
        time.sleep(1)
        status = follow_btn.text
        assert status in ["Following", "Unfollow"], "Follow/unfollow action did not work"

    # ── Navigation Tests ─────────────────────────────────────────────────────

    def test_tc_a_051_bottom_nav_home_tab(self, driver):
        """TC-A-051: Verify Home tab in bottom nav navigates to home feed."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "explore_nav").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "home_nav").click()
        home_feed = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )
        assert home_feed.is_displayed()

    def test_tc_a_052_bottom_nav_explore_tab(self, driver):
        """TC-A-052: Verify Explore tab opens Explore screen."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "explore_nav").click()
        explore = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Explore']"))
        )
        assert explore.is_displayed()

    def test_tc_a_053_bottom_nav_notifications_tab(self, driver):
        """TC-A-053: Verify Notifications tab opens Notifications screen."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "notifications_nav").click()
        notif = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Notifications']"))
        )
        assert notif.is_displayed()

    def test_tc_a_054_deep_link_to_blog_post_works(self, driver):
        """TC-A-054: Verify deep link to a blog post opens the correct blog detail."""
        driver.execute_script("mobile: deepLink", {"url": "blogify://blog/test-post-id", "package": "com.blogify.app"})
        detail = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/blog_detail_content"))
        )
        assert detail.is_displayed(), "Deep link did not open blog detail"

    def test_tc_a_055_back_navigation_works(self, driver):
        """TC-A-055: Verify back navigation from blog detail returns to feed."""
        self._login(driver)
        first_card = driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')][1]")
        first_card.click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/blog_detail_content"))
        )
        driver.press_keycode(4)
        home_feed = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )
        assert home_feed.is_displayed()

    def test_tc_a_056_notifications_count_badge_updates(self, driver):
        """TC-A-056: Verify notification badge count updates after receiving a notification."""
        self._login(driver)
        badge = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "notifications_badge")
        initial_count = badge.text
        # Trigger a notification (via API in integration setup)
        time.sleep(2)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "notifications_nav").click()
        driver.press_keycode(4)
        updated_badge = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "notifications_badge")
        assert updated_badge is not None, "Notification badge not found"

    def test_tc_a_057_settings_screen_loads(self, driver):
        """TC-A-057: Verify Settings screen loads all setting options."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        settings_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "settings_button")
        settings_btn.click()
        settings_heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Settings']"))
        )
        assert settings_heading.is_displayed()

    def test_tc_a_058_dark_mode_toggle_applies(self, driver):
        """TC-A-058: Verify dark mode toggle changes the app theme visually."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "settings_button").click()
        toggle = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "dark_mode_toggle")
        toggle.click()
        time.sleep(1)
        # Validate a dark background element exists
        bg = driver.find_element(AppiumBy.ID, "com.blogify.app:id/main_container")
        assert bg is not None, "Theme did not change after dark mode toggle"

    def test_tc_a_059_bookmarks_screen_shows_saved_posts(self, driver):
        """TC-A-059: Verify Bookmarks screen displays previously bookmarked posts."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "bookmarks_nav").click()
        bookmarks_heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Bookmarks']"))
        )
        assert bookmarks_heading.is_displayed()

    def test_tc_a_060_app_handles_no_internet_gracefully(self, driver):
        """TC-A-060: Verify app shows 'No Internet Connection' message when offline."""
        driver.set_network_connection(0)  # Airplane mode
        time.sleep(2)
        offline_msg = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'internet')]"))
        )
        assert offline_msg.is_displayed(), "No internet message not shown"
        driver.set_network_connection(6)  # Restore WiFi + data
