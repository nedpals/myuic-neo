import { isMock, mockBackendUrl } from "../main/client";
import { mockServerDefaults, useMockServer as _useMockServer } from "@myuic-api/mock";

export const enableMockServer = isMock;

export const useMockServer = () => {
  if (!enableMockServer) return;
  _useMockServer(mockBackendUrl, {
    ...mockServerDefaults,
    timing: import.meta.env.VITE_MOCKSERVER_TIMING ?? '2000',
    passthroughs: ['/@unocss-devtools-update']
  });
}
