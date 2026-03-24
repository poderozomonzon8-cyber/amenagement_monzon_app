import { useState, useMemo } from "react";
import { Users, ShieldCheck, EnvelopeSimple, MagnifyingGlass } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@animaapp/playground-react-sdk";
import { Role, setStoredRole } from "@/contexts/AuthContext";

const ROLES: Role[] = ["admin","manager","employee","accountant","client"];

const ROLE_BADGE: Record<Role, string> = {
  admin:      "bg-gold/20 text-gold",
  manager:    "bg-blue-100 text-blue-700",
  employee:   "bg-purple-100 text-purple-700",
  accountant: "bg-emerald-100 text-emerald-700",
  client:     "bg-gray-100 text-gray-600",
  guest:      "bg-gray-100 text-gray-400",
};

const ROLE_COLOR: Record<Role, string> = {
  admin: "bg-gold/30",
  manager: "bg-blue-200",
  employee: "bg-purple-200",
  accountant: "bg-emerald-200",
  client: "bg-gray-200",
  guest: "bg-gray-300",
};

export default function UserManagerPanel() {
  type EmployeeData = { id: string; firstName: string; lastName: string; email: string; roleLevel?: Role };
type ClientData   = { id: string; contactPerson: string; email?: string };

// Guardamos data sin desestructurar
const employeeQuery = useQuery("Employee", { orderBy: { lastName: "asc" } });
const clientQuery   = useQuery("Client", { orderBy: { createdAt: "desc" } });

// Tipamos la data extraída
const employees: EmployeeData[] = (employeeQuery.data ?? []) as EmployeeData[];
const clients: ClientData[]     = (clientQuery.data ?? []) as ClientData[];
const ePending = employeeQuery.isPending;
const cPending = clientQuery.isPending;
  const [search, setSearch] = useState("");
  const [assignedRoles, setAssignedRoles] = useState<Record<string, Role>>({});
  const [flashId, setFlashId] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");

  const handleAssignRole = (email: string, role: Role) => {
    if (!email) return;
    setStoredRole(email, role);
    setAssignedRoles(prev => ({ ...prev, [email]: role }));
    setFlashId(email);
    setTimeout(() => setFlashId(null), 1800);
  };

  
  type UserRow = { id: string; name: string; email: string; type: "employee" | "client"; role: Role };
  const allUsers: UserRow[] = [
    ...(employees).map(e => ({
  id: e.id,
  name: `${e.firstName} ${e.lastName}`,
  email: e.email,
  type: "employee" as const,
  role: (assignedRoles[e.email] ?? (e.roleLevel as Role)) ?? "employee",
})),

...(clients).map(c => ({
  id: c.id,
  name: c.contactPerson,
  email: c.email ?? "",
  type: "client" as const,
  role: (c.email ? assignedRoles[c.email] : undefined) ?? "client",
})),
  ];

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      if (roleFilter && u.role !== roleFilter) return false;
      if (typeFilter && u.type !== typeFilter) return false;
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });
  }, [allUsers, search, roleFilter, typeFilter]);

  const isPending = cPending || ePending;

  const exportCSV = (users: UserRow[]) => {
    const csv = [
      ["Name", "Email", "Type", "Role"],
      ...users.map(u => [u.name, u.email, u.type, u.role])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "users.csv");
    link.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="font-headline font-bold text-2xl text-charcoal">User Manager</h1>
          <p className="font-sans text-sm text-gray-500 mt-1">View all system users and manage their access roles.</p>
        </div>
        <button
          className="px-3 py-1 text-xs bg-gold text-white rounded-xl hover:bg-gold/80"
          onClick={() => exportCSV(filteredUsers)}
        >
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select
          className="px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="employee">Employee</option>
          <option value="client">Client</option>
        </select>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm font-sans bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-charcoal/30" />
      </div>

      <Card className="bg-white border-gray-200 shadow-sm">
        <CardContent className="p-0">
          {isPending ? (
            <div className="flex items-center justify-center py-16">
              <span className="w-7 h-7 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={28} weight="regular" className="text-gray-300 mb-2" />
              <p className="font-sans text-sm text-gray-400">No users found.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Admin row */}
              <div className="flex items-center justify-between px-6 py-4 bg-gold/5">
                <div className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <span className="font-headline font-bold text-xs text-gold">S</span>
                  </div>
                  <div>
                    <p className="font-sans font-medium text-sm text-charcoal">Silviol Monzon</p>
                    <p className="font-mono text-[10px] text-gray-400">silviolmonzon@amenagementmonzon.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-gold/20 text-gold">Admin</span>
                  <span className="px-2.5 py-1 text-[10px] font-mono rounded-full bg-gray-100 text-gray-500">System</span>
                </div>
              </div>

              {filteredUsers.map(u => (
                <div key={u.id} className={`relative group flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors ${flashId === u.email ? "bg-emerald-50" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${ROLE_COLOR[u.role]}`}>
                      <span className="font-headline font-bold text-xs text-gray-700">{u.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-sans font-medium text-sm text-charcoal">{u.name}</p>
                      <p className="font-mono text-[10px] text-gray-400">{u.email || "No email"} · <span className="capitalize">{u.type}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end relative">
                    <span className={`px-2.5 py-1 text-[10px] font-mono rounded-full capitalize transition-all ${ROLE_BADGE[u.role] ?? ROLE_BADGE.client}`}>
                      {u.role}
                    </span>
                    {u.email && (
                      <select
                        value={u.role}
                        onChange={e => handleAssignRole(u.email, e.target.value as Role)}
                        className="px-2.5 py-1.5 text-xs font-sans border border-gray-200 rounded-xl bg-white text-gray-500 focus:outline-none focus:border-charcoal/30 cursor-pointer"
                      >
                        {ROLES.map(r => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    )}
                    {flashId === u.email && <span className="text-emerald-500 text-[10px] font-mono">✓ Saved</span>}

                    {/* Hover quick actions */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 bg-gray-100 rounded hover:bg-blue-200">
                        <EnvelopeSimple size={14} />
                      </button>
                      <button className="p-1 bg-gray-100 rounded hover:bg-red-200" onClick={() => handleAssignRole(u.email, "client")}>
                        <ShieldCheck size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
