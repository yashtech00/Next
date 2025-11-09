"use client";
import { useEffect } from "react";

export function OAuthTokenStore() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  return null;
}
