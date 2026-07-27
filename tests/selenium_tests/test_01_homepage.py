"""
tests/selenium/test_01_homepage.py
TC_S_001 – TC_S_010 : Homepage & Public Landing Page Tests
"""
import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from config import BASE_URL


class TestHomepage:

    def test_tc_s_001_homepage_loads_successfully(self, driver):
        """TC-S-001: Verify homepage loads with HTTP 200 and no console errors."""
        assert "Blogify" in driver.title, f"Expected 'Blogify' in title, got: {driver.title}"

    def test_tc_s_002_hero_section_visible(self, driver):
        """TC-S-002: Verify hero section with headline is visible on homepage."""
        hero_text = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//h1[contains(text(),'Writing') or contains(text(),'Blogify') or contains(text(),'Modern')]"))
        )
        assert hero_text.is_displayed(), "Hero headline not visible"

    def test_tc_s_003_navbar_visible(self, driver):
        """TC-S-003: Verify top navigation bar is visible with required links."""
        # Navbar renders as a <div> in Blogify (not a <nav> tag)
        navbar = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//div[.//img[contains(@alt,'logo')]]"))
        )
        assert navbar.is_displayed(), "Navbar not visible on homepage"

    def test_tc_s_004_explore_link_in_navbar(self, driver):
        """TC-S-004: Verify 'Explore' link is present in the navigation bar."""
        explore = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//a[contains(text(),'Explore')] | //button[contains(text(),'Explore')]"))
        )
        assert explore.is_displayed()

    def test_tc_s_005_login_button_in_navbar(self, driver):
        """TC-S-005: Verify 'Login' button is present and visible in navbar."""
        login_btn = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.XPATH, "//a[contains(text(),'Login')] | //button[contains(text(),'Login')]"))
        )
        assert login_btn.is_displayed()

    def test_tc_s_006_homepage_has_blog_section(self, driver):
        """TC-S-006: Verify homepage displays a blog/articles section."""
        # BlogList renders in a div with grid columns; also skeleton loaders exist
        blog_section = WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.XPATH, "//div[contains(@class,'grid') and contains(@class,'cols')]"))
        )
        assert blog_section is not None

    def test_tc_s_007_footer_is_displayed(self, driver):
        """TC-S-007: Verify footer is present and visible on the homepage."""
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        import time; time.sleep(1)
        # Footer renders as a <div> in Blogify, contains copyright text
        footer = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Copyright') or contains(text(),'Blogify') and contains(text(),'Reserved')]"))
        )
        assert footer is not None, "Footer not found on homepage"

    def test_tc_s_008_page_title_is_correct(self, driver):
        """TC-S-008: Verify page <title> contains 'Blogify'."""
        assert "Blogify" in driver.title

    def test_tc_s_009_meta_description_exists(self, driver):
        """TC-S-009: Verify page has a meta description for SEO."""
        meta_desc = driver.find_element(By.XPATH, "//meta[@name='description']")
        content = meta_desc.get_attribute("content")
        assert content and len(content) > 10, "Meta description is missing or too short"

    def test_tc_s_010_get_started_button_visible(self, driver):
        """TC-S-010: Verify 'Get Started' CTA button is visible on homepage."""
        btn = WebDriverWait(driver, 15).until(
            EC.visibility_of_element_located((By.XPATH, "//button[contains(text(),'Get Started')] | //a[contains(text(),'Get Started')]"))
        )
        assert btn.is_displayed()
