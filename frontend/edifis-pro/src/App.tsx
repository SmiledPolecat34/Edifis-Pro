    import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import "./App.css";

import ProtectedRoute from "./components/protectedRoute/ProtectedRoute";
import PageLayout from "./layout/PageLayout";
import Login from "./pages/login/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Register from "./pages/auth/Register";
import Home from "./pages/home/Home";
import Profile from "./pages/profile/Profile";
import Worker from "./pages/worker/Worker";
import AddWorker from "./pages/worker/AddWorker";
import EditWorker from "./pages/worker/EditWorker";
import WorkerDetails from "./pages/worker/WorkerDetails";
import NotFound from "./pages/notFound/NotFound";
import Construction from "./pages/construction/Construction";
import AddConstruction from "./pages/construction/AddConstruction";
import ConstructionDetails from "./pages/construction/ConstructionDetails";
import Missions from "./pages/mission/Missions";
import CreateTask from "./pages/mission/addtask";
import EditTask from "./pages/mission/EditTask";
import UserDetail from "./pages/user/UserDetail";
import { ManageCompetences } from "./pages/competence/ManageCompetences";
import AddCompetence    from "./pages/competence/AddCompetence";
import EditCompetence   from "./pages/competence/EditCompetence";


function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<PageLayout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/missions" element={<Missions />} />
                    <Route path="/addamission" element={<CreateTask />} />
                    <Route path="/construction" element={<Construction />} />
                    <Route path="/ConstructionDetails/:id" element={<ConstructionDetails />} />
                    <Route path="/user/:id" element={<UserDetail />} />
                    <Route path="/competences" element={<ManageCompetences />} />
                    <Route path="/competences/add" element={<AddCompetence />} />
                    <Route path="/competences/edit/:id" element={<EditCompetence />} />
                    <Route path="/AddTask" element={<CreateTask />} />

                    {/* Admin and Manager only */}
                    <Route element={<ProtectedRoute allowedRoles={["Admin", "Manager"]} />}>
                        <Route path="/editmission/:id" element={<EditTask />} />
                    </Route>

                    {/* Admin and HR only */}
                    <Route element={<ProtectedRoute allowedRoles={["Admin", "HR"]} />}>
                        <Route path="/AddConstruction" element={<AddConstruction />} />
                        <Route path="/workers" element={<Worker />} />
                        <Route path="/workers/add" element={<AddWorker />} />
                        <Route path="/workers/edit/:id" element={<EditWorker />} />
                        <Route path="/workers/:id" element={<WorkerDetails />} />
                    </Route>
                </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default App;
