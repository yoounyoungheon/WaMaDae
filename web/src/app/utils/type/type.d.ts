export interface FormState {
  isSuccess: boolean;
  isFailure: boolean;
  validationError: Record<string, string[] | undefined>;
  message: string;
}

export type DayType = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export interface DateInfo {
  day: DayType;
  date: number;
  month: number;
  year: number;
}