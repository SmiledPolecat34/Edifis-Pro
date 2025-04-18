import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./App.css";

import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import PageLayout from "./layout/PageLayout";
import Login from "./pages/login/Login";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import Worker from "./pages/worker/Worker";
import AddWorker from "./pages/worker/AddWorker";
import WorkerDetails from "./pages/worker/WorkerDetails";
import NotFound from "./pages/notFound/NotFound";
import Construction from "./pages/construction/Construction";
import AddConstruction from "./pages/construction/AddConstruction";
import ConstructionDetails from "./pages/construction/ConstructionDetails";
import Missions from "./pages/mission/Missions";
import CreateTask from "./pages/mission/addtask";
import EditTask from "./pages/mission/EditTask";

function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
            <Route element={<ProtectedRoute />}>
                <Route element={<PageLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/missions" element={<Missions />} />
                    <Route path="/addamission" element={<CreateTask />} />
                    <Route path="/editmission/:id" element={<EditTask />} />
                    <Route path="/construction" element={<Construction />} />
                    <Route
                        path="/ConstructionDetails/:id"
                        element={<ConstructionDetails />}
                    />
                    
                    {/* Routes accessibles uniquement aux admins */}
                    <Route element={<ProtectedRoute requiredRoles={["Admin"]} />}>
                        <Route path="/AddConstruction" element={<AddConstruction />} />
                        <Route path="/worker" element={<Worker />} />
                        <Route path="/AddWorker" element={<AddWorker />} />
                        <Route path="/worker/:id" element={<WorkerDetails />} />
                    </Route>
                </Route>
            </Route>

            {!isAuthenticated && <Route path="/login" element={<Login />} />}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
