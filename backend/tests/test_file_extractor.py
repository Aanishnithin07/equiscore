"""
EquiScore Tests — File Extractor Tests
=========================================
Tests for the PitchDeckExtractor service.
"""

from __future__ import annotations

import pytest

from services.file_extractor import ExtractionError, PitchDeckExtractor


@pytest.fixture
def extractor() -> PitchDeckExtractor:
    """Create a PitchDeckExtractor instance for testing."""
    return PitchDeckExtractor()


def test_sanitize_text_removes_null_bytes() -> None:
    """Test that null bytes are stripped from text."""
    dirty = "Hello\x00World"
    clean = PitchDeckExtractor._sanitize_text(dirty)
    assert "\x00" not in clean
    assert clean == "HelloWorld"


def test_sanitize_text_removes_control_chars() -> None:
    """Test that control characters (except \\n, \\r, \\t) are removed."""
    dirty = "Hello\x01\x02\x03World\nNewline\tTab"
    clean = PitchDeckExtractor._sanitize_text(dirty)
    assert "\x01" not in clean
    assert "\n" in clean  # Newlines preserved
    assert "\t" in clean  # Tabs preserved


def test_count_words_excludes_markers() -> None:
    """Test that slide markers are not counted as words."""
    text = "[SLIDE 1] Hello world [SLIDE 2] foo bar [SPEAKER NOTES] baz"
    count = PitchDeckExtractor._count_words(text)
    # "Hello", "world", "foo", "bar", "baz" = 5 words
    assert count == 5


def test_unsupported_file_format() -> None:
    """Test that unsupported file extensions raise ValueError."""
    extractor = PitchDeckExtractor()

    with pytest.raises(ValueError, match="Unsupported file format"):
        import asyncio
        asyncio.get_event_loop().run_until_complete(
            extractor.extract(b"fake content", "presentation.docx")
        )
