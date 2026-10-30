/**
 * The read options. Same six controls, same ids, same defaults, same ranges
 * and the same explanatory paragraph as the original's `<details class="opts">`.
 */

import { t, useT } from '@/i18n';
import type { ReactElement, ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Prose } from './Prose';
import { Disclosure } from './ui/disclosure';
import { Field, Input, Select } from './ui/field';
import type { OptionField, OptionsForm, RecipientChoice } from '@/lib/options';

export interface OptionsDetailsProps {
  readonly value: OptionsForm;
  readonly onChange: (next: OptionsForm) => void;
  readonly disabled: boolean;
  /** The field the last validation failure named, so it can be marked invalid. */
  readonly invalidField: OptionField | null;
  readonly errorMessage: string | null;
  /**
   * Run controls that belong to the read as a whole and are not a setting (the
   * 4.x/Nano tab's "Dump all selectors"). They sit inside the spoiler, under the fields.
   */
  readonly actions?: ReactNode;
}

export function OptionsDetails({
  value,
  onChange,
  disabled,
  invalidField,
  errorMessage,
  actions,
}: OptionsDetailsProps): ReactElement {
  const { rich } = useT();
  const invalid = (field: OptionField): boolean => invalidField === field;
  const describedBy = errorMessage === null ? undefined : 'opt-error';
  const flag = (
    field: OptionField,
  ): { readonly 'aria-invalid': boolean; readonly 'aria-describedby'?: string } =>
    invalid(field) && describedBy !== undefined
      ? { 'aria-invalid': true, 'aria-describedby': describedBy }
      : { 'aria-invalid': invalid(field) };

  return (
    <Disclosure
      summary={
        <span className="inline-flex items-center gap-2">
          <span className="font-semibold">{t('v4:options.title')}</span>
          <span className="font-normal text-muted-foreground">{t('v4:options.subtitle')}</span>
        </span>
      }
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Field htmlFor="optChunk" label={t('v4:options.chunk')}>
          <Input
            type="number"
            id="optChunk"
            min={1}
            max={65536}
            step={1}
            value={value.chunk}
            disabled={disabled}
            {...flag('chunk')}
            onChange={(event) => {
              onChange({ ...value, chunk: event.target.value });
            }}
          />
        </Field>
        <Field htmlFor="optGapFill" label={t('v4:options.gapFill')}>
          <Input
            type="text"
            id="optGapFill"
            inputMode="text"
            value={value.gapFill}
            disabled={disabled}
            {...flag('gapFill')}
            onChange={(event) => {
              onChange({ ...value, gapFill: event.target.value });
            }}
          />
        </Field>
        <Field htmlFor="optRetries" label={t('v4:options.retries')}>
          <Input
            type="number"
            id="optRetries"
            min={0}
            max={10}
            step={1}
            value={value.retries}
            disabled={disabled}
            {...flag('retries')}
            onChange={(event) => {
              onChange({ ...value, retries: event.target.value });
            }}
          />
        </Field>
        <Field htmlFor="optRetryDelay" label={t('v4:options.retryDelay')}>
          <Input
            type="number"
            id="optRetryDelay"
            min={0}
            max={10000}
            step={50}
            value={value.retryDelay}
            disabled={disabled}
            {...flag('retryDelay')}
            onChange={(event) => {
              onChange({ ...value, retryDelay: event.target.value });
            }}
          />
        </Field>
        <Field htmlFor="optRecipient" label={t('v4:options.recipient')}>
          <Select
            id="optRecipient"
            value={value.recipient}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...value, recipient: event.target.value as RecipientChoice });
            }}
          >
            <option value="auto">{t('v4:options.recipientAuto')}</option>
            <option value="interface">
              {t('v4:options.recipientInterface', { requestTypes: '0x41/0xC1' })}
            </option>
            <option value="device">
              {t('v4:options.recipientDevice', { requestTypes: '0x40/0xC0' })}
            </option>
          </Select>
        </Field>
        <Field htmlFor="optDecrypt" label={t('v4:options.decrypt')}>
          <Select
            id="optDecrypt"
            value={value.decrypt ? '1' : '0'}
            disabled={disabled}
            onChange={(event) => {
              onChange({ ...value, decrypt: event.target.value === '1' });
            }}
          >
            <option value="1">{t('v4:options.yes')}</option>
            <option value="0">{t('v4:options.no')}</option>
          </Select>
        </Field>
      </div>

      {actions !== undefined && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
          {actions}
        </div>
      )}

      {errorMessage !== null && (
        <p
          id="opt-error"
          role="alert"
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/8 px-3 py-2 text-[0.85rem] font-medium text-destructive"
        >
          <SlidersHorizontal aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}

      <Prose>
        <p>{rich('v4:options.help')}</p>
      </Prose>
    </Disclosure>
  );
}
