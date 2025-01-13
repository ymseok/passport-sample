"use client";
import { config, passport } from "@imtbl/sdk";
import { useEffect, useState } from "react";

export default function Home() {
  const [passportInstance, setPassportInstance] =
    useState<passport.Passport | null>(null);
  const [userAddress, setUserAddress] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(false);

  // Passport 클라이언트 초기화를 위한 useEffect
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_CLIENT_ID ||
      !process.env.NEXT_PUBLIC_PUBLISHABLE_KEY
    ) {
      setError("필수 환경 변수가 설정되지 않았습니다.");
      return;
    }

    const passportInstance = new passport.Passport({
      baseConfig: {
        environment: config.Environment.SANDBOX,
        publishableKey: process.env.NEXT_PUBLIC_PUBLISHABLE_KEY as string,
      },
      clientId: process.env.NEXT_PUBLIC_CLIENT_ID as string,
      redirectUri: "http://localhost:3000/redirect",
      logoutRedirectUri: "http://localhost:3000/",
      audience: "platform_api",
      scope: "openid offline_access email transact",
    });

    setPassportInstance(passportInstance);
  }, []);

  const logout = async () => {
    if (!passportInstance) {
      return;
    }
    await passportInstance.logout();
    setUserAddress("");
    setIsConnected(false);
  };

  const login = async () => {
    if (!passportInstance) return;

    const provider = passportInstance.connectEvm();
    const accounts = await provider.request({ method: "eth_requestAccounts" });

    setUserAddress(accounts[0]);
    setIsConnected(true);
  };

  const handleWalletConnection = async () => {
    try {
      if (!passportInstance) return;

      if (isConnected) {
        logout();
      } else {
        login();
      }
    } catch (error) {
      console.error(isConnected ? "연결 해제 실패:" : "연결 실패:", error);
      setError(
        isConnected
          ? "지갑 연결 해제에 실패했습니다."
          : "지갑 연결에 실패했습니다."
      );
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Passport Wallet 연결</h2>

          {error && (
            <div className="w-full p-4 bg-red-100 text-red-700 rounded-lg mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleWalletConnection}
            disabled={!passportInstance || !!error}
            className={`rounded-full border border-solid border-transparent transition-colors flex items-center justify-center gap-2 text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full disabled:opacity-50 disabled:cursor-not-allowed ${
              isConnected
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc]"
            }`}
          >
            {isConnected ? "Disconnect" : "Connect"}
          </button>

          {userAddress && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg w-full">
              <p className="text-sm break-all">지갑 주소: {userAddress}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
