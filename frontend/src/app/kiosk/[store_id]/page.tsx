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

function hoursWorked(clock_in: string, clock_out: string | null) {
  if (!clock_out) return "In progress";
  const h = (new Date(clock_out).getTime() - new Date(clock_in).getTime()) / 3_600_000;
  return `${h.toFixed(2)}h`;
}

function wagesEarned(clock_in: string, clock_out: string | null, rate: number) {
  if (!clock_out) return "—";
  const h = (new Date(clock_out).getTime() - new Date(clock_in).getTime()) / 3_600_000;
  return `$${(h * rate).toFixed(2)}`;
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
    setShifts(Array.isArray(data) ? data : []);
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
        clock_in: shiftForm.clock_in,
        clock_out: shiftForm.clock_out,
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
                      onChange={(e) => setShiftForm(f => ({ ...f, clock_in: e.target.value }))}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-600 block mb-1">Clock Out</label>
                    <input
                      type="datetime-local"
                      value={shiftForm.clock_out}
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
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-slate-500 bg-slate-50">
                      <th className="py-2 px-4 font-medium">Clock In</th>
                      <th className="py-2 px-4 font-medium">Clock Out</th>
                      <th className="py-2 px-4 font-medium">Hours</th>
                      <th className="py-2 px-4 font-medium">Wages</th>
                      <th className="py-2 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {shifts.map(shift => (
                      <tr key={shift.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-2 px-4">{new Date(shift.clock_in).toLocaleString()}</td>
                        <td className="py-2 px-4">{shift.clock_out ? new Date(shift.clock_out).toLocaleString() : "—"}</td>
                        <td className="py-2 px-4">{hoursWorked(shift.clock_in, shift.clock_out)}</td>
                        <td className="py-2 px-4">{wagesEarned(shift.clock_in, shift.clock_out, selectedEmployee.hourly_rate)}</td>
                        <td className="py-2 px-4 text-right">
                          <button onClick={() => handleDeleteShift(shift.id)} className="text-red-400 hover:text-red-600 text-xs cursor-pointer">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
