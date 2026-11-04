/** 숫자는 안전한 양의 정수만, 문자열은 앞에 0이 없는 십진 정수만 허용한다. 실패 시 null. */
export const parsePositiveId = (value: string | number | null | undefined): number | null => {
  if (typeof value !== 'number' && !/^[1-9]\d*$/.test(value ?? '')) return null;

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

/** ID가 정확히 한 번 전달된 경우에만 검증한다. 누락되거나 중복되면 null. */
export const parseSinglePositiveId = (values: readonly string[]): number | null =>
  values.length === 1 ? parsePositiveId(values[0]) : null;
