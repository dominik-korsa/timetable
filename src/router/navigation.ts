import { RouteParams, useRoute, useRouter } from 'vue-router';
import { Path, paths } from 'src/router/path-builder';
import { computed, reactive } from 'vue';
import { paramNames } from 'src/router/route-constants';
import { UnitType } from 'src/api/common';

type Params = {
  tri: null; unitType: null;
} | {
  tri: string; unitType: UnitType | null;
};

const getParam = (params: RouteParams, param: keyof typeof paramNames) => {
  const value = params[paramNames[param]];
  if (typeof value !== 'string') return null;
  return value;
};

export const useNavigation = () => {
  const route = useRoute();
  const router = useRouter();

  const goBack = (to: Path) => {
    const resolved = router.resolve(to);
    if (resolved.href === window.history.state.back) router.back();
    else router.push(to).then();
  };

  const params = computed<Params>(() => {
    const tri = getParam(route.params, 'tri');
    if (tri === null) {
      return {
        tri: null,
        unitType: null,
      };
    }
    return {
      tri,
      unitType: getParam(route.params, 'unitType') as UnitType | null,
    };
  });

  const triRelative = computed(
    () => paths.tri(getParam(route.params, 'tri') ?? ''),
  );

  const currentUnitList = computed(() => {
    if (params.value.unitType === null) return null;
    return paths.tri(params.value.tri).unitType(params.value.unitType).list;
  });

  return reactive({
    goBack,
    params,
    triRelative,
    currentUnitList,
  });
};
