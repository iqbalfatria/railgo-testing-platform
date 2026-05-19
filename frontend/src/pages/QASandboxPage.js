import { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import { qaAPI } from '../services/api';
import toast from 'react-hot-toast';

const SandboxCard = ({ id, title, desc, children, badge }) => (
  <div
    id={`sandbox-card-${id}`}
    data-testid={`sandbox-card-${id}`}
    className="card"
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-bold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
      </div>
      {badge && <span className="badge-info text-xs shrink-0">{badge}</span>}
    </div>
    {children}
  </div>
);

const QASandboxPage = () => {
  const [states, setStates] = useState({
    slowResponse: false,
    randomFail: false,
    infiniteLoading: false,
    duplicateCount: 0,
    brokenForm: { email: '', submitted: false },
    disabledBtn: false,
    hiddenBtn: false,
    sessionResult: null,
  });

  const [results, setResults] = useState({});

  const set = (key, val) => setStates(prev => ({ ...prev, [key]: val }));
  const setResult = (key, val) => setResults(prev => ({ ...prev, [key]: val }));

  // 1. Slow Response
  const handleSlowResponse = async () => {
    set('slowResponse', true);
    setResult('slow', null);
    try {
      const res = await qaAPI.slowResponse();
      setResult('slow', { success: true, msg: res.data.message });
      toast.success('Slow response received!');
    } catch (err) {
      setResult('slow', { success: false, msg: 'Request failed or timed out' });
      toast.error('Request failed');
    } finally {
      set('slowResponse', false);
    }
  };

  // 2. Random Fail
  const handleRandomFail = async () => {
    set('randomFail', true);
    setResult('random', null);
    try {
      const res = await qaAPI.randomFail();
      setResult('random', { success: true, msg: res.data.message });
      toast.success('Request succeeded!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Random failure occurred';
      setResult('random', { success: false, msg });
      toast.error(msg);
    } finally {
      set('randomFail', false);
    }
  };

  // 3. Session Expired
  const handleSessionExpired = async () => {
    try {
      await qaAPI.sessionExpired();
    } catch (err) {
      const msg = err.response?.data?.message;
      setResult('session', { code: err.response?.status, msg });
      toast.error(`${err.response?.status}: ${msg}`);
    }
  };

  // 4. Duplicate Submit
  const handleDuplicateSubmit = async () => {
    set('duplicateCount', states.duplicateCount + 1);
    try {
      await qaAPI.duplicateSubmit();
    } catch (err) {
      setResult('duplicate', { msg: err.response?.data?.message, count: states.duplicateCount + 1 });
      toast.error(err.response?.data?.message || 'Duplicate submit error');
    }
  };

  // 5. Infinite Loading
  const handleInfiniteLoading = () => {
    set('infiniteLoading', true);
    toast('⚠️ This will load forever! Simulating infinite loading...', { icon: '⚠️' });
    // Never resolves intentionally
    qaAPI.slowResponse(); // We won't toggle back = infinite
  };

  return (
    <div id="qa-sandbox-page" data-testid="qa-sandbox-page" className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🧪</span>
            <h1 id="sandbox-title" data-testid="sandbox-title"
              className="text-3xl font-extrabold text-gray-900">QA Sandbox</h1>
          </div>
          <p className="text-gray-500">
            Halaman khusus untuk latihan Automation Testing & bug handling di Katalon Studio.
            Setiap card merepresentasikan skenario testing yang berbeda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1. Broken Form Validation */}
          <SandboxCard id="broken-form" title="🔴 Broken Validation"
            desc="Form validation yang tidak berjalan dengan benar" badge="Bug Simulation">
            <div className="space-y-3">
              <div>
                <label htmlFor="broken-email" className="text-sm font-medium text-gray-700">Email (validation broken)</label>
                <input
                  type="text"
                  id="broken-email"
                  name="broken_email"
                  data-testid="input-broken-email"
                  placeholder="Any text will 'pass'"
                  className="input-field mt-1"
                  value={states.brokenForm.email}
                  onChange={e => set('brokenForm', { ...states.brokenForm, email: e.target.value })}
                />
              </div>
              <button
                id="btn-broken-submit"
                data-testid="btn-broken-submit"
                onClick={() => {
                  // Intentionally broken: no validation, always "succeeds"
                  set('brokenForm', { ...states.brokenForm, submitted: true });
                  toast.success('✓ Form submitted (validation skipped!)');
                }}
                className="btn-primary w-full text-sm py-2"
              >
                Submit (No Validation)
              </button>
              {states.brokenForm.submitted && (
                <p id="broken-form-result" data-testid="broken-form-result" className="text-xs text-green-600 font-medium">
                  ✓ Submitted: "{states.brokenForm.email}" — Validation was bypassed!
                </p>
              )}
            </div>
          </SandboxCard>

          {/* 2. Slow Response */}
          <SandboxCard id="slow-response" title="⏱ Delayed Response"
            desc="API yang merespons lambat (3 detik)" badge="API Testing">
            <button
              id="btn-slow-response"
              data-testid="btn-slow-response"
              onClick={handleSlowResponse}
              disabled={states.slowResponse}
              className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2 mb-3"
            >
              {states.slowResponse ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span id="slow-loading-text" data-testid="slow-loading-indicator">Waiting 3 seconds...</span>
                </>
              ) : 'Trigger Slow Response'}
            </button>
            {results.slow && (
              <div id="slow-response-result" data-testid="slow-response-result"
                className={`text-xs p-2 rounded-lg ${results.slow.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {results.slow.msg}
              </div>
            )}
          </SandboxCard>

          {/* 3. Infinite Loading */}
          <SandboxCard id="infinite-loading" title="♾️ Infinite Loading"
            desc="API yang tidak pernah merespons" badge="Timeout Testing">
            <button
              id="btn-infinite-loading"
              data-testid="btn-infinite-loading"
              onClick={handleInfiniteLoading}
              className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2 mb-3"
            >
              {states.infiniteLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span id="infinite-loading-text" data-testid="infinite-loading-indicator">Loading forever...</span>
                </>
              ) : 'Start Infinite Loading'}
            </button>
            <p className="text-xs text-gray-400">⚠️ This button intentionally never stops loading</p>
          </SandboxCard>

          {/* 4. Random Fail */}
          <SandboxCard id="random-fail" title="🎲 Random Failure"
            desc="Request yang 50% kemungkinan gagal" badge="Error Handling">
            <button
              id="btn-random-fail"
              data-testid="btn-random-fail"
              onClick={handleRandomFail}
              disabled={states.randomFail}
              className="btn-primary w-full text-sm py-2 mb-3"
            >
              {states.randomFail ? 'Rolling dice...' : 'Try Random Request (50/50)'}
            </button>
            {results.random && (
              <div id="random-fail-result" data-testid="random-fail-result"
                className={`text-xs p-2 rounded-lg ${results.random.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {results.random.success ? '✓ Success!' : '✗ Failed!'} — {results.random.msg}
              </div>
            )}
          </SandboxCard>

          {/* 5. Disabled Button */}
          <SandboxCard id="disabled-button" title="🚫 Disabled Button"
            desc="Tombol yang tidak dapat di-klik" badge="Element State">
            <div className="space-y-3">
              <button
                id="btn-always-disabled"
                name="always_disabled"
                data-testid="btn-always-disabled"
                disabled
                className="btn-primary w-full text-sm py-2 opacity-50 cursor-not-allowed"
              >
                Always Disabled Button
              </button>
              <button
                id="btn-toggle-disabled"
                data-testid="btn-toggle-disabled"
                onClick={() => set('disabledBtn', !states.disabledBtn)}
                className="btn-secondary w-full text-sm py-2"
              >
                {states.disabledBtn ? 'Enable Button ▶' : 'Disable Toggle Button'}
              </button>
              <button
                id="btn-conditional-disabled"
                data-testid="btn-conditional-disabled"
                disabled={states.disabledBtn}
                className="btn-primary w-full text-sm py-2"
              >
                Toggle-able Button
              </button>
            </div>
          </SandboxCard>

          {/* 6. Hidden Button */}
          <SandboxCard id="hidden-button" title="👁️ Hidden Element"
            desc="Elemen tersembunyi yang harus ditemukan" badge="DOM Testing">
            <div className="space-y-3">
              <div
                id="hidden-button-container"
                data-testid="hidden-button-container"
                style={{ display: states.hiddenBtn ? 'block' : 'none' }}
              >
                <button
                  id="btn-hidden-secret"
                  data-testid="btn-hidden-secret"
                  className="btn-primary w-full text-sm py-2"
                  onClick={() => toast.success('🎉 You found the hidden button!')}
                >
                  🎉 Secret Button Found!
                </button>
              </div>
              <button
                id="btn-toggle-hidden"
                data-testid="btn-toggle-hidden"
                onClick={() => set('hiddenBtn', !states.hiddenBtn)}
                className="btn-secondary w-full text-sm py-2"
              >
                {states.hiddenBtn ? 'Hide the Button' : 'Reveal Hidden Button'}
              </button>
              <p className="text-xs text-gray-400">
                XPath: //button[@id='btn-hidden-secret']
              </p>
            </div>
          </SandboxCard>

          {/* 7. Duplicate Submit */}
          <SandboxCard id="duplicate-submit" title="🔄 Duplicate Submission"
            desc="Simulasi double-click atau multiple submit" badge="Race Condition">
            <div className="space-y-3">
              <button
                id="btn-duplicate-submit"
                data-testid="btn-duplicate-submit"
                onClick={handleDuplicateSubmit}
                className="btn-primary w-full text-sm py-2"
              >
                Submit (Click Multiple Times!)
              </button>
              <p id="duplicate-count-display" data-testid="duplicate-count-display" className="text-sm text-center text-gray-600">
                Submit count: <strong>{states.duplicateCount}</strong>
              </p>
              {results.duplicate && (
                <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                  Error: {results.duplicate.msg}
                </div>
              )}
            </div>
          </SandboxCard>

          {/* 8. Session Expired */}
          <SandboxCard id="session-expired" title="⏰ Session Expired"
            desc="Simulasi token kadaluarsa" badge="Auth Testing">
            <button
              id="btn-trigger-session-expired"
              data-testid="btn-trigger-session-expired"
              onClick={handleSessionExpired}
              className="btn-primary w-full text-sm py-2 mb-3"
            >
              Trigger Session Expired (401)
            </button>
            {results.session && (
              <div id="session-expired-result" data-testid="session-expired-result"
                className="text-xs bg-yellow-50 text-yellow-700 p-2 rounded-lg">
                Status: {results.session.code} — {results.session.msg}
              </div>
            )}
          </SandboxCard>

          {/* 9. Form with All Input Types */}
          <SandboxCard id="input-types" title="📝 All Input Types"
            desc="Berbagai jenis form input untuk testing" badge="Form Testing">
            <div className="space-y-3">
              <input type="text" id="input-text-test" name="text_test" data-testid="input-text-test"
                placeholder="Text input" className="input-field text-sm py-2" />
              <input type="number" id="input-number-test" name="number_test" data-testid="input-number-test"
                placeholder="Number input" className="input-field text-sm py-2" />
              <select id="select-test" name="select_test" data-testid="select-test" className="input-field text-sm py-2">
                <option value="">Select option</option>
                <option value="opt1">Option 1</option>
                <option value="opt2">Option 2</option>
              </select>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="checkbox-test" name="checkbox_test" data-testid="checkbox-test" />
                <label htmlFor="checkbox-test" className="text-sm">Checkbox test</label>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-1">
                  <input type="radio" id="radio-a" name="radio_test" data-testid="radio-test-a" value="a" />
                  <label htmlFor="radio-a" className="text-sm">Option A</label>
                </div>
                <div className="flex items-center gap-1">
                  <input type="radio" id="radio-b" name="radio_test" data-testid="radio-test-b" value="b" />
                  <label htmlFor="radio-b" className="text-sm">Option B</label>
                </div>
              </div>
              <textarea id="textarea-test" name="textarea_test" data-testid="textarea-test"
                placeholder="Textarea input" rows={2} className="input-field text-sm" />
            </div>
          </SandboxCard>
        </div>

        {/* XPath Reference */}
        <div id="xpath-reference" data-testid="xpath-reference" className="card mt-8">
          <h2 className="font-bold text-gray-900 mb-4">📋 Selector Reference for Katalon</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'By ID', selector: "//button[@id='btn-slow-response']", type: 'XPath' },
              { label: 'By data-testid', selector: "[data-testid='btn-random-fail']", type: 'CSS' },
              { label: 'By name', selector: "//input[@name='broken_email']", type: 'XPath' },
              { label: 'Hidden element', selector: "//div[@id='hidden-button-container']", type: 'XPath' },
              { label: 'Disabled button', selector: "[id='btn-always-disabled']", type: 'CSS' },
              { label: 'Countdown timer', selector: "[data-testid='countdown-display']", type: 'CSS' },
            ].map((ref, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-600">{ref.label}</span>
                  <span className="badge-info text-xs">{ref.type}</span>
                </div>
                <code className="text-xs text-blue-700 font-mono break-all">{ref.selector}</code>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QASandboxPage;
