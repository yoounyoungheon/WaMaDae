"use client";

import { useState, type FormEvent } from "react";
import { KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/app/shared/ui/atom/button";
import LoadingSpinner from "@/app/shared/ui/atom/loading-spinner";
import TextInput from "@/app/shared/ui/atom/text-input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/shared/ui/molecule/card";

const INVALID_CODE_MESSAGE = "유효하지 않은 접근 코드입니다.";
const SERVER_ERROR_MESSAGE =
  "인증을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.";

type BetaAccessResponse = {
  message?: unknown;
};

export type BetaAccessFormViewProps = {
  code: string;
  errorMessage: string | null;
  isSubmitting: boolean;
  onCodeChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function BetaAccessForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/beta-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
        cache: "no-store",
      });

      if (!response.ok) {
        const body = (await response
          .json()
          .catch(() => null)) as BetaAccessResponse | null;
        const message =
          typeof body?.message === "string"
            ? body.message
            : response.status === 401
            ? INVALID_CODE_MESSAGE
            : SERVER_ERROR_MESSAGE;
        setErrorMessage(message);
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setErrorMessage(SERVER_ERROR_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BetaAccessFormView
      code={code}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
      onCodeChange={(value) => {
        setCode(value);
        if (errorMessage) {
          setErrorMessage(null);
        }
      }}
      onSubmit={handleSubmit}
    />
  );
}

export function BetaAccessFormView({
  code,
  errorMessage,
  isSubmitting,
  onCodeChange,
  onSubmit,
}: BetaAccessFormViewProps) {
  const errorId = errorMessage ? "beta-access-error" : undefined;

  return (
    <Card className="w-full max-w-[390px] border-white/70 bg-white/90 shadow-[0_24px_70px_rgba(72,52,112,0.16)] backdrop-blur-xl">
      <CardHeader className="items-center px-6 pb-4 pt-7 text-center">
        <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-main/10 text-primary-main">
          <KeyRound aria-hidden="true" className="h-6 w-6" />
        </span>
        <CardTitle className="text-[24px] leading-tight text-ink-page">
          베타 서비스 입장
        </CardTitle>
        <CardDescription className="pt-1 text-[14px] leading-relaxed text-ink-secondary">
          전달받은 접근 코드를 입력해 주세요.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-6 pb-7 pt-2">
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <div>
            <label
              htmlFor="beta-access-code"
              className="mb-2 block text-sm font-semibold text-ink-emphasis"
            >
              베타 접근 코드
            </label>
            <TextInput
              id="beta-access-code"
              name="code"
              type="password"
              value={code}
              placeholder="접근 코드를 입력하세요"
              autoComplete="current-password"
              status={errorMessage ? "error" : "default"}
              aria-invalid={Boolean(errorMessage)}
              aria-describedby={errorId}
              disabled={isSubmitting}
              onValueChange={onCodeChange}
              className="h-12"
            />
            {errorMessage ? (
              <p
                id={errorId}
                role="alert"
                className="mt-2 text-sm font-medium text-error-main"
              >
                {errorMessage}
              </p>
            ) : null}
          </div>

          <Button
            htmlType="submit"
            disabled={!code || isSubmitting}
            className="h-12 w-full gap-2 rounded-2xl"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner
                  label="접근 코드 확인 중"
                  className="h-5 w-5 text-white"
                />
                확인 중
              </>
            ) : (
              "인증하기"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
