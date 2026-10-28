"use client";

import React, { useState, useEffect } from "react";
import { Users, UserPlus, Shield, Mail, Phone, Search, Filter, ShieldCheck, Clock, CheckCircle, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users");

  // New User Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleName, setRoleName] = useState("SALES_EXECUTIVE");
  const [creating, setCreating] = useState(false);

  const fetchUsers = () => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, roleName }),
      });
      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFullName("");
        setEmail("");
        setPhone("");
        fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || u.roles.includes(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-500" />
            <span>User Management & RBAC Permissions</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Control team accounts, role-based access levels, and security audit logs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md shadow-brand-600/30 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab("users")}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === "users"
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Active Team Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-xs font-bold transition border-b-2 ${
            activeTab === "audit"
              ? "border-brand-500 text-brand-500"
              : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
          }`}
        >
          Security Audit Logs
        </button>
      </div>

      {activeTab === "users" ? (
        <>
          {/* Controls bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search user name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Filter className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-brand-500"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                <option value="COMPANY_ADMIN">COMPANY_ADMIN</option>
                <option value="SALES_MANAGER">SALES_MANAGER</option>
                <option value="SALES_EXECUTIVE">SALES_EXECUTIVE</option>
                <option value="ACCOUNTANT">ACCOUNTANT</option>
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="glass-panel rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-500 font-bold flex items-center justify-center text-xs">
                          {user.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{user.fullName}</div>
                          <div className="text-[10px] text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300">
                      {user.phone || "+91 98765 43210"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20">
                        {user.roles.join(", ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1 w-fit">
                        <CheckCircle className="w-3 h-3" />
                        <span>{user.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Audit Log Section */
        <div className="glass-panel p-6 rounded-3xl space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>System Access & Security Log</span>
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-white">LOGIN Success</span> - Alex Distributor (admin@movieflow.com)
              </div>
              <span className="text-gray-500 text-[10px]">Today, 19:42:37</span>
            </div>
            <div className="p-3 rounded-xl bg-gray-900/60 border border-gray-800 flex justify-between items-center">
              <div>
                <span className="font-semibold text-white">DEAL_UPDATE</span> - Modified MG terms for Deal #DEAL-2026-001
              </div>
              <span className="text-gray-500 text-[10px]">Today, 18:30:12</span>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">
                Invite Team Member
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Rahul Sharma"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul@company.com"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">System Role</label>
                <select
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
                >
                  <option value="COMPANY_ADMIN">Company Admin</option>
                  <option value="SALES_MANAGER">Sales Manager</option>
                  <option value="SALES_EXECUTIVE">Sales Executive</option>
                  <option value="DISTRIBUTOR">Distributor Rep</option>
                  <option value="THEATER_OWNER">Theater Owner</option>
                  <option value="ACCOUNTANT">Accountant</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md"
                >
                  {creating ? "Adding..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
