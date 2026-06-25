"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import AdminTable, { Column, TableAction } from "@/components/admin/AdminTable";
import { ShieldCheck, UserCheck, AlertTriangle, Key, Save, Check } from "lucide-react";

interface AdminUserRecord {
  id: string;
  name: string;
  role_type: "admin" | "super_admin" | "content_editor" | "operations" | "finance" | "sales";
  email: string;
  created_at: string;
}

const defaultPermissionsMatrix = {
  super_admin: { read_catalog: true, write_catalog: true, review_ai: true, manage_leads: true, manage_finance: true, update_settings: true },
  admin: { read_catalog: true, write_catalog: true, review_ai: true, manage_leads: true, manage_finance: false, update_settings: true },
  content_editor: { read_catalog: true, write_catalog: true, review_ai: true, manage_leads: false, manage_finance: false, update_settings: false },
  operations: { read_catalog: true, write_catalog: false, review_ai: false, manage_leads: true, manage_finance: false, update_settings: false },
  sales: { read_catalog: true, write_catalog: false, review_ai: false, manage_leads: true, manage_finance: false, update_settings: false },
  finance: { read_catalog: false, write_catalog: false, review_ai: false, manage_leads: false, manage_finance: true, update_settings: false }
};

export default function UsersRBACAdmin() {
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [matrix, setMatrix] = useState(defaultPermissionsMatrix);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [formRole, setFormRole] = useState<AdminUserRecord["role_type"]>("admin");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("admins")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      const formatted: AdminUserRecord[] = (data || []).map((row: any) => ({
        id: row.id,
        name: row.name,
        role_type: row.role_type || "content_editor",
        email: `${row.name.toLowerCase().replace(/ /g, ".")}@journey.os`,
        created_at: row.created_at
      }));

      setUsers(formatted);
    } catch (err: any) {
      console.warn("Admins DB query failed, loading mock accounts:", err.message);
      setUsers([
        {
          id: "usr-1",
          name: "Sarah Andrews",
          role_type: "super_admin",
          email: "sarah.andrews@journey.os",
          created_at: new Date(Date.now() - 31536000000).toISOString()
        },
        {
          id: "usr-2",
          name: "Daniel Craig",
          role_type: "content_editor",
          email: "daniel.craig@journey.os",
          created_at: new Date(Date.now() - 15768000000).toISOString()
        },
        {
          id: "usr-3",
          name: "Marcus Aurelius",
          role_type: "sales",
          email: "marcus@journey.os",
          created_at: new Date(Date.now() - 864000000).toISOString()
        },
        {
          id: "usr-4",
          name: "Fiona Gallagher",
          role_type: "finance",
          email: "fiona.g@journey.os",
          created_at: new Date(Date.now() - 432000000).toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditRole = (usr: AdminUserRecord) => {
    setSelectedUser(usr);
    setFormRole(usr.role_type);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const { error } = await supabase
        .from("admins")
        .update({ role_type: formRole })
        .eq("id", selectedUser.id);

      if (error) throw error;

      setSuccessMsg(`Successfully updated role for ${selectedUser.name}.`);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      // client update fallback
      setUsers(prev =>
        prev.map(u => (u.id === selectedUser.id ? { ...u, role_type: formRole } : u))
      );
      setSuccessMsg(`Mock Action: Successfully updated role for ${selectedUser.name}.`);
      setSelectedUser(null);
    }
  };

  const toggleMatrixPermission = (role: keyof typeof defaultPermissionsMatrix, perm: string) => {
    setMatrix(prev => {
      const rolePerms = prev[role] as any;
      return {
        ...prev,
        [role]: {
          ...rolePerms,
          [perm]: !rolePerms[perm]
        }
      };
    });
    setSuccessMsg(`Permission grid updated temporarily.`);
    setTimeout(() => setSuccessMsg(""), 2000);
  };

  const columns: Column<AdminUserRecord>[] = [
    { header: "Staff Member", key: "name", sortable: true },
    { header: "Email Address", key: "email", sortable: true },
    {
      header: "Access Role",
      key: "role_type",
      render: (row) => (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sand border border-border/40 font-mono text-ink-indigo">
          {row.role_type.replace(/_/g, " ")}
        </span>
      ),
      sortable: true
    },
    { header: "Granted Date", key: "created_at", render: (row) => new Date(row.created_at).toLocaleDateString() }
  ];

  const actions: TableAction<AdminUserRecord>[] = [
    { label: "Modify Role", onClick: handleEditRole, className: "text-marigold" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display text-ink-indigo">User Access & Role Management (RBAC)</h1>
        <p className="text-xs text-dusk-teal mt-0.5">
          Establish operational, financial, content editing, and system administration permissions.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Split Section: Staff Roles left, edit & permissions grid right */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          <AdminTable
            data={users}
            columns={columns}
            searchKey="name"
            searchPlaceholder="Search staff profiles..."
            actions={actions}
            exportFileName="staff_access_control"
          />

          {/* Permissions Matrix Grid */}
          <div className="bg-white border border-border/40 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border/20 pb-3">
              <Key className="w-4.5 h-4.5 text-marigold" />
              <h3 className="text-sm font-bold text-ink-indigo font-display">Permissions Matrix Schema</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-sand/30 border-b border-border/30">
                    <th className="p-3 font-bold text-ink-indigo">Access Role</th>
                    <th className="p-3 font-bold text-ink-indigo text-center">Read Catalog</th>
                    <th className="p-3 font-bold text-ink-indigo text-center">Write Catalog</th>
                    <th className="p-3 font-bold text-ink-indigo text-center">Review AI</th>
                    <th className="p-3 font-bold text-ink-indigo text-center">Manage Leads</th>
                    <th className="p-3 font-bold text-ink-indigo text-center">Manage Finance</th>
                    <th className="p-3 font-bold text-ink-indigo text-center">Update Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {Object.keys(matrix).map((roleKey) => {
                    const role = roleKey as keyof typeof defaultPermissionsMatrix;
                    const perms = matrix[role];
                    return (
                      <tr key={role} className="hover:bg-sand/10 transition">
                        <td className="p-3 font-bold uppercase text-deep-charcoal text-[10px] tracking-wider">
                          {role.replace(/_/g, " ")}
                        </td>
                        {Object.keys(perms).map((permKey) => (
                          <td key={permKey} className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={(perms as any)[permKey]}
                              onChange={() => toggleMatrixPermission(role, permKey)}
                              className="accent-marigold cursor-pointer"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Edit Role Side Card */}
        {selectedUser && (
          <div className="bg-white border border-border/40 p-6 rounded-xl shadow-sm space-y-4 animate-fade-in text-xs">
            <div className="flex justify-between items-center border-b border-border/20 pb-3">
              <h3 className="text-sm font-bold text-ink-indigo font-display">Modify Staff Role</h3>
              <button onClick={() => setSelectedUser(null)} className="text-dusk-teal/60 hover:text-ink-indigo font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRole} className="space-y-4">
              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Staff Member Name</label>
                <input
                  type="text"
                  value={selectedUser.name}
                  disabled
                  className="w-full px-3 py-2 border border-border/60 rounded-lg bg-sand/35 text-dusk-teal focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Email Address</label>
                <input
                  type="text"
                  value={selectedUser.email}
                  disabled
                  className="w-full px-3 py-2 border border-border/60 rounded-lg bg-sand/35 text-dusk-teal focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-deep-charcoal mb-1">Assign Role Permissions Scope</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as AdminUserRecord["role_type"])}
                  className="w-full px-3 py-2 border border-border/60 rounded-lg bg-white focus:outline-none focus:border-marigold text-xs font-semibold text-ink-indigo"
                >
                  <option value="super_admin">Super Admin (All Permissions)</option>
                  <option value="admin">Admin (Operational Control)</option>
                  <option value="content_editor">Content Editor (Catalog & AI Review)</option>
                  <option value="operations">Operations (Lead and Stay Management)</option>
                  <option value="sales">Sales Representative (CRM Lead outreach)</option>
                  <option value="finance">Finance Auditor (Pricing & Margins)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-marigold hover:bg-marigold/90 text-white rounded-lg py-2.5 font-semibold transition text-center flex items-center justify-center gap-1"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Update Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 border border-border rounded-lg py-2.5 hover:bg-sand/30 transition text-center"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
