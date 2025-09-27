import { Button } from "@/components/ui/button";
import { app,auth, db, functions} from "../lib/firebase";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.signOut().then(() => navigate("/login"));
  };

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
      <div className="p-10 bg-card rounded-lg border">
        <h2 className="text-xl font-semibold">Welcome, Learner!</h2>
        <p className="text-muted-foreground mt-2">
          This is where you will browse, enroll, and take courses. This section is still under construction.
        </p>
      </div>
    </div>
  );
};

export default UserDashboard;