// src/pages/DashboardContainer.tsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import Dashboard from "./Dashboard";
import { Board as UiBoard, ProjectType } from "@/types";

import { fetchBoards, createBoard, deleteBoard, BoardDTO } from "@/api/boards";

import { fetchRequests, approveRequest, rejectRequest } from "@/api/requests";

interface DashboardContainerProps {
  user: any;
}

const DashboardContainer: React.FC<DashboardContainerProps> = ({ user }) => {
  const navigate = useNavigate();

  const [boards, setBoards] = useState<UiBoard[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // WebSocket reference
  const wsRef = useRef<WebSocket | null>(null);

  // ---------------------------
  // Converters
  // ---------------------------
  const mapDtoToUi = (dto: BoardDTO): UiBoard => ({
    id: String(dto.id),
    title: dto.title,
    type: "canvas",
    notes: [],
    collaborators: [],
    shareCode: dto.collaboration_code || "NO-CODE",
    createdAt: new Date().toISOString(),
  });

  // ---------------------------
  // Refetch boards + requests
  // ---------------------------
  const loadDashboard = async () => {
    try {
      const [boardData, requestData] = await Promise.all([
        fetchBoards(),
        fetchRequests(),
      ]);

      setBoards(boardData.map(mapDtoToUi));
      setRequests(requestData);
    } catch (err) {
      console.error("Dashboard reload error:", err);
    }
  };

  // ---------------------------
  // Initial Load
  // ---------------------------
  useEffect(() => {
    (async () => {
      try {
        const [boardData, requestData] = await Promise.all([
          fetchBoards(),
          fetchRequests(),
        ]);

        setBoards(boardData.map(mapDtoToUi));
        setRequests(requestData);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------------------------
  // Create Board
  // ---------------------------
  const handleCreateBoard = async (title: string, type: ProjectType) => {
    try {
      const dto = await createBoard({ title });
      setBoards((prev) => [...prev, mapDtoToUi(dto)]);
    } catch (err) {
      console.error("Create board error:", err);
      alert("Failed to create board.");
    }
  };

  // ---------------------------
  // Join Board
  // ---------------------------
  const handleJoinBoard = async (code: string) => {
    try {
      const { requestBoardAccess } = await import("@/api/boards");
      await requestBoardAccess(code);

      alert("Request sent to board owner!");
    } catch (err) {
      console.error("Join board error:", err);
      alert("Invalid code or request failed.");
    }
  };

  // ---------------------------
  // Delete
  // ---------------------------
  const handleDeleteBoard = async (id: string) => {
    if (!confirm("Delete this board?")) return;

    try {
      await deleteBoard(Number(id));
      setBoards((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete board.");
    }
  };

  // ---------------------------
  // Open Board
  // ---------------------------
  const handleOpenBoard = (id: string) => {
    navigate(`/app/board/${id}`);
  };

  // ---------------------------
  // Approve / Reject
  // ---------------------------
  const handleApprove = async (reqId: number) => {
    await approveRequest(reqId);
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  const handleReject = async (reqId: number) => {
    await rejectRequest(reqId);
    setRequests((prev) => prev.filter((r) => r.id !== reqId));
  };

  // ---------------------------
  // WebSocket (will activate fully in Part 2)
  // ---------------------------
  useEffect(() => {
    if (!user) return;

    const ws = new WebSocket(
      `${window.location.origin.replace("http", "ws")}/ws/notifications/${user.id}`,
    );

    wsRef.current = ws;

    ws.onopen = () => console.log("WS Connected (Dashboard)");
    ws.onclose = () => console.log("WS Closed");
    ws.onerror = (e) => console.error("WS Error:", e);

    ws.onmessage = (msg) => {
      try {
        const data = JSON.parse(msg.data);

        if (data.type === "access_request") {
          setRequests((prev) => [...prev, data]);
        }

        if (data.type === "access_response") {
          // future use
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    return () => ws.close();
  }, [user]);

  // ---------------------------
  // UI
  // ---------------------------
  if (loading) {
    return (
      <div className="w-full h-[calc(100vh-80px)] flex items-center justify-center text-muted-foreground">
        Loading workspace…
      </div>
    );
  }

  return (
    <Dashboard
      boards={boards}
      user={user}
      onCreateBoard={handleCreateBoard}
      onJoinBoard={handleJoinBoard}
      onDeleteBoard={handleDeleteBoard}
      onOpenBoard={handleOpenBoard}
      requests={requests}
      onApproveRequest={handleApprove}
      onRejectRequest={handleReject}
    />
  );
};

export default DashboardContainer;
