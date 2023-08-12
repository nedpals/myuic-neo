import { EthnicGroup, Gender, IncomeGroup, Nationality, ParentRelationship, Religion, RouteName, RoutePath } from '@myuic-api/types';
import { readonly } from 'vue';
import { client, useClientQuery } from '../client';

function useFormListQuery<T>(routeName: RouteName) {
  return function() {
    return readonly(useClientQuery<Record<string, T>>([routeName], () => client.http.get(RoutePath(routeName))));
  }
}

const useGendersQuery = useFormListQuery<Gender>('genderList');
const useNationalitiesQuery = useFormListQuery<Nationality>('nationalitiesList');
const useParentRelationshipsQuery = useFormListQuery<ParentRelationship>('parentRelationshipStatusesList');
const useReligionsQuery = useFormListQuery<Religion>('religionList');
const useIncomeGroupsQuery = useFormListQuery<IncomeGroup>('incomeGroupsList');
const useEthnicGroupsQuery = useFormListQuery<EthnicGroup>('ethnicGroupsList');

export {
  useGendersQuery,
  useNationalitiesQuery,
  useParentRelationshipsQuery,
  useReligionsQuery,
  useIncomeGroupsQuery,
  useEthnicGroupsQuery
}
