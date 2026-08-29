const TIKTOK_ERROR_MESSAGES: Record<string, string> = {
  unaudited_client_can_only_post_to_private_accounts:
    "Sandbox TikTok : passe ton compte en privé dans l'app TikTok, puis choisis « Moi seulement » ici.",
  spam_risk_too_many_posts: "Limite de posts atteinte — réessaie demain.",
  spam_risk_user_banned_from_posting: "Ce compte ne peut pas publier pour le moment.",
  reached_active_user_cap: "Quota journalier de l'app atteint — réessaie demain.",
  scope_not_authorized: "Reconnecte le compte TikTok (scope video.publish requis).",
  access_token_invalid: "Session TikTok expirée — reconnecte le compte.",
  url_ownership_unverified:
    "Domaine non vérifié chez TikTok pour les images (carrousel).",
};

export function formatTikTokError(code?: string, fallback?: string) {
  if (code && TIKTOK_ERROR_MESSAGES[code]) return TIKTOK_ERROR_MESSAGES[code];
  if (fallback?.includes("integration guidelines")) {
    return TIKTOK_ERROR_MESSAGES.unaudited_client_can_only_post_to_private_accounts;
  }
  return fallback ?? "Publication TikTok échouée.";
}
