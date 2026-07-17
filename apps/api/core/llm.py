from google import genai
from core.config import get_settings

settings = get_settings()
_client = genai.Client(api_key=settings.gemini_api_key)


def get_embedding(text: str) -> list[float]:
    """Generate an embedding vector for a piece of text using Gemini's embedding model."""
    result = _client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
    )
    return result.embeddings[0].values


def generate_text(prompt: str) -> str:
    """Generate text using Gemini's current stable Flash model."""
    response = _client.models.generate_content(
        model="gemini-3.1-flash-lite",
        contents=prompt,
    )
    return response.text