import { EthnicGroup, Gender, IncomeGroup, Nationality, ParentRelationship, Religion, RoutePath } from '@myuic-api/types';
import { defineStore } from 'pinia';
import { client } from '../client';

export const useFormStore = defineStore('form', {
  state: () => ({
    genders: {} as Record<string, Gender>,
    nationalities: {} as Record<string, Nationality>,
    religions: {} as Record<string, Religion>,
    parentRelationshipStatuses: {} as Record<string, ParentRelationship>,
    incomeGroups: {} as Record<string, IncomeGroup>,
    ethnicGroups: {} as Record<string, EthnicGroup>
  }),

  actions: {
    getIdByGender(gender: string): string | null {
      for (const gID in this.genders) {
        if (this.genders[gID] === gender) {
          return gID;
        }
      }
      return null;
    },

    async getFormInfos() {
      const isGenderEmpty = this.genders === null || Object.keys(this.genders).length === 0;
      const isNationalitiesEmpty = this.nationalities === null || Object.keys(this.nationalities).length === 0;
      const isReligionsEmpty = this.religions === null || Object.keys(this.religions).length === 0;
      const isStatusesEmpty = this.parentRelationshipStatuses === null || Object.keys(this.parentRelationshipStatuses).length === 0;
      const isIncomeGroupsEmpty = this.incomeGroups === null || Object.keys(this.incomeGroups).length === 0;
      const isEthnicGroupsEmpty = this.ethnicGroups === null || Object.keys(this.ethnicGroups).length === 0;
      if (
        !isGenderEmpty && 
        !isNationalitiesEmpty && 
        !isReligionsEmpty && 
        !isStatusesEmpty && 
        !isIncomeGroupsEmpty && 
        !isEthnicGroupsEmpty
      ) return;

      // FIXME: add list routes on client package
      const resps = await Promise.all([
        client.http.get(RoutePath('genderList')),
        client.http.get(RoutePath('nationalitiesList')),
        client.http.get(RoutePath('religionList')),
        client.http.get(RoutePath('parentRelationshipStatusesList')),
        client.http.get(RoutePath('incomeGroupsList')),
        client.http.get(RoutePath('ethnicGroupsList'))
      ]);

      if (isGenderEmpty)
        this.genders = resps[0].data;

      if (isNationalitiesEmpty)
        this.nationalities = resps[1].data;
      
      if (isReligionsEmpty)  
        this.religions = resps[2].data;

      if (isStatusesEmpty)
        this.parentRelationshipStatuses = resps[3].data;
      
      if (isIncomeGroupsEmpty)
        this.incomeGroups = resps[4].data;

      if (isEthnicGroupsEmpty)
        this.ethnicGroups = resps[5].data;
    }
  }
})