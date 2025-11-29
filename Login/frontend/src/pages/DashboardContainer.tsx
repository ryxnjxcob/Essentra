import React, { useEffect, useState } from "react";
import axios from "axios";
import Dashboard from "./Dashboard";

const DashboardContainer = ({ user }: any) => {
  const [boards, setBoards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadBoards() {
    try {
      const res = await axios.get("/api/boards", { withCredentials: true });
      setBoards(res.data); // backend returns list of boards
    } catch (e) {
      console.error("Failed to load boards", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadBoards();
  }, []);

  function onCreateBoard(title: string, type: string) {
    axios
      .post("/api/boards", { title, type }, { withCredentials: true })
      .then(() => loadBoards());
  }

  function onJoinBoard(code: string) {
    axios
      .post("/api/boards/join", { code }, { withCredentials: true })
      .then(() => loadBoards());
  }

  function onDeleteBoard(id: string) {
    axios
      .delete(`/api/boards/${id}`, { withCredentials: true })
      .then(() => loadBoards());
  }

  function onOpenBoard(id: string) {
    window.location.href = `/app/board/${id}`;
  }

  if (loading) return <div />;

  return (
    <Dashboard
      boards={boards}
      user={user}
      onCreateBoard={onCreateBoard}
      onJoinBoard={onJoinBoard}
      onDeleteBoard={onDeleteBoard}
      onOpenBoard={onOpenBoard}
    />
  );
};

export default DashboardContainer;
