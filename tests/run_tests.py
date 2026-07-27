#!/usr/bin/env python3
"""
tests/run_tests.py
──────────────────────────────────────────────────────────────────────────────
Master test runner for the Blogify E2E Test Suite.
Runs Selenium (Web) and/or Appium (Mobile) tests and generates reports.

Usage examples:
    # Run ONLY Selenium tests (default)
    python run_tests.py

    # Run ONLY Appium tests
    python run_tests.py --suite appium

    # Run ALL tests (Selenium + Appium)
    python run_tests.py --suite all

    # Run with verbose output
    python run_tests.py --suite selenium -v

    # Run specific markers
    python run_tests.py -m "smoke"
    python run_tests.py -m "security or performance"

    # Run with parallel workers (requires pytest-xdist)
    python run_tests.py --suite selenium -n 4

Prerequisites:
    pip install -r requirements.txt
    # For Selenium: Chrome browser + ChromeDriver (auto-managed)
    # For Appium:   Appium server on http://127.0.0.1:4723
    #               Android emulator named 'Blogify_Emulator' (API 33)
    #               Blogify APK installed on emulator
──────────────────────────────────────────────────────────────────────────────
"""
import argparse
import subprocess
import sys
import os
import time
import json

# ── Paths ─────────────────────────────────────────────────────────────────────

TESTS_DIR   = os.path.dirname(os.path.abspath(__file__))
REPORTS_DIR = os.path.join(TESTS_DIR, "reports")


def run_pytest(suite: str, extra_args: list[str]) -> int:
    """Build and execute the pytest command, returning the exit code."""
    os.makedirs(REPORTS_DIR, exist_ok=True)

    cmd = [sys.executable, "-m", "pytest"]

    # ── Test paths ────────────────────────────────────────────────────────────
    if suite == "selenium":
        cmd.append("selenium_tests/")
    elif suite == "appium":
        cmd.append("appium_tests/")
    else:
        cmd.extend(["selenium_tests/", "appium_tests/"])

    # ── Standard options ──────────────────────────────────────────────────────
    cmd += [
        "--tb=short",
        "-v",
        "--timeout=60",
        f"--html={os.path.join(REPORTS_DIR, 'blogify_html_report.html')}",
        "--self-contained-html",
    ]

    # ── User-supplied extra args ───────────────────────────────────────────────
    cmd += extra_args

    print(f"\n{'='*70}")
    print(f"  Blogify E2E Test Suite — Running: {suite.upper()}")
    print(f"  Command: {' '.join(cmd)}")
    print(f"{'='*70}\n")

    result = subprocess.run(cmd, cwd=TESTS_DIR)
    return result.returncode


def print_summary():
    """Pretty-print the JSON results summary after the run."""
    json_path = os.path.join(REPORTS_DIR, "test_results.json")
    if not os.path.exists(json_path):
        return

    with open(json_path, "r", encoding="utf-8") as f:
        summary = json.load(f)

    total   = summary.get("total",  0)
    passed  = summary.get("passed", 0)
    failed  = summary.get("failed", 0)
    error   = summary.get("error",  0)
    gen_at  = summary.get("generated_at", "")
    rate    = round(passed / max(total, 1) * 100, 1)

    print(f"\n{'='*70}")
    print(f"  TEST RUN COMPLETE  —  {gen_at}")
    print(f"{'='*70}")
    print(f"  Total   : {total}")
    print(f"  Passed  : {passed}  [PASS]")
    print(f"  Failed  : {failed}  [FAIL]")
    print(f"  Errors  : {error}   [ERROR]")
    print(f"  Pass Rate: {rate}%")
    print(f"{'='*70}")
    print(f"  Reports saved in: {REPORTS_DIR}")
    print(f"{'='*70}\n")


def main():
    parser = argparse.ArgumentParser(
        description="Blogify E2E master test runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        "--suite", choices=["selenium", "appium", "all"],
        default="selenium",
        help="Which test suite to run (default: selenium)",
    )
    parser.add_argument(
        "-v", "--verbose", action="store_true",
        help="Pass -v to pytest for verbose output",
    )
    parser.add_argument(
        "-n", "--workers",
        type=int, default=0,
        help="Number of parallel workers via pytest-xdist (0 = no parallelism)",
    )
    parser.add_argument(
        "-m", "--markers",
        default="",
        help='pytest marker expression, e.g. "smoke" or "security or performance"',
    )
    parser.add_argument(
        "-k", "--keyword",
        default="",
        help='pytest -k keyword filter, e.g. "test_tc_s_001"',
    )
    parser.add_argument(
        "--generate-report-only", action="store_true",
        help="Skip running tests and only (re)generate reports from existing test_results.json",
    )

    args, unknown = parser.parse_known_args()

    # ── Report-only mode ───────────────────────────────────────────────────────
    if args.generate_report_only:
        from generate_report import main as gen_main
        gen_main()
        return

    # ── Build extra args ───────────────────────────────────────────────────────
    extra = list(unknown)
    if args.verbose:
        extra.append("-v")
    if args.workers > 0:
        extra += ["-n", str(args.workers)]
    if args.markers:
        extra += ["-m", args.markers]
    if args.keyword:
        extra += ["-k", args.keyword]

    # ── Run ───────────────────────────────────────────────────────────────────
    exit_code = run_pytest(args.suite, extra)
    print_summary()

    # ── Also generate standalone HTML report ──────────────────────────────────
    json_path = os.path.join(REPORTS_DIR, "test_results.json")
    if os.path.exists(json_path):
        try:
            from generate_report import load_results, generate_html
            summary  = load_results(json_path)
            html_out = os.path.join(REPORTS_DIR, "blogify_html_report.html")
            generate_html(summary, html_out)
        except Exception as e:
            print(f"[warn] Could not regenerate HTML report: {e}")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
