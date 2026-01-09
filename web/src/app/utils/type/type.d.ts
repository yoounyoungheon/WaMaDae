export interface FormState {
  isSuccess: boolean;
  isFailure: boolean;
  validationError: Record<string, string[] | undefined>;
  message: string;
}

export type MemberRole = 'ADIMIN' | 'USER' | 'SHOP';

export type ToastType = "success" | "error" | "info";