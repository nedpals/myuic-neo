import { EthnicGroup, Gender, IncomeGroup, Nationality, ParentRelationship, Religion, RouteName, RoutePath } from '@myuic-api/types';
import { client, useClientQuery } from '../client';
import { useStudentStore } from './studentStore';

function useFormListQuery<T>(routeName: RouteName) {
  const studentStore = useStudentStore();

  return function() {
    return useClientQuery<Record<string, T>>(routeName, () => client.http.get(RoutePath(routeName)), {
      enabled: studentStore.hasSemesterId
    });
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