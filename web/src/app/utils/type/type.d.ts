export interface FormState {
  isSuccess: boolean;
  isFailure: boolean;
  validationError: Record<string, string[] | undefined>;
  message: string;
}

export type MemberRole = 'ADIMIN' | 'USER' | 'STORE';

export type DayType = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';