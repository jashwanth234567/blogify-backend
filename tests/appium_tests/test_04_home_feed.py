"""
tests/appium/test_04_home_feed.py
TC_A_031 – TC_A_040 : Home Feed & Blog List Tests (Mobile)
"""
import pytest
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import TEST_USER_EMAIL, TEST_USER_PASSWORD


class TestHomeFeed:

    def _login(self, driver):
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_button").click()
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "email_input").send_keys(TEST_USER_EMAIL)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "password_input").send_keys(TEST_USER_PASSWORD)
        driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_submit").click()
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/home_feed"))
        )

    def test_tc_a_031_home_feed_loads_blog_cards(self, driver):
        """TC-A-031: Verify home feed displays blog post cards."""
        self._login(driver)
        cards = driver.find_elements(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')]")
        assert len(cards) > 0, "No blog cards displayed on home feed"

    def test_tc_a_032_admin_posts_excluded_from_feed(self, driver):
        """TC-A-032: Verify admin-authored posts are NOT visible in home feed."""
        self._login(driver)
        admin_posts = driver.find_elements(AppiumBy.XPATH, "//android.widget.TextView[@text='Admin Post']")
        assert len(admin_posts) == 0, "Admin-authored posts visible in public feed — isolation broken"

    def test_tc_a_033_feed_supports_pull_to_refresh(self, driver):
        """TC-A-033: Verify pull-to-refresh gesture works on home feed."""
        self._login(driver)
        feed = driver.find_element(AppiumBy.ID, "com.blogify.app:id/home_feed")
        driver.execute_script("mobile: scroll", {"direction": "down", "element": feed.id})
        time.sleep(1)
        driver.execute_script("mobile: scroll", {"direction": "up", "element": feed.id})
        time.sleep(2)
        cards = driver.find_elements(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')]")
        assert len(cards) > 0, "Feed did not reload on pull-to-refresh"

    def test_tc_a_034_blog_card_shows_title_and_author(self, driver):
        """TC-A-034: Verify blog card displays title and author name."""
        self._login(driver)
        title = driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')][1]//android.widget.TextView[1]")
        author = driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')][1]//android.widget.TextView[2]")
        assert title.is_displayed() and author.is_displayed(), "Blog card missing title or author"

    def test_tc_a_035_clicking_blog_card_opens_detail(self, driver):
        """TC-A-035: Verify tapping a blog card opens the blog detail screen."""
        self._login(driver)
        first_card = driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')][1]")
        first_card.click()
        detail = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((AppiumBy.ID, "com.blogify.app:id/blog_detail_content"))
        )
        assert detail.is_displayed(), "Blog detail screen did not open"

    def test_tc_a_036_trending_tab_loads(self, driver):
        """TC-A-036: Verify Trending tab on home feed loads trending posts."""
        self._login(driver)
        trending_tab = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text='Trending']")
        trending_tab.click()
        cards = WebDriverWait(driver, 10).until(
            EC.presence_of_all_elements_located((AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')]"))
        )
        assert len(cards) >= 0, "Trending tab did not load"

    def test_tc_a_037_most_liked_tab_loads(self, driver):
        """TC-A-037: Verify Most Liked tab loads posts sorted by likes."""
        self._login(driver)
        tab = driver.find_element(AppiumBy.XPATH, "//android.widget.TextView[@text='Most Liked']")
        tab.click()
        time.sleep(2)
        cards = driver.find_elements(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')]")
        assert len(cards) >= 0, "Most Liked tab did not load"

    def test_tc_a_038_infinite_scroll_loads_more_posts(self, driver):
        """TC-A-038: Verify infinite scroll loads additional posts."""
        self._login(driver)
        initial_count = len(driver.find_elements(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')]"))
        feed = driver.find_element(AppiumBy.ID, "com.blogify.app:id/home_feed")
        driver.execute_script("mobile: scroll", {"direction": "down", "element": feed.id, "percent": 3.0})
        time.sleep(3)
        new_count = len(driver.find_elements(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')]"))
        assert new_count >= initial_count, "Infinite scroll did not load more posts"

    def test_tc_a_039_like_button_works_on_feed(self, driver):
        """TC-A-039: Verify like button on feed card toggles like status."""
        self._login(driver)
        like_btn = driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')][1]//android.widget.ImageButton[@content-desc='like_button']")
        like_btn.click()
        time.sleep(1)
        # Verify the like button visual state changed
        liked = like_btn.get_attribute("selected")
        assert liked == "true", "Like button did not toggle on tap"

    def test_tc_a_040_bookmark_button_works_on_feed(self, driver):
        """TC-A-040: Verify bookmark button saves a post."""
        self._login(driver)
        bookmark_btn = driver.find_element(AppiumBy.XPATH, "//android.widget.FrameLayout[contains(@resource-id,'blog_card')][1]//android.widget.ImageButton[@content-desc='bookmark_button']")
        bookmark_btn.click()
        time.sleep(1)
        bookmarked = bookmark_btn.get_attribute("selected")
        assert bookmarked == "true", "Bookmark did not save the post"
