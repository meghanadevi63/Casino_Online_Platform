import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PostLoginRedirect = () => {
  const { user, loadingUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (loadingUser) return;

    //  Not authenticated
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    // ROLE-BASED REDIRECT
    switch (user.role_id) {
      case 4: // PLATFORM OWNER
        navigate("/owner", { replace: true });
        break;

      case 2: // TENANT ADMIN
        navigate("/admin/analytics/live", { replace: true });
        break;
      case 1: // PLAYER
        navigate("/dashboard", { replace: true }); 
        break;

      default: 
        navigate("/login", { replace: true });
    }
  }, [user, loadingUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Redirecting...
    </div>
  );
};

export default PostLoginRedirect;
