/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ATCGame from "./components/ATCGame";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6 text-emerald-400" dir="rtl">
        کنترل ترافیک هوایی فرودگاه دبی (DXB)
      </h1>
      <ATCGame />
    </div>
  );
}
