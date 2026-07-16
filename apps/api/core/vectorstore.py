from supabase import create_client, Client
from core.config import get_settings

_settings = get_settings()
_client: Client | None = None


def get_supabase_client() -> Client:
    global _client
    if _client is None:
        _client = create_client(
            _settings.supabase_url,
            _settings.supabase_service_role_key,
        )
    return _client