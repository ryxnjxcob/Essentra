import axios from "axios";

export interface CollabRequest {
  id: number;
  board_title: string;
  requester_name: string;
}

export async function fetchRequests(): Promise<CollabRequest[]> {
  const res = await axios.get("/boards/collaboration/requests", {
    withCredentials: true,
  });
  return res.data;
}

export async function approveRequest(requestId: number) {
  return axios.post(
    `/boards/collaboration/${requestId}/respond`,
    { approve: true },
    { withCredentials: true },
  );
}

export async function rejectRequest(requestId: number) {
  return axios.post(
    `/boards/collaboration/${requestId}/respond`,
    { approve: false },
    { withCredentials: true },
  );
}
