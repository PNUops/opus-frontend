import FilterDropDown from './FilterDropDown';
import useFilterQuery from '../sub-tab/useFilterQueryData';
import { FilterState } from '../hooks/useMyLikesFilter';

interface Props {
  state: FilterState;
  update: (next: Partial<FilterState>) => void;
  reset: () => void;
}

const MyLikeFilterBar = ({ state, update, reset }: Props) => {
  const { SORT_OPTIONS, DATE_OPTIONS, CATEGORY_OPTIONS, CONTEST_OPTIONS } = useFilterQuery();

  return (
    <div className="flex flex-wrap gap-4">
      <FilterDropDown
        key={'sort'}
        label={SORT_OPTIONS.find((o) => o.value === state.sort)?.label ?? ''}
        value={state.sort}
        options={SORT_OPTIONS}
        onChange={(v) => update({ sort: v, page: '0' })}
      />

      <FilterDropDown
        key={'date'}
        label={DATE_OPTIONS.find((o) => o.value === state.dateType)?.label ?? ''}
        value={state.dateType}
        options={DATE_OPTIONS}
        onChange={(v) => update({ dateType: v, page: '0' })}
      />

      <FilterDropDown
        key={'category'}
        label={CATEGORY_OPTIONS.find((o) => o.value === state.categoryId)?.label ?? ''}
        value={state.categoryId}
        options={CATEGORY_OPTIONS}
        onChange={(v) => update({ categoryId: v, page: '0' })}
      />

      <FilterDropDown
        key={'contest'}
        label={CONTEST_OPTIONS.find((o) => o.value === state.contestId)?.label ?? ''}
        value={state.contestId}
        options={CONTEST_OPTIONS}
        onChange={(v) => update({ contestId: v, page: '0' })}
      />

      <button onClick={reset}>초기화</button>
    </div>
  );
};

export default MyLikeFilterBar;
