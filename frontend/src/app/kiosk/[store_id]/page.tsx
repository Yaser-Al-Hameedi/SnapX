"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Employee {
  id: string;
  name: string;
  last_name: string;
  hourly_rate: number;
  store_id: string;
}

interface Shift {
  id: string;
  employee_id: string;
  clock_in: string;
  clock_out: string | null;
}

async function getToken() {
  const { supabase } = await import("@/lib/supabase");
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

function hoursWorked(clock_in: string, clock_out: string | null): number | null {
  if (!clock_out) return null;
  return (new Date(clock_out).getTime() - new Date(clock_in).getTime()) / 3_600_000;
}

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], { month: "numeric", day: "numeric", hour: "numeric", minute: "2-digit" });
}

interface WeekGroup { label: string; shifts: Shift[] }

function groupByWeek(shifts: Shift[]): WeekGroup[] {
  const map = new Map<string, Shift[]>();
  for (const s of shifts) {
    const d = new Date(s.clock_in);
    const day = d.getDay();
    const toMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + toMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const key = monday.toISOString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.entries())
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .map(([key, shifts]) => {
      const monday = new Date(key);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
      const label = `${monday.toLocaleDateString([], opts)} – ${sunday.toLocaleDateString([], opts)}`;
      return { label, shifts };
    });
}

export default function KioskPage() {
  const params = useParams();
  const router = useRouter();
  const store_id = params.store_id as string;

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [addingShift, setAddingShift] = useState(false);
  const [shiftForm, setShiftForm] = useState({ clock_in: "", clock_out: "" });
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const maxDatetime = now.toISOString().slice(0, 16);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);

  async function fetchEmployees() {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees/${store_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setEmployees(Array.isArray(data) ? data : []);
  }

  async function fetchShifts(employeeId: string) {
    const token = await getToken();
    if (!token) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/shifts?store_id=${store_id}&employee_id=${employeeId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    const sorted = Array.isArray(data)
      ? [...data].sort((a, b) => new Date(b.clock_in).getTime() - new Date(a.clock_in).getTime())
      : [];
    setShifts(sorted);
  }

  async function handleLogShift() {
    if (!selectedEmployee || !shiftForm.clock_in || !shiftForm.clock_out) return;
    const token = await getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        employee_id: selectedEmployee.id,
        store_id,
        clock_in: new Date(shiftForm.clock_in).toISOString(),
        clock_out: new Date(shiftForm.clock_out).toISOString(),
      }),
    });
    setShiftForm({ clock_in: "", clock_out: "" });
    setAddingShift(false);
    fetchShifts(selectedEmployee.id);
  }

  async function handleDeleteShift(shiftId: string) {
    const token = await getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/shifts?shift_id=${shiftId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (selectedEmployee) fetchShifts(selectedEmployee.id);
  }

  function handleSelectEmployee(emp: Employee) {
    setSelectedEmployee(emp);
    fetchShifts(emp.id);
    setAddingShift(false);
  }

  function handleAdminMode() {
    const stored = localStorage.getItem(`kiosk_pin_${store_id}`);
    if (!stored) {
      router.push(`/bookkeeping/${store_id}`);
      return;
    }
    if (pinInput === stored) {
      router.push(`/bookkeeping/${store_id}`);
    } else {
      setPinError(true);
      setPinInput("");
    }
  }

  useEffect(() => { fetchEmployees(); }, [store_id]);

  return (
    <ProtectedRoute>
      <main className="container py-12 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Employee Hours</h1>
            <p className="text-slate-500 text-sm mt-1">
              {selectedEmployee ? `${selectedEmployee.name} ${selectedEmployee.last_name}` : "Select your name to log your shift"}
            </p>
          </div>
          <button
            onClick={() => { setShowPinModal(true); setPinError(false); setPinInput(""); }}
            className="btn text-sm border border-slate-200 text-slate-500 hover:text-slate-900"
          >
            Admin Mode
          </button>
        </div>

        {/* Employee grid */}
        {!selectedEmployee ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {employees.map(emp => (
              <button
                key={emp.id}
                onClick={() => handleSelectEmployee(emp)}
                className="card p-6 text-left hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-200 cursor-pointer"
              >
                <p className="text-lg font-bold">{emp.name}</p>
                <p className="text-sm text-slate-400 group-hover:text-slate-300">{emp.last_name}</p>
              </button>
            ))}
            {employees.length === 0 && (
              <p className="text-slate-400 text-sm col-span-full">No employees added yet. Ask your admin to add employees.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setSelectedEmployee(null); setShifts([]); setAddingShift(false); }}
                className="text-slate-400 hover:text-slate-900 text-sm cursor-pointer transition-colors"
              >
                ← All Employees
              </button>
              <button onClick={() => setAddingShift(!addingShift)} className="btn btn-primary text-sm ml-auto">
                {addingShift ? "Cancel" : "+ Log Shift"}
              </button>
            </div>

            {addingShift && (
              <div className="card p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm text-slate-600 block mb-1">Clock In</label>
                    <input
                      type="datetime-local"
                      value={shiftForm.clock_in}
                      max={maxDatetime}
                      onChange={(e) => setShiftForm(f => ({ ...f, clock_in: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 block mb-1">Clock Out</label>
                    <input
                      type="datetime-local"
                      value={shiftForm.clock_out}
                      max={maxDatetime}
                      onChange={(e) => setShiftForm(f => ({ ...f, clock_out: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button onClick={handleLogShift} className="btn btn-primary">Save Shift</button>
                  </div>
                </div>
              </div>
            )}

            {shifts.length > 0 ? (
              <div className="space-y-6">
                {groupByWeek(shifts).map(({ label, shifts: weekShifts }) => {
                  const weekHours = weekShifts.reduce((sum, s) => sum + (hoursWorked(s.clock_in, s.clock_out) ?? 0), 0);
                  const weekWages = weekHours * selectedEmployee.hourly_rate;
                  return (
                    <div key={label} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Week of {label}</span>
                      </div>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b text-left text-slate-500">
                            <th className="py-2 px-4 font-medium">Clock In</th>
                            <th className="py-2 px-4 font-medium">Clock Out</th>
                            <th className="py-2 px-4 font-medium">Hours</th>
                            <th className="py-2 px-4 font-medium">Wages</th>
                            <th className="py-2 px-4"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {weekShifts.map(shift => {
                            const h = hoursWorked(shift.clock_in, shift.clock_out);
                            return (
                              <tr key={shift.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-2 px-4">{fmt(shift.clock_in)}</td>
                                <td className="py-2 px-4">{shift.clock_out ? fmt(shift.clock_out) : "—"}</td>
                                <td className="py-2 px-4">{h !== null ? `${h.toFixed(2)}h` : "In progress"}</td>
                                <td className="py-2 px-4">{h !== null ? `$${(h * selectedEmployee.hourly_rate).toFixed(2)}` : "—"}</td>
                                <td className="py-2 px-4 text-right">
                                  <button onClick={() => handleDeleteShift(shift.id)} className="text-red-400 hover:text-red-600 text-xs cursor-pointer">Delete</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                            <td className="py-2 px-4 text-slate-500 text-xs uppercase tracking-wide" colSpan={2}>Weekly Total</td>
                            <td className="py-2 px-4">{weekHours.toFixed(2)}h</td>
                            <td className="py-2 px-4 text-green-700">${weekWages.toFixed(2)}</td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No shifts logged yet.</p>
            )}
          </div>
        )}

        {/* PIN modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-sm space-y-4 shadow-xl">
              <h2 className="text-lg font-bold">Admin Mode</h2>
              <p className="text-sm text-slate-500">Enter your PIN to access the full app.</p>
              <input
                autoFocus
                type="password"
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value); setPinError(false); }}
                onKeyDown={(e) => e.key === "Enter" && handleAdminMode()}
                className="input"
                placeholder="Enter PIN..."
              />
              {pinError && <p className="text-red-500 text-sm">Incorrect PIN.</p>}
              <div className="flex gap-3">
                <button onClick={handleAdminMode} className="btn btn-primary flex-1">Confirm</button>
                <button onClick={() => setShowPinModal(false)} className="btn border border-slate-200 flex-1">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
