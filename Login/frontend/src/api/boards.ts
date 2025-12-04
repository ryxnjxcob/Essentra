// src/api/boards.ts
import axios from "axios";

export interface BoardDTO {
  id: number;
  title: string;
  collaboration_code: string | null;
}

export interface CreateBoardPayload {
  title: string;
}

export async function fetchBoards(): Promise<BoardDTO[]> {
  const res = await axios.get("/boards", { withCredentials: true });
  return res.data;
}

export async function createBoard(
  payload: CreateBoardPayload,
): Promise<BoardDTO> {
  const res = await axios.post("/boards", payload, {
    withCredentials: true,
  });
  return res.data;
}

export async function deleteBoard(boardId: number): Promise<void> {
  await axios.delete(`/boards/${boardId}`, { withCredentials: true });
}

export async function fetchBoardById(boardId: number): Promise<BoardDTO> {
  const res = await axios.get(`/boards/${boardId}`, {
    withCredentials: true,
  });
  return res.data;
}
export async function requestBoardAccess(code: string) {
  const res = await axios.post(
    "/boards/request-access",
    { code },
    { withCredentials: true },
  );

  return res.data;
}

// Request list (owner sees pending requests)
export async function fetchBoardRequests() {
  const res = await axios.get("/notifications", {
    withCredentials: true,
  });
  return res.data;
}

// Approve / Reject
export async function respondToAccessRequest(
  requestId: number,
  approve: boolean,
) {
  const res = await axios.post(
    `/boards/collaboration/${requestId}/respond`,
    { approve },
    { withCredentials: true },
  );
  return res.data;
}
