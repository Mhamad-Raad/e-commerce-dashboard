import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * All limit/budget fields are nullable: send `null` to clear a cap ("unlimited"),
 * omit to leave unchanged. Budgets are USD cents. `locked` is included so an admin
 * can manually unlock after a budget trip; `lockedReason` is system-managed.
 */
export class UpdateAssistantConfigDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  @Length(1, 40)
  provider?: string;

  @IsOptional()
  @IsString()
  @Length(1, 60)
  model?: string;

  // --- Per-user message caps ---
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  maxMsgsPerMinute?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  maxMsgsPerHour?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  maxMsgsPerDay?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  maxMsgsPerWeek?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  maxMsgsPerMonth?: number | null;

  // --- Per-user token caps ---
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  maxTokensPerDay?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  maxTokensPerWeek?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  maxTokensPerMonth?: number | null;

  // --- Global spend caps (USD cents) ---
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  budgetWeeklyCents?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  budgetMonthlyCents?: number | null;
  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0)
  budgetTotalCents?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  warnThresholdPct?: number;

  // Admin can flip this to false to manually unlock after a budget trip.
  @IsOptional()
  @IsBoolean()
  locked?: boolean;
}
