import { useQuery } from "vue-query";
import { client } from "../client";

export const useElectionCandidatesQuery = () => useQuery(
  'election_candidates',
  () => client.electionCandidatesList(),
  {
    enabled: true
  }
);