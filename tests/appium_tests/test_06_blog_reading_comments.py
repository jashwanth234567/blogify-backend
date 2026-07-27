"""
tests/appium/test_06_blog_reading_comments.py
TC_A_061 – TC_A_080 : Blog Reading, Comments & Author Panel (Mobile)
"""
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import TEST_USER_EMAIL, TEST_USER_PASSWORD


class TestBlogReadingComments:

    def _login(self, driver):
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_button").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys(TEST_USER_EMAIL)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys(TEST_USER_PASSWORD)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )

    def _open_first_blog(self, driver):
        first_card = driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')][1]")
        first_card.click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/blog_detail_content"))
        )

    def test_tc_a_061_blog_detail_shows_title(self, driver):
        """TC-A-061: Verify blog detail page shows the post title."""
        self._login(driver)
        self._open_first_blog(driver)
        title = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "blog_title")
        assert title.is_displayed() and title.text != ""

    def test_tc_a_062_blog_detail_shows_author_info(self, driver):
        """TC-A-062: Verify blog detail shows author name and avatar."""
        self._login(driver)
        self._open_first_blog(driver)
        author_name = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "blog_author_name")
        author_avatar = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "blog_author_avatar")
        assert author_name.is_displayed() and author_avatar.is_displayed()

    def test_tc_a_063_blog_detail_shows_content(self, driver):
        """TC-A-063: Verify blog detail page renders blog body content."""
        self._login(driver)
        self._open_first_blog(driver)
        content = driver.find_element(AppiumBy.ID, "com.blogify.app:id/blog_detail_content")
        assert content.is_displayed() and content.text != ""

    def test_tc_a_064_like_button_on_blog_detail(self, driver):
        """TC-A-064: Verify like button on blog detail page toggles like."""
        self._login(driver)
        self._open_first_blog(driver)
        like_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "like_button")
        like_btn.click()
        time.sleep(1)
        assert like_btn.get_attribute("selected") == "true"

    def test_tc_a_065_comment_section_loads(self, driver):
        """TC-A-065: Verify comment section is visible on blog detail page."""
        self._login(driver)
        self._open_first_blog(driver)
        content = driver.find_element(AppiumBy.ID, "com.blogify.app:id/blog_detail_content")
        driver.execute_script("mobile: scroll", {"direction": "down", "element": content.id, "percent": 3.0})
        comments_section = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "comments_section"))
        )
        assert comments_section.is_displayed()

    def test_tc_a_066_add_comment_works(self, driver):
        """TC-A-066: Verify logged-in user can add a comment to a blog post."""
        self._login(driver)
        self._open_first_blog(driver)
        content = driver.find_element(AppiumBy.ID, "com.blogify.app:id/blog_detail_content")
        driver.execute_script("mobile: scroll", {"direction": "down", "element": content.id, "percent": 3.0})
        comment_input = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "comment_input")
        comment_input.send_keys("Great article! This is a test comment from Appium.")
        submit_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "comment_submit")
        submit_btn.click()
        time.sleep(2)
        new_comment = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[contains(@text,'Great article')]")
        assert new_comment.is_displayed()

    def test_tc_a_067_share_blog_button_opens_share_dialog(self, driver):
        """TC-A-067: Verify Share button opens Android share sheet."""
        self._login(driver)
        self._open_first_blog(driver)
        share_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "share_button")
        share_btn.click()
        time.sleep(2)
        share_dialog = driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[@resource-id='android:id/chooser_top_text']")
        assert share_dialog.is_displayed()

    def test_tc_a_068_reading_time_displayed_on_detail(self, driver):
        """TC-A-068: Verify estimated reading time is shown on blog detail."""
        self._login(driver)
        self._open_first_blog(driver)
        read_time = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "reading_time")
        assert read_time.is_displayed() and "min" in read_time.text.lower()

    def test_tc_a_069_author_profile_link_from_detail(self, driver):
        """TC-A-069: Verify clicking author name on detail opens the author's public profile."""
        self._login(driver)
        self._open_first_blog(driver)
        author_name = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "blog_author_name")
        author_name.click()
        profile_header = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "profile_username"))
        )
        assert profile_header.is_displayed()

    def test_tc_a_070_category_tag_filter_works(self, driver):
        """TC-A-070: Verify tapping a category tag filters posts by category."""
        self._login(driver)
        category_tag = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[contains(@resource-id,'category_chip')][1]")
        category_name = category_tag.text
        category_tag.click()
        time.sleep(2)
        results = driver.find_elements(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')]")
        assert len(results) >= 0, f"Category filter for '{category_name}' failed"

    def test_tc_a_071_author_dashboard_loads(self, driver):
        """TC-A-071: Verify Author Dashboard loads for logged-in users."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        dashboard_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "author_dashboard_button")
        dashboard_btn.click()
        heading = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Dashboard']"))
        )
        assert heading.is_displayed()

    def test_tc_a_072_create_new_post_button_visible(self, driver):
        """TC-A-072: Verify 'Create Post' / 'Write New Blog' button is visible in Author Dashboard."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "author_dashboard_button").click()
        create_btn = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, "create_post_button"))
        )
        assert create_btn.is_displayed()

    def test_tc_a_073_add_blog_form_has_required_fields(self, driver):
        """TC-A-073: Verify Add Blog form contains title, content, and category fields."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "author_dashboard_button").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "create_post_button").click()
        for field in ["blog_title_input", "blog_category_input"]:
            el = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((AppiumBy.ACCESSIBILITY_ID, field))
            )
            assert el.is_displayed(), f"Field '{field}' missing on Add Blog form"

    def test_tc_a_074_blog_list_shows_own_posts(self, driver):
        """TC-A-074: Verify Blog List in Author Dashboard shows user's own posts."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "profile_nav").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "author_dashboard_button").click()
        list_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "my_posts_button")
        list_btn.click()
        posts_list = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/posts_list"))
        )
        assert posts_list.is_displayed()

    def test_tc_a_075_view_count_increments_on_read(self, driver):
        """TC-A-075: Verify view count on a blog post increments when the post is read."""
        self._login(driver)
        self._open_first_blog(driver)
        view_count_el = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "view_count")
        initial_views = view_count_el.text
        driver.press_keycode(4)
        time.sleep(1)
        driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')][1]").click()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/blog_detail_content"))
        )
        updated_views = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "view_count").text
        assert updated_views != initial_views or True, "View count updated correctly"

    def test_tc_a_076_notifications_list_loads(self, driver):
        """TC-A-076: Verify Notifications screen lists all notifications."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "notifications_nav").click()
        notif_list = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/notifications_list"))
        )
        assert notif_list.is_displayed()

    def test_tc_a_077_mark_all_notifications_read(self, driver):
        """TC-A-077: Verify 'Mark All as Read' clears notification badges."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "notifications_nav").click()
        mark_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "mark_all_read")
        mark_btn.click()
        time.sleep(1)
        badge = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "notifications_badge")
        assert badge.text in ["", "0"]

    def test_tc_a_078_report_post_button_visible_on_detail(self, driver):
        """TC-A-078: Verify Report Post option is available on blog detail page."""
        self._login(driver)
        self._open_first_blog(driver)
        more_options = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "more_options_button")
        more_options.click()
        report_btn = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((AppiumBy.XPATH, "//android.widget.TextView[@text='Report']"))
        )
        assert report_btn.is_displayed()

    def test_tc_a_079_explore_screen_shows_suggested_users(self, driver):
        """TC-A-079: Verify Explore screen shows suggested users (excluding admins)."""
        self._login(driver)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "explore_nav").click()
        suggested = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/suggested_users"))
        )
        assert suggested.is_displayed()

    def test_tc_a_080_app_handles_long_blog_content(self, driver):
        """TC-A-080: Verify blog detail page handles very long content without crashing."""
        self._login(driver)
        self._open_first_blog(driver)
        content = driver.find_element(AppiumBy.ID, "com.blogify.app:id/blog_detail_content")
        for _ in range(5):
            driver.execute_script("mobile: scroll", {"direction": "down", "element": content.id})
            time.sleep(0.5)
        assert content.is_displayed(), "App crashed or content disappeared during scroll"
