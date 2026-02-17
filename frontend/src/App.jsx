import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PostLoginRedirect from "./pages/PostLoginRedirect";

import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GameLobby from "./pages/GameLobby";
import GameRouter from "./pages/GameRouter";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import GameHistory from "./pages/GameHistory";
import ResponsibleGaming from "./pages/ResponsibleGaming";
import PlayerKYC from "./pages/PlayerKYC";
import Deposit from "./pages/Deposit";
import Transactions from "./pages/Transactions";
import Withdraw from "./pages/Withdraw";
import JackpotHub from "./pages/JackpotHub";

import Promotions from "./pages/Promotions";
// Admin Analytics
import AdminAnalyticsGames from "./pages/admin/AdminAnalyticsGames";
import AdminGameDetails from "./pages/admin/AdminGameDetails";

//  Admin Players
import AdminPlayers from "./pages/admin/AdminPlayers";
import AdminPlayerDetails from "./pages/admin/AdminPlayerDetails";
import AdminKYCList from "./pages/admin/AdminKYCList";
import AdminKYCDetails from "./pages/admin/AdminKYCDetails";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import AdminJackpots from "./pages/admin/AdminJackpots";

import AdminBonusProgress from "./pages/admin/AdminBonusProgress";
import AdminBonuses from "./pages/admin/AdminBonuses";
import AdminLayout from "./components/AdminLayout";
import AdminMarketplace from "./pages/admin/AdminMarketplace";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminMyGames from "./pages/admin/AdminMyGames";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminLiveDashboard from "./pages/admin/AdminLiveDashboard";
// ===== OWNER (SUPER ADMIN) =====
import OwnerProfile from "./pages/owner/OwnerProfile";
import OwnerLayout from "./components/OwnerLayout";
import OwnerOverview from "./pages/owner/OwnerOverview";
import OwnerTenants from "./pages/owner/OwnerTenants";
import OwnerTenantCreate from "./pages/owner/OwnerTenantCreate";
import OwnerTenantOverview from "./pages/owner/OwnerTenantOverview";
import OwnerTenantAdmins from "./pages/owner/OwnerTenantAdmins";

import OwnerTenantLayout from "./pages/owner/OwnerTenantLayout";
import OwnerTenantCountries from "./pages/owner/OwnerTenantCountries";
import OwnerTenantGames from "./pages/owner/OwnerTenantGames";



import OwnerGameLayout from "./pages/owner/OwnerGameLayout";
import OwnerGameCountries from "./pages/owner/OwnerGameCountries";
import OwnerGameCurrencies from "./pages/owner/OwnerGameCurrencies";
import OwnerInquiries from "./pages/owner/OwnerInquiries";

import OwnerGameProviders from "./pages/owner/OwnerGameProviders";
import OwnerGames from "./pages/owner/OwnerGames";
import OwnerTenantAnalytics from "./pages/owner/OwnerTenantAnalytics";
import OwnerGameAnalytics from "./pages/owner/OwnerGameAnalytics";
import OwnerTenantProviders from "./pages/owner/OwnerTenantProviders";
import OwnerProviderGames from "./pages/owner/OwnerProviderGames";
import OwnerRequests from "./pages/owner/OwnerRequests";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ========= PUBLIC ========= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/post-login" element={<PostLoginRedirect />} />

        <Route path="/register" element={<Register />} />

        {/* ========= PLAYER / AUTH ========= */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/games" element={<GameLobby />} />
            <Route path="/game/:gameId" element={<GameRouter />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/promotions" element={<Promotions />} /> 
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<GameHistory />} />
            <Route
              path="/responsible-gaming"
              element={<ResponsibleGaming />}
            />
            <Route path="/kyc" element={<PlayerKYC />} />
            <Route path="/jackpots" element={<JackpotHub />} />


          </Route>
        </Route>

        {/* ========= ADMIN ========= */}
        <Route element={<ProtectedRoute allowedRoles={[2]} />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin/analytics/games"
              element={<AdminAnalyticsGames />}
            />
            <Route
              path="/admin/analytics/games/:gameId"
              element={<AdminGameDetails />}
            />
            <Route path="/admin/players" element={<AdminPlayers />} />
            <Route
              path="/admin/players/:playerId"
              element={<AdminPlayerDetails />}
            />
            <Route path="/admin/analytics/live" element={<AdminLiveDashboard />} />
            <Route path="/admin/kyc" element={<AdminKYCList />} />
            <Route path="/admin/kyc/:documentId" element={<AdminKYCDetails />} />
            <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
            <Route path="/admin/marketplace" element={<AdminMarketplace />} />

            <Route path="/admin/requests" element={<AdminRequests />} />
            <Route path="/admin/games" element={<AdminMyGames />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/bonuses" element={<AdminBonuses />} /> 
            <Route path="/admin/bonus-progress" element={<AdminBonusProgress />} />
            <Route path="/admin/jackpots" element={<AdminJackpots />} />
          </Route>



        </Route>

        {/* ========= OWNER / PLATFORM ========= */}
        <Route element={<ProtectedRoute allowedRoles={[4]} />}>
          <Route element={<OwnerLayout />}>
            <Route path="/owner/tenants/create" element={<OwnerTenantCreate />} />
            <Route path="/owner" element={<OwnerOverview />} />
            <Route path="/owner/tenants" element={<OwnerTenants />} />
            <Route path="/owner/profile" element={<OwnerProfile />} />

            <Route path="/owner/game-providers" element={<OwnerGameProviders />}
            />
            <Route path="/owner/game-providers/:providerId/games" element={<OwnerProviderGames />} />
            <Route path="/owner/games" element={<OwnerGames />} />
            <Route path="/owner/games/:gameId" element={<OwnerGameLayout />}>


              <Route path="countries" element={<OwnerGameCountries />} />
              <Route path="currencies" element={<OwnerGameCurrencies />} />
            </Route>

            <Route
              path="/owner/analytics/tenants"
              element={<OwnerTenantAnalytics />}
            />
            <Route path="/owner/inquiries" element={<OwnerInquiries />} />
            <Route
              path="/owner/analytics/games"
              element={<OwnerGameAnalytics />}
            />
            <Route path="/owner/requests" element={<OwnerRequests />} />

            <Route path="/owner/tenants/:tenantId" element={<OwnerTenantLayout />}>
              <Route index element={<OwnerTenantOverview />} />
              <Route path="countries" element={<OwnerTenantCountries />} />

              <Route path="/owner/tenants/:tenantId/admins" element={<OwnerTenantAdmins />} />
              <Route
                path="/owner/tenants/:tenantId/providers"
                element={<OwnerTenantProviders />}
              />
              <Route path="games" element={<OwnerTenantGames />} />
              
              {/* ... inside OwnerLayout ... */}


            </Route>


          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;