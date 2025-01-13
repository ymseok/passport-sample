"use client";

import { config, passport } from "@imtbl/sdk";
import { useEffect, useState } from "react";

export default function LoginCallback() {
  const [error, setError] = useState<string>("");

  useEffect(() => {
    handleLoginCallback();
  }, []);

  const handleLoginCallback = async () => {
    try {
      if (
        !process.env.NEXT_PUBLIC_CLIENT_ID ||
        !process.env.NEXT_PUBLIC_PUBLISHABLE_KEY
      ) {
        throw new Error("필수 환경 변수가 설정되지 않았습니다.");
      }

      const passportClient = new passport.Passport({
        baseConfig: {
          environment: config.Environment.SANDBOX,
          publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY,
        },
        clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
        redirectUri: "https://localhost:3000/redirect",
        logoutRedirectUri: "https://localhost:3000/logout",
        audience: "platform_api",
        scope: "openid offline_access email transact",
      });

      // 로그인 콜백 처리
      await passportClient.loginCallback();
    } catch (err) {
      console.error("로그인 콜백 처리 실패:", err);
      setError("로그인 처리 중 오류가 발생했습니다.");
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">로그인 처리 중...</div>
    </div>
  );
}
